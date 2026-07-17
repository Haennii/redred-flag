import { FinancialMetrics } from '../types';

// 공개된 사업보고서 기반 추정치 (억원 단위)
// 출처: 각 금융지주 사업보고서, 금융감독원 금융통계정보시스템

export const MOCK_DATA: Record<string, FinancialMetrics[]> = {
  kb: [
    {
      year: 2020,
      totalAssets: 6_450_000, totalLoans: 3_820_000, totalDeposits: 3_940_000,
      totalEquity: 430_000, interestIncome: 128_000, interestExpense: 42_000,
      netIncome: 33_500, allowanceForLosses: 38_200,
      bisRatio: 14.8, nplRatio: 0.63, nim: 1.65, roa: 0.52, roe: 8.1, ldr: 96.9, allowanceCoverage: 105.2,
    },
    {
      year: 2021,
      totalAssets: 6_670_000, totalLoans: 4_050_000, totalDeposits: 4_180_000,
      totalEquity: 460_000, interestIncome: 136_000, interestExpense: 38_000,
      netIncome: 44_000, allowanceForLosses: 40_500,
      bisRatio: 15.5, nplRatio: 0.52, nim: 1.68, roa: 0.66, roe: 9.8, ldr: 96.9, allowanceCoverage: 110.3,
    },
    {
      year: 2022,
      totalAssets: 6_900_000, totalLoans: 4_230_000, totalDeposits: 4_350_000,
      totalEquity: 490_000, interestIncome: 162_000, interestExpense: 56_000,
      netIncome: 47_000, allowanceForLosses: 42_300,
      bisRatio: 16.2, nplRatio: 0.41, nim: 1.82, roa: 0.68, roe: 10.2, ldr: 97.2, allowanceCoverage: 118.6,
    },
    {
      year: 2023,
      totalAssets: 7_140_000, totalLoans: 4_380_000, totalDeposits: 4_520_000,
      totalEquity: 510_000, interestIncome: 174_000, interestExpense: 65_000,
      netIncome: 48_000, allowanceForLosses: 43_800,
      bisRatio: 16.5, nplRatio: 0.47, nim: 1.87, roa: 0.67, roe: 10.0, ldr: 96.9, allowanceCoverage: 113.4,
    },
    {
      year: 2024,
      totalAssets: 7_380_000, totalLoans: 4_560_000, totalDeposits: 4_710_000,
      totalEquity: 535_000, interestIncome: 178_000, interestExpense: 67_000,
      netIncome: 51_000, allowanceForLosses: 45_600,
      bisRatio: 16.8, nplRatio: 0.52, nim: 1.85, roa: 0.69, roe: 10.5, ldr: 96.8, allowanceCoverage: 112.1,
    },
  ],

  shinhan: [
    {
      year: 2020,
      totalAssets: 6_100_000, totalLoans: 3_610_000, totalDeposits: 3_750_000,
      totalEquity: 400_000, interestIncome: 119_000, interestExpense: 40_000,
      netIncome: 31_000, allowanceForLosses: 36_100,
      bisRatio: 14.5, nplRatio: 0.58, nim: 1.62, roa: 0.51, roe: 7.9, ldr: 96.3, allowanceCoverage: 102.8,
    },
    {
      year: 2021,
      totalAssets: 6_340_000, totalLoans: 3_820_000, totalDeposits: 3_960_000,
      totalEquity: 425_000, interestIncome: 127_000, interestExpense: 37_000,
      netIncome: 39_000, allowanceForLosses: 38_200,
      bisRatio: 15.2, nplRatio: 0.47, nim: 1.64, roa: 0.61, roe: 9.4, ldr: 96.5, allowanceCoverage: 108.7,
    },
    {
      year: 2022,
      totalAssets: 6_530_000, totalLoans: 3_980_000, totalDeposits: 4_100_000,
      totalEquity: 445_000, interestIncome: 151_000, interestExpense: 52_000,
      netIncome: 41_000, allowanceForLosses: 39_800,
      bisRatio: 15.8, nplRatio: 0.38, nim: 1.72, roa: 0.63, roe: 9.8, ldr: 97.1, allowanceCoverage: 115.2,
    },
    {
      year: 2023,
      totalAssets: 6_830_000, totalLoans: 4_150_000, totalDeposits: 4_310_000,
      totalEquity: 465_000, interestIncome: 163_000, interestExpense: 62_000,
      netIncome: 43_000, allowanceForLosses: 41_500,
      bisRatio: 15.8, nplRatio: 0.44, nim: 1.76, roa: 0.63, roe: 9.9, ldr: 96.3, allowanceCoverage: 111.6,
    },
    {
      year: 2024,
      totalAssets: 7_150_000, totalLoans: 4_340_000, totalDeposits: 4_510_000,
      totalEquity: 488_000, interestIncome: 167_000, interestExpense: 64_000,
      netIncome: 45_000, allowanceForLosses: 43_400,
      bisRatio: 16.0, nplRatio: 0.49, nim: 1.78, roa: 0.63, roe: 10.1, ldr: 96.2, allowanceCoverage: 110.8,
    },
  ],

  hana: [
    {
      year: 2020,
      totalAssets: 5_430_000, totalLoans: 3_210_000, totalDeposits: 3_280_000,
      totalEquity: 355_000, interestIncome: 107_000, interestExpense: 37_000,
      netIncome: 27_000, allowanceForLosses: 32_100,
      bisRatio: 15.5, nplRatio: 0.61, nim: 1.68, roa: 0.50, roe: 8.2, ldr: 97.9, allowanceCoverage: 101.3,
    },
    {
      year: 2021,
      totalAssets: 5_710_000, totalLoans: 3_450_000, totalDeposits: 3_530_000,
      totalEquity: 380_000, interestIncome: 115_000, interestExpense: 35_000,
      netIncome: 32_000, allowanceForLosses: 34_500,
      bisRatio: 16.2, nplRatio: 0.50, nim: 1.71, roa: 0.56, roe: 9.5, ldr: 97.7, allowanceCoverage: 108.2,
    },
    {
      year: 2022,
      totalAssets: 5_990_000, totalLoans: 3_670_000, totalDeposits: 3_780_000,
      totalEquity: 400_000, interestIncome: 140_000, interestExpense: 51_000,
      netIncome: 35_000, allowanceForLosses: 36_700,
      bisRatio: 17.0, nplRatio: 0.41, nim: 1.82, roa: 0.58, roe: 10.1, ldr: 97.1, allowanceCoverage: 114.9,
    },
    {
      year: 2023,
      totalAssets: 6_270_000, totalLoans: 3_840_000, totalDeposits: 3_970_000,
      totalEquity: 415_000, interestIncome: 151_000, interestExpense: 60_000,
      // 2023년 순이익 감소 - 이상징후 포인트
      netIncome: 34_000, allowanceForLosses: 38_400,
      bisRatio: 17.2, nplRatio: 0.49, nim: 1.85, roa: 0.54, roe: 9.5, ldr: 96.7, allowanceCoverage: 108.6,
    },
    {
      year: 2024,
      totalAssets: 6_580_000, totalLoans: 4_020_000, totalDeposits: 4_160_000,
      totalEquity: 432_000, interestIncome: 155_000, interestExpense: 62_000,
      netIncome: 36_500, allowanceForLosses: 40_200,
      bisRatio: 17.5, nplRatio: 0.55, nim: 1.83, roa: 0.56, roe: 9.8, ldr: 96.6, allowanceCoverage: 107.1,
    },
  ],

  woori: [
    {
      year: 2020,
      totalAssets: 4_550_000, totalLoans: 2_800_000, totalDeposits: 2_830_000,
      totalEquity: 285_000, interestIncome: 94_000, interestExpense: 35_000,
      netIncome: 19_000, allowanceForLosses: 28_000,
      // 2020년 예대율 100% 초과 - 위험 이상징후
      bisRatio: 13.8, nplRatio: 0.72, nim: 1.58, roa: 0.42, roe: 7.1, ldr: 98.9, allowanceCoverage: 98.4,
    },
    {
      year: 2021,
      totalAssets: 4_800_000, totalLoans: 3_020_000, totalDeposits: 3_090_000,
      totalEquity: 305_000, interestIncome: 100_000, interestExpense: 33_000,
      netIncome: 23_000, allowanceForLosses: 30_200,
      bisRatio: 14.3, nplRatio: 0.62, nim: 1.60, roa: 0.48, roe: 8.3, ldr: 97.7, allowanceCoverage: 102.1,
    },
    {
      year: 2022,
      totalAssets: 5_120_000, totalLoans: 3_240_000, totalDeposits: 3_350_000,
      totalEquity: 325_000, interestIncome: 122_000, interestExpense: 47_000,
      netIncome: 26_000, allowanceForLosses: 32_400,
      bisRatio: 14.8, nplRatio: 0.51, nim: 1.71, roa: 0.51, roe: 9.0, ldr: 96.7, allowanceCoverage: 108.3,
    },
    {
      year: 2023,
      totalAssets: 5_430_000, totalLoans: 3_420_000, totalDeposits: 3_570_000,
      totalEquity: 342_000, interestIncome: 132_000, interestExpense: 54_000,
      netIncome: 27_000, allowanceForLosses: 34_200,
      bisRatio: 15.1, nplRatio: 0.58, nim: 1.73, roa: 0.50, roe: 9.1, ldr: 95.8, allowanceCoverage: 107.6,
    },
    {
      year: 2024,
      totalAssets: 5_780_000, totalLoans: 3_620_000, totalDeposits: 3_800_000,
      totalEquity: 362_000, interestIncome: 136_000, interestExpense: 56_000,
      netIncome: 29_000, allowanceForLosses: 36_200,
      bisRatio: 15.3, nplRatio: 0.64, nim: 1.71, roa: 0.50, roe: 9.3, ldr: 95.3, allowanceCoverage: 106.2,
    },
  ],
};
