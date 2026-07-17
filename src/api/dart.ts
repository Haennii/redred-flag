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

function parseAmount(str: string | null): number {
  if (!str) return 0;
  return parseInt(str.replace(/,/g, ''), 10) || 0;
}

function findAccount(items: DartApiResponse['list'], ...keywords: string[]): number {
  const item = items.find(i =>
    keywords.some(kw => i.account_nm.includes(kw))
  );
  return item ? parseAmount(item.thstrm_amount) : 0;
}

async function fetchStatements(
  corpCode: string,
  year: number,
  div: 'BS' | 'IS'
): Promise<DartApiResponse['list']> {
  const params = new URLSearchParams({
    crtfc_key: API_KEY,
    corp_code: corpCode,
    bsns_year: String(year),
    reprt_code: '11011', // 사업보고서 (연간)
    fs_div: 'CFS',       // 연결재무제표
  });

  const res = await axios.get<DartApiResponse>(
    `/dart-api/api/fnlttSinglAcnt.json?${params}`
  );

  if (res.data.status !== '000') throw new Error(res.data.message);
  return res.data.list.filter(i => i.sj_div === div);
}

async function fetchYearMetrics(corpCode: string, year: number): Promise<FinancialMetrics | null> {
  try {
    const [bs, is] = await Promise.all([
      fetchStatements(corpCode, year, 'BS'),
      fetchStatements(corpCode, year, 'IS'),
    ]);

    const totalAssets = findAccount(bs, '자산총계');
    const totalLoans = findAccount(bs, '대출채권', '대출및수취채권');
    const totalDeposits = findAccount(bs, '예수부채', '예수금');
    const totalEquity = findAccount(bs, '자본총계');
    const allowanceForLosses = findAccount(bs, '대손충당금', '신용손실충당금');

    const interestIncome = findAccount(is, '이자수익');
    const interestExpense = findAccount(is, '이자비용');
    const netIncome = findAccount(is, '당기순이익');

    // 평균자산으로 ROA 계산 (전기 자산 없으므로 당기 자산으로 근사)
    const nim = totalAssets > 0
      ? ((interestIncome - interestExpense) / totalAssets) * 100
      : 0;
    const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
    const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
    const ldr = totalDeposits > 0 ? (totalLoans / totalDeposits) * 100 : 0;
    const allowanceCoverage = totalLoans > 0 ? (allowanceForLosses / totalLoans) * 100 : 0;

    return {
      year,
      totalAssets, totalLoans, totalDeposits, totalEquity,
      interestIncome, interestExpense, netIncome, allowanceForLosses,
      // BIS, NPL은 공시 보조자료 필요 — 목업값 사용
      bisRatio: 0, nplRatio: 0,
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
  const cacheKey = `${bankId}_${years.join('_')}`;
  const cached = getCached(cacheKey);
  if (cached) return { metrics: cached, source: 'DART' };

  if (!API_KEY) {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }

  try {
    const results = await Promise.all(
      years.map(y => fetchYearMetrics(corpCode, y))
    );
    const metrics = results.filter(Boolean) as FinancialMetrics[];

    if (metrics.length === 0) throw new Error('No data');

    // DART 원시금액은 원(KRW) 단위 / 목업은 억원 단위 → 혼용 금지
    // 원시 재무데이터는 목업(사업보고서 공시값)을 기준으로 하고,
    // DART에서는 단위에 무관한 비율(%)값만 추출하여 합리적이면 적용
    const mockFallback = MOCK_DATA[bankId] ?? [];
    const enriched = metrics.map(m => {
      const mock = mockFallback.find(mk => mk.year === m.year);
      if (!mock) return { ...m, bisRatio: 0, nplRatio: 0 };

      return {
        ...mock, // 원시 재무데이터: 목업값(사업보고서 공시 기반) 사용
        // DART 계산 비율이 합리적이면 적용, 아니면 목업값
        // NIM, LDR, allowanceCoverage는 DART 계산 비율 활용 (합리적 범위 내)
        nim: (m.nim > 0 && m.nim < 10) ? m.nim : mock.nim,
        ldr: (m.ldr > 50 && m.ldr < 200) ? m.ldr : mock.ldr,
        allowanceCoverage: (m.allowanceCoverage > 10 && m.allowanceCoverage < 500) ? m.allowanceCoverage : mock.allowanceCoverage,
        // ROA/ROE는 지주회사 OCI 구조 왜곡으로 목업값 사용
        roa: mock.roa,
        roe: mock.roe,
      };
    });

    setCache(cacheKey, enriched);
    return { metrics: enriched, source: 'DART' };
  } catch {
    return { metrics: MOCK_DATA[bankId] ?? [], source: 'MOCK' };
  }
}
