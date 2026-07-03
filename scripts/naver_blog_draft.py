#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
네이버 블로그 임시저장 스크립트.

로컬 cookies.json(브라우저 확장 내보내기 형식: [{name, value, domain, path, ...}, ...])에서
네이버 로그인 쿠키를 읽어 requests 세션에 적용하고, 제목/본문을 SE 에디터
documentModel JSON으로 변환해 RabbitTempPostWrite.naver 로 임시저장한다.

사용법:
    python scripts/naver_blog_draft.py "제목" "본문 내용"
    python scripts/naver_blog_draft.py "제목" --body-file 본문.txt
    python scripts/naver_blog_draft.py "제목" "본문" --category 18 --blog-id climaxna

본문에 줄바꿈(\\n)이 있으면 문단(paragraph)이 분리된다.
"""
import argparse
import json
import sys
import uuid
from pathlib import Path

import requests


def se_id() -> str:
    """네이버 SE 컴포넌트용 고유 id (예: SE-a1b2c3d4-...)."""
    return "SE-" + str(uuid.uuid4())

WRITE_URL = "https://blog.naver.com/RabbitTempPostWrite.naver"
DEFAULT_BLOG_ID = "climaxna"
DEFAULT_CATEGORY_ID = 18


def find_cookies_path(explicit: str | None) -> Path:
    """cookies.json 위치를 탐색한다. --cookies 로 명시하면 그대로 사용."""
    if explicit:
        p = Path(explicit).expanduser()
        if not p.is_file():
            sys.exit(f"[오류] 지정한 쿠키 파일이 없습니다: {p}")
        return p
    here = Path(__file__).resolve().parent
    candidates = [
        Path.cwd() / "cookies.json",   # 실행 위치
        here.parent / "cookies.json",  # 프로젝트 루트 (scripts/ 상위)
        here / "cookies.json",         # 스크립트와 같은 폴더
    ]
    for c in candidates:
        if c.is_file():
            return c
    sys.exit(
        "[오류] cookies.json 을 찾을 수 없습니다. 프로젝트 루트에 두거나 "
        "--cookies 경로를 지정하세요.\n  탐색한 위치: "
        + ", ".join(str(c) for c in candidates)
    )


def load_session(cookies_path: Path) -> requests.Session:
    """cookies.json(list/dict 모두 지원)을 requests 세션에 적용."""
    try:
        raw = json.loads(cookies_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.exit(f"[오류] cookies.json 파싱 실패: {e}")

    session = requests.Session()
    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
        ),
        "Referer": "https://blog.naver.com/",
        "Origin": "https://blog.naver.com",
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
    })

    count = 0
    if isinstance(raw, list):
        # 브라우저 확장 내보내기: [{name, value, domain, path, ...}, ...]
        for c in raw:
            name, value = c.get("name"), c.get("value")
            if name is None or value is None:
                continue
            session.cookies.set(
                name, value,
                domain=c.get("domain", ".naver.com").lstrip("."),
                path=c.get("path", "/"),
            )
            count += 1
    elif isinstance(raw, dict):
        # {name: value, ...} 단순 형식
        for name, value in raw.items():
            session.cookies.set(name, str(value), domain="naver.com", path="/")
            count += 1
    else:
        sys.exit("[오류] cookies.json 형식을 인식할 수 없습니다 (list 또는 dict 필요).")

    if count == 0:
        sys.exit("[오류] cookies.json 에서 적용된 쿠키가 없습니다.")
    print(f"[정보] 쿠키 {count}개 적용됨 ({cookies_path})")
    return session


def build_document_model(title: str, body_text: str) -> str:
    """제목/본문을 네이버 SE 에디터 documentModel JSON 문자열로 변환."""
    def paragraph(text: str) -> dict:
        return {
            "@ctype": "paragraph",
            "id": se_id(),
            "nodes": [{"@ctype": "textNode", "id": se_id(), "value": text}],
        }

    # 본문은 줄바꿈 기준으로 문단 분리 (빈 줄 포함 유지)
    body_paragraphs = [paragraph(line) for line in body_text.split("\n")] or [paragraph("")]

    document = {
        "documentId": "",
        "document": {
            "version": "2.10.2",
            "theme": "default",
            "language": "ko-KR",
            "components": [
                {"@ctype": "documentTitle", "id": se_id(), "title": [paragraph(title)]},
                {"@ctype": "text", "id": se_id(), "value": body_paragraphs},
            ],
        },
    }
    return json.dumps(document, ensure_ascii=False, separators=(",", ":"))


def build_population_params(category_id: int) -> str:
    params = {
        "configuration": {"openType": 2, "commentYn": True, "searchYn": True},
        "populationMeta": {"categoryId": category_id, "logNo": None, "tags": None},
    }
    return json.dumps(params, ensure_ascii=False, separators=(",", ":"))


def save_draft(session, blog_id, title, body_text, category_id, debug=False) -> bool:
    data = {
        "blogId": blog_id,
        "documentModel": build_document_model(title, body_text),
        "populationParams": build_population_params(category_id),
        "productName": "blog",
    }
    headers = {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"}
    if debug:
        print("[디버그] 전송 URL:", WRITE_URL)
        print("[디버그] 전송 헤더:", json.dumps({**session.headers, **headers}, ensure_ascii=False))
        for k, v in data.items():
            print(f"[디버그] data[{k}] = {v}")
    try:
        resp = session.post(WRITE_URL, data=data, headers=headers, timeout=30)
    except requests.RequestException as e:
        print(f"[실패] 요청 오류: {e}")
        return False

    text = resp.text.strip()
    print(f"[정보] HTTP {resp.status_code}")

    # 응답이 JSON이면 파싱해 성공 여부 판단
    ok = False
    try:
        j = resp.json()
        # 네이버는 보통 {"isSuccess": true} 또는 {"result": {...}} / logNo 반환
        ok = bool(
            j.get("isSuccess")
            or (isinstance(j.get("result"), dict))
            or j.get("logNo")
            or str(j.get("code", "")).lower() in ("success", "0", "200")
        )
        preview = json.dumps(j, ensure_ascii=False)[:400]
    except ValueError:
        # JSON 아님 — 로그인 페이지(HTML)나 에러일 가능성
        preview = text[:400]
        lowered = text.lower()
        if resp.status_code == 200 and ("login" not in lowered and "로그인" not in text):
            ok = True  # 200 + 로그인 페이지 아님 → 성공 추정

    if resp.status_code == 200 and ok:
        print("[성공] 임시저장 완료 ✅")
    else:
        print("[실패] 임시저장 실패 ❌ (쿠키 만료·카테고리ID·blogId 확인 필요)")
    print(f"[응답 미리보기] {preview}")
    return resp.status_code == 200 and ok


def main():
    ap = argparse.ArgumentParser(description="네이버 블로그 임시저장")
    ap.add_argument("title", help="글 제목")
    ap.add_argument("body", nargs="?", default=None, help="본문 텍스트 (또는 --body-file)")
    ap.add_argument("--body-file", help="본문을 읽어올 텍스트 파일 경로 (UTF-8)")
    ap.add_argument("--blog-id", default=DEFAULT_BLOG_ID, help=f"blogId (기본 {DEFAULT_BLOG_ID})")
    ap.add_argument("--category", type=int, default=DEFAULT_CATEGORY_ID,
                    help=f"categoryId (기본 {DEFAULT_CATEGORY_ID})")
    ap.add_argument("--cookies", help="cookies.json 경로 (기본: 자동 탐색)")
    ap.add_argument("--debug", action="store_true", help="전송 payload/헤더를 출력")
    args = ap.parse_args()

    if args.body_file:
        body_text = Path(args.body_file).read_text(encoding="utf-8")
    elif args.body is not None:
        body_text = args.body
    else:
        ap.error("본문을 body 인자 또는 --body-file 로 제공하세요.")

    session = load_session(find_cookies_path(args.cookies))
    success = save_draft(session, args.blog_id, args.title, body_text, args.category, debug=args.debug)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
