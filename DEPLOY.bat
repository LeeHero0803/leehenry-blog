@echo off
setlocal EnableExtensions
chcp 65001 >nul

REM ====== 配置 ======
set "HOST=39.104.64.173"
set "PORT=22"
set "USER=root"
set "REMOTE_DIR=/www/wwwroot/39.104.64.173"
set "WWW_USER=www"
set "WWW_GROUP=www"
set "BACKUP=1"
set "NO_STRICT=1"
set "KEY=%USERPROFILE%\.ssh\id_ed25519"
REM ====== 配置 ======

REM === SSH / SCP 组装 ===
if "%NO_STRICT%"=="1" (
  set "SSH=ssh -i ""%KEY%"" -o StrictHostKeyChecking=no -p %PORT% %USER%@%HOST%"
  set "SCP=scp -i ""%KEY%"" -o StrictHostKeyChecking=no -P %PORT%"
) else (
  set "SSH=ssh -i ""%KEY%"" -p %PORT% %USER%@%HOST%"
  set "SCP=scp -i ""%KEY%"" -P %PORT%"
)

if not exist "%KEY%" (
  echo [ERR] SSH private key not found: "%KEY%"
  exit /b 1
)

REM === 1) 本地构建 ===
call :step 1 "本地构建"
call pnpm build || (echo [ERR] Build failed & exit /b 1)

REM === 2) 确保远端目录存在 ===
call :step 2 "确保远端目录存在"
%SSH% "mkdir -p %REMOTE_DIR%" || (echo [ERR] Remote mkdir failed & exit /b 1)

REM === 3) 远端全量打包备份 & 清理 ===
call :step 3 "远端全量备份并清理（保留 .well-known / .user.ini）"
if "%BACKUP%"=="1" (
  %SSH% "set -e; SITE='%REMOTE_DIR%'; BK=/www/backup/$(date +%%F_%%H%%M%%S).tar.gz; mkdir -p /www/backup; tar -czf ""$BK"" -C ""$SITE"" .; echo Backup to $BK done." || (echo [ERR] Backup failed & exit /b 1)
)
%SSH% "set -e; SITE='%REMOTE_DIR%'; cd ""$SITE""; find . -mindepth 1 -maxdepth 1 -not -name '.well-known' -not -name '.user.ini' -exec rm -rf {} +;" || (echo [ERR] Clean failed & exit /b 1)

REM === 4) 本地打包 dist 为 tar.gz ===
call :step 4 "打包 dist 为 tar.gz"
set "PKG_TGZ=dist.tar.gz"
if exist "%PKG_TGZ%" del /f /q "%PKG_TGZ%" >nul 2>&1

set "GIT_TAR=%ProgramFiles%\Git\usr\bin\tar.exe"
if exist "%GIT_TAR%" (
  "%GIT_TAR%" -czf "%PKG_TGZ%" -C dist .
) else (
  tar -czf "%PKG_TGZ%" -C dist .
)
if errorlevel 1 (echo [ERR] 打包失败 & exit /b 1)

REM === 5) 上传压缩包到远端 ===
call :step 5 "上传压缩包到远端"
%SSH% "mkdir -p %REMOTE_DIR%/.upload" || (echo [ERR] Remote temp mkdir failed & exit /b 1)
%SCP% "%PKG_TGZ%" %USER%@%HOST%:%REMOTE_DIR%/.upload/dist.tar.gz || (echo [ERR] Upload failed & exit /b 1)

REM === 6) 远端解压并清理压缩包 ===
call :step 6 "远端解压并清理压缩包"
%SSH% "set -e; SITE='%REMOTE_DIR%'; PKG=""$SITE/.upload/dist.tar.gz""; tar -xzf ""$PKG"" -C ""$SITE""; rm -f ""$PKG""; echo Unpacked dist.tar.gz." || (echo [ERR] Unpack failed & exit /b 1)

REM === 7) 修正属主与权限 ===
call :step 7 "修正属主与权限（排除 .user.ini）"
%SSH% "set -e; SITE='%REMOTE_DIR%'; find ""$SITE"" -not -name '.user.ini' -exec chown %WWW_USER%:%WWW_GROUP% {} +; find ""$SITE"" -type d -not -name '.user.ini' -exec chmod 755 {} \; ; find ""$SITE"" -type f -not -name '.user.ini' -exec chmod 644 {} \; ; echo Permission fixed." || (echo [ERR] Chown/chmod failed & exit /b 1)

REM === 8) 完成 ===
call :step 8 "部署完成！"
echo Done -> http://%HOST%/
exit /b 0

:step
echo(
echo ============================
echo [STEP %1] %~2
echo ============================
echo(
goto :eof
