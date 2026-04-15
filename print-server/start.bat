@echo off
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo Node.js не установлен! Скачай с https://nodejs.org
    pause
    exit /b 1
)

if not exist node_modules (
    echo Устанавливаем зависимости...
    npm install
)

echo Запуск print server...
node server.js
pause
