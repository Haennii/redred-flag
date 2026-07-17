import { FinancialMetrics, RedFlag, RiskLevel, Trend } from '../types';
import { THRESHOLDS } from '../constants/thresholds';

function getTrend(current: number, previous: number | undefined, higherIsWorse: boolean): Trend {
  if (previous === undefined) return 'STABLE';
  const delta = current - previous;
  if (Math.abs(delta) < 0.01) return 'STABLE';
  if (higherIsWorse) return delta > 0 ? 'UP' : 'DOWN';
  return delta > 0 ? 'DOWN' : 'UP'; // 낮을수록 나쁜 지표는 반전
}

function getSeverity(
  value: number,
  thresholds: { danger: number; warning: number; watch: number },
  higherIsWorse: boolean
): { level: RiskLevel; score: number; triggered: boolean } {
  if (higherIsWorse) {
    if (value >= thresholds.danger) return { level: 'DANGER', score: 30, triggered: true };
    if (value >= thresholds.warning) return { level: 'WARNING', score: 20, triggered: true };
    if (value >= thresholds.watch) return { level: 'WATCH', score: 10, triggered: true };
    return { level: 'SAFE', score: 0, triggered: false };
  } else {
    if (value <= thresholds.danger) return { level: 'DANGER', score: 30, triggered: true };
    if (value <= thresholds.warning) return { level: 'WARNING', score: 20, triggered: true };
    if (value <= thresholds.watch) return { level: 'WATCH', score: 10, triggered: true };
    return { level: 'SAFE', score: 0, triggered: false };
  }
}

