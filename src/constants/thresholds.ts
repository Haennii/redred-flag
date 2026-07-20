// ─── 공식 기준 ───────────────────────────────────────────────────────────────
// 보통주자본비율(CET1): Basel III + 금융위원회 고시 (은행업감독규정 §26)
// 4대 은행은 D-SIB(국내 시스템적 중요 은행) 지정 → +1% 추가 요구
// 최소 4.5% + 자본보전완충 2.5% + D-SIB 1.0% = 8.0% 실질 최저선
export const CET1_THRESHOLDS = {
  danger:  8.0,   // D-SIB 포함 실질 최저선 (미달 시 배당·상여 제한)
  warning: 10.0,  // 금감원 경영실태평가 3등급 기준 참고
  watch:   11.5,  // 4대 은행 평균 하단 수준
  basis: 'Basel III 최종안 (BCBS, 2017) · 금융위원회 고시 제2023-14호',
};

// ─── 동종 4행 평균 대비 편차 기준 ────────────────────────────────────────────
// ISA 520 (분석적 절차) — 동종 업계 비교를 통한 이상치 탐지
// 편차 = (개별값 − 4행 평균) / |4행 평균| × 100 (%)
export const PEER_DEV = {
  // 낮을수록 나쁜 지표: 평균보다 낮으면 위험
  below: { watch: -10, warning: -20, danger: -35 },
  // 높을수록 나쁜 지표: 평균보다 높으면 위험
  above: { watch: 20,  warning: 40,  danger: 80  },
  // 증감률 편차 (pp): 증가율이 평균보다 낮으면 위험 (수익 지표)
  growthBelow: { watch: -10, warning: -20, danger: -35 },
  // 증감률 편차 (pp): 증가율이 평균보다 높으면 위험 (비용 지표)
  growthAbove: { watch: 15,  warning: 30,  danger: 60  },
  basis: 'ISA 520 분석적 절차 · 금감원 국내은행 경영현황 공시 (동종 4행 비교)',
};

export const RISK_SCORE_BANDS = {
  SAFE:    { min: 0,  max: 25, label: '양호', color: '#10B981' },
  WATCH:   { min: 26, max: 50, label: '주의', color: '#F59E0B' },
  WARNING: { min: 51, max: 75, label: '경고', color: '#F97316' },
  DANGER:  { min: 76, max: 100, label: '위험', color: '#EF4444' },
};
