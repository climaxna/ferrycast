// 광고 영역에 붙는 중성 회색 라벨 — 광고 슬롯(LocalAdSlot)·시안(AdsPageContent) 공용.
// 앱의 의미색(파랑=출발, teal=도착, indigo=다른 노선망, amber=비운항, rose=결항)을 피해
// 회색을 쓴다: "서비스 데이터가 아님"을 조용히 알리는 신호.
// 부모에 relative가 있어야 우상단에 자리잡는다.
export default function AdLabel({ text = "광고" }: { text?: string }) {
  return (
    <span className="absolute right-3 top-2.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
      {text}
    </span>
  )
}
