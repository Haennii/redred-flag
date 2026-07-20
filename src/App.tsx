import { useState, useEffect } from 'react';
import { BankAnalysis } from './types';
import { BANKS, ANALYSIS_YEARS } from './constants/banks';
import { fetchBankMetrics } from './api/dart';
import { assessRedFlags, computePeerAverages, getRiskLevel } from './utils/riskFlags';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

export default function App() {
  const [analyses, setAnalyses] = useState<BankAnalysis[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1단계: 전 은행 데이터 병렬 로드
      const fetched = await Promise.all(
        BANKS.map(bank => fetchBankMetrics(bank.id, bank.corpCode, ANALYSIS_YEARS))
      );

      // 2단계: 동종 4행 평균 계산
      const allMetrics = fetched.map(f => f.metrics);
      const peerAvg = computePeerAverages(allMetrics);

      // 3단계: 은행별 이상징후 평가 (동종 평균 기준 적용)
      const results: BankAnalysis[] = fetched.map((f, i) => {
        const bank = BANKS[i];
        const { flags, score } = assessRedFlags(f.metrics, peerAvg);
        const riskLevel = getRiskLevel(score);
        return {
          bank,
          metrics: f.metrics,
          redFlags: flags,
          riskScore: score,
          riskLevel,
          latestMetrics: f.metrics[f.metrics.length - 1],
          dataSource: f.source,
        };
      });

      setAnalyses(results);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <div className="text-gray-400 text-sm">DART 데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Header lastUpdated={today} />
      <Dashboard
        analyses={analyses}
        selectedBankId={selectedBankId}
        onSelectBank={setSelectedBankId}
      />
    </div>
  );
}
