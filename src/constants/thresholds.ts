// 감사 관점 위험 임계값
export const THRESHOLDS = {
  roe: {
    danger: 5.0, warning: 7.0, watch: 8.5,
    label: '자기자본이익률(ROE)', unit: '%', direction: 'lower_is_worse',
  },
  nim: {
    danger: 1.2, warning: 1.4, watch: 1.6,
    label: '순이자마진(NIM)', unit: '%', direction: 'lower_is_worse',
  },
  cet1Ratio: {
    danger: 8.5, warning: 10.0, watch: 11.5,
    label: '보통주자본비율(CET1)', unit: '%', direction: 'lower_is_worse',
  },
  netOpRevGrowth: {
    danger: -25, warning: -15, watch: -10,
    label: '순영업수익 증감률', unit: '%', direction: 'lower_is_worse',
  },
  nonInterestGrowth: {
    danger: -40, warning: -25, watch: -15,
    label: '비이자이익 증감률', unit: '%', direction: 'lower_is_worse',
  },
  creditCostGrowth: {
    watch: 30, warning: 50, danger: 100,
    label: '대손비용 증감률', unit: '%', direction: 'higher_is_worse',
  },
  creditCostRatio: {
    watch: 0.3, warning: 0.5, danger: 0.8,
    label: '대손비용률', unit: '%', direction: 'higher_is_worse',
  },
};

export const RISK_SCORE_BANDS = {
  SAFE:    { min: 0,  max: 25, label: '양호', color: '#10B981' },
  WATCH:   { min: 26, max: 50, label: '주의', color: '#F59E0B' },
  WARNING: { min: 51, max: 75, label: '경고', color: '#F97316' },
  DANGER:  { min: 76, max: 100, label: '위험', color: '#EF4444' },
};
