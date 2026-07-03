---
target: src/app/page.tsx (메인 화면)
total_score: 34
p0_count: 0
p1_count: 2
timestamp: 2026-07-03T06-40-22Z
slug: src-app-page-tsx
---
# Critique — src/app/page.tsx (메인 화면)
DEGRADED: single-context. Detector ran.
Design Health: 34/40 (Good).
Anti-patterns: PASS. detect.mjs 1건(RegionNav gray-on-color) = false positive(rest text vs hover bg 오검출).
Priority Issues:
- [P1] 날씨카드 소형 텍스트(10~11px) + white/70~75 대비 미달 — 야외·고령 우선순위와 충돌.
- [P1] 중첩 <button>: 날씨존 button 안 RefreshButton(button) invalid HTML. WCAG 4.1.2.
- [P2] 날씨카드 375px 한 줄 밀집(전부 shrink-0) 가로 넘침 위험.
- [P2] 터치 타깃 <44px: RegionNav 링크, 공식링크.
- [P2] focus-visible 링 부재(카드/존 버튼).
Persona: Sam(중첩버튼·포커스링·대비), 완도 고령주민(소형 회백 글자 햇빛 가독성), Casey(새로고침 썸존 밖).
