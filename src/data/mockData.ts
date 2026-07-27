import { FinancialMetrics } from '../types';

// 2021-2024: DART API 실데이터 검증값 (API 실패 시 fallback 용도)
//   정상 동작 시에는 DART API 실데이터 + cet1Ratio 조합 사용
//   여기서 cet1Ratio는 감독당국 공시 기준으로 입력
// 2020: DART API 미지원 → 사업보고서 HTML 파싱 + 기준금리 기반 추정 (억원 단위)
// 출처: 각 은행 사업보고서, 금융감독원 경영공시, 한국은행 기준금리 이력

export const MOCK_DATA: Record<string, FinancialMetrics[]> = {
  kb: [
    {
      // 2020: 이자수익·대출채권은 2021 사업보고서 전기 열에서 직접 추출
      // 이자비용: BOK 기준금리 평균 0.75% 환경 → 2021 대비 ~1.5배
      // 대손비용: COVID-19 대규모 충당금 (2021 대비 약 2배)
      year: 2020,
      totalAssets: 4_236_000, totalLoans: 3_184_823, totalEquity: 304_598,
      interestIncome: 97_187, interestExpense: 35_000, netIncome: 22_000,
      netOperatingRevenue: 71_187, nonInterestIncome: 9_000,
      creditCost: 7_100, creditCostRatio: 0.223,
      roe: 7.22, nim: 1.47, cet1Ratio: 13.2,
    },
    {
      year: 2021,
      totalAssets: 4_647_734, totalLoans: 3_494_388, totalEquity: 326_176,
      interestIncome: 94_908, interestExpense: 23_595, netIncome: 25_634,
      netOperatingRevenue: 78_539, nonInterestIncome: 7_226,
      creditCost: 3_566, creditCostRatio: 0.102,
      roe: 7.86, nim: 1.534, cet1Ratio: 13.9,
    },
    {
      year: 2022,
      totalAssets: 5_003_435, totalLoans: 3_638_391, totalEquity: 335_538,
      interestIncome: 139_620, interestExpense: 54_028, netIncome: 29_082,
      netOperatingRevenue: 90_846, nonInterestIncome: 5_254,
      creditCost: 4_614, creditCostRatio: 0.127,
      roe: 8.67, nim: 1.711, cet1Ratio: 14.6,
    },
    {
      year: 2023,
      totalAssets: 5_123_728, totalLoans: 3_736_230, totalEquity: 362_152,
      interestIncome: 208_747, interestExpense: 115_664, netIncome: 30_012,
      netOperatingRevenue: 97_477, nonInterestIncome: 4_394,
      creditCost: 11_633, creditCostRatio: 0.311,
      roe: 8.29, nim: 1.817, cet1Ratio: 14.9,
    },
    {
      year: 2024,
      totalAssets: 5_435_964, totalLoans: 3_963_902, totalEquity: 373_462,
      interestIncome: 216_470, interestExpense: 120_572, netIncome: 30_736,
      netOperatingRevenue: 99_088, nonInterestIncome: 3_190,
      creditCost: 4_171, creditCostRatio: 0.105,
      roe: 8.23, nim: 1.764, cet1Ratio: 15.2,
    },
  ],

  shinhan: [
    {
      year: 2020,
      totalAssets: 3_983_000, totalLoans: 2_760_000, totalEquity: 262_000,
      interestIncome: 85_911, interestExpense: 38_000, netIncome: 18_000,
      netOperatingRevenue: 55_911, nonInterestIncome: 8_000,
      creditCost: 7_200, creditCostRatio: 0.261,
      roe: 6.87, nim: 1.20, cet1Ratio: 12.9,
    },
    {
      year: 2021,
      totalAssets: 4_325_159, totalLoans: 2_995_598, totalEquity: 275_737,
      interestIncome: 83_870, interestExpense: 25_491, netIncome: 21_529,
      netOperatingRevenue: 62_037, nonInterestIncome: 3_658,
      creditCost: 2_411, creditCostRatio: 0.081,
      roe: 7.81, nim: 1.350, cet1Ratio: 13.6,
    },
    {
      year: 2022,
      totalAssets: 4_548_425, totalLoans: 3_152_346, totalEquity: 291_387,
      interestIncome: 127_440, interestExpense: 55_058, netIncome: 26_319,
      netOperatingRevenue: 71_446, nonInterestIncome: -936,
      creditCost: 5_449, creditCostRatio: 0.173,
      roe: 9.03, nim: 1.591, cet1Ratio: 14.2,
    },
    {
      year: 2023,
      totalAssets: 4_697_271, totalLoans: 3_170_622, totalEquity: 310_569,
      interestIncome: 185_738, interestExpense: 111_932, netIncome: 26_121,
      netOperatingRevenue: 74_539, nonInterestIncome: 733,
      creditCost: 7_299, creditCostRatio: 0.230,
      roe: 8.41, nim: 1.571, cet1Ratio: 14.2,
    },
    {
      year: 2024,
      totalAssets: 5_117_592, totalLoans: 3_515_751, totalEquity: 333_284,
      interestIncome: 196_682, interestExpense: 120_170, netIncome: 30_324,
      netOperatingRevenue: 75_603, nonInterestIncome: -909,
      creditCost: 3_086, creditCostRatio: 0.088,
      roe: 9.10, nim: 1.495, cet1Ratio: 14.4,
    },
  ],

  hana: [
    {
      year: 2020,
      totalAssets: 3_809_000, totalLoans: 2_734_842, totalEquity: 261_000,
      interestIncome: 80_685, interestExpense: 35_000, netIncome: 18_666,
      netOperatingRevenue: 50_685, nonInterestIncome: 5_000,
      creditCost: 5_700, creditCostRatio: 0.208,
      roe: 7.15, nim: 1.20, cet1Ratio: 13.9,
    },
    {
      year: 2021,
      totalAssets: 4_118_616, totalLoans: 2_956_807, totalEquity: 274_513,
      interestIncome: 79_817, interestExpense: 23_499, netIncome: 23_801,
      netOperatingRevenue: 61_041, nonInterestIncome: 4_723,
      creditCost: 1_420, creditCostRatio: 0.048,
      roe: 8.67, nim: 1.367, cet1Ratio: 14.6,
    },
    {
      year: 2022,
      totalAssets: 4_661_382, totalLoans: 3_161_724, totalEquity: 285_427,
      interestIncome: 123_841, interestExpense: 53_372, netIncome: 29_860,
      netOperatingRevenue: 75_342, nonInterestIncome: 4_873,
      creditCost: 3_603, creditCostRatio: 0.114,
      roe: 10.46, nim: 1.512, cet1Ratio: 15.4,
    },
    {
      year: 2023,
      totalAssets: 4_785_115, totalLoans: 3_319_085, totalEquity: 304_179,
      interestIncome: 186_582, interestExpense: 113_035, netIncome: 32_922,
      netOperatingRevenue: 80_593, nonInterestIncome: 7_046,
      creditCost: 5_387, creditCostRatio: 0.162,
      roe: 10.82, nim: 1.537, cet1Ratio: 15.6,
    },
    {
      year: 2024,
      totalAssets: 5_099_231, totalLoans: 3_505_751, totalEquity: 319_434,
      interestIncome: 191_431, interestExpense: 119_343, netIncome: 31_273,
      netOperatingRevenue: 77_409, nonInterestIncome: 5_321,
      creditCost: 2_348, creditCostRatio: 0.067,
      roe: 9.79, nim: 1.414, cet1Ratio: 15.9,
    },
  ],

  woori: [
    {
      year: 2020,
      totalAssets: 3_724_000, totalLoans: 2_861_578, totalEquity: 225_000,
      interestIncome: 80_621, interestExpense: 33_000, netIncome: 15_000,
      netOperatingRevenue: 54_621, nonInterestIncome: 7_000,
      creditCost: 6_500, creditCostRatio: 0.227,
      roe: 6.67, nim: 1.28, cet1Ratio: 12.2,
    },
    {
      year: 2021,
      totalAssets: 3_973_571, totalLoans: 3_052_778, totalEquity: 236_906,
      interestIncome: 75_734, interestExpense: 22_260, netIncome: 21_523,
      netOperatingRevenue: 58_901, nonInterestIncome: 5_427,
      creditCost: 1_435, creditCostRatio: 0.047,
      roe: 9.09, nim: 1.346, cet1Ratio: 12.7,
    },
    {
      year: 2022,
      totalAssets: 4_245_355, totalLoans: 3_087_854, totalEquity: 244_339,
      interestIncome: 115_137, interestExpense: 48_996, netIncome: 25_474,
      netOperatingRevenue: 71_000, nonInterestIncome: 4_859,
      creditCost: 3_906, creditCostRatio: 0.127,
      roe: 10.43, nim: 1.558, cet1Ratio: 13.2,
    },
    {
      year: 2023,
      totalAssets: 4_366_879, totalLoans: 3_208_106, totalEquity: 250_968,
      interestIncome: 169_818, interestExpense: 102_933, netIncome: 22_771,
      netOperatingRevenue: 69_881, nonInterestIncome: 2_996,
      creditCost: 9_310, creditCostRatio: 0.290,
      roe: 9.07, nim: 1.532, cet1Ratio: 13.5,
    },
    {
      year: 2024,
      totalAssets: 4_612_248, totalLoans: 3_424_653, totalEquity: 267_273,
      interestIncome: 179_824, interestExpense: 112_406, netIncome: 27_946,
      netOperatingRevenue: 70_046, nonInterestIncome: 2_628,
      creditCost: -6_983, creditCostRatio: -0.204,
      roe: 10.46, nim: 1.462, cet1Ratio: 13.7,
    },
  ],
};
