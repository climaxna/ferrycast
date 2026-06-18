self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", () => self.clients.claim())

// 취소 가능하도록 timeout ID를 키별로 보관
const alarmTimeouts = new Map()

self.addEventListener("message", (e) => {
  if (e.data?.type === "SCHEDULE_ALARM") {
    const { routeLabel, departureTime, offsetMinutes, delayMs } = e.data
    const key = `${departureTime}-${offsetMinutes}`
    const id = setTimeout(() => {
      alarmTimeouts.delete(key)
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
    alarmTimeouts.set(key, id)
  }

  if (e.data?.type === "CANCEL_ALARMS") {
    const { departureTime } = e.data
    for (const [key, id] of alarmTimeouts.entries()) {
      if (!departureTime || key.startsWith(`${departureTime}-`)) {
        clearTimeout(id)
        alarmTimeouts.delete(key)
      }
    }
  }
})
