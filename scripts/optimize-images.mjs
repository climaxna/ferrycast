#!/usr/bin/env node
// @ts-check
/**
 * 블로그용 이미지 최적화 스크립트 (네이버 블로그 기준 기본값)
 *
 * 사용법:
 *   node scripts/optimize-images.mjs [입력폴더] [출력폴더] [옵션]
 *   npm run optimize                         # 기본 폴더
 *                                            #   내PC\Pictures\블로그\photo_in
 *                                            # → 내PC\Pictures\블로그\photo_out
 *   npm run optimize -- ~/사진 ~/블로그업로드   # 폴더 직접 지정
 *
 * 옵션:
 *   --width <px>      최대 가로 폭 (기본 1000, 네이버 본문 폭에 맞춤)
 *   --quality <1-100> JPEG 품질 (기본 85)
 *   --format <fmt>    출력 포맷 jpeg|webp (기본 jpeg)
 *   --recursive       하위 폴더까지 처리
 *   --overwrite       출력 파일이 이미 있어도 덮어쓰기 (기본은 건너뜀)
 *
 * 동작:
 *   - 입력 폴더의 이미지를 가로 폭 기준으로 축소(원본이 더 작으면 확대 안 함)
 *   - EXIF 회전값을 실제 픽셀에 반영(휴대폰 세로 사진 눕는 문제 해결)
 *   - 메타데이터(위치정보 등) 제거 → 용량↓ + 개인정보 보호
 *   - 결과를 출력 폴더에 저장하고, 절감된 용량을 요약 출력
 */

import { readdir, mkdir, stat } from "node:fs/promises";
import { join, extname, basename, relative, dirname } from "node:path";
import { homedir } from "node:os";

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error(
    "\n❌ sharp 라이브러리가 없습니다. 먼저 설치하세요:\n   npm install\n"
  );
  process.exit(1);
}

const IMAGE_EXTS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".tif",
  ".tiff",
  ".heic",
  ".heif",
  ".gif",
  ".bmp",
]);

// ---- 인자 파싱 -------------------------------------------------------------
const rawArgs = process.argv.slice(2);
const positional = [];
const opts = {
  width: 1000,
  quality: 85,
  format: "jpeg",
  recursive: false,
  overwrite: false,
};

for (let i = 0; i < rawArgs.length; i++) {
  const a = rawArgs[i];
  if (a === "--width") opts.width = Number(rawArgs[++i]);
  else if (a === "--quality") opts.quality = Number(rawArgs[++i]);
  else if (a === "--format") opts.format = String(rawArgs[++i]).toLowerCase();
  else if (a === "--recursive") opts.recursive = true;
  else if (a === "--overwrite") opts.overwrite = true;
  else if (a === "--help" || a === "-h") {
    printHelp();
    process.exit(0);
  } else if (a.startsWith("--")) {
    console.error(`알 수 없는 옵션: ${a}`);
    process.exit(1);
  } else positional.push(a);
}

if (!["jpeg", "jpg", "webp"].includes(opts.format)) {
  console.error(`지원하지 않는 포맷: ${opts.format} (jpeg 또는 webp)`);
  process.exit(1);
}
if (opts.format === "jpg") opts.format = "jpeg";
if (!Number.isFinite(opts.width) || opts.width <= 0) {
  console.error("--width 값이 올바르지 않습니다.");
  process.exit(1);
}
if (!Number.isFinite(opts.quality) || opts.quality < 1 || opts.quality > 100) {
  console.error("--quality 값은 1~100 사이여야 합니다.");
  process.exit(1);
}

// 기본 폴더는 저장소 밖(내 사진 폴더)에 둔다 — 사진을 프로젝트 안에 두지 않아 실수로 커밋될 일이 없고,
// 탐색기에서 바로 열어 쓰기 편하다. 홈 디렉터리 기준이라 Windows에서 C:\Users\<사용자>\Pictures\블로그\... 로 잡힌다
// (사용자명을 코드에 박지 않으므로 다른 PC·계정에서도 그대로 동작).
const BLOG_DIR = join(homedir(), "Pictures", "블로그");
const inputDir = positional[0] || join(BLOG_DIR, "photo_in");
const outputDir = positional[1] || join(BLOG_DIR, "photo_out");

