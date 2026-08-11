import AdLabel from "./AdLabel"
import { AD_SLOT_RATIO } from "@/config/localAds"

// 배너가 들어갈 "빈 자리"를 실제 게재 크기 그대로 보여주는 틀.
// 모집 카드(LocalAdSlot, 문구·버튼이 든 세로로 긴 카드)와 목적이 다르다:
// 이건 광고주에게 **차지하는 면적**을 보여주기 위한 것이라, 실제 배너와 픽셀 단위로 같은 높이여야 한다.
// → 높이를 직접 쓰지 않고 LocalAdCard와 같은 AD_SLOT_RATIO를 공유한다(한쪽만 바뀌는 사고 방지).
export default function AdSlotFrame({ note }: { note?: string }) {
  return (
    <div
      className="relative flex items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-100/70"
      style={{ aspectRatio: String(AD_SLOT_RATIO) }}
    >
      <AdLabel text="광고 자리" />
      <p className="px-4 text-center text-xs font-medium text-slate-400">
        {note ?? "이 자리에 배너가 게재됩니다"}
      </p>
    </div>
  )
}
