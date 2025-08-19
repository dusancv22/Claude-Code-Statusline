@echo off
echo Installing Claude Code Statusline...
echo.

REM Create the statusline directory
if not exist "%USERPROFILE%\.claude\statusline" (
    mkdir "%USERPROFILE%\.claude\statusline"
    echo Created directory: %USERPROFILE%\.claude\statusline
)

REM Copy the statusline.js file
copy /Y "statusline.js" "%USERPROFILE%\.claude\statusline\statusline.js" >nul 2>&1
if %errorlevel% equ 0 (
    echo Copied statusline.js to %USERPROFILE%\.claude\statusline\
) else (
    echo ERROR: Failed to copy statusline.js
    exit /b 1
)

REM Check if settings.json exists
if not exist "%USERPROFILE%\.claude\settings.json" (
    echo Creating new settings.json...
    echo { > "%USERPROFILE%\.claude\settings.json"
    echo   "statusLine": { >> "%USERPROFILE%\.claude\settings.json"
    echo     "type": "command", >> "%USERPROFILE%\.claude\settings.json"
    echo     "command": "node \"%USERPROFILE%\.claude\statusline\statusline.js\"", >> "%USERPROFILE%\.claude\settings.json"
    echo     "padding": 0 >> "%USERPROFILE%\.claude\settings.json"
    echo   } >> "%USERPROFILE%\.claude\settings.json"
    echo } >> "%USERPROFILE%\.claude\settings.json"
    echo Created settings.json with statusline configuration
) else (
    echo.
    echo WARNING: settings.json already exists
    echo Please manually add the following to your %USERPROFILE%\.claude\settings.json:
    echo.
    echo   "statusLine": {
    echo     "type": "command",
    echo     "command": "node \"%USERPROFILE%\.claude\statusline\statusline.js\"",
    echo     "padding": 0
    echo   }
    echo.
)

echo.
echo ===================================
echo Installation complete!
echo Please restart Claude Code to see your new statusline.
echo ===================================
pause