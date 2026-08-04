# 블로그용 이미지 최적화 (`optimize-images.mjs`)

로컬 폴더의 사진을 **블로그 업로드용으로 최적화**해서 다른 폴더에 저장하는 스크립트입니다.
기본값은 **네이버 블로그** 기준(가로 폭 축소 + JPEG 고압축)으로 맞춰져 있습니다.

## 준비 (최초 1회)

```bash
npm install        # sharp 라이브러리 설치
```

## 사용법

가장 간단하게 — 기본 폴더 사용:

```bash
# 1) 프로젝트 안에 photos-in 폴더를 만들고 사진을 넣습니다
# 2) 실행하면 photos-out 폴더에 최적화된 이미지가 생깁니다
npm run optimize
```

폴더를 직접 지정하려면:

```bash
npm run optimize -- "/Users/내이름/Desktop/원본사진" "/Users/내이름/Desktop/블로그업로드"
```

> `npm run optimize` 뒤에 인자를 넘길 때는 `--` 를 먼저 붙여야 합니다.

## 옵션

| 옵션 | 설명 | 기본값 |
| --- | --- | --- |
| `--width <px>` | 최대 가로 폭(px). 원본이 더 작으면 확대하지 않음 | `1000` |
| `--quality <1-100>` | 압축 품질 | `85` |
| `--format jpeg\|webp` | 출력 포맷 | `jpeg` |
| `--recursive` | 하위 폴더까지 처리(폴더 구조 유지) | 꺼짐 |
| `--overwrite` | 출력 파일이 이미 있어도 덮어쓰기 | 꺼짐(건너뜀) |
| `-h`, `--help` | 도움말 | |

예시:

```bash
# 가로 1200px, 품질 90으로
npm run optimize -- --width 1200 --quality 90

# WebP로 뽑기(티스토리/워드프레스 등)
npm run optimize -- --format webp
```

## 하는 일

- 가로 폭을 기준으로 이미지 **축소** (원본이 작으면 그대로 둠)
- 휴대폰 사진의 **EXIF 회전값을 실제 픽셀에 반영** → 세로 사진 눕는 문제 해결
- **메타데이터(GPS 위치정보 등) 제거** → 용량↓ + 개인정보 보호
- JPEG는 mozjpeg로 더 작게 압축
- PNG·HEIC 등도 지정 포맷으로 변환
- 결과 폴더에 저장하고, **절감된 용량을 요약 출력**
- 같은 이름의 출력 파일이 이미 있으면 기본적으로 **건너뜀**(`--overwrite`로 강제 가능)

지원 입력 포맷: JPG, PNG, WebP, TIFF, HEIC/HEIF, GIF, BMP

> 참고: `photos-in/`, `photos-out/` 폴더는 `.gitignore`에 등록되어 있어 사진이 저장소에 올라가지 않습니다.