export function assessRedFlags(metrics: FinancialMetrics[]): { flags: RedFlag[]; score: number } {
  if (metrics.length === 0) return { flags: [], score: 0 };

  const latest = metrics[metrics.length - 1];
  const prev = metrics.length > 1 ? metrics[metrics.length - 2] : undefined;
  const twoYearsAgo = metrics.length > 2 ? metrics[metrics.length - 3] : undefined;

  // 대출성장률 계산
  const loanGrowthRate =
    prev && prev.totalLoans > 0
      ? ((latest.totalLoans - prev.totalLoans) / prev.totalLoans) * 100
      : 0;

  // 3년 연속 ROA 하락 여부
  const roaThreeYearDecline =
    twoYearsAgo !== undefined &&
    prev !== undefined &&
    latest.roa < prev.roa &&
    prev.roa < twoYearsAgo.roa;

  // 순이익 전년비 급감 (20% 이상)
  const incomeDrop =
    prev !== undefined
      ? ((latest.netIncome - prev.netIncome) / Math.abs(prev.netIncome)) * 100
      : 0;

  const flags: RedFlag[] = [
    // 1. BIS 자기자본비율
    (() => {
      const t = THRESHOLDS.bisRatio;
      const { level, score, triggered } = getSeverity(latest.bisRatio, t, false);
      return {
        id: 'bis_ratio',
        name: 'BIS 자기자본비율 부족',
        nameEn: 'Insufficient BIS Capital Ratio',
        description: `현재 ${latest.bisRatio.toFixed(1)}% — Basel III 최소요건 ${t.danger}%`,
        auditNote: '자본적정성은 은행 건전성의 핵심지표. 하락 추세가 지속되면 규제당국 조기시정조치(PCA) 대상이 될 수 있어 계속기업 불확실성 검토 필요.',
        currentValue: latest.bisRatio,
        threshold: t.danger,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.bisRatio, prev?.bisRatio, false),
      };
    })(),

    // 2. NPL 비율
    (() => {
      const t = THRESHOLDS.nplRatio;
      const { level, score, triggered } = getSeverity(latest.nplRatio, t, true);
      return {
        id: 'npl_ratio',
        name: '고정이하여신비율(NPL) 상승',
        nameEn: 'Non-Performing Loan Ratio Increase',
        description: `현재 ${latest.nplRatio.toFixed(2)}% — 경계치 ${t.watch}%`,
        auditNote: 'NPL 상승은 대손충당금 추가 적립 필요성을 시사. 충당금이 NPL 증가를 따라가지 못하면 이익이 과대계상될 가능성 있음. 감사 시 Sample 대출채권 실사 확대 검토.',
        currentValue: latest.nplRatio,
        threshold: t.warning,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.nplRatio, prev?.nplRatio, true),
      };
    })(),

    // 3. 대손충당금 적립률
    (() => {
      const t = THRESHOLDS.allowanceCoverage;
      const { level, score, triggered } = getSeverity(latest.allowanceCoverage, t, false);
      return {
        id: 'allowance_coverage',
        name: '대손충당금 과소적립',
        nameEn: 'Under-Provisioning Risk',
        description: `적립률 ${latest.allowanceCoverage.toFixed(1)}% — 100% 미만 시 잠재손실 노출`,
        auditNote: '대손충당금 적립률은 이익조정(earnings management)의 핵심 수단. 적립률 저하 시 당기이익 부풀리기 의심. IFRS 9 기대신용손실(ECL) 모델의 가정 및 시나리오 타당성 검토 필요.',
        currentValue: latest.allowanceCoverage,
        threshold: t.danger,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.allowanceCoverage, prev?.allowanceCoverage, false),
      };
    })(),

    // 4. ROA
    (() => {
      const t = THRESHOLDS.roa;
      const baseLevel = getSeverity(latest.roa, t, false);
      const extraScore = roaThreeYearDecline ? 15 : 0;
      return {
        id: 'roa',
        name: 'ROA 지속 하락',
        nameEn: 'Return on Assets Decline',
        description: `현재 ${latest.roa.toFixed(2)}%${roaThreeYearDecline ? ' — 3년 연속 하락' : ''}`,
        auditNote: 'ROA 지속 하락은 자산 수익창출 능력 저하를 의미. 비용 구조 악화 또는 부실자산 증가가 원인일 수 있어 비용항목 상세 분석 필요.',
        currentValue: latest.roa,
        threshold: t.warning,
        unit: '%',
        severity: roaThreeYearDecline && baseLevel.level === 'SAFE' ? 'WATCH' : baseLevel.level,
        scoreContribution: baseLevel.score + extraScore,
        triggered: baseLevel.triggered || roaThreeYearDecline,
        trend: getTrend(latest.roa, prev?.roa, false),
      };
    })(),

    // 5. 순이자마진(NIM)
    (() => {
      const t = THRESHOLDS.nim;
      const { level, score, triggered } = getSeverity(latest.nim, t, false);
      return {
        id: 'nim',
        name: '순이자마진(NIM) 압박',
        nameEn: 'Net Interest Margin Squeeze',
        description: `현재 ${latest.nim.toFixed(2)}% — 경계치 ${t.watch}%`,
        auditNote: '금리 상승기에 NIM이 오히려 하락한다면 역마진 구조나 단기 부채 조달 의존도 증가를 시사. 자산/부채 만기 불일치(ALM) 리스크 점검 필요.',
        currentValue: latest.nim,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.nim, prev?.nim, false),
      };
    })(),

    // 6. 예대율
    (() => {
      const t = THRESHOLDS.ldr;
      const { level, score, triggered } = getSeverity(latest.ldr, t, true);
      return {
        id: 'ldr',
        name: '예대율 과다',
        nameEn: 'Loan-to-Deposit Ratio Excess',
        description: `현재 ${latest.ldr.toFixed(1)}% — 규제 상한 ${t.danger}%`,
        auditNote: '예대율 100% 초과는 예수금 이상으로 대출이 나간 상태로 단기 유동성 위기 시 Bank Run 취약. 한국은행 유동성 지원 없이 독자 상환 불가능 여부 검토.',
        currentValue: latest.ldr,
        threshold: t.danger,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.ldr, prev?.ldr, true),
      };
    })(),

    // 7. 대출 급성장
    (() => {
      const t = THRESHOLDS.loanGrowthRate;
      const { level, score, triggered } = getSeverity(loanGrowthRate, t, true);
      return {
        id: 'loan_growth',
        name: '대출 급성장',
        nameEn: 'Rapid Loan Growth',
        description: `전년 대비 ${loanGrowthRate.toFixed(1)}% 증가 — 경계치 ${t.watch}%`,
        auditNote: '단기 대출 급팽창은 심사기준 완화의 신호일 수 있음. 부실이 후행하므로 향후 NPL 상승 가능성 내재. 신규 취급 대출 포트폴리오 품질 표본 감사 고려.',
        currentValue: loanGrowthRate,
        threshold: t.warning,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: loanGrowthRate > 0 ? 'UP' : 'DOWN',
      };
    })(),

    // 8. 순이익 급감
    (() => {
      const triggered = prev !== undefined && incomeDrop < -20;
      return {
        id: 'income_drop',
        name: '당기순이익 급감',
        nameEn: 'Net Income Sharp Decline',
        description: `전년 대비 ${incomeDrop.toFixed(1)}% 변동`,
        auditNote: '순이익 급감은 대손충당금 대규모 전입, 일회성 손실, 또는 이전연도 이익 과대계상의 수정 가능성을 시사. 항목별 구성 변화 분석 필수.',
        currentValue: incomeDrop,
        threshold: -20,
        unit: '%',
        severity: triggered ? 'WARNING' : 'SAFE',
        scoreContribution: triggered ? 20 : 0,
        triggered,
        trend: incomeDrop < 0 ? 'DOWN' : 'UP',
      };
    })(),
  ];

  const totalScore = Math.min(
    100,
    flags.reduce((sum, f) => sum + f.scoreContribution, 0)
  );

  return { flags, score: totalScore };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 76) return 'DANGER';
  if (score >= 51) return 'WARNING';
  if (score >= 26) return 'WATCH';
  return 'SAFE';
}

export const RISK_LABELS: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  SAFE: { label: '양호', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  WATCH: { label: '주의', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  WARNING: { label: '경고', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  DANGER: { label: '위험', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};
