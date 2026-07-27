import { Bank } from '../types';

export const BANKS: Bank[] = [
  {
    id: 'kb',
    name: 'KB국민은행',
    shortName: 'KB국민',
    corpCode: '00386937', // KB국민은행 (별도재무제표 기준)
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
  },
  {
    id: 'shinhan',
    name: '신한은행',
    shortName: '신한',
    corpCode: '00149293', // 신한은행
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'hana',
    name: '하나은행',
    shortName: '하나',
    corpCode: '00158909', // 하나은행
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'woori',
    name: '우리은행',
    shortName: '우리',
    corpCode: '00254045', // 우리은행
    color: '#818CF8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
  },
];

export const ANALYSIS_YEARS = [2020, 2021, 2022, 2023, 2024];
export const LATEST_YEAR = 2024;
