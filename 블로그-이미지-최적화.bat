@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo    FerryCast 블로그 이미지 최적화
echo ============================================
echo.

REM --- Node.js 설치 확인 ---
where node >nul 2>nul
if errorlevel 1 (
  echo [오류] Node.js가 설치되어 있지 않습니다.
  echo    https://nodejs.org 에서 LTS 버전을 설치한 뒤 다시 실행하세요.
  echo.
  pause
  exit /b 1
)

REM --- 필요한 라이브러리(sharp) 확인, 없으면 자동 설치 ---
if not exist "node_modules\sharp" (
  echo 최초 실행이라 필요한 라이브러리를 설치합니다. 잠시만 기다려주세요...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo [오류] 라이브러리 설치에 실패했습니다. 인터넷 연결을 확인하세요.
    pause
    exit /b 1
  )
)

REM --- 폴더를 이 파일 위로 끌어다 놓으면(드래그 앤 드롭) 그 폴더를 최적화 ---
if not "%~1"=="" (
  if exist "%~1\" (
    echo 입력 폴더 : %~1
    echo 출력 폴더 : %~1-최적화
    echo.
    node scripts\optimize-images.mjs "%~1" "%~1-최적화"
    goto done
  )
)

REM --- 기본 동작: 내 사진 폴더의 photo_in → photo_out (폴더는 스크립트가 알아서 생성) ---
echo 입력 폴더 : %USERPROFILE%\Pictures\블로그\photo_in
echo 출력 폴더 : %USERPROFILE%\Pictures\블로그\photo_out
echo.
echo (사진을 위 photo_in 폴더에 넣거나, 다른 사진 폴더를 이 파일 위로 끌어다 놓으세요.)
echo.
node scripts\optimize-images.mjs

:done
echo.
echo 완료되었습니다. 창을 닫으려면 아무 키나 누르세요.
pause >nul
