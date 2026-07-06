// FerryCast 완도군청 제안서 v2 생성 — PDF(Playwright) + DOCX(docx) 동시 생성
// 실행: node scripts/make-proposal-v2.mjs
// 소스: docs/제안서_초안.md 의 내용을 그대로 옮긴 구조화 데이터
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ImageRun, BorderStyle, ShadingType,
} from "docx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.join(__dirname, "..", "docs")
const SHOTS = path.join(DOCS, "screenshots")
const b64 = (f) => fs.readFileSync(path.join(SHOTS, f)).toString("base64")
const buf = (f) => fs.readFileSync(path.join(SHOTS, f))

// ── 공통 콘텐츠 ────────────────────────────────
const CONTACT = { name: "김신진", phone: "010-8478-7552", email: "climaxna@naver.com", web: "https://ferrycast.kr" }
const SUBMIT_DATE = "2026년 7월"

const FEATURE_ROWS = [
  ["실시간 운항 시간표", "완도 출발·도착 전 항로의 배 시각을 실시간 제공 (완도–제주·청산도·소안도·보길도·노화)"],
  ["운항 / 결항 표시", "운항은 파랑, 결항은 빨강으로 직관 표시. 일부 편만 결항돼도 운항 편은 그대로 안내"],
  ["날씨 · 파고", "완도 현재 날씨·바람·습도·파고에 단기예보를 더해 뱃길 가늠 지원"],
  ["조석(물때) 예보", "국립해양조사원 만조·간조 시각과 물높이를 곡선 그래프로 시각화, 5일치 제공"],
  ["직항 / 경유 구분", "같은 항로의 직항편과 경유편(예: 제주–추자도)을 구분 표시"],
  ["내일 시간표 미리보기", "오늘 운항이 모두 끝난 뒤에도 내일 시간표를 바로 확인. 첫 배를 강조 표시"],
  ["출항 알림", "출발 30·10·5분 전 알림 (홈화면 추가 시)"],
  ["설치 없이 즉시", "QR 또는 검색으로 접속 즉시 모든 정보 표시. 홈화면 추가 시 앱처럼 사용"],
]

const COMPETITORS = [
  ["가보고싶은섬 / KSA여객선예매\n(한국해운조합)", "전국 여객선 예매 앱", "앱 설치·회원가입이 필요합니다. 전국 대상이라 완도만 보려면 검색·선택해야 합니다. 날씨·물때를 제공하지 않습니다"],
  ["완도여객선터미널·선사 누리집", "선사별 시간표 안내", "항로마다 흩어져 있고, 결항·날씨가 통합되지 않습니다"],
  ["KOMSA 운항정보 조회", "운항 현황 페이지", "일반 이용자에게 접근성이 낮습니다"],
]

const DIFFERENTIATORS = [
  "목적이 다릅니다 — 기존 앱은 표를 사는 곳이고, FerryCast는 “오늘 뜨나”를 확인하는 곳입니다. 예매 단계에서는 한국해운조합 예매 페이지로 연결합니다.",
  "설치·로그인이 없습니다 — QR을 비추거나 주소만 입력하면 열립니다. 회원가입 화면이 없습니다.",
  "완도에 특화했습니다 — 전국 앱에서 완도를 찾아 들어갈 필요 없이, 완도 항로만 첫 화면에 모았습니다.",
  "날씨·파고·물때를 함께 봅니다 — 예매 앱에는 없는 정보입니다. 뱃길은 시간표만으로 판단할 수 없습니다.",
  "세부 정보까지 살핍니다 — 완도–제주 항로의 직항편과 추자도 경유편을 구분해, 경유편을 직항으로 알고 탔다가 시간을 더 쓰는 일을 줄입니다.",
]

const GALLERY = [
  ["01_main.png", "메인 화면 — 한 화면에 모든 정보",
    "열면 클릭 없이 현재 날씨·파고, 다음 만조·간조, 완도 출발 전 항로의 다음 배 시각과 운항·결항 상태가 한 화면에 나옵니다."],
  ["02_route_jeju.png", "항로 상세 — 직항/경유 구분",
    "오늘 시간표(지난 편은 흐리게, 다음 편은 강조), 공식 운임표, 출발 터미널 지도, 내일 운항 편수를 한곳에 모읍니다. 직항·경유(예: 13:40 추자도 경유)도 구분해 표시합니다."],
  ["03_arrival.png", "완도 도착 — 섬에서 돌아오는 배편",
    "섬에서 완도로 돌아오는 배편 시각·운항 상태와 섬에서 타는 터미널 위치를 확인합니다."],
  ["08_tomorrow.png", "내일 시간표 미리보기",
    "오늘 운항이 끝난 뒤에도 “내일 N편 운항 예정”을 누르면 내일 시간표가 바로 뜹니다. 첫 배를 색으로 강조해 새벽 이동을 준비하는 이용자를 돕습니다."],
  ["04_weather.png", "단기 날씨 예보",
    "기상청 단기예보 기반으로 날씨·최저/최고 기온·강수확률을 큰 글씨와 아이콘으로 보여줍니다."],
  ["05_tide.png", "조석(물때) 예보 — 곡선 그래프",
    "KHOA 완도 관측소 기준 만조·간조를 물결 곡선 그래프로 한눈에 보여주며, 5일치를 제공합니다."],
  ["06_alarm.png", "출항 알림",
    "출발 시각을 누르면 30·10·5분 전에 알림을 받습니다(홈화면 추가 시)."],
  ["07_qr.png", "QR 안내물 (인쇄·부착용)",
    "터미널·정류장 부착용 인쇄물입니다. “완도 배 시간표 / 결항·날씨 한눈에”, “휴대폰 카메라로 비추면 열려요”를 큰 글씨로 담았습니다."],
]