// ---- 파일 수집 -------------------------------------------------------------
/** @returns {Promise<string[]>} 처리할 이미지 파일 경로 목록 */
async function collectImages(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (opts.recursive) files.push(...(await collectImages(full)));
    } else if (IMAGE_EXTS.has(extname(e.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

// ---- 유틸 ------------------------------------------------------------------
function human(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function printHelp() {
  console.log(`
블로그용 이미지 최적화 (네이버 블로그 기준)

  node scripts/optimize-images.mjs [입력폴더] [출력폴더] [옵션]

옵션:
  --width <px>       최대 가로 폭 (기본 ${opts.width})
  --quality <1-100>  품질 (기본 ${opts.quality})
  --format jpeg|webp 출력 포맷 (기본 ${opts.format})
  --recursive        하위 폴더까지 처리
  --overwrite        기존 출력 파일 덮어쓰기
  -h, --help         도움말
`);
}

// ---- 메인 ------------------------------------------------------------------
async function main() {
  console.log(`\n📷 블로그용 이미지 최적화 (네이버 블로그 기준)`);
  console.log(`   입력 : ${inputDir}`);
  console.log(`   출력 : ${outputDir}`);
  console.log(
    `   설정 : 가로 최대 ${opts.width}px · ${opts.format.toUpperCase()} 품질 ${opts.quality}${
      opts.recursive ? " · 하위폴더 포함" : ""
    }\n`
  );

  // 입력 폴더가 없으면 만들어 둔다 — 첫 실행에서 "폴더에 사진을 넣으세요" 안내가 바로 실행 가능해진다
  await mkdir(inputDir, { recursive: true });

  const files = await collectImages(inputDir);
  if (files.length === 0) {
    console.log(
      `⚠️  처리할 이미지가 없습니다.\n   아래 폴더에 사진을 넣고 다시 실행하세요.\n   ${inputDir}\n`
    );
    return;
  }

  await mkdir(outputDir, { recursive: true });

  const ext = opts.format === "webp" ? ".webp" : ".jpg";
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  let totalIn = 0;
  let totalOut = 0;

  for (const file of files) {
    // 출력 경로 (recursive면 폴더 구조 유지)
    const rel = relative(inputDir, file);
    const relDir = dirname(rel);
    const outName = basename(rel, extname(rel)) + ext;
    const outPath = join(outputDir, relDir === "." ? "" : relDir, outName);

    try {
      if (!opts.overwrite) {
        const exists = await stat(outPath).then(
          () => true,
          () => false
        );
        if (exists) {
          skipped++;
          console.log(`⏭️  건너뜀(이미 있음): ${rel}`);
          continue;
        }
      }

      await mkdir(dirname(outPath), { recursive: true });

      const inSize = (await stat(file)).size;

      let pipeline = sharp(file, { failOn: "none" })
        .rotate() // EXIF 방향 반영
        .resize({
          width: opts.width,
          withoutEnlargement: true, // 원본이 작으면 확대 안 함
          fit: "inside",
        });

      pipeline =
        opts.format === "webp"
          ? pipeline.webp({ quality: opts.quality })
          : pipeline.jpeg({
              quality: opts.quality,
              mozjpeg: true, // 더 나은 압축
              chromaSubsampling: "4:2:0",
            });

      const info = await pipeline.toFile(outPath);
      const outSize = (await stat(outPath)).size;

      totalIn += inSize;
      totalOut += outSize;
      ok++;

      const saved = inSize > 0 ? Math.round((1 - outSize / inSize) * 100) : 0;
      console.log(
        `✅ ${rel}  ${human(inSize)} → ${human(outSize)} (${saved >= 0 ? "-" : "+"}${Math.abs(
          saved
        )}%, ${info.width}×${info.height})`
      );
    } catch (err) {
      failed++;
      console.log(`❌ 실패: ${rel} — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log(`\n────────────────────────────────`);
  console.log(`완료: ${ok}개 최적화` + (skipped ? `, ${skipped}개 건너뜀` : "") + (failed ? `, ${failed}개 실패` : ""));
  if (ok > 0) {
    const savedPct =
      totalIn > 0 ? Math.round((1 - totalOut / totalIn) * 100) : 0;
    console.log(
      `용량: ${human(totalIn)} → ${human(totalOut)}  (전체 ${savedPct}% 절감)`
    );
  }
  console.log(`결과 폴더: ${outputDir}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
