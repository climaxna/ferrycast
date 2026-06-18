self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", () => self.clients.claim())

self.addEventListener("message", (e) => {
  if (e.data?.type !== "SCHEDULE_ALARM") return
  const { routeLabel, departureTime, offsetMinutes, delayMs } = e.data
  setTimeout(() => {
    const body = offsetMinutes > 0
      ? `${offsetMinutes}분 후 출발합니다 (${departureTime} 출발)`
      : `지금 출발합니다! (${departureTime} 출발)`
    self.registration.showNotification(`🚢 ${routeLabel}`, {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      tag: `ferry-${departureTime}-${offsetMinutes}`,
      requireInteraction: true,
    })
  }, delayMs)
})
