import fs from "node:fs"
import {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  Table, TableRow, TableCell, WidthType, ImageRun, BorderStyle, ShadingType,
} from "docx"

const FONT = "맑은 고딕"
const BLUE = "1D4ED8"
const DARK = "1E293B"
const GRAY = "64748B"

// ── 텍스트 헬퍼 ──────────────────────────────
const run = (text, o = {}) => new TextRun({ text, font: FONT, size: o.size ?? 20, bold: o.bold, italics: o.italics, color: o.color ?? DARK, break: o.break })
const para = (children, o = {}) => new Paragraph({ alignment: o.align, spacing: { after: o.after ?? 120, before: o.before ?? 0, line: 276 }, children: Array.isArray(children) ? children : [children], ...o.extra })
const h1 = (text) => new Paragraph({ spacing: { before: 280, after: 140 }, border: { bottom: { color: BLUE, size: 8, style: BorderStyle.SINGLE, space: 4 } }, children: [run(text, { size: 26, bold: true, color: BLUE })] })
const h2 = (text) => para(run(text, { size: 22, bold: true, color: DARK }), { before: 160, after: 80 })
const body = (text, o = {}) => para(run(text, { size: 20, color: o.color ?? "334155" }), { after: o.after ?? 100 })
const bullet = (text) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60, line: 276 }, children: [run(text, { size: 20, color: "334155" })] })

// ── 표 헬퍼 ──────────────────────────────────
const noBorder = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }
const cellBorder = (c = "E2E8F0") => ({ top: { style: BorderStyle.SINGLE, size: 4, color: c }, bottom: { style: BorderStyle.SINGLE, size: 4, color: c }, left: { style: BorderStyle.SINGLE, size: 4, color: c }, right: { style: BorderStyle.SINGLE, size: 4, color: c } })

function dataTable(headers, rows, widths) {
  const head = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE }, borders: cellBorder(),
      shading: { type: ShadingType.CLEAR, fill: "1D4ED8" },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [para(run(h, { bold: true, color: "FFFFFF", size: 20 }), { after: 0 })],
    })),
  })
  const dataRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE }, borders: cellBorder(),
      shading: ri % 2 ? { type: ShadingType.CLEAR, fill: "F8FAFC" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [para(run(c, { size: 19, color: "334155" }), { after: 0 })],
    })),
  }))
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [head, ...dataRows] })
}

// ── 스크린샷 갤러리 행 (이미지 | 설명) ──────────
const IMG_W = 150
function shotRow(file, w, h, title, desc) {
  const buf = fs.readFileSync(`proposal-shots/${file}`)
  const ratio = h / w
  const img = new ImageRun({ data: buf, type: "png", transformation: { width: IMG_W, height: Math.round(IMG_W * ratio) } })
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 32, type: WidthType.PERCENTAGE }, borders: noBorder, verticalAlign: "center",
        margins: { top: 80, bottom: 80, left: 40, right: 120 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img] })],
      }),
      new TableCell({
        width: { size: 68, type: WidthType.PERCENTAGE }, borders: noBorder, verticalAlign: "center",
        margins: { top: 80, bottom: 80, left: 80, right: 40 },
        children: [
          para(run(title, { bold: true, size: 22, color: BLUE }), { after: 80 }),
          para(run(desc, { size: 19, color: "334155" }), { after: 0 }),
        ],
      }),
    ],
  })
}

const gallery = new Table({
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    shotRow("01-main.png", 780, 2336, "① 메인 화면 — 한 화면 통합",
      "앱을 열면 클릭 없이 즉시 완도 현재 날씨·파고, 다음 조석 시각, 완도 출발 전 항로의 운항 시간표와 운항/결항 상태가 한 화면에 표시됩니다. 별도 앱 설치가 필요 없습니다."),
    shotRow("04-route-detail.png", 780, 1688, "② 항로 상세 — 시간표·운임·터미널",
      "항로를 누르면 오늘 출발 시간표(지난 편·다음 편 구분), 공식 운임 요금표 링크, 출발 터미널 위치(지도 보기), 승선 예약 링크를 제공합니다. 계절별 시간표가 자동 반영됩니다."),
    shotRow("05-arrivals.png", 780, 2812, "③ 완도 도착 시간표",
      "'완도 도착' 탭에서 섬에서 완도로 돌아오는 배편의 출발 시각과 운항 상태를 확인할 수 있습니다. 귀가·복귀 일정을 미리 계획할 수 있습니다."),
    shotRow("02-forecast.png", 780, 1688, "④ 단기 날씨 예보 (최대 3일)",
      "날씨 카드를 누르면 기상청 단기예보 기반으로 오늘·내일·모레의 날씨, 최저/최고 기온, 강수확률을 제공합니다. 이동·여행 계획 수립에 활용할 수 있습니다."),
    shotRow("03-tidal.png", 780, 1688, "⑤ 5일 조석 예보",
      "국립해양조사원(KHOA) 완도 관측소 데이터로 만조·간조 시각과 조위(cm)를 5일치 제공합니다. 조류에 민감한 완도 항로의 운항 가능성 판단에 도움이 됩니다."),
    shotRow("06-qr.png", 780, 1688, "⑥ QR 즉시 접속",
      "터미널·정류장 등에 부착할 수 있는 QR 코드입니다. 스캔 한 번으로 앱 설치 없이 ferrycast.kr에 즉시 접속합니다. 인쇄 기능을 내장해 안내물 제작이 간편합니다."),
  ],
})

