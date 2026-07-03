---
name: FerryCast
description: 완도 여객선 이용자를 위한 글랜스형 운항·날씨·조석 정보 유틸리티
colors:
  primary: "#2563eb"
  primary-strong: "#1e40af"
  primary-mid: "#3b82f6"
  primary-tint: "#dbeafe"
  primary-wash: "#eff6ff"
  sky-wash: "#f0f9ff"
  arrival: "#14b8a6"
  arrival-deep: "#0d9488"
  arrival-ink: "#115e59"
  arrival-tint: "#ccfbf1"
  arrival-wash: "#f0fdfa"
  status-operating-ink: "#047857"
  status-operating-wash: "#ecfdf5"
  status-cancelled-ink: "#e11d48"
  status-cancelled-mid: "#f43f5e"
  status-cancelled-line: "#fecdd3"
  status-cancelled-wash: "#fff1f2"
  note-ink: "#b45309"
  note-wash: "#fffbeb"
  body-bg: "#f8fafc"
  surface: "#ffffff"
  border: "#f1f5f9"
  border-strong: "#e2e8f0"
  ink: "#0f172a"
  ink-700: "#334155"
  ink-600: "#475569"
  ink-500: "#64748b"
  ink-muted: "#94a3b8"
  ink-faint: "#cbd5e1"
typography:
  data:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "normal"
    fontFeature: "tabular-nums"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
rounded:
  full: "9999px"
  card: "16px"
  block: "12px"
  control: "8px"
  chip: "6px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
components:
  route-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  route-card-cancelled:
    backgroundColor: "{colors.status-cancelled-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "14px 16px"
  status-badge-operating:
    backgroundColor: "{colors.status-operating-wash}"
    textColor: "{colors.status-operating-ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  status-badge-cancelled:
    backgroundColor: "{colors.status-cancelled-wash}"
    textColor: "{colors.status-cancelled-ink}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  next-departure-highlight:
    backgroundColor: "{colors.primary-wash}"
    textColor: "{colors.primary-strong}"
    rounded: "{rounded.block}"
    padding: "8px 12px"
  time-chip-next:
    backgroundColor: "{colors.primary-mid}"
    textColor: "{colors.surface}"
    rounded: "{rounded.chip}"
    padding: "4px 10px"
  official-link-button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-600}"
    rounded: "{rounded.control}"
    padding: "10px 14px"
---

# Design System: FerryCast

## 1. Overview

**Creative North Star: "항구의 안내판 (The Harbor Kiosk)"**

FerryCast는 선착장 입구에 붙은 차분하고 믿음직한 안내판이다. 여행객과 주민이 지나가며 한 번 보고 "오늘 배가 뜬다/안 뜬다"를 3초 안에 확신하고 떠나는 곳. 화면은 맑은 여백 위에 정보를 정직하게 정리해 얹고, 바다빛 파랑을 단 하나의 목소리로 삼아 지금 중요한 것(다음 출발, 운항 상태)만 가리킨다. 밝고 친근하되, 그 친근함은 톤과 색·여백에서 오지 표정 짓는 애니메이션에서 오지 않는다.

밀도는 낮고 위계는 또렷하다. 슬레이트 뉴트럴의 조용한 배경 위에서 파랑(출발)·틸(도착)·상태색(초록 운항 / 장미 결항)이 각자의 역할만 수행한다. 카드는 가볍게 떠 있고(연한 그림자), 숫자는 tabular-nums로 정렬돼 시간표가 표처럼 읽힌다. 이 시스템이 명시적으로 거부하는 것: 화려한 여행 마케팅 랜딩의 풀스크린 히어로, 관리자 콘솔의 위젯 과밀, 그리고 무엇보다 **장난스럽거나 과한 애니메이션** — 바운스·네온·이모지 남발·장식성 인터랙션은 유틸리티의 신뢰감을 깎는다.

