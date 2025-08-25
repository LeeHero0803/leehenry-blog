@echo off
setlocal EnableExtensions
chcp 65001 >nul

REM =========================
REM ======= CONFIG ==========
REM =========================

REM ---- Behavior ----
set "PAUSE_AT_END=1"      REM 1=pause on exit; 0=auto-close

REM ---- Paths & Layout (script sibling to 'leehenry-blog') ----
set "SCRIPT_DIR=%~dp0"
for %%I in ("%SCRIPT_DIR%") do set "ROOT=%%~fI"
set "BLOG_DIR=%ROOT%\leehenry-blog"
set "OUTPUT_DIR=dist"
set "PKG_TGZ=%SCRIPT_DIR%dist.tar.gz"

REM ---- Remote Deploy ----
set "HOST=39.104.64.173"
set "PORT=22"
set "USER=root"
set "REMOTE_DIR=/www/wwwroot/39.104.64.173"
set "WWW_USER=www"
set "WWW_GROUP=www"
set "BACKUP=1"
set "NO_STRICT=1"
set "KEY=%USERPROFILE%\.ssh\id_ed25519"

REM ---- Tooling ----
set "GIT_TAR=%ProgramFiles%\Git\usr\bin\tar.exe"

REM =========================
REM ======= RUNTIME =========
REM =========================

:main_restart
REM ---- Global timer start ----
for /f %%i in ('powershell -NoProfile -Command "[Console]::Write((Get-Date).Ticks)"') do set "RUN_T0_TICKS=%%i"
for /f %%i in ('powershell -NoProfile -Command "[Console]::Write((Get-Date).ToString(\"HH:mm:ss\"))"') do set "RUN_T0_HMS=%%i"

powershell -Command "Write-Host '[INFO] SCRIPT_DIR=%SCRIPT_DIR%' -ForegroundColor Green"
powershell -Command "Write-Host '[INFO] ROOT=%ROOT%' -ForegroundColor Green"
powershell -Command "Write-Host '[INFO] BLOG_DIR=%BLOG_DIR%' -ForegroundColor Green"
powershell -Command "Write-Host '[INFO] OUTPUT_DIR=%OUTPUT_DIR%' -ForegroundColor Green"
powershell -Command "Write-Host ('[INFO] RUN START AT %RUN_T0_HMS%') -ForegroundColor Green"
powershell -Command "Write-Host ''"

if not exist "%BLOG_DIR%" (
  powershell -Command "Write-Host '[ERR] Blog source directory not found:' -ForegroundColor Red"
  powershell -Command "Write-Host '      %BLOG_DIR%' -ForegroundColor Red"
  goto :end_fail
)

REM ---- SSH / SCP commands ----
if "%NO_STRICT%"=="1" (
  set "SSH=ssh -i ""%KEY%"" -o StrictHostKeyChecking=no -p %PORT% %USER%@%HOST%"
  set "SCP=scp -i ""%KEY%"" -o StrictHostKeyChecking=no -P %PORT%"
) else (
  set "SSH=ssh -i ""%KEY%"" -p %PORT% %USER%@%HOST%"
  set "SCP=scp -i ""%KEY%"" -P %PORT%"
)

if not exist "%KEY%" (
  powershell -Command "Write-Host '[ERR] SSH private key not found:' -ForegroundColor Red"
  powershell -Command "Write-Host '      %KEY%' -ForegroundColor Red"
  goto :end_fail
)

REM ---- tar availability (prefer Git tar) ----
set "TAR_CMD="
if exist "%GIT_TAR%" (
  set "TAR_CMD=%GIT_TAR%"
) else (
  where tar >nul 2>&1 && set "TAR_CMD=tar"
)
if "%TAR_CMD%"=="" (
  powershell -Command "Write-Host '[ERR] tar not found. Install Git for Windows (usr\bin\tar.exe) or add tar to PATH.' -ForegroundColor Red"
  goto :end_fail
)

REM =========================
REM ======= STEPS ===========
REM =========================

REM 1) Local build
call :step_begin 1 "Local build · 本地构建"
pushd "%BLOG_DIR%" || (powershell -Command "Write-Host '[ERR] Failed to enter blog directory.' -ForegroundColor Red" & goto :end_fail)

where pnpm >nul 2>&1
if %errorlevel%==0 (
  powershell -Command "Write-Host '[INFO] Running: pnpm build' -ForegroundColor Green"
  call pnpm build || (popd & powershell -Command "Write-Host '[ERR] Build failed.' -ForegroundColor Red" & goto :end_fail)
) else (
  powershell -Command "Write-Host '[WARN] pnpm not found, fallback to: npm run build' -ForegroundColor Yellow"
  call npm run build || (popd & powershell -Command "Write-Host '[ERR] Build failed.' -ForegroundColor Red" & goto :end_fail)
)

