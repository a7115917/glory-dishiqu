@echo off
chcp 65001 >nul
cd /d "%~dp0"
title 荣耀 · 第十区

set "NODE="
where node >nul 2>nul && set "NODE=node"

if not defined NODE (
  if exist "%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe" (
    set "NODE=%USERPROFILE%\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
  )
)
if not defined NODE (
  if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE=%LOCALAPPDATA%\Programs\nodejs\node.exe"
  )
)
if not defined NODE (
  if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE=%ProgramFiles%\nodejs\node.exe"
  )
)

if not defined NODE (
  echo.
  echo   没有找到 Node.js，局域网模式用不了。
  echo.
  echo   两种替代方案：
  echo     1. 电脑：直接双击  index.html
  echo     2. 手机：把  dist\荣耀·第十区.html  发到手机上，用浏览器打开
  echo.
  pause
  exit /b 1
)

"%NODE%" server.js
echo.
echo   服务已停止。
pause
