# FerryCast — CLAUDE.md

> 이 파일은 Claude Code가 매 세션마다 읽는 프로젝트 기억 파일입니다.
> 작업 전에 반드시 이 파일을 먼저 읽고 시작하세요.
> **코드 작성 전 반드시 CODING_RULES.md 를 읽고 따를 것.**

---

## 🟢 지금 여기

**UI 개선 및 노선 정보 고도화 완료 → M2 진행 중**

> **Claude Code 지시**:
> - 태스크 하나 완료할 때마다 이 섹션을 자동으로 업데이트할 것.
> - 완료된 항목은 마일스톤 현황에서 [x] 체크할 것.
> - 태스크 완료 후 `git commit -m "M번호-번호: 태스크명 완료"` 형식으로 자동 커밋할 것.
> - 새 세션 시작 시: "CLAUDE.md 읽고 어디까지 했는지 알려줘. 이어서 진행해줘"

---

## 프로젝트 한 줄 요약

완도에서 배를 타야 하는 주민·여행객이 앱을 열면 **클릭 없이 즉시** 오늘 날씨·조석예보·항로 시간표·운항/결항 상태를 한 화면에서 확인하는 웹앱.

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
- [x] 기상청 API 연동 (날씨 카드 — 초단기실황 + 5일 단기예보)
- [x] TAGO API 실시간 연동 완료 (제주·청산도·소안도·보길도 실시간 시간표)
- [x] KOMSA API 연동 완료 (결항 정보 실시간 연동 — nvg_stts_nm=결항 감지)
- [x] KHOA 조석예보 연동 완료 (DT_0027, 만조·간조 시각·높이, 5일 예보)
- [x] RouteDetail 전체화면 상세 페이지 (시간표 과거/현재/미래 구분, 운임 링크, 터미널 지도)
- [x] QR 코드 페이지 (/qr) — 앱 URL 즉시 공유
- [x] 5일 날씨·조석 예보 상세 화면
- [x] 소안도·보길도·노화 경유 노선 통합 (단일 카드로 표시)
- [x] 도착 탭 — 섬 출발 터미널("타는 곳") 표시 및 카카오지도 연결
- [x] 날씨 카드 compact 레이아웃 (한 줄 가로 배치)

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
 기온 | 날씨 | 풍속 | 습도 | 파고  (한 줄 compact)
 조석 — 다음 만조/간조 시각

[항로 목록]
 🟢 완도 → 제주              06:00 / 13:00 / 18:00
 🔴 완도 → 청산도            결항
 🟢 완도 → 소안도·보길도·노화  08:30 / 15:00
 ...

[면책 문구 + 공식 사이트 링크]

[광고 슬롯 자리 — AdSense 승인 후 활성화]
```

---

## 데이터 소스 (API)

| 데이터         | API                          | 비고                          |
| -------------- | ---------------------------- | ----------------------------- |
| 항로 시간표    | 국토교통부 TAGO (data.go.kr) | 국내선박운항정보              |
| 운항/결항 상태 | 한국해양교통안전공단 KOMSA   | 실시간 운항현황               |
| 운항 정보 보완 | 한국해운조합                 | KOMSA 보완용                  |
| 날씨           | 기상청 오픈API               | 초단기실황 (5분 캐시)         |
| 5일 예보·파고  | 기상청 단기예보              | getVilageFcst (600초 캐시)    |
| 조석예보       | 국립해양조사원 KHOA          | 만조·간조 시각·높이, 5일 예보 |

### 완도 기준 좌표

- 위도(lat): 34.3114
- 경도(lon): 126.7544
- 기상청 격자: X=57, Y=74

### 주요 항로 (TAGO 실제 데이터 기준)

- 완도 → 제주 (SEA31020, TAGO 실시간 ✅)
- 완도 → 청산도 (SEA31020, TAGO 실시간 ✅)
- 완도_화흥포 → **소안도·보길도·노화** (SEA31022, 경유 노선 통합 ✅)
- _(목포·녹동·여수는 TAGO 데이터 없음 — 별도 확인 필요)_

### TAGO API 연동 정보

- **Base URL**: `https://apis.data.go.kr/1613000/DmstcShipNvgInfo`
- **Operations**: PascalCase (`GetShipOpratInfoList`, `GetPortList`, `GetPsnshipTrminlList`)
- **완도항 nodeId**: `SEA31020` / **화흥포 nodeId**: `SEA31022`
- **날짜 파라미터**: `depPlandTime=YYYYMMDD`

