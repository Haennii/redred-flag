import axios from 'axios';
import { DartApiResponse, DartFinancialItem, FinancialMetrics } from '../types';
import { MOCK_DATA } from '../data/mockData';

const API_KEY = import.meta.env.VITE_DART_API_KEY as string;
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24시간

interface CacheEntry {
  data: FinancialMetrics[];
  timestamp: number;
}

function getCached(key: string): FinancialMetrics[] | null {
  try {
    const raw = localStorage.getItem(`dart_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(`dart_cache_${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: FinancialMetrics[]): void {
  try {
    const entry: CacheEntry = { data, timestamp: Date.now() };
    localStorage.setItem(`dart_cache_${key}`, JSON.stringify(entry));
  } catch {}
}

// DART API는 원(KRW) 단위 반환 → 억원으로 ��환
function parseAmountInEok(str: string | null | undefined): number {
  if (!str) return 0;
  const raw = parseInt(str.replace(/,/g, ''), 10) || 0;
  return Math.round(raw / 100_000_000);
}

type AmountField = 'thstrm_amount' | 'frmtrm_amount' | 'bfefrmtrm_amount';

function findAccount(
  items: DartFinancialItem[],
  field: AmountField,
  ...keywords: string[]
): number {
  const exact = items.find(i => keywords.includes(i.account_nm.trim()));
  if (exact) return parseAmountInEok(exact[field]);
  const partial = items.find(i => keywords.some(kw => i.account_nm.includes(kw)));
  return partial ? parseAmountInEok(partial[field]) : 0;
}

// 음수 포함 계정 (기타영업손익 등)
function findAccountSigned(
  items: DartFinancialItem[],
  field: AmountField,
  ...keywords: string[]
): number {
  const match =
    items.find(i => keywords.includes(i.account_nm.trim())) ??
    items.find(i => keywords.some(kw => i.account_nm.includes(kw)));
  if (!match) return 0;
  const raw = parseInt((match[field] ?? '').replace(/,/g, ''), 10) || 0;
  return Math.round(raw / 100_000_000);
}

async function fetchAllAccounts(
  corpCode: string,
  year: number
): Promise<DartApiResponse['list']> {
  const params = new URLSearchParams({
    crtfc_key: API_KEY,
    corp_code: corpCode,
    bsns_year: String(year),
    reprt_code: '11011', // 사업보고서 (연간)
    fs_div: 'OFS',       // 별도재무제표 (개별 은행 기준)
  });

  const res = await axios.get<DartApiResponse>(
    `/dart-api/api/fnlttSinglAcntAll.json?${params}`
  );

  if (res.data.status !== '000') throw new Error(res.data.message);
  return res.data.list;
}

// DART API 응답에서 특정 연도 지표 추출
// field: thstrm=당기, frmtrm=전기(1년 전), bfefrmtrm=전전기(2년 전)
function extractMetrics(
  items: DartFinancialItem[],
  field: AmountField,
  year: number
): FinancialMetrics | null {
  const bs = items.filter(i => i.sj_div === 'BS');
  const is = items.filter(i => i.sj_div === 'IS' || i.sj_div === 'CIS');

  const fa  = (...kw: string[]) => findAccount(is, field, ...kw);
  const fas = (...kw: string[]) => findAccountSigned(is, field, ...kw);
  const fabs = (...kw: string[]) => findAccount(bs, field, ...kw);

  const totalAssets  = fabs('자산총계');
  const totalEquity  = fabs('자본총계');
  const totalLoans   = fabs(
    '상각후원가측정대출채��',
    '대출채권및수취채권',
    '대출채권',
    '원화대출금',
  );

  const interestIncome  = fa('이자수익');
  const interestExpense = fa('이자비용');
  const netIncome       = fa('당기순이익(손실)', '당기순이익');

  // 비이자이익 3개 구성 계정
  const feeIncome   = fa('순수수료이익', '순수수료손익');
  const tradingGain = fa(
    '당기손익-공정가치측정 금융상품 순손익',
    '당기손익-공정가치측정금융상품관련손익',
    '순당기손익-공정가치측정금융상품이익',
  );
  const otherOpNet  = fas('기타영업손익', '기타영업손실');
  const otherOpIncome = otherOpNet !== 0
    ? otherOpNet
    : fa('기타영업수익') - fa('기타영업비용');

  // 대손비용
  const creditCost = fa(
    '신용손실충당금 전입액',
    '신용손실충당금전입액',
    '신용손실충당금전입',
    '대손충당금전입액',
    '대손충당금 전입액',
  );

  if (totalAssets === 0) return null;

  const nonInterestIncome   = feeIncome + tradingGain + otherOpIncome;
  const netInterestIncome   = interestIncome - interestExpense;
  const netOperatingRevenue = netInterestIncome + nonInterestIncome;
  const nim            = (netInterestIncome / totalAssets) * 100;
  const roe            = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
  const creditCostRatio = totalLoans > 0 ? (creditCost / totalLoans) * 100 : 0;

  return {
    year,
    totalAssets, totalLoans, totalEquity,
    interestIncome, interestExpense, netIncome,
    netOperatingRevenue, nonInterestIncome, creditCost,
    cet1Ratio: 0, // 감독당국 공시 → 목업으로 보완
    nim, roe, creditCostRatio,
  };
}

export async function fetchBankMetrics(
  bankId: string,
  corpCode: string,
  years: number[]
): Promise<{ metrics: FinancialMetrics[]; source: 'DART' | 'MOCK' }> {
  const cacheKey = `${bankId}_v9_${years.join('_')}`;
  const cached = getCached(cacheKey);
  if (cached) return { metrics: cached, source: 'DART' };

  if (!API_KEY) {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }

  try {
    // DART API로 2023 사업보고서 1회 요청 → 당기(2023) + 전기(2022) + 전전기(2021) 동시 추출
    // DART API로 2024 사업보고서 1회 요청 → 당기(2024)
    const [items23, items24] = await Promise.all([
      fetchAllAccounts(corpCode, 2023),
      fetchAllAccounts(corpCode, 2024),
    ]);

    const year23 = extractMetrics(items23, 'thstrm_amount',   2023);
    const year22 = extractMetrics(items23, 'frmtrm_amount',   2022);
    const year21 = extractMetrics(items23, 'bfefrmtrm_amount', 2021);
    const year24 = extractMetrics(items24, 'thstrm_amount',   2024);

    const dartByYear: Record<number, FinancialMetrics | null> = {
      2024: year24,
      2023: year23,
      2022: year22,
      2021: year21,
    };

    const mockFallback = MOCK_DATA[bankId] ?? [];

    // 연도별 병합: DART 실데이터 우선, CET1 및 DART 미지원 연도(2020)는 목업으로 보완
    const merged = years.map(year => {
      const dart = dartByYear[year] ?? null;
      const mock = mockFallback.find(m => m.year === year);

      if (dart) {
        return { ...dart, cet1Ratio: mock?.cet1Ratio ?? 0 };
      }
      return mock ?? null;
    }).filter(Boolean) as FinancialMetrics[];

    if (merged.length === 0) throw new Error('No data');

    setCache(cacheKey, merged);
    return { metrics: merged, source: 'DART' };
  } catch {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }
}
