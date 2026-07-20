export type RiskLevel = 'SAFE' | 'WATCH' | 'WARNING' | 'DANGER';
export type Trend = 'UP' | 'DOWN' | 'STABLE';

export interface Bank {
  id: string;
  name: string;
  shortName: string;
  corpCode: string;
  color: string;
  bgColor: string;
}

export interface FinancialMetrics {
  year: number;
  totalAssets: number;            // 자산총계 (억원)
  totalLoans: number;             // 대출채권 (억원)
  totalEquity: number;            // 자본총계 (억원)
  netIncome: number;              // 당기순이익 (억원)
  interestIncome: number;         // 이자수익 (억원) — NIM 계산용
  interestExpense: number;        // 이자비용 (억원) — NIM 계산용
  netOperatingRevenue: number;    // 순영업수익 (억원)
  nonInterestIncome: number;      // 비이자이익 (억원)
  creditCost: number;             // 대손비용 (억원)
  roe: number;                    // 자기자본이익률 (%)
  nim: number;                    // 순이자마진 (%)
  cet1Ratio: number;              // 보통주자본비율 (%)
  creditCostRatio: number;        // 대손비용률 (%)
}

export interface RedFlag {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  auditNote: string;          // 감사관점 코멘트
  currentValue: number;
  threshold: number;
  unit: string;
  severity: RiskLevel;
  scoreContribution: number;
  triggered: boolean;
  trend: Trend;
}

export interface BankAnalysis {
  bank: Bank;
  metrics: FinancialMetrics[];
  redFlags: RedFlag[];
  riskScore: number;
  riskLevel: RiskLevel;
  latestMetrics: FinancialMetrics;
  dataSource: 'DART' | 'MOCK';
}

export interface DartFinancialItem {
  rcept_no: string;
  reprt_code: string;
  bsns_year: string;
  corp_code: string;
  sj_div: string;
  sj_nm: string;
  account_id: string;
  account_nm: string;
  account_detail: string;
  thstrm_nm: string;
  thstrm_amount: string;
  frmtrm_nm: string;
  frmtrm_amount: string;
  bfefrmtrm_nm: string | null;
  bfefrmtrm_amount: string | null;
  ord: string;
  currency: string;
}

export interface DartApiResponse {
  status: string;
  message: string;
  list: DartFinancialItem[];
}