---

## 폴더 구조

```
ferrycast/
├── src/
│   ├── app/
│   │   ├── page.tsx             ← 메인화면
│   │   ├── layout.tsx
│   │   ├── qr/                  ← QR 코드 페이지
│   │   └── globals.css
│   ├── components/
│   │   ├── WeatherCard.tsx      ← 날씨 카드 (서버)
│   │   ├── WeatherCardClient.tsx← 날씨 카드 (클라이언트)
│   │   ├── WeatherDetail.tsx    ← 날씨/조석 상세 모달
│   │   ├── ForecastDetail.tsx   ← 5일 날씨 예보
│   │   ├── TidalForecastDetail.tsx ← 5일 조석 예보
│   │   ├── RouteList.tsx        ← 항로 목록
│   │   ├── RouteItem.tsx        ← 항로 카드
│   │   └── RouteDetail.tsx      ← 항로 상세 전체화면
│   └── lib/
│       ├── weather.ts           ← 기상청 초단기실황 API
│       ├── forecast.ts          ← 기상청 단기예보 (5일)
│       ├── ferry.ts             ← TAGO/KOMSA API
│       ├── tide.ts              ← KHOA 조석예보 API
│       └── types.ts             ← 공통 타입 정의
├── public/
│   └── manifest.json            ← PWA 설정
├── .env.local                   ← API 키 (Git에 올리지 말 것!)
├── CLAUDE.md                    ← 이 파일
└── CODING_RULES.md              ← 코드 작성 규칙 (코딩 전 반드시 읽을 것)
```

---

## 환경변수 (.env.local)

```
DATAGOKR_API_KEY=발급받은_키   # TAGO + KOMSA + KHOA 조석예보 공통 (data.go.kr 동일 키)
KMA_API_KEY=발급받은_키        # 기상청 별도 키
```

> ⚠️ `.env.local`은 반드시 `.gitignore`에 포함되어 있어야 합니다. GitHub에 키가 올라가면 즉시 폐기하고 재발급하세요.

---

## 마일스톤 현황

### M0 — 준비 ✅ 완료

- [x] 프로젝트 생성 + GitHub + Vercel 연동
- [x] DATAGOKR_API_KEY 발급 (TAGO + KOMSA + KHOA 통합)
- [x] KMA_API_KEY 발급 (기상청)
- [x] API 실제 응답 테스트 완료
- [x] Vercel Analytics 설치

### M1 — 핵심 기능 ✅ 완료

- [x] 메인 레이아웃 (모바일 375px, max-w-lg, sticky 헤더)
- [x] WeatherCard — 기상청 초단기실황 연동 (기온·날씨·풍속·습도·파고)
- [x] TidalCard — KHOA 조석예보 연동 (DT_0027, 만조·간조, 5일 예보)
- [x] RouteList + RouteItem — TAGO 실시간 연동, fallback 자동 전환
- [x] 운항/결항 배지 — TAGO 시간표 + KOMSA 결항 감지 실시간 연동
- [x] API 오류 fallback — 날씨·항로 각각 안내 박스
- [x] 면책 문구 + 공식 링크 (완도군청, 해운조합)
- [x] 광고 슬롯 placeholder

### M1.5 — UI 고도화 ✅ 완료

- [x] RouteDetail 전체화면 상세 (시간표 과거/현재/미래 색상 구분, 상대시간 표시)
- [x] 운임 요금 — 공식 사이트 링크 연결 (청산도: 청산도농협, 기타: 해운조합)
- [x] 터미널 카카오지도 연결 (출발: 완도터미널, 도착: 섬 출발 터미널)
- [x] 소안도·보길도·노화 경유 노선 통합 (groupKey 기반)
- [x] QR 코드 페이지 (/qr) — 앱 URL 공유
- [x] 5일 날씨 / 5일 조석 상세 전체화면
- [x] 날씨 카드 compact 한 줄 레이아웃 (파고 포함)
- [x] 시간표 4열 그리드 레이아웃

