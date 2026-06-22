# FerryCast — CLAUDE.md

> 이 파일은 Claude Code가 매 세션마다 읽는 프로젝트 기억 파일입니다.
> 작업 전에 반드시 이 파일을 먼저 읽고 시작하세요.
> **코드 작성 전 반드시 CODING_RULES.md 를 읽고 따를 것.**

---

## 🟢 지금 여기

**M2 진행 중 — 서비스 정식 운영(ferrycast.kr) + 수익화 진행**
최근 완료: 카카오 AdFit 연동, 쿠팡 파트너스 완도 특산물 섹션, 제주 직항/경유 표시,
조석 곡선 그래프, 내일 시간표 바텀시트, 완도군청 제안서 v2(현장 시범 부착 사진 포함).

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
- [x] MTIS 운항 스케줄 API 실시간 연동 완료 (제주·청산도·소안도·보길도 시간표 + 결항 통합, nvg_stts_nm=결항 감지)
- [x] TAGO + KOMSA → MTIS 단일 API 마이그레이션 완료 (청산도 정적 fallback 제거, 6편 실시간 수신)
- [x] KHOA 조석예보 연동 완료 (DT_0027, 만조·간조 시각·높이, 5일 예보)
- [x] RouteDetail 전체화면 상세 페이지 (시간표 과거/현재/미래 구분, 운임 링크, 터미널 지도)
- [x] QR 코드 페이지 (/qr) — 앱 URL 즉시 공유
- [x] 5일 날씨·조석 예보 상세 화면
- [x] 소안도·보길도·노화 경유 노선 통합 (단일 카드로 표시)
- [x] 도착 탭 — 섬 출발 터미널("타는 곳") 표시 및 카카오지도 연결
- [x] 날씨 카드 compact 레이아웃 (한 줄 가로 배치)
- [x] 제주 직항/경유(추자도) 구분 표시 (MTIS nvg_seawy_nm 기반)
- [x] 5일 조석 곡선 그래프 (TideCurve), 내일 시간표 바텀시트
- [x] 카카오 AdFit 광고 연동 (배편 아래, 라벨+옅은 배경)
- [x] 쿠팡 파트너스 완도 특산물 섹션 (배너 3개 자동교체, 카카오 광고 위)
- [x] 완도군청 협력 제안서 v2 (docs/, 현장 시범 부착 사진 포함)

---

## 핵심 원칙 — 코딩 전 반드시 확인

1. **클릭 없이 바로** — 메인화면 진입 즉시 모든 정보가 보여야 한다. 탭·버튼으로 숨기지 않는다.
2. **모바일 우선** — 375px 기준. 스크롤 없이 핵심 정보가 보이도록.
3. **오류 안전망** — API 실패 시 흰 화면 절대 금지. 항상 fallback 메시지 표시.
4. **면책 문구 필수** — 운항 정보 하단에 "실제 운항 여부는 공식 채널에서 최종 확인하세요" + 공식 링크 병기.
5. **정식 운영 중 — 검증 후 반영** — ferrycast.kr는 이미 사용자가 쓰는 서비스다. 수정사항이 생기면 **곧바로 운영 소스에 바로 적용하지 말고**, 먼저 로컬(`npm run dev`)에서 확인하거나 필요하면 별도 테스트 페이지로 동작을 검증한 뒤 메인 소스에 반영한다. 실서비스에 깨진 화면이 노출되지 않도록 한다.

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
| 항로 시간표 + 운항/결항 | 한국해양교통안전공단 MTIS (data.go.kr) | 운항 스케줄 통합 (시간표·결항 단일 API) |
| 날씨           | 기상청 오픈API               | 초단기실황 (5분 캐시)         |
| 5일 예보·파고  | 기상청 단기예보              | getVilageFcst (600초 캐시)    |
| 조석예보       | 국립해양조사원 KHOA          | 만조·간조 시각·높이, 5일 예보 |

### 완도 기준 좌표

- 위도(lat): 34.3114
- 경도(lon): 126.7544
- 기상청 격자: X=57, Y=74

### 주요 항로 (MTIS 실제 데이터 기준)

- 완도 → 제주 (한일골드스텔라·실버클라우드, MTIS 실시간 ✅)
- 완도 → 청산도 (슬로시티청산도호·청산아일랜드호·**퀸청산호**, MTIS 실시간 ✅ — 3척 7편, 5분 이내 중복 출발 자동 병합)
- 완도_화흥포 → **소안도·보길도·노화** (대한호·민국호, 경유 노선 통합 ✅)

### MTIS 운항 스케줄 API 연동 정보 (현행)

- **Base URL**: `https://apis.data.go.kr/B554035/oprt-schd-info-v2/get-oprt-schd-info-v2`
- **사용 키**: `DATAGOKR_API_KEY` (기존 키 그대로, 별도 발급 불필요)
- **파라미터**: `serviceKey`, `pageNo=1`, `numOfRows=2000`, `dataType=JSON`, `rlvtYmd=YYYYMMDD`
  - ⚠️ **numOfRows는 반드시 전국 일일 편수(~700)보다 크게** (전건 단일 페이지 수신). 500 등으로 줄이면 일부 노선의 오후·저녁편이 2페이지로 밀려 **누락됨** (소안 8편 버그 사례). 페이지 분할 금지.
- **성공 코드**: `response.header.resultCode === "200"` (KOMSA 계열 동일, 표준 "00" 아님!)
- **응답 필드** (`response.body.items.item[]`):
  - `sail_tm`: 출항 시각 HHMM (앞자리 0 없음 — `"700"`=07:00, `"1430"`=14:30 → `parseSailTime`로 4자리 패딩 후 콜론 삽입)
  - `oport_nm`: 출발항 이름 (완도/화흥포/청산/소안/제주 …)
  - `dest_nm`: 도착항 이름
  - `psnshp_nm`: 여객선명
  - `nvg_stts_nm`: 운항 상태 — `"결항"` 감지로 결항 배지 표시