**Key Characteristics:**
- 글랜스 우선: 진입 즉시 모든 핵심 정보. 탭·모달 뒤에 숨기지 않는다.
- 단일 목소리의 파랑(#2563eb) + 도착 전용 틸 + 색맹 안전 상태색(색+라벨+아이콘).
- 슬레이트 뉴트럴, 맑은 여백, 가벼운 그림자의 산뜻한 정보 카드.
- tabular-nums 숫자 정렬로 시간표가 표처럼 읽힘.
- 절제된 모션: 상태 변화·피드백에만, 150–250ms.

## 2. Colors

바다빛 파랑 하나를 목소리로 삼은 Restrained 팔레트. 슬레이트 뉴트럴이 무대를 조용히 받치고, 파랑·틸·상태색은 각자 맡은 정보만 가리킨다.

### Primary
- **바다빛 파랑 (Harbor Blue, #2563eb):** 브랜드("Cast"), 링크, 출발 강조, theme-color. 시스템의 단일 강조 목소리.
- **깊은 파랑 (Deep Harbor, #1e40af):** 다음 출발 시각 숫자 등 파랑 위 고대비 잉크.
- **밝은 파랑 (Bright Blue, #3b82f6):** 다음 출발 타임칩 채움색.
- **파랑 틴트/워시 (#dbeafe / #eff6ff):** 다음 출발 하이라이트 블록 배경, 미래편 칩 배경.

### Secondary
- **도착 틸 (Arrival Teal, #14b8a6 · deep #0d9488 · ink #115e59 · tint #ccfbf1 · wash #f0fdfa):** **오직 도착(섬→완도) 맥락**에만. 출발(파랑)과 도착(틸)을 색으로 분리해 방향을 즉시 구분한다.

### Tertiary
- **안내 앰버 (Note Amber, ink #b45309 / wash #fffbeb):** 경유편·대체 터미널·부가 안내 칩. 주의가 아니라 "참고" 신호.

### Neutral
- **본문 배경 (#f8fafc):** 앱 전체 바닥. 흰 카드가 그 위에 떠 보이게 하는 아주 옅은 슬레이트.
- **표면 (#ffffff):** 카드·시트·버튼 표면.
- **보더 (#f1f5f9 / 강조 #e2e8f0):** 카드 경계, 구분선.
- **잉크 램프 (#0f172a → #334155 → #475569 → #64748b → #94a3b8 → #cbd5e1):** 제목→본문→라벨→뮤트→플레이스홀더 순.

### Named Rules
**The One Voice Rule.** 파랑(#2563eb)은 이 시스템의 유일한 강조 목소리다. 강조·링크·현재 선택·출발에만 쓰고 장식으로 칠하지 않는다. 도착은 틸, 상태는 상태색 — 파랑을 이 셋의 자리에 침범시키지 않는다.

**The Triple-Coded Status Rule.** 운항(초록)·결항(장미)은 **색만으로 구분하지 않는다.** 항상 색 + 텍스트 라벨("운항"/"결항") + 아이콘/배지 형태를 함께 쓴다. 적록색맹과 야외 눈부심 모두에서 읽혀야 한다.

## 3. Typography

**Body & Display Font:** Geist (fallback: system-ui, sans-serif)
**Mono/Data Font:** Geist Mono — 필요 시. 시간표 숫자는 Geist + `tabular-nums`로 정렬.

**Character:** 하나의 잘 튜닝된 지오메트릭 산세리프가 제목·본문·라벨·데이터를 모두 감당한다. 제품 UI답게 display/body 페어링을 두지 않는다. 대비는 굵기와 크기로, 소음은 만들지 않는다.

### Hierarchy
- **Data** (700, 1.5rem/24px, tabular-nums): 다음 출발 시각. 화면에서 가장 크고 눈에 띄는 단일 숫자. 시간표의 앵커.
- **Headline** (700, 1.125rem/18px, tracking -0.01em): 헤더 로고, 항로명. 위계의 최상단 텍스트.
- **Body** (400, 0.875rem/14px, line-height 1.6): 면책·안내 문장. 산문은 65–75ch 이내.
- **Label** (500, 0.75rem/12px): 상태 배지, 시각 라벨, 칩, 보조 메타. 라벨에 display 폰트를 쓰지 않는다.

### Named Rules
**The Tabular Time Rule.** 모든 운항 시각·숫자는 `tabular-nums`. 06:00과 18:30이 세로로 자릿수 정렬돼 시간표가 표처럼 스캔된다. 이게 무너지면 시간표가 흔들려 보인다.

**The Fixed-Scale Rule.** 고정 rem 스케일만 쓴다. 유동(clamp) 헤딩은 제품 UI에서 금지 — 좁은 화면에서 더 나빠 보인다. 야외·고령 가독성을 위해 본문 하한은 14px, 핵심 상태는 더 크게.

## 4. Elevation

가벼운 그림자로 깊이를 만드는 **flat-by-default** 시스템. 카드는 쉬는 상태에서 아주 옅게 떠 있고(`shadow-sm`), 상호작용에만 살짝 더 든다(`hover:shadow-md`). 헤더만 `backdrop-blur`로 스크롤 콘텐츠 위에 얹힌다. 무거운 그림자·글래스모피즘은 쓰지 않는다.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)` = shadow-sm): 카드·버튼·푸터의 기본 부양감.
- **Hover** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` = shadow-md): 눌릴 수 있는 항로 카드에 호버 시. 상태 피드백 전용.
- **Header blur** (`backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.8)`): sticky 헤더가 콘텐츠 위에 반투명하게 얹힘.

### Named Rules
**The Flat-By-Default Rule.** 표면은 쉴 때 평평하다(옅은 shadow-sm + 보더). 그림자가 짙어지는 건 상태 반응(hover, active)일 때뿐. 정적인 카드에 무거운 그림자를 깔지 않는다.

## 5. Components

### Buttons / Links
- **Shape:** 항로 카드는 `rounded-2xl`(16px) 전체가 버튼. 공식 링크·컨트롤은 `rounded-lg`(8px).
- **Route card:** 흰 표면 + `slate-100` 보더 + `shadow-sm`. 결항 변형은 `rose-50` 워시 배경 + `rose-200` 보더로 카드 전체가 경고를 입는다.
- **Hover / Active:** `hover:shadow-md`, `hover:border-slate-200`, `active:scale-[0.99]`, 그림자 `transition-all`. 우측 시그니처 `›`가 `group-hover`에 0.5px 이동.
- **Official-link button:** 흰 배경 + `slate-200` 보더 + `slate-600` 텍스트, hover 시 `blue-200` 보더 + `blue-700` 텍스트.

### Chips (시간표 · 상태 배지)
- **Status badge:** `rounded-full` 필. 운항 = `emerald-50`/`emerald-700`, 결항 = `rose-50`/`rose-600`, 운항예정 = `slate-100`/`slate-500`. 항상 텍스트 라벨 동반.
- **Time chip (3 states):** 지난 편 = 배경 없는 `slate-400`, 다음 편 = 채워진 파랑/틸 + 흰 글자 굵게, 이후 편 = `blue-100`/`teal-100` 틴트. `rounded-md`, `tabular-nums`.
- **Note chip:** 경유·대체터미널·내일운항 = `amber-50`/`emerald-50` 워시 + 아이콘 인라인.

### Cards / Containers
- **Corner:** `rounded-2xl`(16px) 카드, `rounded-xl`(12px) 다음-출발 하이라이트 블록.
- **Background:** 흰 표면. 다음-출발 블록만 방향색 가로 그라데이션(출발 `blue-50→sky-50`, 도착 `teal-50→emerald-50`) — 배경 한정, 텍스트 그라데이션 아님.
- **Shadow:** Elevation의 Resting/Hover 참조.
- **Padding:** 카드 `px-4 py-3.5`, 블록 `px-3 py-2`.

### Navigation / Header
- **Sticky 헤더:** `bg-white/80` + `backdrop-blur-md` + 하단 `slate-100` 보더. 로고 + "Ferry**Cast**"(Cast만 파랑) + 서브라벨 + QR 링크.
- **QR/보조 링크:** 뮤트(`slate-400`) 기본, hover 시 `slate-100` 배경 + `blue-600`.

### Skeleton (로딩)
- **Style:** `animate-pulse` + `bg-slate-100` + 실제 콘텐츠와 같은 `rounded-2xl` 높이. 스피너 대신 콘텐츠 형태의 스켈레톤을 쓴다.

### Signature: Next-Departure Highlight
다음 출발 한 편을 방향색 그라데이션 블록에 크게(text-2xl tabular-nums) 얹고, 우측에 상대시간("32분 후")을 둔다. 화면에서 사용자가 가장 먼저 찾는 정보 — 안내판의 헤드라인.

## 6. Do's and Don'ts

### Do:
- **Do** 파랑(#2563eb)을 유일한 강조 목소리로 유지 — 출발·링크·현재 선택에만. 도착은 틸, 상태는 상태색.
- **Do** 운항/결항을 **색 + 텍스트 라벨 + 배지 형태** 삼중으로 표기(적록색맹·야외 눈부심 대응).
- **Do** 모든 시각·숫자에 `tabular-nums`로 시간표를 표처럼 정렬.
- **Do** 카드를 flat-by-default로 — `shadow-sm` 쉬는 상태, `hover:shadow-md` 반응 상태.
- **Do** 본문 하한 14px, 핵심 운항 상태는 더 크게. 야외·고령 가독성 우선.
- **Do** API 실패 시에도 안내 fallback을 표시 — 빈 화면·에러 스택 금지.

### Don't:
- **Don't** 장난스럽거나 과한 애니메이션을 넣지 마라 — 바운스·엘라스틱 모션, 네온색, 이모지 남발, 장식성 인터랙션. 모션은 상태 변화 전달에만, 150–250ms.
- **Don't** 화려한 여행 마케팅 랜딩처럼 풀스크린 히어로·큰 슬로건·스크롤 스토리텔링으로 핵심 정보를 밀어내지 마라.
- **Don't** 관리자 콘솔처럼 위젯·차트를 과밀하게 깔지 마라. 일반 주민에게 과하다.
- **Don't** 상태를 색만으로 구분하지 마라(라벨·아이콘 없는 초록/빨강 점).
- **Don't** 무거운 그림자·글래스모피즘을 장식으로 쓰지 마라.
- **Don't** `background-clip:text` 그라데이션 텍스트, 1px 초과 컬러 side-stripe 보더를 쓰지 마라(절대 금지).
- **Don't** 라벨·버튼·데이터에 display 폰트를 쓰지 마라. Geist 하나로 굵기·크기 대비만.