// ── 문서 본문 ────────────────────────────────
const children = [
  // 표지
  para(run("완도 배편·날씨 통합 정보 서비스", { size: 24, bold: true, color: GRAY }), { align: AlignmentType.CENTER, after: 60, before: 200 }),
  para(run("FerryCast 협력 제안서", { size: 44, bold: true, color: BLUE }), { align: AlignmentType.CENTER, after: 80 }),
  para(run("QR코드 부착 허가 및 공식 홍보 협조 요청", { size: 22, color: DARK }), { align: AlignmentType.CENTER, after: 200 }),
  para([run("“오늘 배 뜨나요?”", { size: 22, bold: true, color: BLUE }), run("  —  완도 군민과 관광객이", { size: 20, color: GRAY })], { align: AlignmentType.CENTER, after: 20 }),
  para(run("한 화면에서 즉시 확인하는 공익 정보 서비스", { size: 20, color: GRAY }), { align: AlignmentType.CENTER, after: 240 }),
  para(run("제출일: 2026년 6월", { size: 20, color: DARK }), { align: AlignmentType.CENTER, after: 20 }),
  para(run("제안자: FerryCast 운영자", { size: 20, color: DARK }), { align: AlignmentType.CENTER, after: 40 }),
  para(run("웹주소: https://ferrycast.kr", { size: 20, bold: true, color: BLUE }), { align: AlignmentType.CENTER, after: 200, extra: { pageBreakBefore: false } }),

  // 1
  h1("1. 제안 개요"),
  body("FerryCast는 완도를 오가는 군민과 관광객이 여객선 운항 시간표, 실시간 운항·결항 여부, 날씨·파고 정보를 별도 앱 설치 없이 한 화면에서 즉시 확인할 수 있는 모바일 웹 서비스입니다."),
  body("본 제안서는 완도군청에 다음 두 가지를 정중히 요청드립니다."),
  bullet("완도 여객선터미널·버스터미널 등 공공장소에 FerryCast 접속 QR코드 부착 허가"),
  bullet("완도군 공식 채널(누리집·SNS 등)을 통한 서비스 홍보 협조"),
  body("FerryCast는 군민 편의와 관광객 만족도 향상을 목표로 하는 공익적 정보 서비스이며, 군의 예산 지원 없이 민간이 자체 운영합니다."),

  // 2
  h1("2. 추진 배경 — 군민·관광객의 불편"),
  body("완도는 기상 변화에 따라 여객선 결항이 잦은 지역입니다. 그러나 현재 배편 정보는 여러 기관에 흩어져 있어, 이용자가 다음과 같은 불편을 겪습니다."),
  bullet("운항 시간표, 결항 여부, 날씨 정보를 각각 다른 사이트에서 따로 확인해야 함"),
  bullet("관광객은 어디서 정보를 찾아야 하는지 모르고, 터미널에 도착해서야 결항을 알게 되는 경우가 발생"),
  bullet("고령 군민은 여러 사이트를 오가며 정보를 찾기 어려움"),
  body("이러한 불편은 관광객의 완도 방문 경험을 저해하고, 군민의 일상 이동에 불편을 초래합니다. FerryCast는 이 문제를 ‘한 화면, 클릭 없는 즉시 확인’으로 해결합니다."),

  // 3
  h1("3. 서비스 주요 기능"),
  dataTable(
    ["기능", "내용"],
    [
      ["운항 시간표", "완도 출발·도착 전 항로의 운항 시간을 한눈에 제공 (완도–제주 포함)"],
      ["실시간 운항 상태", "운항 / 결항 / 운항예정을 색상(🟢🔴⚪)으로 직관적으로 표시"],
      ["날씨·파고 정보", "완도 현재 날씨, 풍속, 파고를 함께 제공하여 운항 가능성 예측 지원"],
      ["조석 예보", "국립해양조사원(KHOA) 만조·간조 시각과 조위를 5일치 제공"],
      ["즉시 확인", "앱 설치 불필요. QR 스캔 또는 검색으로 접속 즉시 모든 정보 표시"],
    ],
    [28, 72],
  ),
  body("※ 데이터 출처: 국토교통부 TAGO, 한국해양교통안전공단(KOMSA), 기상청, 국립해양조사원(KHOA) 등 공공 API를 활용합니다.", { color: GRAY, after: 40 }),

  // 3-1 화면 미리보기
  h1("4. 실제 앱 화면 미리보기"),
  body("아래는 실제 서비스 화면입니다. 모든 정보는 스마트폰에서 스크롤 한 번으로 확인할 수 있도록 설계되었습니다.", { after: 140 }),
  gallery,

  // 4-1 향후 추가 예정
  h1("5. 향후 추가 예정 기능"),
  body("FerryCast는 지속적으로 기능과 정보 범위를 확대하고 있습니다. 다음 기능을 순차적으로 적용할 예정입니다."),
  dataTable(
    ["추가 예정 기능", "내용"],
    [
      ["출항 알림", "관심 항로의 출발 시각을 미리 알려주는 알림 기능 — 홈화면에 추가(앱 설치) 후 이용 가능하도록 순차 적용 예정"],
      ["제공 항로 확대", "현재 완도–제주, 완도–청산도, 완도–소안도·보길도·노화 항로를 제공하며, 목포·녹동·여수 등 그 외 항로도 데이터 확보에 따라 순차적으로 추가 예정"],
    ],
    [28, 72],
  ),
  body("※ 현재 제공 항로: 완도–제주 · 완도–청산도 · 완도–소안도·보길도·노화. 그 외 항로는 공공 데이터 연동 작업을 거쳐 단계적으로 확대됩니다.", { color: GRAY, after: 40 }),

  // 5
  h1("6. 완도군의 기대 효과"),
  h2("6-1. 군민 편의 증진"),
  bullet("배편·날씨 정보를 한 번에 확인하여 불필요한 헛걸음 방지"),
  bullet("고령층도 쉽게 쓰는 단순한 화면으로 정보 접근성 향상"),
  h2("6-2. 관광객 만족도 향상"),
  bullet("관광객이 결항 정보를 미리 확인하여 일정 차질 최소화"),
  bullet("‘정보를 쉽게 찾을 수 있는 완도’라는 긍정적 방문 경험 제공"),
  h2("6-3. 군의 부담 없는 협력"),
  bullet("군의 예산·인력 투입 없이 민간이 자체 개발·운영"),
  bullet("군은 부착 허가와 홍보 협조만으로 군민 편의 서비스 제공 효과"),

  // 6
  h1("7. 운영 방식 및 지속가능성"),
  body("FerryCast는 무료 공익 서비스로 운영되며, 서버 운영비 등 지속적인 유지·관리를 위해 다음과 같은 최소한의 수익 모델을 투명하게 운영할 계획입니다."),
  dataTable(
    ["구분", "내용"],
    [
      ["온라인 광고", "화면 하단에 비침해적 배너 광고를 게재 (정보 확인을 방해하지 않는 위치)"],
      ["지역 상생", "완도 지역 업체(펜션·식당·특산물 등) 홍보를 우선 게재하여 지역 경제에 기여"],
      ["정보 무료", "배편·날씨 등 핵심 정보는 영구 무료. 이용자에게 요금을 부과하지 않음"],
    ],
    [24, 76],
  ),
  body("운영 수익은 서버 유지와 서비스 개선에 사용되며, 이는 군의 예산 부담 없이 서비스를 안정적으로 지속하기 위한 수단입니다. 공공 정보를 활용한 서비스인 만큼, 군과 협의된 범위 내에서 투명하게 운영하겠습니다."),

  // 7
  h1("8. 완도군청에 드리는 요청 사항"),
  dataTable(
    ["No", "요청 항목", "세부 내용"],
    [
      ["1", "QR코드 부착 허가", "여객선터미널·버스터미널 등 공공장소에 접속 QR 안내물 부착 허가"],
      ["2", "공식 홍보 협조", "완도군 누리집·SNS 등 공식 채널을 통한 서비스 소개 게시"],
      ["3", "정보 정확성 협의", "정확한 정보 제공을 위한 데이터·운영 관련 의견 교류 (선택)"],
    ],
    [10, 28, 62],
  ),

  // 8
  h1("9. 맺음말"),
  body("FerryCast는 완도를 찾는 모든 사람이 ‘오늘 배가 뜨는지’를 쉽고 빠르게 확인할 수 있도록 돕는 작은 서비스입니다. 군의 예산이나 인력 부담 없이, 군민 편의와 관광 활성화에 보탬이 되고자 합니다."),
  body("완도군청의 부착 허가와 홍보 협조가 더해진다면, 더 많은 군민과 관광객이 이 서비스를 통해 편리함을 누릴 수 있습니다. 긍정적인 검토를 부탁드립니다."),

  // 연락처
  h1("문의 및 연락처"),
  body("서비스명: FerryCast (페리캐스트)"),
  body("웹주소: https://ferrycast.kr"),
  para([run("담당자: 김신진", { size: 20, bold: true, color: DARK }), run("      연락처: 010-8478-7552", { size: 20, color: DARK })], { after: 60 }),
  para([run("이메일: climaxna@naver.com", { size: 20, color: DARK })], { after: 60 }),
]

const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [{
    properties: { page: { margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 } } },
    children,
  }],
})

const buf = await Packer.toBuffer(doc)
const outName = process.argv[2] || "FerryCast_완도군청_제안서.docx"
fs.writeFileSync(outName, buf)
console.log("✅ 생성 완료:", outName, `(${(buf.length / 1024).toFixed(0)} KB)`)