if not exist "%BLOG_DIR%\%OUTPUT_DIR%" (
  popd
  powershell -Command "Write-Host '[ERR] Build output not found:' -ForegroundColor Red"
  powershell -Command "Write-Host '      %BLOG_DIR%\%OUTPUT_DIR%' -ForegroundColor Red"
  goto :end_fail
)
popd
call :step_end 1

REM 2) Ensure remote dir
call :step_begin 2 "Ensure remote dir · 确保远端目录存在"
powershell -Command "Write-Host '[INFO] Ensuring remote directory...' -ForegroundColor Green"
%SSH% "mkdir -p %REMOTE_DIR%" || (powershell -Command "Write-Host '[ERR] Remote mkdir failed.' -ForegroundColor Red" & goto :end_fail)
call :step_end 2

REM 3) Remote backup & clean (keep .well-known / .user.ini)
call :step_begin 3 "Remote backup & clean · 远端备份并清理"
if "%BACKUP%"=="1" (
  powershell -Command "Write-Host '[INFO] Creating remote backup...' -ForegroundColor Green"
  %SSH% "set -e; SITE='%REMOTE_DIR%'; BK=/www/backup/$(date +%%F_%%H%%M%%S).tar.gz; mkdir -p /www/backup; tar -czf ""$BK"" -C ""$SITE"" .; echo Backup to $BK done." || (powershell -Command "Write-Host '[ERR] Remote backup failed.' -ForegroundColor Red" & goto :end_fail)
)
powershell -Command "Write-Host '[INFO] Cleaning remote directory...' -ForegroundColor Green"
%SSH% "set -e; SITE='%REMOTE_DIR%'; cd ""$SITE""; find . -mindepth 1 -maxdepth 1 -not -name '.well-known' -not -name '.user.ini' -exec rm -rf {} +;" || (powershell -Command "Write-Host '[ERR] Remote clean failed.' -ForegroundColor Red" & goto :end_fail)
call :step_end 3

REM 4) Pack dist -> tar.gz
call :step_begin 4 "Pack dist -> tar.gz · 打包 dist"
if exist "%PKG_TGZ%" del /f /q "%PKG_TGZ%" >nul 2>&1
powershell -Command "Write-Host '[INFO] Packing dist into tar.gz...' -ForegroundColor Green"
"%TAR_CMD%" -czf "%PKG_TGZ%" -C "%BLOG_DIR%\%OUTPUT_DIR%" .
if errorlevel 1 (powershell -Command "Write-Host '[ERR] Local packing failed.' -ForegroundColor Red" & goto :end_fail)
call :step_end 4

REM 5) Upload package
call :step_begin 5 "Upload package · 上传压缩包到远端"
powershell -Command "Write-Host '[INFO] Uploading package to server...' -ForegroundColor Green"
%SSH% "mkdir -p %REMOTE_DIR%/.upload" || (powershell -Command "Write-Host '[ERR] Remote temp mkdir failed.' -ForegroundColor Red" & goto :end_fail)
%SCP% "%PKG_TGZ%" %USER%@%HOST%:%REMOTE_DIR%/.upload/dist.tar.gz || (powershell -Command "Write-Host '[ERR] Upload failed.' -ForegroundColor Red" & goto :end_fail)
if exist "%PKG_TGZ%" (
  del /f /q "%PKG_TGZ%" >nul 2>&1
  powershell -Command "Write-Host '[INFO] Local package removed.' -ForegroundColor Green"
)
call :step_end 5

REM 6) Remote unpack & cleanup
call :step_begin 6 "Remote unpack & cleanup · 远端解压并清理"
powershell -Command "Write-Host '[INFO] Extracting package on remote...' -ForegroundColor Green"
%SSH% "set -e; SITE='%REMOTE_DIR%'; PKG=""$SITE/.upload/dist.tar.gz""; mkdir -p ""$SITE""; tar -xzf ""$PKG"" -C ""$SITE""; rm -f ""$PKG""; echo Unpacked dist.tar.gz." || (powershell -Command "Write-Host '[ERR] Remote unpack failed.' -ForegroundColor Red" & goto :end_fail)
call :step_end 6

