interface HeaderProps {
  lastUpdated: string;
}

export default function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="border-b border-gray-800 bg-[#0B1120]">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-red-500 rounded-full" />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                RedFlag <span className="text-red-400">·</span> 은행 재무 이상징후 분석
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                4대 시중은행 재무제표 기반 감사위험 조기경보 대시보드
              </p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">데이터 기준</div>
          <div className="text-sm text-gray-300 font-mono">{lastUpdated}</div>
          <div className="text-xs text-gray-600 mt-0.5">출처: DART 전자공시 / 사업보고서</div>
        </div>
      </div>
    </header>
  );
}
