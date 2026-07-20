import { FinancialMetrics, PeerAverages, RedFlag, RiskLevel, Trend } from '../types';
import { CET1_THRESHOLDS, PEER_DEV } from '../constants/thresholds';

// ─── 유틸 ──────────────────────────────────────────────────────────────────

function getTrend(current: number, prev: number | undefined, higherIsWorse: boolean): Trend {
  if (prev === undefined) return 'STABLE';
  const delta = current - prev;
  if (Math.abs(delta) < 0.01) return 'STABLE';
  if (higherIsWorse) return delta > 0 ? 'UP' : 'DOWN';
  return delta > 0 ? 'DOWN' : 'UP';
}

function yoy(cur: number, prev: number | undefined): number {
  if (!prev || prev === 0) return 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

// 동종 4행 평균 대비 편차 (%)
function peerDev(value: number, peerAvg: number): number {
  if (peerAvg === 0) return 0;
  return ((value - peerAvg) / Math.abs(peerAvg)) * 100;
}

// 증감률 편차 (pp): 개별 증감률 - 4행 평균 증감률
function growthDev(bankGrowth: number, peerGrowth: number): number {
  return bankGrowth - peerGrowth;
}

type Thresholds = { watch: number; warning: number; danger: number };

function getSeverityBelow(
  deviation: number, t: Thresholds
): { level: RiskLevel; score: number; triggered: boolean } {
  if (deviation <= t.danger)  return { level: 'DANGER',  score: 30, triggered: true };
  if (deviation <= t.warning) return { level: 'WARNING', score: 20, triggered: true };
  if (deviation <= t.watch)   return { level: 'WATCH',   score: 10, triggered: true };
  return { level: 'SAFE', score: 0, triggered: false };
}

function getSeverityAbove(
  deviation: number, t: Thresholds
): { level: RiskLevel; score: number; triggered: boolean } {
  if (deviation >= t.danger)  return { level: 'DANGER',  score: 30, triggered: true };
  if (deviation >= t.warning) return { level: 'WARNING', score: 20, triggered: true };
  if (deviation >= t.watch)   return { level: 'WATCH',   score: 10, triggered: true };
  return { level: 'SAFE', score: 0, triggered: false };
}

function fmt(v: number, dec = 2): string {
  return (v >= 0 ? '+' : '') + v.toFixed(dec);
}

// ─── 동종 4행 평균 계산 (App.tsx에서 호출) ─────────────────────────────────

export function computePeerAverages(allMetrics: FinancialMetrics[][]): PeerAverages {
  const mean = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length;
  const latest = allMetrics.map(m => m[m.length - 1]);
  const prev   = allMetrics.map(m => m[m.length - 2]);

  return {
    roe:              mean(latest.map(m => m.roe)),
    nim:              mean(latest.map(m => m.nim)),
    norGrowth:        mean(latest.map((m, i) => yoy(m.netOperatingRevenue, prev[i]?.netOperatingRevenue))),
    niiGrowth:        mean(latest.map((m, i) => yoy(m.nonInterestIncome,   prev[i]?.nonInterestIncome))),
    creditCostGrowth: mean(latest.map((m, i) => yoy(m.creditCost,          prev[i]?.creditCost))),
    creditCostRatio:  mean(latest.map(m => m.creditCostRatio)),
  };
}

// ─── 이상징후 평가 ─────────────────────────────────────────────────────────

export function assessRedFlags(
  metrics: FinancialMetrics[],
  peer: PeerAverages
): { flags: RedFlag[]; score: number } {
  if (metrics.length === 0) return { flags: [], score: 0 };

  const latest = metrics[metrics.length - 1];
  const prev   = metrics.length > 1 ? metrics[metrics.length - 2] : undefined;

  const norGrowth  = yoy(latest.netOperatingRevenue, prev?.netOperatingRevenue);
  const niiGrowth  = yoy(latest.nonInterestIncome,   prev?.nonInterestIncome);
  const ccGrowth   = yoy(latest.creditCost,          prev?.creditCost);

  const flags: RedFlag[] = [

    // ── 1. 자기자본이익률(ROE) — 동종 4행 평균 대비 편차 ──────────────────
    (() => {
      const dev = peerDev(latest.roe, peer.roe);
      const { level, score, triggered } = getSeverityBelow(dev, PEER_DEV.below);
      return {
        id: 'roe',
        name: '자기자본이익률(ROE)',
        nameEn: 'Return on Equity',
        description: `${latest.roe.toFixed(1)}% (4행 평균 ${peer.roe.toFixed(1)}%, 편차 ${fmt(dev, 1)}%)`,
        auditNote: 'ROE가 동종 평균을 크게 하회하면 자본 효율성 저하 또는 이익 과대계상 수정 가능성을 시사. 지속 하락 시 배당 압박으로 인한 이익조정 유인 증가.',
        currentValue: latest.roe,
        peerAverage: peer.roe,
        threshold: peer.roe,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: getTrend(latest.roe, prev?.roe, false),
      };
    })(),

    // ── 2. 순이자마진(NIM) — 동종 4행 평균 대비 편차 ─────────────────────
    (() => {
      const dev = peerDev(latest.nim, peer.nim);
      const { level, score, triggered } = getSeverityBelow(dev, PEER_DEV.below);
      return {
        id: 'nim',
        name: '순이자마진(NIM)',
        nameEn: 'Net Interest Margin',
        description: `${latest.nim.toFixed(2)}% (4행 평균 ${peer.nim.toFixed(2)}%, 편차 ${fmt(dev, 1)}%)`,
        auditNote: 'NIM이 동종 평균 대비 낮다면 역마진 구조 또는 단기 부채 조달 의존도 증가를 시사. 금리 상승기에 역행하면 ALM 리스크 점검 필요.',
        currentValue: latest.nim,
        peerAverage: peer.nim,
        threshold: peer.nim,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: getTrend(latest.nim, prev?.nim, false),
      };
    })(),

    // ── 3. 보통주자본비율(CET1) — Basel III 공식 기준 ────────────────────
    (() => {
      const t = CET1_THRESHOLDS;
      let level: RiskLevel = 'SAFE'; let score = 0; let triggered = false;
      if (latest.cet1Ratio <= t.danger)       { level = 'DANGER';  score = 30; triggered = true; }
      else if (latest.cet1Ratio <= t.warning) { level = 'WARNING'; score = 20; triggered = true; }
      else if (latest.cet1Ratio <= t.watch)   { level = 'WATCH';   score = 10; triggered = true; }
      return {
        id: 'cet1',
        name: '보통주자본비율(CET1)',
        nameEn: 'Common Equity Tier 1',
        description: `${latest.cet1Ratio.toFixed(1)}% (D-SIB 최저선 ${t.danger}%)`,
        auditNote: 'CET1이 규제 최저선(8%)에 근접하면 배당·상여 지급 제한 및 조기시정조치(PCA) 대상이 될 수 있어 계속기업 불확실성 검토 필요. BIS 대비 CET1 격차 확대 시 하이브리드 자본 의존도 과다 의심.',
        currentValue: latest.cet1Ratio,
        threshold: t.danger,
        unit: '%',
        basis: t.basis,
        severity: level, scoreContribution: score, triggered,
        trend: getTrend(latest.cet1Ratio, prev?.cet1Ratio, false),
      };
    })(),

    // ── 4. 순영업수익 — 증감률의 4행 평균 대비 편차 ──────────────────────
    (() => {
      const dev = growthDev(norGrowth, peer.norGrowth);
      const { level, score, triggered } = getSeverityBelow(dev, PEER_DEV.growthBelow);
      return {
        id: 'net_op_rev',
        name: '순영업수익',
        nameEn: 'Net Operating Revenue',
        description: `${latest.netOperatingRevenue.toLocaleString()}억원, 전년비 ${fmt(norGrowth, 1)}% (4행 평균 ${fmt(peer.norGrowth, 1)}%, 편차 ${fmt(dev, 1)}%p)`,
        auditNote: '순영업수익 증감률이 동종 평균을 크게 하회하면 수익 구조 악화 또는 일회성 손실 가능성. 이자이익과 비이자이익 항목별 구성 변화 분석 필요.',
        currentValue: norGrowth,
        peerAverage: peer.norGrowth,
        threshold: peer.norGrowth + PEER_DEV.growthBelow.watch,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: dev >= 0 ? 'DOWN' : 'UP',
      };
    })(),

    // ── 5. 비이자이익 — 증감률의 4행 평균 대비 편차 ──────────────────────
    (() => {
      const dev = growthDev(niiGrowth, peer.niiGrowth);
      const { level, score, triggered } = getSeverityBelow(dev, PEER_DEV.growthBelow);
      return {
        id: 'non_interest',
        name: '비이자이익',
        nameEn: 'Non-Interest Income',
        description: `${latest.nonInterestIncome.toLocaleString()}억원, 전년비 ${fmt(niiGrowth, 1)}% (4행 평균 ${fmt(peer.niiGrowth, 1)}%, 편차 ${fmt(dev, 1)}%p)`,
        auditNote: '비이자이익 감소가 동종 대비 두드러지면 수수료 기반 약화 또는 유가증권 평가손 집중 가능성. 수익 다변화 전략의 실질적 이행 여부 점검.',
        currentValue: niiGrowth,
        peerAverage: peer.niiGrowth,
        threshold: peer.niiGrowth + PEER_DEV.growthBelow.watch,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: dev >= 0 ? 'DOWN' : 'UP',
      };
    })(),

    // ── 6. 대손비용 — 증감률의 4행 평균 대비 편차 ────────────────────────
    (() => {
      const dev = growthDev(ccGrowth, peer.creditCostGrowth);
      const { level, score, triggered } = getSeverityAbove(dev, PEER_DEV.growthAbove);
      return {
        id: 'credit_cost',
        name: '대손비용',
        nameEn: 'Credit Cost',
        description: `${latest.creditCost.toLocaleString()}억원, 전년비 ${fmt(ccGrowth, 1)}% (4행 평균 ${fmt(peer.creditCostGrowth, 1)}%, 편차 ${fmt(dev, 1)}%p)`,
        auditNote: '동종 대비 대손비용 급증은 부실 대출 선제 인식 또는 전년도 충당금 과소 적립 수정 신호. IFRS 9 ECL 모델의 PD·LGD 가정 및 시나리오 가중치 적정성 점검 필요.',
        currentValue: ccGrowth,
        peerAverage: peer.creditCostGrowth,
        threshold: peer.creditCostGrowth + PEER_DEV.growthAbove.watch,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: dev <= 0 ? 'DOWN' : 'UP',
      };
    })(),

    // ── 7. 대손비용률 — 동종 4행 평균 대비 편차 ──────────────────────────
    (() => {
      const dev = peerDev(latest.creditCostRatio, peer.creditCostRatio);
      const { level, score, triggered } = getSeverityAbove(dev, PEER_DEV.above);
      return {
        id: 'credit_cost_ratio',
        name: '대손비용률',
        nameEn: 'Credit Cost Ratio',
        description: `${latest.creditCostRatio.toFixed(2)}% (4행 평균 ${peer.creditCostRatio.toFixed(2)}%, 편차 ${fmt(dev, 1)}%)`,
        auditNote: '대손비용률이 동종 평균을 크게 상회하면 대출 포트폴리오 자산건전성 악화 선행 신호. 부문별(가계·기업·기타) 대출 분포 및 담보 적정성 감사 표본 확대 검토.',
        currentValue: latest.creditCostRatio,
        peerAverage: peer.creditCostRatio,
        threshold: peer.creditCostRatio,
        unit: '%',
        basis: PEER_DEV.basis,
        severity: level, scoreContribution: score, triggered,
        trend: getTrend(latest.creditCostRatio, prev?.creditCostRatio, true),
      };
    })(),
  ];

  const totalScore = Math.min(100, flags.reduce((s, f) => s + f.scoreContribution, 0));
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
