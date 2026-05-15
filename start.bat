@echo off
cd /d "%~dp0"
echo Starting dev server at http://127.0.0.1:5173/
echo Keep this window open while using the site. Press Ctrl+C to stop.
echo.
npm.cmd run dev
pause
