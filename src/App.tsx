import { useState, useEffect } from 'react';
import { BankAnalysis } from './types';
import { BANKS, ANALYSIS_YEARS } from './constants/banks';
import { fetchBankMetrics } from './api/dart';
import { assessRedFlags, getRiskLevel } from './utils/riskFlags';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

export default function App() {
  const [analyses, setAnalyses] = useState<BankAnalysis[]>([]);
  const [selectedBankId, setSelectedBankId] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const results = await Promise.all(
        BANKS.map(async bank => {
          const { metrics, source } = await fetchBankMetrics(bank.id, bank.corpCode, ANALYSIS_YEARS);
          const { flags, score } = assessRedFlags(metrics);
          const riskLevel = getRiskLevel(score);
          const latestMetrics = metrics[metrics.length - 1];
          return {
            bank,
            metrics,
            redFlags: flags,
            riskScore: score,
            riskLevel,
            latestMetrics,
            dataSource: source,
          } satisfies BankAnalysis;
        })
      );
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
