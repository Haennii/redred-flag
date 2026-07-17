import { Bank } from '../types';

export const BANKS: Bank[] = [
  {
    id: 'kb',
    name: 'KB금융지주',
    shortName: 'KB국민',
    corpCode: '00164779',
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
  },
  {
    id: 'shinhan',
    name: '신한금융지주',
    shortName: '신한',
    corpCode: '00138012',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
  },
  {
    id: 'hana',
    name: '하나금융지주',
    shortName: '하나',
    corpCode: '00547258',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    id: 'woori',
    name: '우리금융지주',
    shortName: '우리',
    corpCode: '00093671',
    color: '#818CF8',
    bgColor: 'rgba(129, 140, 248, 0.15)',
  },
];

export const ANALYSIS_YEARS = [2020, 2021, 2022, 2023, 2024];
export const LATEST_YEAR = 2024;
