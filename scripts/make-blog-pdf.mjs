// FerryCast 블로그 홍보글 PDF 생성 — docs/blog-shots 스크린샷 사용
// 실행: node scripts/make-blog-pdf.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS = path.join(__dirname, "..", "docs")
const SHOTS = path.join(DOCS, "blog-shots")
const b64 = (f) => fs.readFileSync(path.join(SHOTS, f)).toString("base64")

const WEB = "https://ferrycast.kr"
const TODAY = "2026년 7월"

function buildHtml() {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: "Malgun Gothic","맑은 고딕",sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.7; margin: 0; }
  h1,h2,h3 { margin: 0; }

  .cover { text-align: center; padding: 20px 0 30px; }
  .cover .badge { display: inline-block; background: #eff6ff; color: #2563eb; font-weight: 800; font-size: 11pt; padding: 5px 14px; border-radius: 999px; margin-bottom: 14px; }
  .cover .title { font-size: 27pt; font-weight: 900; color: #0f172a; line-height: 1.35; }
  .cover .title b { color: #2563eb; }
  .cover .sub { margin-top: 12px; font-size: 13pt; color: #64748b; }
  .cover .url { margin-top: 18px; font-size: 13pt; font-weight: 800; color: #2563eb; }
  .cover .date { margin-top: 6px; font-size: 10pt; color: #94a3b8; }

  h2.sec { color: #2563eb; font-size: 16.5pt; font-weight: 900; margin: 30px 0 12px; break-after: avoid; }
  h2.sec .num { display: inline-block; background: #2563eb; color: #fff; width: 26px; height: 26px; border-radius: 999px; text-align: center; line-height: 26px; font-size: 12pt; margin-right: 8px; }
  p { margin: 0 0 10px; }
  p.lead { font-size: 12pt; font-weight: 700; color: #0f172a; }
  ul { margin: 0 0 10px; padding-left: 20px; }
  li { margin-bottom: 5px; }
  .pagebreak { page-break-before: always; }

  .callout { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 14px 16px; margin: 12px 0; }
  .callout .k { color: #b45309; font-weight: 800; font-size: 11pt; margin-bottom: 4px; }
  .callout p { color: #78350f; margin: 0; }

  .figure { display: flex; gap: 18px; align-items: flex-start; margin: 14px 0 20px; break-inside: avoid; }
  .figure.rev { flex-direction: row-reverse; }
  .figure img { width: 180px; border: 1px solid #e2e8f0; border-radius: 14px; flex-shrink: 0; }
  .figure .txt { padding-top: 4px; }
  .figure .txt .ft { font-weight: 800; color: #2563eb; font-size: 12.5pt; margin: 0 0 8px; }
  .figure .txt p { font-size: 10.7pt; color: #334155; }

  .wide { text-align: center; margin: 14px 0; }
  .wide img { width: 240px; border: 1px solid #e2e8f0; border-radius: 14px; }
  .wide .cap { font-size: 10pt; color: #64748b; margin-top: 6px; }

  .before-after { display: flex; gap: 14px; margin: 12px 0 16px; }
  .before-after .col { flex: 1; }
  .before-after .col .lbl { font-weight: 800; font-size: 10.5pt; padding: 4px 10px; border-radius: 999px; display: inline-block; margin-bottom: 8px; }
  .before-after .col.before .lbl { background: #fee2e2; color: #b91c1c; }
  .before-after .col.after .lbl { background: #dcfce7; color: #15803d; }
  .before-after .col p { font-size: 10.3pt; }

  table { width: 100%; border-collapse: collapse; margin: 8px 0 14px; }
  th { background: #2563eb; color: #fff; font-weight: 700; padding: 8px 10px; text-align: left; font-size: 10.5pt; }
  td { border: 1px solid #e2e8f0; padding: 8px 10px; font-size: 10.5pt; vertical-align: top; }
  td.k { font-weight: 700; color: #0f172a; width: 26%; background: #f8fafc; }

  .cta { text-align: center; background: linear-gradient(135deg,#2563eb,#1d4ed8); border-radius: 16px; padding: 26px 20px; margin-top: 16px; color: #fff; }
  .cta .t { font-size: 15pt; font-weight: 900; margin-bottom: 6px; }
  .cta .u { font-size: 14pt; font-weight: 900; background: #fff; color: #1d4ed8; display: inline-block; padding: 8px 22px; border-radius: 999px; margin-top: 10px; }
  .cta .s { font-size: 10pt; opacity: .85; margin-top: 10px; }

  .foot { margin-top: 18px; font-size: 9.5pt; color: #94a3b8; text-align: center; }
  </style></head><body>

  <div class="cover">
    <div class="badge">FerryCast 업데이트 소식</div>
    <div class="title">완도 배 시간표 앱,<br/>이제 <b>"결항"</b>과 <b>"비운항"</b>을 구분해서 알려드립니다</div>
    <div class="sub">기상 때문에 못 뜨는 배와, 정비·검사로 당분간 쉬는 배는 다릅니다</div>
    <div class="url">${WEB}</div>
    <div class="date">${TODAY}</div>
  </div>

  <p class="lead">완도에서 배는 도로입니다. 청산도·소안도·보길도 주민에게 여객선은 출퇴근길이고, 관광객에게는 섬에 닿는 유일한 방법입니다. 그런데 "오늘 배 뜨나요?"라는 질문에 정확히 답하기가 생각보다 어려웠습니다.</p>
  <p>FerryCast는 완도 앞바다 배편·날씨·물때를 앱 설치 없이, 클릭 한 번 없이 한 화면에서 바로 보여주는 서비스입니다. 이번에 사용자 제보를 계기로 데이터를 다시 들여다보다가, 꽤 중요한 걸 하나 고쳤습니다. 오늘은 그 이야기를 나눠볼까 합니다.</p>

  <h2 class="sec"><span class="num">1</span>"선박검사인데 결항이라고요?" — 제보에서 시작된 개선</h2>
  <p>완도–제주 항로에는 직항편 말고 <b>추자도를 들르는 경유편</b>이 있습니다. 이 경유편이 선박검사로 잠시 쉬고 있었는데, 화면에는 그냥 "운항"으로 표시되고 있다는 제보를 받았습니다.</p>
  <p>들여다보니 원인은 데이터 판정 기준에 있었습니다. 공공 운항 데이터에는 배가 못 뜨는 이유가 두 갈래로 나뉩니다.</p>
  <div class="before-after">
    <div class="col before">
      <span class="lbl">기상 결항</span>
      <p>풍랑주의보 등 <b>날씨 때문에</b> 오늘만 못 뜨는 경우. 내일은 정상 운항될 수 있습니다.</p>
    </div>
    <div class="col after">
      <span class="lbl">비운항</span>
      <p>선박검사·정비·계절 휴항 등 <b>계획된 이유로</b> 며칠~몇 주간 쉬는 경우.</p>
    </div>
  </div>
  <p>기존에는 이 둘을 구분하지 않고 뭉뚱그려 봤기 때문에, 계획된 비운항편이 "정상 운항"으로 잘못 보이는 사례가 있었습니다. 데이터를 다시 확인해 <b>진짜 운항 여부를 가리는 필드</b>를 기준으로 판정 로직을 바꾸고, 화면에서도 두 상황을 다른 색으로 분명히 구분했습니다.</p>

  <h2 class="sec"><span class="num">2</span>실제 화면으로 보면 이렇습니다</h2>
  <div class="figure">
    <img src="data:image/png;base64,${b64("02_jeju_card.png")}"/>
    <div class="txt">
      <p class="ft">① 메인 화면 — 결항편이 칩으로 바로 보여요</p>
      <p>완도 → 제주 카드를 열지 않아도, 오늘 시간표 줄에서 바로 <b>취소선 + "비운항"</b> 표시를 볼 수 있습니다. 09:20편은 선박검사로 쉬고, 13:40 추자도 경유편도 오늘은 쉽니다. 나머지 02:30·15:00편은 정상 운항입니다.</p>
    </div>
  </div>
  <div class="figure rev">
    <img src="data:image/png;base64,${b64("03_route_detail.png")}"/>
    <div class="txt">
      <p class="ft">② 상세 화면 — 사유까지 함께</p>
      <p>카드를 열면 "오늘 일부 편 비운항" 안내 박스에 <b>시각·경유 여부·사유</b>(선박검사, 기타 등)까지 한 번에 나옵니다. 정상 운항편의 도착 예정 시각도 함께 보여줍니다.</p>
    </div>
  </div>
  <div class="callout">
    <div class="k">이게 왜 중요하냐면</div>
    <p>"결항"은 오늘만 그런 것이고 내일은 다시 정상화될 수 있지만, "비운항"은 선박검사·정비처럼 <b>며칠에서 몇 주까지 이어질 수 있는 상황</b>입니다. 두 상황을 구분해야 여행 일정을 다르게 계획할 수 있습니다 — 오늘만 피할지, 아예 다른 편을 알아봐야 할지가 달라지니까요.</p>
  </div>

  <h2 class="sec pagebreak"><span class="num">3</span>인천 항로에 섬 두 곳이 늘었습니다</h2>
  <p>완도 말고도 포항(울릉도)·목포(제주·홍도·흑산도 등)·인천(백령도·연평도) 항로를 같은 방식으로 보여드리고 있는데, 이번에 인천에 <b>덕적도·대이작도</b>가 새로 추가됐습니다. 매일 여러 편이 오가는 항로인데도 그동안 빠져 있던 곳입니다.</p>
  <div class="figure">
    <img src="data:image/png;base64,${b64("07_incheon.png")}"/>
    <div class="txt">
      <p class="ft">③ 인천 페이지 — 백령도·연평도·덕적도·대이작도</p>
      <p>인천연안여객터미널에서 출발하는 4개 항로를 한 화면에서 확인합니다. 이날은 기상 때문에 백령도·대이작도가 결항, 덕적도는 일부 편만 결항된 상황도 그대로 보여집니다.</p>
    </div>
  </div>
  <div class="wide">
    <img src="data:image/png;base64,${b64("06_region_nav.png")}"/>
    <div class="cap">화면 아래 지역 버튼으로 완도 ↔ 포항 ↔ 목포 ↔ 인천을 바로 이동합니다</div>
  </div>

  <h2 class="sec"><span class="num">4</span>원래 있던 핵심 기능도 다시 소개합니다</h2>
  <table>
    <tr><th style="width:26%">기능</th><th>내용</th></tr>
    <tr><td class="k">클릭 없이 즉시</td><td>앱을 열면(또는 QR을 스캔하면) 바로 오늘 날씨·물때·배 시간표가 보입니다. 로그인도, 별도 검색도 없습니다.</td></tr>
    <tr><td class="k">날씨 · 파고</td><td>기상청 데이터로 현재 기온·날씨·바람·파고를 보여주고, 5일치 예보도 확인할 수 있습니다.</td></tr>
    <tr><td class="k">물때(조석) 곡선</td><td>국립해양조사원 데이터를 곡선 그래프로 그려 만조·간조 시각과 높이를 직관적으로 보여줍니다.</td></tr>
    <tr><td class="k">직항 · 경유 구분</td><td>완도–제주처럼 직항과 추자도 경유가 섞인 노선에서, 경유편만 따로 표시해 헷갈리지 않게 합니다.</td></tr>
    <tr><td class="k">내일 시간표 미리보기</td><td>오늘 운항이 끝난 뒤에도 "내일 N편 운항 예정"을 눌러 내일 시간표를 바로 확인할 수 있습니다.</td></tr>
    <tr><td class="k">완전 무료</td><td>배편·날씨·물때 정보는 광고 하나 없이도 다 무료입니다. 화면 맨 아래 배너만 조용히 자리하고 있습니다.</td></tr>
  </table>

  <div class="figure">
    <img src="data:image/png;base64,${b64("05_tide.png")}"/>
    <div class="txt">
      <p class="ft">④ 5일 조석 예보 — 곡선으로 한눈에</p>
      <p>오늘부터 5일치 만조·간조를 그래프로 보여줘서, 숫자표보다 훨씬 빠르게 물때를 파악할 수 있습니다.</p>
    </div>
  </div>

  <h2 class="sec pagebreak"><span class="num">5</span>지금 바로 써보세요</h2>
  <p>설치도, 회원가입도 필요 없습니다. 아래 QR을 스캔하거나 주소창에 <b>ferrycast.kr</b>을 입력하면 바로 열립니다. 스마트폰 홈 화면에 추가해두면 앱처럼 아이콘 하나로 매번 접속할 수 있습니다.</p>
  <div class="wide">
    <img src="data:image/png;base64,${b64("08_qr.png")}" style="width:200px"/>
    <div class="cap">⑤ QR 코드 — 카메라로 비추면 바로 열립니다</div>
  </div>

  <div class="cta">
    <div class="t">"오늘 배 뜨나요?" — 이제 한 화면에서 확인하세요</div>
    <div class="u">${WEB}</div>
    <div class="s">완도 · 포항(울릉도) · 목포(제주 외) · 인천(백령도 외) 지원</div>
  </div>

  <p class="foot">이 정보는 참고용입니다. 실제 운항 여부는 출발 전 공식 채널에서 최종 확인하세요. FerryCast는 한국해양교통안전공단(MTIS)·기상청·국립해양조사원(KHOA) 공공 데이터를 기반으로 합니다.</p>

  </body></html>`
}

async function main() {
  const html = buildHtml()
  if (process.env.DEBUG_HTML) fs.writeFileSync(path.join(DOCS, "_blog_debug.html"), html)
  const outPdf = path.join(DOCS, "FerryCast_블로그_홍보글.pdf")
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle" })
  await page.pdf({
    path: outPdf, format: "A4", printBackground: true,
    margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
  })
  await browser.close()
  console.log("✅ 블로그 PDF 생성 완료:", outPdf)
}

await main()
