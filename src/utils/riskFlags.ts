import { FinancialMetrics, RedFlag, RiskLevel, Trend } from '../types';
import { THRESHOLDS } from '../constants/thresholds';

function getTrend(current: number, previous: number | undefined, higherIsWorse: boolean): Trend {
  if (previous === undefined) return 'STABLE';
  const delta = current - previous;
  if (Math.abs(delta) < 0.01) return 'STABLE';
  if (higherIsWorse) return delta > 0 ? 'UP' : 'DOWN';
  return delta > 0 ? 'DOWN' : 'UP';
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

function yoyGrowth(current: number, prev: number | undefined): number {
  if (!prev || prev === 0) return 0;
  return ((current - prev) / Math.abs(prev)) * 100;
}

export function assessRedFlags(metrics: FinancialMetrics[]): { flags: RedFlag[]; score: number } {
  if (metrics.length === 0) return { flags: [], score: 0 };

  const latest = metrics[metrics.length - 1];
  const prev   = metrics.length > 1 ? metrics[metrics.length - 2] : undefined;

  const netOpRevGrowth    = yoyGrowth(latest.netOperatingRevenue, prev?.netOperatingRevenue);
  const nonInterestGrowth = yoyGrowth(latest.nonInterestIncome, prev?.nonInterestIncome);
  const creditCostGrowth  = yoyGrowth(latest.creditCost, prev?.creditCost);

  const flags: RedFlag[] = [
    // 1. 자기자본이익률(ROE)
    (() => {
      const t = THRESHOLDS.roe;
      const { level, score, triggered } = getSeverity(latest.roe, t, false);
      return {
        id: 'roe',
        name: '자기자본이익률(ROE)',
        nameEn: 'Return on Equity',
        description: `현재 ${latest.roe.toFixed(1)}% — 경계 ${t.watch}%`,
        auditNote: 'ROE 하락은 자본 효율성 저하를 의미. 이익감소 또는 자본 과다 적립 여부를 확인. 지속 하락 시 배당 압박·임원보수 조정 등 이익조정 유인 증가.',
        currentValue: latest.roe,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.roe, prev?.roe, false),
      };
    })(),

    // 2. 순이자마진(NIM)
    (() => {
      const t = THRESHOLDS.nim;
      const { level, score, triggered } = getSeverity(latest.nim, t, false);
      return {
        id: 'nim',
        name: '순이자마진(NIM)',
        nameEn: 'Net Interest Margin',
        description: `현재 ${latest.nim.toFixed(2)}% — 경계 ${t.watch}%`,
        auditNote: 'NIM 하락은 금리리스크 노출 또는 단기 부채 조달 의존도 증가를 시사. 금리 상승기 역마진 구조 여부 및 자산·부채 만기 불일치(ALM) 점검 필요.',
        currentValue: latest.nim,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.nim, prev?.nim, false),
      };
    })(),

    // 3. 보통주자본비율(CET1)
    (() => {
      const t = THRESHOLDS.cet1Ratio;
      const { level, score, triggered } = getSeverity(latest.cet1Ratio, t, false);
      return {
        id: 'cet1',
        name: '보통주자본비율(CET1)',
        nameEn: 'Common Equity Tier 1',
        description: `현재 ${latest.cet1Ratio.toFixed(1)}% — Basel III 최소 ${t.danger}%`,
        auditNote: 'CET1은 가장 손실흡수 능력이 높은 자본. BIS비율 대비 CET1 하락폭이 크면 하이브리드 자본 의존도 과다를 의심. 규제 미달 시 배당 제한·PCA 가능성.',
        currentValue: latest.cet1Ratio,
        threshold: t.danger,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.cet1Ratio, prev?.cet1Ratio, false),
      };
    })(),

    // 4. 순영업수익
    (() => {
      const t = THRESHOLDS.netOpRevGrowth;
      const { level, score, triggered } = getSeverity(netOpRevGrowth, t, false);
      return {
        id: 'net_op_rev',
        name: '순영업수익',
        nameEn: 'Net Operating Revenue',
        description: `${latest.netOperatingRevenue.toLocaleString()}억원 (전년비 ${netOpRevGrowth > 0 ? '+' : ''}${netOpRevGrowth.toFixed(1)}%)`,
        auditNote: '순영업수익은 이자이익과 비이자이익의 합산으로 은행 핵심 수익력을 나타냄. 급감 시 수익 구조 악화 또는 일회성 손실 여부 확인 필요.',
        currentValue: netOpRevGrowth,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: netOpRevGrowth > 0 ? 'DOWN' : 'UP',
      };
    })(),

    // 5. 비이자이익
    (() => {
      const t = THRESHOLDS.nonInterestGrowth;
      const { level, score, triggered } = getSeverity(nonInterestGrowth, t, false);
      return {
        id: 'non_interest',
        name: '비이자이익',
        nameEn: 'Non-Interest Income',
        description: `${latest.nonInterestIncome.toLocaleString()}억원 (전년비 ${nonInterestGrowth > 0 ? '+' : ''}${nonInterestGrowth.toFixed(1)}%)`,
        auditNote: '비이자이익 비중이 낮으면 금리 변동에 취약. 급감 시 수수료 수익 기반 약화 또는 유가증권 평가손 발생 여부 확인. 수익 다변화 전략 점검.',
        currentValue: nonInterestGrowth,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: nonInterestGrowth > 0 ? 'DOWN' : 'UP',
      };
    })(),

    // 6. 대손비용
    (() => {
      const t = THRESHOLDS.creditCostGrowth;
      const { level, score, triggered } = getSeverity(creditCostGrowth, t, true);
      return {
        id: 'credit_cost',
        name: '대손비용',
        nameEn: 'Credit Cost',
        description: `${latest.creditCost.toLocaleString()}억원 (전년비 ${creditCostGrowth > 0 ? '+' : ''}${creditCostGrowth.toFixed(1)}%)`,
        auditNote: '대손비용 급증은 부실 대출 증가 또는 ECL 모델 가정 변경 신호. 전년 비용이 과소 계상됐을 가능성도 있어 충당금 전입액 추이 및 NPL 연동성 분석 필요.',
        currentValue: creditCostGrowth,
        threshold: t.warning,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: creditCostGrowth > 0 ? 'UP' : 'DOWN',
      };
    })(),

    // 7. 대손비용률
    (() => {
      const t = THRESHOLDS.creditCostRatio;
      const { level, score, triggered } = getSeverity(latest.creditCostRatio, t, true);
      return {
        id: 'credit_cost_ratio',
        name: '대손비용률',
        nameEn: 'Credit Cost Ratio',
        description: `현재 ${latest.creditCostRatio.toFixed(2)}% — 경계 ${t.watch}%`,
        auditNote: '대손비용률은 대출 포트폴리오 품질의 핵심 지표. 상승 추세는 자산건전성 악화를 선행. IFRS 9 ECL 모델의 PD/LGD 가정 적정성 및 시나리오 가중치 감사 필요.',
        currentValue: latest.creditCostRatio,
        threshold: t.watch,
        unit: '%',
        severity: level,
        scoreContribution: score,
        triggered,
        trend: getTrend(latest.creditCostRatio, prev?.creditCostRatio, true),
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
  SAFE:    { label: '양호', color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  WATCH:   { label: '주의', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
  WARNING: { label: '경고', color: '#F97316', bg: 'rgba(249,115,22,0.15)' },
  DANGER:  { label: '위험', color: '#EF4444', bg: 'rgba(239,68,68,0.15)' },
};
