import { CET1_THRESHOLDS, PEER_DEV, RISK_SCORE_BANDS } from '../constants/thresholds';

const SECTION = 'mb-10';
const H2 = 'text-base font-semibold text-white mb-4 pb-2 border-b border-gray-800';
const H3 = 'text-sm font-semibold text-gray-200 mb-1';
const BODY = 'text-sm text-gray-400 leading-relaxed';
const TAG = 'inline-block px-2 py-0.5 rounded text-xs font-mono';

const INDICATORS = [
  {
    id: '01',
    name: '자기자본이익률(ROE)',
    nameEn: 'Return on Equity',
    formula: 'ROE = 당기순이익 ÷ 자본총계 × 100',
    type: '동종 평균 대비 편차',
    thresholds: [
      { label: '주의', value: `편차 ≤ ${PEER_DEV.below.watch}%`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≤ ${PEER_DEV.below.warning}%`, color: '#F97316' },
      { label: '위험', value: `편차 ≤ ${PEER_DEV.below.danger}%`, color: '#EF4444' },
    ],
    auditNote: 'ROE가 동종 평균을 크게 하회하면 자본 효율성 저하 또는 이익 과대계상 수정 가능성을 시사. 지속 하락 시 배당 압박으로 인한 이익조정 유인 증가.',
    ref: 'ISA 520.A13 — 비율분석을 통한 이상치 탐지',
  },
  {
    id: '02',
    name: '순이자마진(NIM)',
    nameEn: 'Net Interest Margin',
    formula: 'NIM = 순이자이익(이자수익 − 이자비용) ÷ 총자산 × 100',
    type: '동종 평균 대비 편차',
    thresholds: [
      { label: '주의', value: `편차 ≤ ${PEER_DEV.below.watch}%`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≤ ${PEER_DEV.below.warning}%`, color: '#F97316' },
      { label: '위험', value: `편차 ≤ ${PEER_DEV.below.danger}%`, color: '#EF4444' },
    ],
    auditNote: 'NIM이 동종 평균 대비 낮다면 역마진 구조 또는 단기 부채 조달 의존도 증가를 시사. 금리 상승기에 역행하면 ALM 리스크 및 이자수익 인식 시점 오류 점검 필요.',
    ref: 'ISA 520.A15 — 동종 업계 정보와의 비교',
  },
  {
    id: '03',
    name: '보통주자본비율(CET1)',
    nameEn: 'Common Equity Tier 1',
    formula: 'CET1 = 보통주자본 ÷ 위험가중자산 × 100',
    type: 'Basel III 공식 기준 (절대값)',
    thresholds: [
      { label: '주의', value: `≤ ${CET1_THRESHOLDS.watch}%`, color: '#F59E0B' },
      { label: '경고', value: `≤ ${CET1_THRESHOLDS.warning}%`, color: '#F97316' },
      { label: '위험', value: `≤ ${CET1_THRESHOLDS.danger}%`, color: '#EF4444' },
    ],
    auditNote: 'CET1이 규제 최저선(8.0%)에 근접하면 배당·상여 지급 제한 및 조기시정조치(PCA) 대상이 될 수 있어 계속기업 불확실성 검토 필요. BIS 비율과의 격차 확대 시 하이브리드 자본 의존도 과다 의심.',
    ref: 'Basel III 최종안(BCBS 2017) · 금융위원회 고시 제2023-14호',
  },
  {
    id: '04',
    name: '순영업수익 증감률',
    nameEn: 'Net Operating Revenue Growth',
    formula: '전년 대비 증감률의 동종 4행 평균 대비 편차(pp)',
    type: '증감률 동종 편차',
    thresholds: [
      { label: '주의', value: `편차 ≤ ${PEER_DEV.growthBelow.watch}%p`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≤ ${PEER_DEV.growthBelow.warning}%p`, color: '#F97316' },
      { label: '위험', value: `편차 ≤ ${PEER_DEV.growthBelow.danger}%p`, color: '#EF4444' },
    ],
    auditNote: '순영업수익 증감률이 동종 평균을 크게 하회하면 수익 구조 악화 또는 일회성 손실 가능성. 이자이익과 비이자이익 항목별 구성 변화 분석 필요.',
    ref: 'ISA 520.A13 — 추세 분석(Trend Analysis)',
  },
  {
    id: '05',
    name: '비이자이익 증감률',
    nameEn: 'Non-Interest Income Growth',
    formula: '전년 대비 증감률의 동종 4행 평균 대비 편차(pp)',
    type: '증감률 동종 편차',
    thresholds: [
      { label: '주의', value: `편차 ≤ ${PEER_DEV.growthBelow.watch}%p`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≤ ${PEER_DEV.growthBelow.warning}%p`, color: '#F97316' },
      { label: '위험', value: `편차 ≤ ${PEER_DEV.growthBelow.danger}%p`, color: '#EF4444' },
    ],
    auditNote: '비이자이익 감소가 동종 대비 두드러지면 수수료 기반 약화 또는 유가증권 평가손 집중 가능성. 수익 다변화 전략의 실질적 이행 여부 및 공정가치 측정 계정 적정성 점검.',
    ref: 'ISA 520.A15 — 동종 업계 정보와의 비교',
  },
  {
    id: '06',
    name: '대손비용 증감률',
    nameEn: 'Credit Cost Growth',
    formula: '전년 대비 증감률의 동종 4행 평균 대비 편차(pp)',
    type: '증감률 동종 편차 (높을수록 위험)',
    thresholds: [
      { label: '주의', value: `편차 ≥ ${PEER_DEV.growthAbove.watch}%p`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≥ ${PEER_DEV.growthAbove.warning}%p`, color: '#F97316' },
      { label: '위험', value: `편차 ≥ ${PEER_DEV.growthAbove.danger}%p`, color: '#EF4444' },
    ],
    auditNote: '동종 대비 대손비용 급증은 부실 대출 선제 인식 또는 전년도 충당금 과소 적립 수정 신호. IFRS 9 ECL 모델의 PD·LGD 가정 및 시나리오 가중치 적정성 점검 필요.',
    ref: 'ISA 540 — 회계추정치 감사 (충당금 적정성)',
  },
  {
    id: '07',
    name: '대손비용률',
    nameEn: 'Credit Cost Ratio',
    formula: '대손비용률 = 신용손실충당금전입액 ÷ 총대출채권 × 100',
    type: '동종 평균 대비 편차 (높을수록 위험)',
    thresholds: [
      { label: '주의', value: `편차 ≥ ${PEER_DEV.above.watch}%`, color: '#F59E0B' },
      { label: '경고', value: `편차 ≥ ${PEER_DEV.above.warning}%`, color: '#F97316' },
      { label: '위험', value: `편차 ≥ ${PEER_DEV.above.danger}%`, color: '#EF4444' },
    ],
    auditNote: '대손비용률이 동종 평균을 크게 상회하면 대출 포트폴리오 자산건전성 악화 선행 신호. 부문별(가계·기업·기타) 대출 분포 및 담보 적정성 감사 표본 확대 검토.',
    ref: 'ISA 540 — 회계추정치 감사 · ISA 520.A13',
  },
];

export default function MethodologyPage() {
  return (
    <div className="max-w-screen-lg mx-auto px-6 py-8 text-gray-300">

      {/* 개요 */}
      <div className={SECTION}>
        <h2 className={H2}>개요</h2>
        <p className={BODY}>
          이 대시보드는 <strong className="text-white">KSA 520 (분석적 절차)</strong> 를 은행 재무감사에 적용한
          포트폴리오 프로젝트입니다. 감사인이 실질적 검토 절차 수행 전 주의 영역을 좁히는
          "위험 식별 단계"를 자동화하는 것을 목적으로 합니다.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: '분석 대상', value: 'KB국민 · 신한 · 하나 · 우리은행' },
            { label: '분석 기간', value: '2020 – 2024 (5개 연도)' },
            { label: '재무제표 기준', value: '별도재무제표 (OFS)' },
          ].map(item => (
            <div key={item.label} className="bg-[#1A2235] rounded-lg p-4 border border-gray-800">
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 적용 감사기준 */}
      <div className={SECTION}>
        <h2 className={H2}>적용 감사기준</h2>
        <div className="space-y-3">
          {[
            {
              code: 'ISA 520',
              title: '분석적 절차',
              desc: '재무정보 간의 관계를 분석하여 비합리적인 변동이나 예상 금액과의 차이를 식별. 동종 업계 비교(A15)와 비율·추세 분석(A13)을 핵심 기법으로 사용.',
            },
            {
              code: 'ISA 540',
              title: '회계추정치 감사',
              desc: '신용손실충당금(ECL)은 경영진 추정치로, PD·LGD·EAD 가정의 적정성과 IFRS 9 시나리오 가중치의 편향 여부를 대손비용 추이로 선별.',
            },
            {
              code: 'Basel III / CET1',
              title: '건전성 규제 기준',
              desc: 'BCBS 2017 최종안 및 금융위원회 고시 제2023-14호. D-SIB 4행 추가 1% 요건 포함, 실질 최저선 8.0% 적용.',
            },
          ].map(item => (
            <div key={item.code} className="bg-[#1A2235] rounded-lg p-4 border border-gray-800 flex gap-4">
              <span className={`${TAG} bg-blue-900/40 text-blue-300 self-start mt-0.5`}>{item.code}</span>
              <div>
                <div className={H3}>{item.title}</div>
                <p className={BODY}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 데이터 출처 */}
      <div className={SECTION}>
        <h2 className={H2}>데이터 출처 및 처리 방법</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-[#1A2235]">
              <tr>
                {['연도', '출처', '처리 방법', '비고'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 border-b border-gray-800">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50 bg-[#111827]">
              {[
                ['2021 – 2024', 'DART OpenAPI fnlttSinglAcntAll', '2023년 보고서 1회 요청 → thstrm(2023) · frmtrm(2022) · bfefrmtrm(2021) 동시 추출, 2024년 별도 요청', '별도재무제표(OFS) · 사업보고서(11011)'],
                ['2020', '사업보고서 HTML (전기 열)', 'DART API 미지원 연도 — 2021 보고서의 전기 데이터 파싱 + 기준금리 0.75% 환경 기반 이자비용 추정', 'COVID-19 충당금 영향 반영'],
                ['CET1 전 연도', '금융감독원 경영공시 / 은행 IR', '감독당국 공시 기준 수치 (목업 하드코딩)', 'DART API 미제공 항목'],
              ].map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="px-4 py-3 text-gray-400 text-xs align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 이상징후 지표 */}
      <div className={SECTION}>
        <h2 className={H2}>이상징후 판정 지표 (7개)</h2>
        <div className="space-y-4">
          {INDICATORS.map(ind => (
            <div key={ind.id} className="bg-[#1A2235] rounded-xl border border-gray-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-start gap-3">
                <span className="text-xs font-mono text-gray-600 mt-0.5 shrink-0">#{ind.id}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{ind.name}</span>
                    <span className="text-xs text-gray-500">{ind.nameEn}</span>
                    <span className={`${TAG} bg-gray-800 text-gray-400`}>{ind.type}</span>
                  </div>
                  <code className="text-xs text-blue-400 font-mono">{ind.formula}</code>
                </div>
              </div>
              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">판정 임계값</div>
                  <div className="space-y-1.5">
                    {ind.thresholds.map(t => (
                      <div key={t.label} className="flex items-center gap-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded font-semibold w-10 text-center"
                          style={{ color: t.color, backgroundColor: `${t.color}22` }}
                        >
                          {t.label}
                        </span>
                        <span className="text-xs font-mono text-gray-400">{t.value}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold w-10 text-center text-emerald-400 bg-emerald-400/10">양호</span>
                      <span className="text-xs font-mono text-gray-400">그 외</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wider">감사 시사점</div>
                  <p className="text-xs text-gray-400 leading-relaxed">{ind.auditNote}</p>
                  <div className="mt-2 text-[10px] text-gray-600 border-t border-gray-800 pt-2">기준: {ind.ref}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 위험점수 산정 */}
      <div className={SECTION}>
        <h2 className={H2}>종합 감사위험 점수 산정</h2>
        <p className={`${BODY} mb-4`}>
          7개 지표에서 발생한 점수를 합산하여 100점 만점으로 환산합니다.
          각 지표는 독립적으로 평가되며 중복 가산을 허용합니다.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { level: '위험', score: '30점', color: '#EF4444', desc: 'DANGER 발동 시' },
            { level: '경고', score: '20점', color: '#F97316', desc: 'WARNING 발동 시' },
            { level: '주의', score: '10점', color: '#F59E0B', desc: 'WATCH 발동 시' },
            { level: '양호', score: '0점',  color: '#10B981', desc: '임계값 미달 시' },
          ].map(item => (
            <div key={item.level} className="bg-[#1A2235] rounded-lg p-4 border border-gray-800 text-center">
              <div className="text-lg font-bold mb-1" style={{ color: item.color }}>{item.score}</div>
              <div className="text-xs font-semibold" style={{ color: item.color }}>{item.level}</div>
              <div className="text-xs text-gray-500 mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-[#1A2235] rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                {['등급', '점수 구간', '의미'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {Object.entries(RISK_SCORE_BANDS).map(([key, band]) => (
                <tr key={key}>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ color: band.color, backgroundColor: `${band.color}22` }}>
                      {band.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-400">{band.min} – {band.max}점</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {key === 'SAFE'    && '이상징후 없음 또는 경미 — 실질적 검토 절차 축소 가능'}
                    {key === 'WATCH'   && '주의 관찰 필요 — 추가 분석적 절차 수행 권고'}
                    {key === 'WARNING' && '이상 신호 복수 감지 — 실질적 세부 테스트 확대 검토'}
                    {key === 'DANGER'  && '중대 이상징후 — 즉각 실질적 절차 수행 및 경영진 커뮤니케이션'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 한계 및 유의사항 */}
      <div className={SECTION}>
        <h2 className={H2}>한계 및 유의사항</h2>
        <div className="space-y-3">
          {[
            { title: '2020년 데이터', body: 'DART API가 2022년 이전 연도를 미지원하여 사업보고서 전기 열 파싱 및 기준금리 기반 추정치 사용. 실제 감사 적용 시 사업보고서 원본 대조 필요.' },
            { title: 'CET1 비율', body: '감독당국 경영공시(금융감독원) 수치를 수동 입력. DART API에서 직접 추출 불가. 최신 공시와 시차가 발생할 수 있음.' },
            { title: '별도재무제표 기준', body: '은행 단독 실적 기준(OFS)으로 은행 지주회사(연결)와 수치가 다름. 지주 연결 기준 리스크는 별도 분석 필요.' },
            { title: '정성적 요소 미반영', body: '경영진 교체, 규제 환경 변화, 소송·제재 등 비재무 요소는 이 대시보드에서 분석하지 않음. 완전한 감사위험 평가를 대체하지 않음.' },
          ].map(item => (
            <div key={item.title} className="bg-[#1A2235] rounded-lg p-4 border border-gray-800 flex gap-4">
              <span className={`${TAG} bg-yellow-900/30 text-yellow-400 self-start mt-0.5 shrink-0`}>유의</span>
              <div>
                <div className={H3}>{item.title}</div>
                <p className={BODY}>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