const SITE_PHOTOS = [
  ["qr_wando_1.jpg", "완도여객선터미널 — 운항시간표 옆"],
  ["qr_wando_2.jpg", "완도여객선터미널 — 대합실"],
  ["qr_haenam_1.jpg", "해남종합버스터미널"],
]

const STAGES = [
  ["1단계 — 정식화", "시범 부착 지점을 내구성 있는 정식 안내물로 교체", "정식 부착 허가"],
  ["2단계 — 확대", "버스터미널·관광안내소 등으로 부착 지점 확대, 누리집·SNS 홍보", "홍보 협조"],
  ["3단계 — 정착", "이용 현황을 보며 항로·기능 보강, 정보 정확성 협의", "데이터 의견 교류(선택)"],
]

const REVENUE = [
  ["카카오 애드핏 배너", "화면 하단 작은 영역에만 게재. 핵심 정보(날씨·시간표·조석)와 분리해 확인을 방해하지 않음"],
  ["쿠팡 파트너스 (완도 특산물)", "완도 특산물을 소개하는 캐러셀 배너. 이용자에게는 정보, 지역에는 노출 효과, 운영자에게는 수수료"],
  ["정보 무료", "배편·날씨·물때 등 핵심 정보는 영구 무료. 이용자에게 요금을 부과하지 않음"],
]

const CONCERNS = [
  ["정보가 틀리면 책임은?", "모든 정보는 공식 공공 API를 기반으로 하며, 화면마다 “출발 전 공식 채널에서 최종 확인” 안내를 함께 표시합니다. FerryCast는 공식 정보의 입구이지 대체가 아닙니다."],
  ["선사·공식 정보와 충돌하지 않나?", "같은 공공 데이터를 그대로 보여주므로 충돌하지 않습니다. 예매는 한국해운조합으로 연결합니다."],
  ["광고가 공익성을 해치지 않나?", "광고·특산물 코너는 핵심 정보를 모두 확인한 화면 맨 아래에만 있습니다. 지역 특산물을 우선 노출해 지역에도 환원합니다."],
  ["실제로 쓰이고 있다는 근거가 있나?", "현장 시범 부착 이후 이용자가 QR을 스캔해 실제로 확인하는 모습을 직접 확인했습니다. 정식 부착 이후에는 일간 접속자 추이를 2~4주간 축적해, 완도군청에 정량적 이용 현황을 별도로 공유해 드리겠습니다."],
  ["운영자가 그만두면 끊기지 않나?", "공공 API 기반이라 구조가 단순합니다. 군과 협의해 지속 방안(자료·운영 인수 등)을 열어 두겠습니다."],
]

const REQUESTS = [
  ["1", "정식 부착 허가", "여객선터미널 등 완도 공공장소에 내구성 있는 QR 안내물 정식 부착 허가 (현재 임시 시범물 → 정식 안내물로 교체)"],
  ["2", "공식 홍보 협조", "완도군 누리집·SNS 등 공식 채널을 통한 서비스 소개 게시"],
  ["3", "정보 정확성 협의 (선택)", "정확한 정보 제공을 위한 데이터·운영 의견 교류"],
]

