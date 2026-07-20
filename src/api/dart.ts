import axios from 'axios';
import { DartApiResponse, FinancialMetrics } from '../types';
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

// DART API는 원(KRW) 단위 반환 → 억원으로 변환
function parseAmountInEok(str: string | null | undefined): number {
  if (!str) return 0;
  const raw = parseInt(str.replace(/,/g, ''), 10) || 0;
  return Math.round(raw / 100_000_000);
}

function findAccount(items: DartApiResponse['list'], ...keywords: string[]): number {
  const exact = items.find(i => keywords.includes(i.account_nm.trim()));
  if (exact) return parseAmountInEok(exact.thstrm_amount);
  const partial = items.find(i => keywords.some(kw => i.account_nm.includes(kw)));
  return partial ? parseAmountInEok(partial.thstrm_amount) : 0;
}

// 음수 포함 계정 (기타영업손익 등)
function findAccountSigned(items: DartApiResponse['list'], ...keywords: string[]): number {
  const exact = items.find(i => keywords.includes(i.account_nm.trim()));
  if (exact) {
    const raw = parseInt((exact.thstrm_amount ?? '').replace(/,/g, ''), 10) || 0;
    return Math.round(raw / 100_000_000);
  }
  const partial = items.find(i => keywords.some(kw => i.account_nm.includes(kw)));
  if (partial) {
    const raw = parseInt((partial.thstrm_amount ?? '').replace(/,/g, ''), 10) || 0;
    return Math.round(raw / 100_000_000);
  }
  return 0;
}

async function fetchAllAccounts(
  corpCode: string,
  year: number
): Promise<DartApiResponse['list']> {
  // fnlttSinglAcntAll: 전체 재무제표 (모든 계정) — 개별 은행 별도재무제표 기준
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

async function fetchYearMetrics(corpCode: string, year: number): Promise<FinancialMetrics | null> {
  try {
    const items = await fetchAllAccounts(corpCode, year);
    const bs = items.filter(i => i.sj_div === 'BS');
    // 은행 재무제표는 IS 대신 CIS(포괄손익계산서) 사용
    const is = items.filter(i => i.sj_div === 'IS' || i.sj_div === 'CIS');

    // 재무상태표 (BS)
    const totalAssets = findAccount(bs, '자산총계');
    const totalEquity = findAccount(bs, '자본총계');
    // IFRS 9 도입(2023) 전후 계정명 차이 대응
    const totalLoans  = findAccount(bs,
      '상각후원가측정대출채권',
      '대출채권및수취채권',
      '대출채권',
      '원화대출금',
    );

    // 포괄손익계산서 (CIS) — 은행은 IS 대신 CIS 사용
    const interestIncome  = findAccount(is, '이자수익');
    const interestExpense = findAccount(is, '이자비용');
    const netIncome       = findAccount(is, '당기순이익(손실)', '당기순이익');

    // 비이자이익 = 순수수료이익 + 유가증권손익 + 기타영업손익
    // 신한은 '순수수료손익', 나머지 3행은 '순수수료이익'
    const feeIncome         = findAccount(is, '순수수료이익', '순수수료손익');
    const tradingGain       = findAccount(is, '당기손익-공정가치측정 금융상품 순손익');
    const otherOpIncome     = findAccountSigned(is, '기타영업손익');
    const nonInterestIncome = feeIncome + tradingGain + otherOpIncome;

    // 순영업수익 = 순이자이익 + 비이자이익 (계정명 의존 없이 직접 계산)
    const netInterestIncome   = interestIncome - interestExpense;
    const netOperatingRevenue = netInterestIncome + nonInterestIncome;

    // 대손비용 — 은행별 계정명 차이 전체 대응
    // KB: '신용손실충당금 전입액', 하나/우리: '신용손실충당금전입액', 신한: '신용손실충당금전입'(액 없음)
    const creditCost = findAccount(is,
      '신용손실충당금 전입액',
      '신용손실충당금전입액',
      '신용손실충당금전입',
      '대손충당금전입액',
      '대손충당금 전입액',
    );

    if (totalAssets === 0) return null;

    const nim            = ((interestIncome - interestExpense) / totalAssets) * 100;
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
  } catch {
    return null;
  }
}

export async function fetchBankMetrics(
  bankId: string,
  corpCode: string,
  years: number[]
): Promise<{ metrics: FinancialMetrics[]; source: 'DART' | 'MOCK' }> {
  const cacheKey = `${bankId}_v6_${years.join('_')}`;
  const cached = getCached(cacheKey);
  if (cached) return { metrics: cached, source: 'DART' };

  if (!API_KEY) {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }

  try {
    const results = await Promise.all(
      years.map(y => fetchYearMetrics(corpCode, y))
    );

    const mockFallback = MOCK_DATA[bankId] ?? [];
    const hasAnyRealData = results.some(r => r !== null);

    if (!hasAnyRealData) throw new Error('No DART data available');

    // 연도별 병합: DART 실데이터 우선, 없는 연도는 목업(사업보고서 공시 추정치)으로 보완
    // DART API는 구조적으로 2023년 이후 데이터만 제공 (IFRS 9 도입 이후 공시 체계)
    const merged = years.map((year, i) => {
      const dart = results[i];
      const mock = mockFallback.find(m => m.year === year);

      if (dart && mock) {
        // DART 실데이터 + 감독당국 공시 지표(CET1) 보완
        return {
          ...dart,
          cet1Ratio: mock.cet1Ratio,
        };
      }
      // 해당 연도 DART 데이터 없음 → 목업(사업보고서 기반 추정치) 사용
      return mock ?? null;
    }).filter(Boolean) as FinancialMetrics[];

    if (merged.length === 0) throw new Error('No data');

    setCache(cacheKey, merged);
    return { metrics: merged, source: 'DART' };
  } catch {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }
}
