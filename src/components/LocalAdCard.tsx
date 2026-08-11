import Image from "next/image"
import AdLabel from "./AdLabel"
import type { LocalAd } from "@/config/localAds"

// 실제 게재되는 지역 광고 배너 — 시안 A(기본형)/B(사진형)/C(혜택형) 대응.
// 모집 슬롯(LocalAdSlot, 회색 점선)과 달리 이건 "실제 광고"라 배편 카드와 같은
// 흰 카드 + 그림자를 쓴다. 대신 우상단 "광고" 라벨로 정보와 구분한다(표시 의무).
//
// 광고주가 없으면 아예 렌더되지 않는다 — 호출부에서 목록이 비면 LocalAdSlot으로 대체.
export default function LocalAdCard({ ad }: { ad: LocalAd }) {
  const isBenefit = ad.variant === "benefit"
  const href = ad.href ?? (ad.tel ? `tel:${ad.tel.replace(/[^0-9+]/g, "")}` : undefined)

  // D. 전면 이미지형 — 업체가 완성한 배너 한 장을 그대로 노출.
  // 문구·연락처가 그림 안에 있으므로 alt로 대체 텍스트를 제공하고, 탭하면 바로 전화가 걸리게 한다.
  if (ad.variant === "image" && ad.imageSrc) {
    return (
      <a
        href={href}
        {...(ad.href ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
        className="relative block overflow-hidden rounded-2xl border border-slate-200 shadow-sm transition-shadow hover:shadow-md"
      >
        <AdLabel tone="onImage" />
        <Image
          src={ad.imageSrc}
          alt={ad.alt ?? ad.title}
          width={ad.imageW ?? 1200}
          height={ad.imageH ?? 675}
          className="h-auto w-full"
          sizes="(max-width: 512px) 100vw, 512px"
        />
      </a>
    )
  }

  // 혜택형만 amber 톤(주목), 나머지는 흰 카드
  const shell = isBenefit
    ? "border-amber-200 bg-amber-50/60"
    : "border-slate-200 bg-white"

  return (
    <a
      href={href}
      {...(ad.href ? { target: "_blank", rel: "noopener noreferrer sponsored" } : {})}
      className={`relative block rounded-2xl border px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md ${shell}`}
    >
      <AdLabel />

      <div className="flex items-start gap-3">
        {/* 좌측 비주얼 — 사진형은 썸네일, 나머지는 이모지 */}
        {ad.variant === "photo" && ad.imageSrc ? (
          <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            <Image src={ad.imageSrc} alt="" fill sizes="64px" className="object-cover" />
          </span>
        ) : ad.emoji ? (
          <span className="mt-0.5 shrink-0 text-2xl" aria-hidden="true">{ad.emoji}</span>
        ) : null}

        <div className="min-w-0 flex-1">
          {/* pr-12 — 우상단 "광고" 라벨과 겹치지 않게 */}
          <p className="pr-12 text-sm font-bold text-slate-800">{ad.title}</p>

          {isBenefit && ad.benefitLine && (
            <p className="mt-0.5 text-sm font-bold text-amber-700">{ad.benefitLine}</p>
          )}

          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{ad.desc}</p>

          {(ad.tel || ad.ctaLabel) && (
            <p className={`mt-1.5 text-xs font-semibold ${isBenefit ? "text-amber-700" : "text-blue-600"}`}>
              {ad.tel && <span>☎ {ad.tel}</span>}
              {ad.tel && ad.ctaLabel && <span> · </span>}
              {ad.ctaLabel && <span>{ad.ctaLabel} →</span>}
            </p>
          )}
        </div>
      </div>
    </a>
  )
}