REM 7) Fix ownership & perms
call :step_begin 7 "Fix ownership & perms · 修正属主与权限"
powershell -Command "Write-Host '[INFO] Fixing file ownership and permissions...' -ForegroundColor Green"
%SSH% "set -e; SITE='%REMOTE_DIR%'; find ""$SITE"" -not -name '.user.ini' -exec chown %WWW_USER%:%WWW_GROUP% {} +; find ""$SITE"" -type d -not -name '.user.ini' -exec chmod 755 {} \; ; find ""$SITE"" -type f -not -name '.user.ini' -exec chmod 644 {} \; ; echo Permission fixed." || (powershell -Command "Write-Host '[ERR] Ownership/permission fix failed.' -ForegroundColor Red" & goto :end_fail)
call :step_end 7

REM 8) Done
call :step_begin 8 "Done · 部署完成"
powershell -Command "Write-Host ('Your site is now live at: http://%HOST%/ & https://leehenry.top/') -ForegroundColor Cyan"
call :step_end 8

goto :end_ok


:step_begin
set "STEP_NUM=%~1"
set "STEP_TITLE=%~2"
for /f %%i in ('powershell -NoProfile -Command "[Console]::Write((Get-Date).Ticks)"') do set "STEP_T0_TICKS=%%i"
for /f %%i in ('powershell -NoProfile -Command "[Console]::Write((Get-Date).ToString(\"HH:mm:ss\"))"') do set "STEP_T0_HMS=%%i"

powershell -NoProfile -Command ^
  "Write-Host '';" ^
  "Write-Host '╔══════════════════════════════════════════════════════╗' -ForegroundColor DarkGray;" ^
  "Write-Host ('║ STEP {0}/8 | {1}' -f $env:STEP_NUM, $env:STEP_TITLE) -ForegroundColor White;" ^
  "Write-Host '╚══════════════════════════════════════════════════════╝' -ForegroundColor DarkGray;" ^
  "Write-Host ''"
goto :eof


:step_end
powershell -NoProfile -Command ^
  "$t0 = [int64]$env:STEP_T0_TICKS;" ^
  "$t1 = (Get-Date).Ticks;" ^
  "$ts = [TimeSpan]::FromTicks($t1 - $t0);" ^
  "$end = (Get-Date).ToString('HH:mm:ss');" ^
  "$secs = [Math]::Round($ts.TotalSeconds, 3);" ^
  "Write-Host ('[DONE] STEP {0} finished at {1}, duration {2}s' -f $env:STEP_NUM, $end, $secs) -ForegroundColor DarkGreen"
goto :eof


:end_ok
powershell -NoProfile -Command ^
  "$t0 = [int64]$env:RUN_T0_TICKS;" ^
  "$t1 = (Get-Date).Ticks;" ^
  "$ts = [TimeSpan]::FromTicks($t1 - $t0);" ^
  "$secs = [Math]::Round($ts.TotalSeconds, 3);" ^
  "$start = $env:RUN_T0_HMS;" ^
  "$end = (Get-Date).ToString('HH:mm:ss');" ^
  "Write-Host '';" ^
  "Write-Host '════════════════════════════════════════════════════════' -ForegroundColor DarkGray;" ^
  "Write-Host ('All done — finished in {0}s' -f $secs) -ForegroundColor White;" ^
  "Write-Host '════════════════════════════════════════════════════════' -ForegroundColor DarkGray;" ^
  "Write-Host '';" ^
  "Write-Host ''"
if "%PAUSE_AT_END%"=="1" pause
exit /b 0


:end_fail
powershell -NoProfile -Command ^
  "$t0 = [int64]$env:RUN_T0_TICKS;" ^
  "$t1 = (Get-Date).Ticks;" ^
  "$ts = [TimeSpan]::FromTicks($t1 - $t0);" ^
  "$secs = [Math]::Round($ts.TotalSeconds, 3);" ^
  "$start = $env:RUN_T0_HMS;" ^
  "$end = (Get-Date).ToString('HH:mm:ss');" ^
  "Write-Host '';" ^
  "Write-Host '════════════════════════════════════════════════════════' -ForegroundColor DarkGray;" ^
  "Write-Host ('FAILED — finished in {0} seconds' -f $secs) -ForegroundColor Red;" ^
  "Write-Host '════════════════════════════════════════════════════════' -ForegroundColor DarkGray;" ^
  "Write-Host '';" ^
  "Write-Host ''"

:fail_choice
set /p USER_CHOICE="Retry (R) or Exit (E)? "
if /i "%USER_CHOICE%"=="R" (
    goto :main_restart
) else if /i "%USER_CHOICE%"=="E" (
    exit /b 1
) else (
    echo Please type R or E.
    goto :fail_choice
)
