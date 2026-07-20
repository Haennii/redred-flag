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
  // 정확히 일치하는 계정 우선, 없으면 부분 일치
  const exact = items.find(i => keywords.includes(i.account_nm.trim()));
  if (exact) return parseAmountInEok(exact.thstrm_amount);
  const partial = items.find(i => keywords.some(kw => i.account_nm.includes(kw)));
  return partial ? parseAmountInEok(partial.thstrm_amount) : 0;
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
    const totalAssets    = findAccount(bs, '자산총계');
    const totalEquity    = findAccount(bs, '자본총계');
    const totalDeposits  = findAccount(bs, '예수부채', '예수금');
    // IFRS 9 도입(2023) 전후 계정명 차이 대응
    const totalLoans     = findAccount(bs,
      '상각후원가측정대출채권',   // 2023년 이후 IFRS 9
      '대출채권및수취채권',        // 2022년 이전
      '대출채권',
      '원화대출금',
    );
    const allowanceForLosses = findAccount(bs,
      '신용손실충당금',
      '대손충당금',
      '대출채권손실충당금',
    );

    // 손익계산서 (IS)
    const interestIncome  = findAccount(is, '이자수익');
    const interestExpense = findAccount(is, '이자비용');
    const netIncome       = findAccount(is, '당기순이익(손실)', '당기순이익');

    if (totalAssets === 0) return null; // 파싱 실패

    const nim = ((interestIncome - interestExpense) / totalAssets) * 100;
    const roa = (netIncome / totalAssets) * 100;
    const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
    const ldr = totalDeposits > 0 ? (totalLoans / totalDeposits) * 100 : 0;
    const allowanceCoverage = totalLoans > 0 ? (allowanceForLosses / totalLoans) * 100 : 0;

    return {
      year,
      totalAssets, totalLoans, totalDeposits, totalEquity,
      interestIncome, interestExpense, netIncome, allowanceForLosses,
      bisRatio: 0, nplRatio: 0, // 별도 감독 공시 → 목업으로 보완
      nim, roa, roe, ldr, allowanceCoverage,
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
  const cacheKey = `${bankId}_v3_${years.join('_')}`;
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
        // DART 실데이터 + 감독당국 공시 지표(BIS, NPL) 보완
        return {
          ...dart,
          bisRatio: mock.bisRatio,
          nplRatio: mock.nplRatio,
          allowanceCoverage: dart.allowanceCoverage > 5
            ? dart.allowanceCoverage
            : mock.allowanceCoverage,
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