### M2 — 배포·확산

- [x] 커스텀 도메인 연결 (ferrycast.kr — 가비아 구매, Vercel A레코드 216.198.79.1, metadataBase·OG·canonical 적용, QR 정식 도메인 고정)
- [x] PWA manifest 설정 (manifest.json, 아이콘 192/512px, theme-color, apple-touch-icon)
- [ ] 구글 애드센스 신청
- [ ] 광고 슬롯 레이아웃 준비
- [ ] 3종 환경 테스트 (iOS / Android / PC)
- [ ] 지인 5명 공유 + 피드백 수집

---

## 지금 당장 다음 할 일 (M2 진행 중)

1. **M2 시작**: 커스텀 도메인 → PWA manifest → 애드센스 신청
2. **3종 환경 테스트**: iOS Safari / Android Chrome / PC — 레이아웃 이상 없는지 확인

---

## API 연동 메모

### KOMSA API

- **Endpoint**: `https://apis.data.go.kr/B554035/ferry-route-info-v4/get-ferry-route-info-v4`
- **필수 파라미터**: `rlvtYmd=YYYYMMDD` (출항일자), `dataType=JSON`
- **선택 파라미터**: `psnshpNm` (여객선명 필터), `numOfRows`, `pageNo`
- **성공 코드**: `resultCode: "200"` (표준 "00" 아님!)
- **결항 감지**: `nvg_stts_nm === "결항"`

### KHOA 조석예보 ✅ 완료

- **Base URL**: `https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService`
- **사용 키**: `DATAGOKR_API_KEY` (별도 KHOA 키 불필요!)
- **완도 예보지점 코드**: `DT_0027`
- **파라미터**: `serviceKey`, `type=json`, `obsCode=DT_0027`, `reqDate=YYYYMMDD`
- **응답 형식**: `header.resultCode === "00"`, `body.items.item[]`
  - `predcDt`: "YYYY-MM-DD HH:MM" (예측 시각)
  - `predcTdlvVl`: 조위 높이 (cm)
  - `extrSe`: 홀수(1,3)=고조, 짝수(2,4)=저조

### 청산도 시간표 주의사항

- **청산농협**(슬로시티청산도호, 청산아일랜드호)은 TAGO API 미등록 → 정적 시간표 사용
- TAGO에는 **섬사랑7호**(다도해 행정선, 완도발 15:00 / 청산발 11:00)만 등록되어 있음 → 정적 시간표에 병합
- **계절별 시간표 적용 완료** (`CHEONGSANDO_TIMES` in ferry.ts): 막배 시각만 기간별 변동
  - 겨울(10.16~3.16): 막배 17:00
  - 여름(3.17~9.15): 막배 18:00
  - 가을(9.16~10.15): 막배 17:30
- 운항/결항은 KOMSA 실시간 유지, 시간표는 `cheongsandoSeason()`이 오늘 날짜로 자동 선택
- 실제 시간표 확인: 청산농협 061-552-9385 또는 cheongsannh.nonghyup.com

### 운임 요금 링크

- **청산도**: https://cheongsannh.nonghyup.com/user/indexSub.do?codyMenuSeq=1048386239&siteId=cheongsannh
- **소안도·보길도·노화**: https://island.theksa.co.kr
- 제주도 운임요금 확인 필요

---

## 참고 링크

- 공공데이터포털 (TAGO 키 발급): https://www.data.go.kr
- 기상청 오픈API: https://www.data.go.kr/data/15084084/openapi.do
- KOMSA: https://www.komsa.or.kr
- KHOA 오픈API: https://www.khoa.go.kr/api/oceangrid/intro.do
- 완도 연안여객선 공식: https://www.wando.go.kr
