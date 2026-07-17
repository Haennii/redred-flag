// 감사 관점 위험 임계값 (Basel III / 금융감독원 기준)
export const THRESHOLDS = {
  bisRatio: {
    danger: 10.5,   // Basel III 최소 요건
    warning: 12.0,
    watch: 14.0,
    label: 'BIS 자기자본비율',
    unit: '%',
    direction: 'lower_is_worse', // 낮을수록 위험
  },
  nplRatio: {
    watch: 0.5,
    warning: 0.8,
    danger: 1.5,
    label: '고정이하여신비율(NPL)',
    unit: '%',
    direction: 'higher_is_worse',
  },
  roa: {
    danger: 0.3,
    warning: 0.5,
    watch: 0.65,
    label: 'ROA',
    unit: '%',
    direction: 'lower_is_worse',
  },
  roe: {
    danger: 5.0,
    warning: 7.0,
    watch: 8.5,
    label: 'ROE',
    unit: '%',
    direction: 'lower_is_worse',
  },
  nim: {
    danger: 1.2,
    warning: 1.4,
    watch: 1.6,
    label: '순이자마진(NIM)',
    unit: '%',
    direction: 'lower_is_worse',
  },
  ldr: {
    watch: 90,
    warning: 95,
    danger: 100,
    label: '예대율',
    unit: '%',
    direction: 'higher_is_worse',
  },
  allowanceCoverage: {
    danger: 70,
    warning: 85,
    watch: 100,
    label: '대손충당금 적립률',
    unit: '%',
    direction: 'lower_is_worse',
  },
  loanGrowthRate: {
    watch: 10,
    warning: 15,
    danger: 20,
    label: '대출성장률',
    unit: '%',
    direction: 'higher_is_worse',
  },
};

export const RISK_SCORE_BANDS = {
  SAFE: { min: 0, max: 25, label: '양호', color: '#10B981' },
  WATCH: { min: 26, max: 50, label: '주의', color: '#F59E0B' },
  WARNING: { min: 51, max: 75, label: '경고', color: '#F97316' },
  DANGER: { min: 76, max: 100, label: '위험', color: '#EF4444' },
};
