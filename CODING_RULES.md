# CODING_RULES.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. FerryCast 전용 규칙

### 파일 위치 규칙
- API 호출 코드 → `src/lib/` 폴더에만 작성 (weather.ts, forecast.ts, ferry.ts, tide.ts)
- UI 컴포넌트 → `src/components/` 폴더에만 작성
- 타입 정의 → `src/lib/types.ts` 한 곳에만 작성
- 페이지 → `src/app/page.tsx` 하나만 (MVP는 단일 페이지)

### 환경변수 규칙
- 사용 가능한 키: `DATAGOKR_API_KEY`, `KMA_API_KEY`
- 절대 하드코딩 금지. 반드시 `process.env.변수명` 으로 참조
- 새 환경변수 필요 시 → 먼저 물어볼 것

### API 호출 규칙
- 모든 외부 API 호출은 서버 컴포넌트 또는 `src/lib/` 함수에서만 (키 노출 방지)
- API 응답 실패 시 반드시 fallback 데이터 또는 에러 메시지 반환
- 흰 화면(unhandled error) 절대 금지

### UI 규칙
- 모바일 기준: 375px (iPhone SE)
- 최대 너비: 480px
- 정보는 클릭 없이 메인화면에서 즉시 표시 (탭/아코디언으로 숨기지 말 것)

### 상태 표시 규칙
- 운항 → 🟢 blue 계열
- 결항 → 🔴 rose 계열
- 운항예정(unknown) → slate 계열
- 임의로 상태 추가하거나 변경하지 말 것

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
