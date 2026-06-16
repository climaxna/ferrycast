# FerryCast — CLAUDE.md

> 이 파일은 Claude Code가 매 세션마다 읽는 프로젝트 기억 파일입니다.
> 작업 전에 반드시 이 파일을 먼저 읽고 시작하세요.

---

## 🟡 지금 여기

**M1 완료 → M2 시작 대기**

> **Claude Code 지시**: 태스크 하나 완료할 때마다 이 섹션을 자동으로 업데이트할 것.
> 완료된 항목은 마일스톤 현황에서 [x] 체크할 것.
> 새 세션 시작 시: "CLAUDE.md 읽고 어디까지 했는지 알려줘. 이어서 진행해줘"

---

## 프로젝트 한 줄 요약

완도에서 배를 타야 하는 주민·여행객이 앱을 열면 **클릭 없이 즉시** 오늘 날씨·파고·항로 시간표·운항/결항 상태를 한 화면에서 확인하는 웹앱.

---

## 기술 스택

| 항목       | 선택                 |
| ---------- | -------------------- |
| 프레임워크 | Next.js (App Router) |
| 스타일     | Tailwind CSS         |
| 배포       | Vercel               |
| 형태       | 반응형 웹 + PWA      |

---

## 현재 상태

- [x] Next.js 프로젝트 생성
- [x] GitHub 연동
- [x] Vercel 배포 연동
- [x] API 키 발급 + 응답 테스트 완료
- [x] Vercel Analytics 설치
- [x] 메인 화면 구현 (M1 완료)
- [x] 기상청 API 연동 (날씨 카드)
- [ ] TAGO API 연동 (서비스 활용신청 승인 대기중 — 현재 정적 시간표 표시중)
- [ ] KOMSA API 연동 (엔드포인트 확인 필요)

---

## 핵심 원칙 — 코딩 전 반드시 확인

1. **클릭 없이 바로** — 메인화면 진입 즉시 모든 정보가 보여야 한다. 탭·버튼으로 숨기지 않는다.
2. **모바일 우선** — 375px 기준. 스크롤 없이 핵심 정보가 보이도록.
3. **오류 안전망** — API 실패 시 흰 화면 절대 금지. 항상 fallback 메시지 표시.
4. **면책 문구 필수** — 운항 정보 하단에 "실제 운항 여부는 공식 채널에서 최종 확인하세요" + 공식 링크 병기.

---

## MVP 화면 구조 (메인 1개)

```
[FerryCast 헤더]

[날씨 카드]
 오늘 완도 날씨 | 기온 | 풍속 | 파고

[항로 목록]
 🟢 완도 → 제주    06:00 / 13:00 / 18:00
 🔴 완도 → 목포    결항
 🟢 완도 → 녹동    08:30 / 15:00
 ...

[면책 문구 + 공식 사이트 링크]

[광고 슬롯 자리 — AdSense 승인 후 활성화]
```

---

## 데이터 소스 (API)

| 데이터         | API                          | 비고                |
| -------------- | ---------------------------- | ------------------- |
| 항로 시간표    | 국토교통부 TAGO (data.go.kr) | 국내선박운항정보    |
| 운항/결항 상태 | 한국해양교통안전공단 KOMSA   | 실시간 운항현황     |
| 운항 정보 보완 | 한국해운조합                 | KOMSA 보완용        |
| 날씨·파고      | 기상청 오픈API               | 단기예보 + 해양예보 |

### 완도 기준 좌표

- 위도(lat): 34.3114
- 경도(lon): 126.7544
- 기상청 격자: X=57, Y=74

### 주요 항로 (MVP 범위)

- 완도 ↔ 제주
- 완도 ↔ 목포
- 완도 ↔ 녹동
- 완도 ↔ 여수
- _(섬↔섬 내부 항로는 MVP 제외)_

---

## 폴더 구조 (권장)

```
ferrycast/
├── app/
│   ├── page.tsx          ← 메인화면 (MVP 전부 여기)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── WeatherCard.tsx   ← 날씨·파고 카드
│   ├── RouteList.tsx     ← 항로 목록
│   └── RouteItem.tsx     ← 항로 1개 행 (🟢/🔴 + 시간표)
├── lib/
│   ├── weather.ts        ← 기상청 API 호출
│   ├── ferry.ts          ← TAGO/KOMSA API 호출
│   └── types.ts          ← 공통 타입 정의
├── public/
│   └── manifest.json     ← PWA 설정
├── .env.local            ← API 키 (Git에 올리지 말 것!)
└── CLAUDE.md             ← 이 파일
```

---

## 환경변수 (.env.local)

```
DATAGOKR_API_KEY=발급받은_키   # TAGO + KOMSA 공통 (data.go.kr 동일 키)
KMA_API_KEY=발급받은_키        # 기상청 별도 키
```

> ⚠️ `.env.local`은 반드시 `.gitignore`에 포함되어 있어야 합니다. GitHub에 키가 올라가면 즉시 폐기하고 재발급하세요.

---

## 마일스톤 현황

### M0 — 준비 ✅ 완료

- [x] 프로젝트 생성 + GitHub + Vercel 연동
- [x] DATAGOKR_API_KEY 발급 (TAGO + KOMSA 통합)
- [x] KMA_API_KEY 발급 (기상청)
- [x] API 실제 응답 테스트 완료
- [x] Vercel Analytics 설치

### M1 — 핵심 기능 ✅ 완료

- [x] 메인 레이아웃 (모바일 375px, max-w-lg, sticky 헤더)
- [x] WeatherCard — 기상청 apihub 초단기실황 연동 (기온·날씨·풍속·습도, 5분 캐시)
- [x] RouteList + RouteItem — TAGO 시도 후 정적 fallback 자동 전환
- [x] 운항/결항 배지 🟢🔴 — UI 완성, KOMSA 엔드포인트 확인 후 실시간 연동 예정
- [x] API 오류 fallback — 날씨·항로 각각 노란 안내 박스
- [x] 면책 문구 + 공식 링크 (완도군청, 해운조합)
- [x] 광고 슬롯 placeholder (AdSense 승인 후 활성화)

### M2 — 출발

- [ ] 커스텀 도메인 연결
- [ ] PWA manifest 설정
- [ ] 구글 애드센스 신청
- [ ] 광고 슬롯 레이아웃 준비
- [ ] 3종 환경 테스트 (iOS / Android / PC)
- [ ] 지인 5명 공유 + 피드백 수집

---

## 지금 당장 다음 할 일 (M2 진행 전)

1. **Vercel 환경변수 확인** — `DATAGOKR_API_KEY`, `KMA_API_KEY` 설정 여부 → 날씨 카드 실제 동작 확인
2. **data.go.kr TAGO 서비스 활용신청 상태 확인** — 승인되면 실시간 시간표 자동 전환
3. **KOMSA API 엔드포인트 확인** — data.go.kr에서 연안여객선 운항현황 서비스 찾기
4. **M2 시작**: 커스텀 도메인 → PWA → 애드센스 신청

---

## 참고 링크

- 공공데이터포털 (TAGO 키 발급): https://www.data.go.kr
- 기상청 오픈API: https://www.data.go.kr/data/15084084/openapi.do
- KOMSA: https://www.komsa.or.kr
- 완도 연안여객선 공식: https://www.wando.go.kr
- 가우도 터미널 공식: (확인 후 추가)