- **노선 분류**: `depGroupKey()`/`arrGroupKey()`가 출발·도착항 이름으로 groupKey 매핑
  - 단일 호출로 시간표 + 결항을 동시 수신 (TAGO 2회 + KOMSA N회 → MTIS 1회로 통합)
- **호출 최소화 (쿼터 보호)**: `getMtisDay = cache(...)`로 오늘/내일 데이터를 렌더당 1번만 수신 → 출발·도착이 공유 (4회→2회). 내부 `fetch`는 `revalidate:300` Data Cache로 사용자 수와 무관하게 호출 상한 고정. 페이지네이션은 `allSettled`로 일부 실패해도 받은 페이지 유지. 쿼터 초과 plain-text 응답은 파싱 가드로 빈 배열 처리 → 정적 fallback. **fetchMtisAll 직접 호출 금지, 반드시 getMtisDay 사용할 것**
- _TAGO·KOMSA(ferry-route-info-v4) 연동은 폐기됨 (2026.06 MTIS 전환)_

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
│       ├── ferry.ts             ← MTIS 운항 스케줄 API (시간표·결항 통합)
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
DATAGOKR_API_KEY=발급받은_키   # MTIS 운항스케줄 + KHOA 조석예보 공통 (data.go.kr 동일 키)
KMA_API_KEY=발급받은_키        # 기상청 별도 키
```

> ⚠️ `.env.local`은 반드시 `.gitignore`에 포함되어 있어야 합니다. GitHub에 키가 올라가면 즉시 폐기하고 재발급하세요.

---

## 마일스톤 현황

### M0 — 준비 ✅ 완료

- [x] 프로젝트 생성 + GitHub + Vercel 연동
- [x] DATAGOKR_API_KEY 발급 (MTIS + KHOA 통합)
- [x] KMA_API_KEY 발급 (기상청)
- [x] API 실제 응답 테스트 완료
- [x] Vercel Analytics 설치

### M1 — 핵심 기능 ✅ 완료

- [x] 메인 레이아웃 (모바일 375px, max-w-lg, sticky 헤더)
- [x] WeatherCard — 기상청 초단기실황 연동 (기온·날씨·풍속·습도·파고)
- [x] TidalCard — KHOA 조석예보 연동 (DT_0027, 만조·간조, 5일 예보)
- [x] RouteList + RouteItem — MTIS 실시간 연동, fallback 자동 전환
- [x] 운항/결항 배지 — MTIS 시간표 + 결항(nvg_stts_nm) 단일 API 실시간 연동
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

### (폐기) KOMSA ferry-route-info-v4 API

> ⚠️ 2026.06 MTIS 전환으로 더 이상 사용하지 않음. MTIS `nvg_stts_nm`이 결항을 함께 제공하므로 별도 결항 조회 불필요.
> 과거 참고: `https://apis.data.go.kr/B554035/ferry-route-info-v4/get-ferry-route-info-v4`, `rlvtYmd`, `psnshpNm` 필터, `resultCode: "200"`, `nvg_stts_nm === "결항"`

### KHOA 조석예보 ✅ 완료

- **Base URL**: `https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService`
- **사용 키**: `DATAGOKR_API_KEY` (별도 KHOA 키 불필요!)
- **완도 예보지점 코드**: `DT_0027`
- **파라미터**: `serviceKey`, `type=json`, `obsCode=DT_0027`, `reqDate=YYYYMMDD`
- **응답 형식**: `header.resultCode === "00"`, `body.items.item[]`
  - `predcDt`: "YYYY-MM-DD HH:MM" (예측 시각)
  - `predcTdlvVl`: 조위 높이 (cm)
  - `extrSe`: 홀수(1,3)=고조, 짝수(2,4)=저조

### 청산도 시간표 (MTIS 전환 후)

- **MTIS 실시간 직접 수신** ✅ — 슬로시티청산도호(3편) + 청산아일랜드호(3편) = 6편 모두 MTIS에 등록되어 실시간 조회됨
- TAGO 시절 정적 fallback(`ROUTE_MIN_TRIPS`, 청산농협 미등록 보완)은 **제거됨** — 더 이상 정적 시간표를 데이터 소스로 쓰지 않음
- 단, `CHEONGSANDO_TIMES` 계절별 시간표는 **API 완전 장애 시 최후 안전망(`STATIC_DEP`/`STATIC_ARR`)으로만** 잔존 (CLAUDE.md 원칙 #3: 흰 화면 금지). 정상 시 노출되지 않음
  - 안전망 막배: 겨울 17:00 / 여름 18:00 / 가을 17:30
- 실제 시간표 확인: 청산농협 061-552-9385 또는 cheongsannh.nonghyup.com

### 운임 요금 링크

- **청산도**: https://cheongsannh.nonghyup.com/user/indexSub.do?codyMenuSeq=1048386239&siteId=cheongsannh
- **소안도·보길도·노화**: https://island.theksa.co.kr
- 제주도 운임요금 확인 필요

---

## 참고 링크

- 공공데이터포털 (MTIS·KHOA 키 발급): https://www.data.go.kr
- MTIS 운항 스케줄 정보 (data.go.kr ID 15142302): https://www.data.go.kr/data/15142302/openapi.do
- 기상청 오픈API: https://www.data.go.kr/data/15084084/openapi.do
- KOMSA: https://www.komsa.or.kr
- KHOA 오픈API: https://www.khoa.go.kr/api/oceangrid/intro.do
- 완도 연안여객선 공식: https://www.wando.go.kr
