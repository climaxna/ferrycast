import type { WandoRoute } from "@/lib/types"
import { REGIONS } from "@/config/regions"

export type RouteDetailGuide = {
  title: string
  intro: string
  checks: Array<{ title: string; description: string }>
  source: { label: string; href: string }
  guideHref?: string
  tourHref?: string
  tourLabel?: string
}

const BOOKING = "https://island.theksa.co.kr/page/booking"

const GUIDES: Record<string, RouteDetailGuide> = {
  cheongsando: {
    title: "완도 · 청산도 이용 안내",
    intro: "청산도행은 완도여객선터미널과 청산도 도청항을 잇는 대표 생활·관광 항로입니다. 출발 항구와 도착 항구를 예약 내역에서 함께 확인하세요.",
    checks: [
      { title: "도착 항구", description: "청산도 쪽 승·하선 장소는 도청항입니다. 섬 안 숙소나 픽업을 예약할 때에는 도청항 도착으로 안내하는 편이 안전합니다." },
      { title: "시간표 읽기", description: "같은 날에도 선박과 편에 따라 시각이 달라질 수 있습니다. 이 화면의 실시간 상태를 보고, 승선 전에는 공식 예매처의 최종 안내를 한 번 더 확인하세요." },
      { title: "귀항편", description: "청산도에서 완도로 돌아오는 편은 별도 시간표입니다. 당일 왕복이라면 출발 전에 귀항 시각과 숙소·버스 이동 시간을 함께 잡아두세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/wando-cheongsando",
    tourHref: "/tour/cheongsando",
  },
  "hwaheungpo-route": {
    title: "화흥포 · 소안도·보길도·노화 이용 안내",
    intro: "이 노선은 완도여객선터미널이 아닌 화흥포항에서 출발합니다. ‘완도 출발’로만 기억하면 다른 터미널로 갈 수 있어 출발지를 먼저 확인해야 합니다.",
    checks: [
      { title: "출발 위치", description: "승선 장소는 화흥포항입니다. 내비게이션과 픽업 기사에게는 ‘화흥포항’으로 전달하고, 완도읍 터미널과 혼동하지 않도록 주의하세요." },
      { title: "경유 섬", description: "소안도·보길도·노화를 오가는 생활 항로라 같은 시간대라도 실제 하선 섬이 다를 수 있습니다. 목적지와 하선 장소를 선사·현장 안내로 확인하세요." },
      { title: "현장 변수", description: "섬 사이 편은 기상·조류와 선박 운영에 따라 일부 편만 바뀔 수 있습니다. 부분 결항 표시는 해당 편의 상태이므로 시간별로 확인하는 것이 좋습니다." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/wando-soan-bogil-nohwa",
    tourHref: "/tour/bogildo",
    tourLabel: "보길도 주요 관광지 안내 보기",
  },
  jeju: {
    title: "제주 항로 이용 안내",
    intro: "제주행은 장거리 항로라 출발 터미널, 선박, 경유 여부가 일정마다 달라질 수 있습니다. 이 화면의 편별 경유 표기와 예약 내역의 출발 장소를 함께 확인하세요.",
    checks: [
      { title: "출발 터미널", description: "완도·목포·진도·녹동·삼천포 등 출발지에 따라 터미널이 다릅니다. ‘제주행’이라는 목적지보다 예약한 편의 출발항을 기준으로 이동하세요." },
      { title: "경유 편", description: "일부 편은 추자도 등 경유지가 표시될 수 있습니다. 경유 여부는 소요시간과 하선 계획에 영향을 줄 수 있으므로 시간표의 편별 안내를 확인하세요." },
      { title: "차량 동반", description: "여객 좌석과 차량 선적은 별도 확인 대상입니다. 차량을 가져간다면 선사·예매처의 차량 접수 조건과 마감 시각을 먼저 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
  },
  "from-pohang": {
    title: "포항 · 울릉도 이용 안내",
    intro: "포항 출발 울릉도 편은 도착 항구와 선박에 따라 섬 안 이동 동선이 달라질 수 있습니다. 숙소·렌터카 예약 전 도착 항구를 먼저 확인하세요.",
    checks: [
      { title: "도착 항구", description: "울릉도에는 도동·저동·사동 등 항구가 있습니다. 화면의 도착 터미널과 예약 내역을 기준으로 픽업·교통편을 잡으세요." },
      { title: "기상 확인", description: "동해 장거리 항로는 해상 상태 영향이 큽니다. 출항 당일에는 FerryCast 상태와 선사의 공식 공지를 함께 확인하는 것이 좋습니다." },
      { title: "귀항 계획", description: "울릉도에서 나오는 배는 출발 항구와 시간이 다를 수 있습니다. 왕복 여행이면 돌아오는 편의 항구와 시각을 출발 전에 함께 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/ulleung-from-pohang",
  },
  "from-yeongilman": {
    title: "영일만 · 울릉도 이용 안내",
    intro: "영일만신항 출발 편은 포항 시내 여객터미널과 출발 장소가 다릅니다. 예약한 선편의 터미널명을 기준으로 이동해야 합니다.",
    checks: [
      { title: "출발 장소", description: "이 편의 출발지는 포항항국제여객터미널입니다. ‘포항항’이라는 넓은 표현만으로 이동하지 말고 예약 내역의 터미널명을 확인하세요." },
      { title: "야간·장거리 운항", description: "출발·도착 날짜가 달라질 수 있는 장거리 편입니다. 숙소 체크인과 섬 안 이동 예약은 도착 예정 시각만으로 확정하지 않는 편이 안전합니다." },
      { title: "결항 확인", description: "울릉도 항로는 해상 기상에 따라 변동될 수 있습니다. 승선 전 공식 공지와 함께 당일 편별 상태를 확인하세요." },
    ],
    source: { label: "울릉크루즈 공식 안내", href: "https://www.ulcruise.co.kr" },
    guideHref: "/guide/ulleung-from-yeongilman",
  },
  dokdo: {
    title: "울릉도 · 독도 이용 안내",
    intro: "독도 편은 울릉도에서 출발해 독도를 둘러본 뒤 다시 울릉도로 돌아오는 순환 성격의 운항입니다. 별도의 ‘독도 출발 귀항편’이 보이지 않는 이유도 이 구조 때문입니다.",
    checks: [
      { title: "출발 항구", description: "화면에 표시된 울릉도 출발 터미널을 기준으로 이동하세요. 울릉도 안에서도 도동·저동·사동은 서로 다른 항구입니다." },
      { title: "접안 여부", description: "독도 운항은 출항 여부와 현지 접안 여부가 항상 같지는 않을 수 있습니다. 당일 해상 상황과 선사 안내를 최종 기준으로 확인하세요." },
      { title: "당일 확인", description: "기상 영향이 큰 항로이므로 일정·교통·숙소를 연결하기 전, 출항 당일 편별 운항 상태를 반드시 다시 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/ulleung",
  },
  hongdo: {
    title: "목포 · 홍도 이용 안내",
    intro: "홍도행은 목포연안여객선터미널에서 출발하며, 홍도 쪽 승·하선은 홍도항여객선터미널 기준으로 계획하는 것이 좋습니다.",
    checks: [
      { title: "출발·도착 항구", description: "목포항에는 여러 여객터미널이 있어 목적지만 보고 이동하면 혼동할 수 있습니다. 예약한 선편의 출발 터미널과 홍도항 도착 정보를 함께 확인하세요." },
      { title: "섬 일정", description: "홍도 안 숙소·관광 일정은 실제 하선 시간 이후로 여유를 두세요. 기상이나 운항 사정으로 출항·도착 시각이 바뀔 수 있습니다." },
      { title: "귀항편", description: "홍도에서 목포로 나오는 편은 별도 시간표입니다. 숙박 예약 전 귀항편의 운항일과 시간을 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/mokpo-hongdo",
    tourHref: "/tour/hongdo",
  },
  heuksando: {
    title: "목포 · 흑산도 이용 안내",
    intro: "흑산도행은 목포연안여객선터미널에서 출발합니다. 관광·생활 수요가 함께 있는 항로라 목적지 일정 전에 돌아오는 편을 먼저 확인하는 편이 좋습니다.",
    checks: [
      { title: "목포 출발 위치", description: "목포항에는 제주·도서 항로의 터미널이 나뉘어 있습니다. 예약 확인서의 출발 터미널을 기준으로 이동하세요." },
      { title: "섬 안 이동", description: "숙소·렌터카·관광 예약 시 흑산항 도착 이후 이동 시간을 별도로 두세요. 배 도착 직후 연결 교통을 고정하면 변동에 취약합니다." },
      { title: "해상 상황", description: "서남해 항로는 해상 기상에 따라 일부 편이 달라질 수 있습니다. 화면의 편별 결항 표시와 공식 공지를 함께 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/mokpo-heuksando",
    tourHref: "/tour/heuksando",
  },
  gageodo: {
    title: "목포 · 가거도 이용 안내",
    intro: "가거도행은 목포에서 출발하는 장거리 도서 항로입니다. 일부 운항은 순환 형태로 등록될 수 있어, 시간표는 목적지뿐 아니라 편별 항로 안내도 함께 보아야 합니다.",
    checks: [
      { title: "시간 여유", description: "장거리 섬 항로는 날씨와 선박 운항 상황의 영향을 크게 받습니다. 도착 직후 일정은 여유 있게 잡고, 당일 변경 가능성을 고려하세요." },
      { title: "편별 확인", description: "같은 가거도행이라도 경유·순환 표기가 있을 수 있습니다. 예약 전 출발항·도착항과 해당 편의 안내를 다시 확인하세요." },
      { title: "귀항 준비", description: "가거도 출발 편은 다음 이동 일정에 직접 영향을 줍니다. 숙박을 확정하기 전 귀항편의 운항일과 시각을 먼저 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/mokpo-gageodo",
    tourHref: "/tour/gageodo",
  },
  deokjeokdo: {
    title: "인천 · 덕적도 이용 안내",
    intro: "덕적도행은 인천연안여객터미널에서 출발합니다. 자월·승봉·이작 등 경유 섬이 섞일 수 있어, 덕적도 하선 편인지 시간표의 항로 안내를 확인해야 합니다.",
    checks: [
      { title: "경유 여부", description: "인천 앞바다 항로는 여러 섬을 경유하는 편이 있습니다. 출발 시각만 비교하지 말고 목적지와 경유 표기를 함께 확인하세요." },
      { title: "도착 후 이동", description: "덕적도 안 이동·숙소 픽업은 진리항 등 실제 하선 장소 기준으로 조율하세요. 예약 전에 숙소에 도착 항구를 전달하는 편이 좋습니다." },
      { title: "차량 동반", description: "차량을 가져갈 경우 여객 예약과 별도로 선적 가능 여부·접수 조건을 확인해야 합니다." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/incheon-deokjeokdo",
    tourHref: "/tour/deokjeokdo",
  },
  daeijakdo: {
    title: "인천 · 대이작도 이용 안내",
    intro: "대이작도행은 인천연안여객터미널에서 출발하며, 자월·승봉 등 경유 섬이 함께 표시될 수 있습니다. 출발 시각만 보지 말고 대이작도 하선 편인지 항로 안내를 함께 확인하세요.",
    checks: [
      { title: "도착 후 이동", description: "대이작도 관광지는 선착장 주변에만 모여 있지 않습니다. 숙소·픽업을 잡을 때에는 실제 하선 장소와 이동 시간을 함께 전달하세요." },
      { title: "풀등 방문", description: "풀등은 썰물 때만 드러나는 모래톱입니다. 배 시간표와 별개로 조석·현지 운영 안내를 확인한 뒤 일정을 잡아야 합니다." },
      { title: "귀항편", description: "대이작도에서 인천으로 나오는 편은 별도 시간표입니다. 당일 일정이라면 관광지 이동 전에 귀항 시각을 먼저 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    tourHref: "/tour/daeijakdo",
  },
  gulupdo: {
    title: "인천 · 굴업도 이용 안내",
    intro: "굴업도 편은 순환 항로 데이터로 표시될 수 있습니다. 화면의 출발 시각과 함께 항로 안내에 굴업도 경유·하선 편이 맞는지 확인하세요.",
    checks: [
      { title: "운항일과 항로 확인", description: "굴업도는 운항일과 경유 섬에 따라 시간표 표기가 달라질 수 있습니다. 출발 전 당일 편별 운항 상태와 공식 예약 정보를 함께 확인하세요." },
      { title: "섬 안 탐방", description: "개머리초지와 해변 등은 선착장 주변에만 모여 있지 않습니다. 숙소·픽업을 예약할 때 실제 하선 시각과 이동 시간을 전달하세요." },
      { title: "귀항편 우선 확인", description: "귀항편은 별도 시간표입니다. 섬 안 탐방 계획을 세우기 전에 인천으로 나오는 편과 현장 승선 조건을 먼저 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    tourHref: "/tour/gulupdo",
  },
  baengnyeongdo: {
    title: "인천 · 백령도 이용 안내",
    intro: "백령도는 인천연안여객터미널에서 출발해 용기포항여객터미널로 들어가는 장거리 서해 항로입니다. 출발 당일 운항 상태 확인이 특히 중요합니다.",
    checks: [
      { title: "출항 전 확인", description: "장거리 항로는 해상 상태에 따른 변동 폭이 클 수 있습니다. 터미널로 출발하기 전 편별 운항 상태와 공식 공지를 다시 확인하세요." },
      { title: "도착 항구", description: "백령도 숙소·픽업은 용기포항여객터미널 도착 기준으로 조율하세요. 섬 안 이동 시간을 고려해 다음 일정을 잡는 것이 좋습니다." },
      { title: "왕복 일정", description: "당일 왕복보다 숙박 일정이 필요한 경우가 많습니다. 여행을 확정하기 전 백령도 출발 귀항편도 함께 확인하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
    guideHref: "/guide/incheon-baengnyeongdo",
    tourHref: "/tour/baengnyeongdo",
  },
  yeonpyeongdo: {
    title: "인천 · 연평도 이용 안내",
    intro: "연평도 편은 순환 항로 데이터로 표시될 수 있어, 화면에는 인천 출발 편만 안내됩니다. 같은 배가 운항을 마친 뒤 돌아오는 구조라 별도 역방향 카드가 없을 수 있습니다.",
    checks: [
      { title: "항로 표기", description: "순환 항로는 출발·도착 항목만으로 목적지가 분명하지 않을 수 있습니다. 시간표의 연평 항로 안내와 공식 예약 정보를 함께 확인하세요." },
      { title: "당일 상태", description: "서해 도서 항로는 기상과 운항 계획 변화에 영향을 받을 수 있습니다. 출발 전 편별 운항 상태를 다시 확인하세요." },
      { title: "도착 후 일정", description: "연평도 안 숙소·교통은 실제 하선 시각 이후로 여유를 두고 계획하세요." },
    ],
    source: { label: "한국해운조합 승선예약에서 최종 확인", href: BOOKING },
  },
}

export function getRouteDetailGuide(route: WandoRoute): RouteDetailGuide | null {
  const key = route.id.replace(/^(dep|arr|hop)-/, "")
  const guide = GUIDES[key] ?? (route.originName === "제주" ? GUIDES.jeju : undefined)
  if (!guide) return null
  return { ...guide, guideHref: getRouteGuideHref(route) ?? undefined }
}

// originName은 화면의 지역이다. 귀항편의 from은 섬 이름이므로 지역 판정에 쓰지 않는다.
export function getRouteGuideHref(route: WandoRoute): string | null {
  const key = route.id.replace(/^(dep|arr|hop)-/, "")
  const region = route.originName ?? "완도"
  if (route.id.startsWith("yaksan-")) return "/guide/wando-yaksan-islands"
  if (region === "완도") {
    if (key === "jeju") return "/guide/jeju-from-wando"
    if (key === "cheongsando") return "/guide/wando-cheongsando"
    if (key === "hwaheungpo-route") return "/guide/wando-soan-bogil-nohwa"
    return null
  }
  const config = Object.values(REGIONS).find(item => item.name === region)
  if (config?.routeGroups.some(group => group.key === key)) {
    const slug = config.slug === "jeju" && key === "from-mokpo"
      ? "mokpo-jeju" : `${config.slug}-${key}`
    return `/guide/${slug}`
  }
  // 독도는 관련 설명이 있는 울릉도 종합 가이드로 연결한다.
  if (region === "울릉도" && key === "dokdo") return "/guide/ulleung"
  return null
}