// ════════════════════════════════════════════════
// 1) HTML → PDF
// ════════════════════════════════════════════════
function buildHtml() {
  const featureTable = FEATURE_ROWS.map(([a, b]) => `<tr><td class="k">${a}</td><td>${b}</td></tr>`).join("")
  const competitorTable = COMPETITORS.map(([a, b, c]) => `<tr><td class="k">${a.replace(/\n/g, "<br/>")}</td><td>${b}</td><td>${c}</td></tr>`).join("")
  const diffList = DIFFERENTIATORS.map((d) => `<li>${d}</li>`).join("")
  const revenueTable = REVENUE.map(([a, b]) => `<tr><td class="k">${a}</td><td>${b}</td></tr>`).join("")
  const stageTable = STAGES.map(([a, b, c]) => `<tr><td class="k">${a}</td><td>${b}</td><td>${c}</td></tr>`).join("")
  const concernTable = CONCERNS.map(([a, b]) => `<tr><td class="k">${a}</td><td>${b}</td></tr>`).join("")
  const requestTable = REQUESTS.map(([n, a, b]) => `<tr><td class="num">${n}</td><td class="k">${a}</td><td>${b}</td></tr>`).join("")
  const gallery = GALLERY.map(([f, t, d], i) =>
    `<div class="shot"><img src="data:image/png;base64,${b64(f)}"/><div class="shotbody"><p class="st">${["①","②","③","④","⑤","⑥","⑦","⑧"][i]} ${t}</p><p class="sd">${d}</p></div></div>`
  ).join("")
  const sitePhotos = SITE_PHOTOS.map(([f, t]) =>
    `<div class="sitephoto"><img src="data:image/jpeg;base64,${b64(f)}"/><p class="spt">${t}</p></div>`
  ).join("")

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 16mm 15mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Malgun Gothic","맑은 고딕",sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.65; margin: 0; }
  h1,h2 { margin: 0; }
  .cover { text-align: center; padding: 40px 0 28px; }
  .cover .sub { color: #64748b; font-size: 13pt; font-weight: 700; }
  .cover .title { color: #1d4ed8; font-size: 30pt; font-weight: 800; margin: 8px 0; }
  .cover .tag { font-size: 12pt; margin-top: 6px; }
  .cover .quote { margin-top: 22px; font-size: 13pt; }
  .cover .quote b { color: #1d4ed8; }
  .cover .meta { margin-top: 22px; color: #334155; font-size: 11pt; line-height: 1.9; }
  .cover .meta .web { color: #1d4ed8; font-weight: 700; }
  h2.sec { color: #1d4ed8; font-size: 16pt; font-weight: 800; border-bottom: 2px solid #1d4ed8; padding-bottom: 5px; margin: 26px 0 12px; break-after: avoid; }
  h3 { font-size: 12.5pt; color: #1e293b; margin: 14px 0 6px; }
  p { margin: 0 0 9px; }
  ul { margin: 0 0 9px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; }
  th { background: #1d4ed8; color: #fff; font-weight: 700; padding: 8px 10px; text-align: left; font-size: 10.5pt; }
  td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 10.5pt; vertical-align: top; }
  td.k { font-weight: 700; color: #0f172a; width: 24%; background: #f8fafc; }
  td.num { width: 8%; text-align: center; font-weight: 700; color: #1d4ed8; background: #f8fafc; }
  .shot { display: flex; gap: 16px; align-items: center; padding: 12px 0; border-bottom: 1px solid #f1f5f9; break-inside: avoid; }
  .shot img { width: 130px; height: auto; border: 1px solid #e2e8f0; border-radius: 10px; flex-shrink: 0; }
  .shot .st { font-weight: 800; color: #1d4ed8; font-size: 12pt; margin: 0 0 6px; }
  .shot .sd { margin: 0; font-size: 10.5pt; color: #334155; }
  .sitephotos { display: flex; gap: 10px; margin: 10px 0; }
  .sitephoto { flex: 1; text-align: center; }
  .sitephoto img { width: 100%; border-radius: 10px; border: 1px solid #e2e8f0; }
  .sitephoto .spt { font-size: 9.5pt; color: #64748b; margin-top: 4px; }
  .note { color: #64748b; font-size: 9.5pt; margin-top: 4px; }
  .pagebreak { page-break-before: always; }
  .contact { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-top: 10px; }
  .bottomshot { text-align: center; margin: 10px 0; }
  .bottomshot img { width: 220px; border: 1px solid #e2e8f0; border-radius: 10px; }
  </style></head><body>

  <div class="cover">
    <div class="sub">완도 배편·날씨 통합 정보 서비스</div>
    <div class="title">FerryCast 협력 제안서</div>
    <div class="tag">QR코드 부착 허가 및 공식 홍보 협조 요청</div>
    <div class="quote"><b>“오늘 배 뜨나요?”</b><br/>완도 군민과 관광객이 한 화면에서 바로 확인하는 공익 정보 서비스</div>
    <div class="meta">
      제출일 : ${SUBMIT_DATE}<br/>
      제안자 : FerryCast 운영자 ${CONTACT.name}<br/>
      웹주소 : <span class="web">${CONTACT.web}</span>
    </div>
  </div>

  <h2 class="sec">1. 제안 배경</h2>
  <p>완도에서 배는 도로입니다. 청산도·소안도·보길도 주민에게 여객선은 출퇴근길이고 장 보러 가는 길이며, 관광객에게는 섬에 닿는 유일한 수단입니다.</p>
  <p>그런데 이 배가 언제 뜨는지를 알아보는 일이 의외로 번거로웠습니다. 청산도 배 시간을 확인하려고 검색하면, 정작 시간표는 누군가 정리해 둔 블로그 글에서 찾아야 했습니다. 그마저 오래된 정보일 때가 많아, 결국 항만 터미널에 전화를 걸어 물어보곤 했습니다.</p>
  <p>시간표는 선사마다, 결항은 또 다른 곳에, 날씨와 물때는 각각 다른 사이트에 흩어져 있습니다. 그러다 보니 사람들은 터미널에 도착해서야 “오늘 결항입니다”라는 말을 듣기도 합니다.</p>
  <p>FerryCast는 그 흩어진 정보를 <b>한 화면, 클릭 없는 즉시 확인</b>으로 모았습니다. 군의 예산이나 인력을 쓰지 않고 민간이 직접 만들어 이미 운영하고 있습니다. 지금 <b>${CONTACT.web}</b>에서 바로 열립니다.</p>

  <h2 class="sec">2. 무엇이 문제인가</h2>
  <p>완도는 기상 변화로 결항이 잦습니다. 그만큼 정보가 중요한데, 정작 그 정보가 흩어져 있습니다.</p>
  <ul>
    <li><b>시간표·결항·날씨가 따로 있습니다.</b> 이용자는 세 곳을 따로 확인해야 합니다.</li>
    <li><b>관광객은 어디를 봐야 할지 모릅니다.</b> 검색해도 선사별·항로별로 흩어져 나와, 터미널에서야 결항을 알게 됩니다.</li>
    <li><b>고령 군민에게는 더 어렵습니다.</b> 여러 사이트를 오가며 작은 글씨를 읽는 일 자체가 장벽입니다.</li>
  </ul>
  <p>문제의 진짜 원인은 정보가 없어서가 아닙니다. <b>정보가 흩어져 있고, 찾는 과정이 어렵기 때문</b>입니다. 해법은 분명합니다. 한곳에 모으고, 찾는 과정을 없애면 됩니다.</p>

  <h2 class="sec pagebreak">3. 이미 있는 서비스, 그럼에도 FerryCast인 이유</h2>
  <p>배편 정보를 다루는 서비스는 이미 있습니다. 숨기지 않고 먼저 밝힙니다.</p>
  <table><tr><th style="width:24%">기존 서비스</th><th style="width:20%">성격</th><th>한계</th></tr>${competitorTable}</table>
  <p>FerryCast는 이들과 <b>경쟁하지 않습니다. 보완합니다.</b></p>
  <ul>${diffList}</ul>
  <p>이미 검증된 예매 시장 위에, 완도 주민·관광객을 위한 <b>‘정보 입구’</b>를 더하는 것입니다.</p>

  <h2 class="sec">4. 제안하는 서비스</h2>
  <table><tr><th style="width:24%">기능</th><th>내용</th></tr>${featureTable}</table>
  <p class="note">※ 데이터 출처 : 한국해양교통안전공단(MTIS 운항 스케줄), 기상청, 국립해양조사원(KHOA) 등 공공 API 활용</p>

  <h2 class="sec pagebreak">5. 실제 앱 화면</h2>
  <p>아래는 실제 서비스 화면입니다. 모든 정보는 스마트폰에서 손가락 한 번으로 확인할 수 있도록 설계했습니다.</p>
  ${gallery}

  <h2 class="sec pagebreak">6. 안정적인 운영</h2>
  <ul>
    <li><b>공식 공공 데이터</b> : 해양교통안전공단·기상청·국립해양조사원의 공식 API를 사용합니다.</li>
    <li><b>시간표와 결항을 함께</b> : 하나의 공식 데이터로 동시에 받아 시간표와 결항이 어긋나지 않습니다. 청산농협 차도선 같은 지역 배편까지 실시간으로 표시됩니다.</li>
    <li><b>이용자가 늘어도 안정적</b> : 데이터 호출을 최소화하는 캐시 구조라 접속이 몰려도 무리가 가지 않습니다.</li>
    <li><b>빈 화면 없는 안전망</b> : 일시적 장애에도 흰 화면 대신 참고 시간표를 표시합니다. 언제 열어도 무언가는 반드시 보입니다.</li>
    <li><b>완도 밖에서도 검증됐습니다</b> : 완도에서 다진 이 구조를 포항(울릉도)·목포(제주·홍도·흑산도 등)·인천(백령도·연평도) 항로에도 이미 적용해 함께 운영하고 있습니다. 완도가 이 서비스의 출발점이자, 다른 지역에서도 통한다는 사실을 스스로 증명한 셈입니다.</li>
  </ul>

  <h2 class="sec">7. 추진 방안과 일정</h2>
  <h3>이미 현장에 시범 부착했습니다</h3>
  <p>서비스의 효용을 직접 확인하고자, 자비로 안내물을 제작해 완도여객선터미널과 완도 진입 경로의 거점인 해남종합버스터미널에 시범 부착해 보았습니다. 실제로 공식 운항시간표 바로 옆에서 이용자들이 휴대폰으로 스캔해 배 시각과 결항을 확인합니다.</p>
  <div class="sitephotos">${sitePhotos}</div>
  <p>다만 지금은 <b>임시 A4 출력물</b>이라 비바람·손길에 쉽게 훼손되고, 정식 안내물로 보기 어렵습니다. 효용은 현장에서 확인했으니, 이제 <b>군의 공식 허가를 받아 내구성 있는 안내물(아크릴·시트지 등)로 정식 설치</b>하고자 합니다.</p>
  <h3>단계별 계획</h3>
  <table><tr><th style="width:20%">단계</th><th>내용</th><th style="width:26%">완도군 역할</th></tr>${stageTable}</table>
  <p>장비 설치도, 예산 투입도 없습니다. 현장 효용은 이미 확인했으니, 정식 부착 허가만으로 바로 1단계를 진행할 수 있습니다.</p>

  <h2 class="sec pagebreak">8. 완도군의 기대 효과</h2>
  <h3>군민 편의</h3>
  <p>배편·날씨·물때를 한 번에 확인해 헛걸음을 줄입니다. 단순한 화면으로 고령층의 정보 접근성을 높입니다. 완도군은 정부가 지정한 인구감소지역으로, 이 같은 작은 정주 편의도 쌓이면 체감 격차를 줄이는 데 보탬이 됩니다.</p>
  <h3>관광객 만족</h3>
  <p>결항을 미리 확인해 일정 차질을 줄입니다. “정보를 쉽게 찾을 수 있는 완도”라는 인상을 남깁니다.</p>
  <h3>군의 부담 없는 협력</h3>
  <p>예산·인력 투입 없이 민간이 개발·운영합니다. 군은 허가와 홍보만으로 군민 편의 서비스를 제공하는 효과를 얻습니다.</p>

  <h2 class="sec">9. 운영 방식과 지속가능성</h2>
  <p>FerryCast는 무료 공익 서비스입니다. 배편·날씨 등 핵심 정보는 영구 무료이며 이용자에게 요금을 받지 않습니다.</p>
  <p>서버 유지를 위한 최소한의 비용은 두 가지로 충당합니다. 카카오 애드핏 배너 광고는 화면 맨 아래 옅은 배경의 작은 영역에만 게재해 정보 확인을 가리지 않습니다. 쿠팡 파트너스를 통한 완도 특산물 소개 코너는 완도산 수산물·특산품을 관광객에게 자연스럽게 알리는 효과도 함께 냅니다.</p>
  <table><tr><th style="width:26%">구분</th><th>내용</th></tr>${revenueTable}</table>
  <p>아래는 실제 배치 화면입니다. 항로 시간표·날씨·조석 등 핵심 정보를 모두 확인한 다음, 화면 맨 아래에서만 특산물 소개와 배너가 나타납니다.</p>
  <div class="bottomshot"><img src="data:image/png;base64,${b64("09_region_bottom.png")}"/></div>
  <p>운영 수익은 서버 유지와 서비스 개선에 사용되며, 군의 예산 부담 없이 서비스를 안정적으로 지속하기 위한 수단입니다.</p>

  <h2 class="sec pagebreak">10. 예상 우려와 대응</h2>
  <table><tr><th style="width:26%">우려</th><th>대응</th></tr>${concernTable}</table>

  <h2 class="sec">11. 완도군청에 드리는 요청</h2>
  <table><tr><th style="width:8%">No</th><th style="width:22%">요청 항목</th><th>세부 내용</th></tr>${requestTable}</table>

  <h2 class="sec">12. 제안자 의견</h2>
  <p>저는 이 서비스를 직접 만들어 운영하고 있습니다. 기획서가 아니라 <b>이미 동작하는 서비스</b>를 들고 왔습니다. 지금 ${CONTACT.web}에 접속하면 오늘 완도의 배편과 날씨, 물때가 그대로 보입니다. 말로만 제안하지 않고, 자비로 안내물을 만들어 터미널 현장에 직접 시범 부착까지 해보았습니다.</p>
  <p>완도에서 시작한 이 서비스는 그 뒤 포항·목포·인천의 여객선 정보에도 같은 구조로 적용되어 함께 운영되고 있습니다. 완도가 이 모델의 출발점이며, 계속 손봐 가며 키우고 있다는 뜻입니다.</p>
  <p>저는 완도에서 태어났고, 지금도 부모님이 완도에 계십니다. 완도를 오가며 직접 겪은 불편에서 이 서비스를 시작했습니다. 완도에 대한 애정이 이 일을 계속하는 이유이고, 그래서 한때의 프로젝트로 끝내지 않고 꾸준히 운영하려 합니다.</p>
  <p>군의 예산도 인력도 쓰지 않습니다. 완도 군민과 완도를 찾는 사람들이 “오늘 배 뜨나요?”를 더 쉽게 확인하도록, 작은 협력을 부탁드립니다.</p>

  <h2 class="sec">맺음말</h2>
  <p>FerryCast는 작은 서비스입니다. 그러나 배를 한 번 놓치면 하루가 바뀌는 완도에서, 이 작은 확인 하나가 적지 않은 헛걸음을 막을 수 있다고 믿습니다. 완도군청의 부착 허가와 홍보 협조를 부탁드립니다.</p>

  <h2 class="sec">문의 및 연락처</h2>
  <div class="contact">
    서비스명 : FerryCast (페리캐스트)<br/>
    웹주소 : <b style="color:#1d4ed8">${CONTACT.web}</b><br/>
    담당자 : <b>${CONTACT.name}</b> &nbsp;·&nbsp; 연락처 : ${CONTACT.phone} &nbsp;·&nbsp; 이메일 : ${CONTACT.email}
  </div>

  </body></html>`
}

async function makePdf() {
  const html = buildHtml()
  if (process.env.DEBUG_HTML) fs.writeFileSync(path.join(DOCS, "_debug.html"), html)
  const outPdf = path.join(DOCS, "FerryCast_완도군청_제안서_v2.pdf")
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle" })
  await page.pdf({
    path: outPdf, format: "A4", printBackground: true,
    margin: { top: "16mm", bottom: "16mm", left: "15mm", right: "15mm" },
  })
  await browser.close()
  console.log("✅ PDF 생성 완료:", outPdf)
}

// ════════════════════════════════════════════════
// 2) DOCX
// ════════════════════════════════════════════════
const FONT = "맑은 고딕", BLUE = "1D4ED8", DARK = "1E293B", GRAY = "64748B"
const run = (t, o = {}) => new TextRun({ text: t, font: FONT, size: o.size ?? 20, bold: o.bold, color: o.color ?? DARK, break: o.break })
const para = (c, o = {}) => new Paragraph({ alignment: o.align, spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 276 }, pageBreakBefore: o.pageBreakBefore, children: Array.isArray(c) ? c : [c] })
const h1 = (t, o = {}) => new Paragraph({ spacing: { before: 280, after: 140 }, pageBreakBefore: o.pageBreakBefore, border: { bottom: { color: BLUE, size: 8, style: BorderStyle.SINGLE, space: 4 } }, children: [run(t, { size: 26, bold: true, color: BLUE })] })
const h2 = (t) => para(run(t, { size: 22, bold: true }), { before: 160, after: 80 })
const body = (t, o = {}) => para(run(t, { size: 20, color: o.color ?? "334155" }), { after: o.after ?? 100 })
const bullet = (t) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60, line: 276 }, children: [run(t, { size: 20, color: "334155" })] })
const cellB = (c = "E2E8F0") => ({ top: { style: BorderStyle.SINGLE, size: 4, color: c }, bottom: { style: BorderStyle.SINGLE, size: 4, color: c }, left: { style: BorderStyle.SINGLE, size: 4, color: c }, right: { style: BorderStyle.SINGLE, size: 4, color: c } })
const noB = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }

function dataTable(headers, rows, widths) {
  const head = new TableRow({ tableHeader: true, children: headers.map((h, i) => new TableCell({
    width: { size: widths[i], type: WidthType.PERCENTAGE }, borders: cellB(), shading: { type: ShadingType.CLEAR, fill: BLUE },
    margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [para(run(h, { bold: true, color: "FFFFFF", size: 20 }), { after: 0 })] })) })
  const dr = rows.map((r, ri) => new TableRow({ children: r.map((c, i) => new TableCell({
    width: { size: widths[i], type: WidthType.PERCENTAGE }, borders: cellB(), shading: ri % 2 ? { type: ShadingType.CLEAR, fill: "F8FAFC" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: c.split("\n").map((line, li) => para(run(line, { size: 19, color: "334155" }), { after: li === c.split("\n").length - 1 ? 0 : 40 })) })) }))
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [head, ...dr] })
}

function shotRow(file, title, desc, idx) {
  const W = 140, H = Math.round(W * 1688 / 780)
  const img = new ImageRun({ data: buf(file), type: "png", transformation: { width: W, height: H } })
  return new TableRow({ children: [
    new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, borders: noB, verticalAlign: "center", margins: { top: 80, bottom: 80, left: 40, right: 120 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img] })] }),
    new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, borders: noB, verticalAlign: "center", margins: { top: 80, bottom: 80, left: 80, right: 40 },
      children: [para(run(`${["①","②","③","④","⑤","⑥","⑦","⑧"][idx]} ${title}`, { bold: true, size: 22, color: BLUE }), { after: 80 }), para(run(desc, { size: 19, color: "334155" }), { after: 0 })] }),
  ] })
}

function sitePhotoRow() {
  return new TableRow({ children: SITE_PHOTOS.map(([f, t]) => {
    const W = 150, H = Math.round(W * 1100 / 825)
    const img = new ImageRun({ data: buf(f), type: "jpg", transformation: { width: W, height: H } })
    return new TableCell({ width: { size: 33, type: WidthType.PERCENTAGE }, borders: noB, margins: { top: 40, bottom: 40, left: 40, right: 40 },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, children: [img] }),
        para(run(t, { size: 16, color: GRAY }), { align: AlignmentType.CENTER, after: 0 }),
      ] })
  }) })
}

async function makeDocx() {
  const children = [
    para(run("완도 배편·날씨 통합 정보 서비스", { size: 24, bold: true, color: GRAY }), { align: AlignmentType.CENTER, before: 200, after: 60 }),
    para(run("FerryCast 협력 제안서", { size: 44, bold: true, color: BLUE }), { align: AlignmentType.CENTER, after: 80 }),
    para(run("QR코드 부착 허가 및 공식 홍보 협조 요청", { size: 22 }), { align: AlignmentType.CENTER, after: 200 }),
    para([run("“오늘 배 뜨나요?”", { size: 22, bold: true, color: BLUE })], { align: AlignmentType.CENTER, after: 20 }),
    para(run("완도 군민과 관광객이 한 화면에서 바로 확인하는 공익 정보 서비스", { size: 20, color: GRAY }), { align: AlignmentType.CENTER, after: 220 }),
    para(run(`제출일 : ${SUBMIT_DATE}`, { size: 20 }), { align: AlignmentType.CENTER, after: 20 }),
    para(run(`제안자 : FerryCast 운영자 (${CONTACT.name})`, { size: 20 }), { align: AlignmentType.CENTER, after: 20 }),
    para(run(`웹주소 : ${CONTACT.web}`, { size: 20, bold: true, color: BLUE }), { align: AlignmentType.CENTER, after: 200 }),

    h1("1. 제안 배경"),
    body("완도에서 배는 도로입니다. 청산도·소안도·보길도 주민에게 여객선은 출퇴근길이고 장 보러 가는 길이며, 관광객에게는 섬에 닿는 유일한 수단입니다."),
    body("그런데 이 배가 언제 뜨는지를 알아보는 일이 의외로 번거로웠습니다. 청산도 배 시간을 확인하려고 검색하면, 정작 시간표는 누군가 정리해 둔 블로그 글에서 찾아야 했습니다. 그마저 오래된 정보일 때가 많아, 결국 항만 터미널에 전화를 걸어 물어보곤 했습니다."),
    body("시간표는 선사마다, 결항은 또 다른 곳에, 날씨와 물때는 각각 다른 사이트에 흩어져 있습니다. 그러다 보니 사람들은 터미널에 도착해서야 “오늘 결항입니다”라는 말을 듣기도 합니다."),
    body(`FerryCast는 그 흩어진 정보를 한 화면, 클릭 없는 즉시 확인으로 모았습니다. 군의 예산이나 인력을 쓰지 않고 민간이 직접 만들어 이미 운영하고 있습니다. 지금 ${CONTACT.web}에서 바로 열립니다.`),

    h1("2. 무엇이 문제인가"),
    body("완도는 기상 변화로 결항이 잦습니다. 그만큼 정보가 중요한데, 정작 그 정보가 흩어져 있습니다."),
    bullet("시간표·결항·날씨가 따로 있습니다. 이용자는 세 곳을 따로 확인해야 합니다."),
    bullet("관광객은 어디를 봐야 할지 모릅니다. 검색해도 선사별·항로별로 흩어져 나와, 터미널에서야 결항을 알게 됩니다."),
    bullet("고령 군민에게는 더 어렵습니다. 여러 사이트를 오가며 작은 글씨를 읽는 일 자체가 장벽입니다."),
    body("문제의 진짜 원인은 정보가 없어서가 아닙니다. 정보가 흩어져 있고, 찾는 과정이 어렵기 때문입니다. 해법은 분명합니다. 한곳에 모으고, 찾는 과정을 없애면 됩니다."),

    h1("3. 이미 있는 서비스, 그럼에도 FerryCast인 이유", { pageBreakBefore: true }),
    body("배편 정보를 다루는 서비스는 이미 있습니다. 숨기지 않고 먼저 밝힙니다."),
    dataTable(["기존 서비스", "성격", "한계"], COMPETITORS, [24, 20, 56]),
    body("FerryCast는 이들과 경쟁하지 않습니다. 보완합니다."),
    ...DIFFERENTIATORS.map((d) => bullet(d)),
    body("이미 검증된 예매 시장 위에, 완도 주민·관광객을 위한 '정보 입구'를 더하는 것입니다."),

    h1("4. 제안하는 서비스"),
    dataTable(["기능", "내용"], FEATURE_ROWS, [24, 76]),
    body("※ 데이터 출처 : 한국해양교통안전공단(MTIS 운항 스케줄), 기상청, 국립해양조사원(KHOA) 등 공공 API 활용", { color: GRAY, after: 40 }),

    h1("5. 실제 앱 화면", { pageBreakBefore: true }),
    body("아래는 실제 서비스 화면입니다. 모든 정보는 스마트폰에서 손가락 한 번으로 확인할 수 있도록 설계했습니다.", { after: 140 }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: GALLERY.map(([f, t, d], i) => shotRow(f, t, d, i)) }),

    h1("6. 안정적인 운영", { pageBreakBefore: true }),
    bullet("공식 공공 데이터 : 해양교통안전공단·기상청·국립해양조사원의 공식 API를 사용합니다."),
    bullet("시간표와 결항을 함께 : 하나의 공식 데이터로 동시에 받아 시간표와 결항이 어긋나지 않습니다. 청산농협 차도선 같은 지역 배편까지 실시간으로 표시됩니다."),
    bullet("이용자가 늘어도 안정적 : 데이터 호출을 최소화하는 캐시 구조라 접속이 몰려도 무리가 가지 않습니다."),
    bullet("빈 화면 없는 안전망 : 일시적 장애에도 흰 화면 대신 참고 시간표를 표시합니다. 언제 열어도 무언가는 반드시 보입니다."),
    bullet("완도 밖에서도 검증됐습니다 : 완도에서 다진 이 구조를 포항(울릉도)·목포(제주·홍도·흑산도 등)·인천(백령도·연평도) 항로에도 이미 적용해 함께 운영하고 있습니다. 완도가 이 서비스의 출발점이자, 다른 지역에서도 통한다는 사실을 스스로 증명한 셈입니다."),

    h1("7. 추진 방안과 일정"),
    h2("이미 현장에 시범 부착했습니다"),
    body("서비스의 효용을 직접 확인하고자, 자비로 안내물을 제작해 완도여객선터미널과 완도 진입 경로의 거점인 해남종합버스터미널에 시범 부착해 보았습니다. 실제로 공식 운항시간표 바로 옆에서 이용자들이 휴대폰으로 스캔해 배 시각과 결항을 확인합니다."),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [sitePhotoRow()] }),
    body("다만 지금은 임시 A4 출력물이라 비바람·손길에 쉽게 훼손되고, 정식 안내물로 보기 어렵습니다. 효용은 현장에서 확인했으니, 이제 군의 공식 허가를 받아 내구성 있는 안내물(아크릴·시트지 등)로 정식 설치하고자 합니다.", { after: 140 }),
    h2("단계별 계획"),
    dataTable(["단계", "내용", "완도군 역할"], STAGES, [22, 52, 26]),
    body("장비 설치도, 예산 투입도 없습니다. 현장 효용은 이미 확인했으니, 정식 부착 허가만으로 바로 1단계를 진행할 수 있습니다."),

    h1("8. 완도군의 기대 효과", { pageBreakBefore: true }),
    h2("군민 편의"),
    body("배편·날씨·물때를 한 번에 확인해 헛걸음을 줄입니다. 단순한 화면으로 고령층의 정보 접근성을 높입니다. 완도군은 정부가 지정한 인구감소지역으로, 이 같은 작은 정주 편의도 쌓이면 체감 격차를 줄이는 데 보탬이 됩니다."),
    h2("관광객 만족"),
    body("결항을 미리 확인해 일정 차질을 줄입니다. “정보를 쉽게 찾을 수 있는 완도”라는 인상을 남깁니다."),
    h2("군의 부담 없는 협력"),
    body("예산·인력 투입 없이 민간이 개발·운영합니다. 군은 허가와 홍보만으로 군민 편의 서비스를 제공하는 효과를 얻습니다."),

    h1("9. 운영 방식과 지속가능성"),
    body("FerryCast는 무료 공익 서비스입니다. 배편·날씨 등 핵심 정보는 영구 무료이며 이용자에게 요금을 받지 않습니다."),
    body("서버 유지를 위한 최소한의 비용은 두 가지로 충당합니다. 카카오 애드핏 배너 광고는 화면 맨 아래 옅은 배경의 작은 영역에만 게재해 정보 확인을 가리지 않습니다. 쿠팡 파트너스를 통한 완도 특산물 소개 코너는 완도산 수산물·특산품을 관광객에게 자연스럽게 알리는 효과도 함께 냅니다."),
    dataTable(["구분", "내용"], REVENUE, [26, 74]),
    body("아래는 실제 배치 화면입니다. 항로 시간표·날씨·조석 등 핵심 정보를 모두 확인한 다음, 화면 맨 아래에서만 특산물 소개와 배너가 나타납니다.", { after: 100 }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 }, children: [new ImageRun({ data: buf("09_region_bottom.png"), type: "png", transformation: { width: 195, height: Math.round(195 * 1688 / 780) } })] }),
    body("운영 수익은 서버 유지와 서비스 개선에 사용되며, 군의 예산 부담 없이 서비스를 안정적으로 지속하기 위한 수단입니다."),

    h1("10. 예상 우려와 대응", { pageBreakBefore: true }),
    dataTable(["우려", "대응"], CONCERNS, [26, 74]),

    h1("11. 완도군청에 드리는 요청"),
    dataTable(["No", "요청 항목", "세부 내용"], REQUESTS, [8, 24, 68]),

    h1("12. 제안자 의견"),
    body("저는 이 서비스를 직접 만들어 운영하고 있습니다. 기획서가 아니라 이미 동작하는 서비스를 들고 왔습니다. 지금 접속하면 오늘 완도의 배편과 날씨, 물때가 그대로 보입니다. 말로만 제안하지 않고, 자비로 안내물을 만들어 터미널 현장에 직접 시범 부착까지 해보았습니다."),
    body("완도에서 시작한 이 서비스는 그 뒤 포항·목포·인천의 여객선 정보에도 같은 구조로 적용되어 함께 운영되고 있습니다. 완도가 이 모델의 출발점이며, 계속 손봐 가며 키우고 있다는 뜻입니다."),
    body("저는 완도에서 태어났고, 지금도 부모님이 완도에 계십니다. 완도를 오가며 직접 겪은 불편에서 이 서비스를 시작했습니다. 완도에 대한 애정이 이 일을 계속하는 이유이고, 그래서 한때의 프로젝트로 끝내지 않고 꾸준히 운영하려 합니다."),
    body("군의 예산도 인력도 쓰지 않습니다. 완도 군민과 완도를 찾는 사람들이 “오늘 배 뜨나요?”를 더 쉽게 확인하도록, 작은 협력을 부탁드립니다."),

    h1("맺음말"),
    body("FerryCast는 작은 서비스입니다. 그러나 배를 한 번 놓치면 하루가 바뀌는 완도에서, 이 작은 확인 하나가 적지 않은 헛걸음을 막을 수 있다고 믿습니다. 완도군청의 부착 허가와 홍보 협조를 부탁드립니다."),

    h1("문의 및 연락처"),
    body("서비스명 : FerryCast (페리캐스트)"),
    body(`웹주소 : ${CONTACT.web}`),
    para([run(`담당자 : ${CONTACT.name}`, { size: 20, bold: true }), run(`     연락처 : ${CONTACT.phone}     이메일 : ${CONTACT.email}`, { size: 20 })], { after: 60 }),
  ]
  const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 20 } } } },
    sections: [{ properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } }, children }] })
  const out = await Packer.toBuffer(doc)
  const outDocx = path.join(DOCS, "FerryCast_완도군청_제안서_v2.docx")
  fs.writeFileSync(outDocx, out)
  console.log("✅ DOCX 생성 완료:", outDocx, `(${(out.length / 1024).toFixed(0)} KB)`)
}

await makePdf()
await makeDocx()
console.log("🎉 제안서 생성 완료")
