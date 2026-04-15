@echo off
:: Добавляет print server в автозагрузку Windows (запускается скрытым окном)
:: Запускать от имени Администратора

set TASK_NAME=MedTerminalPrintServer
set SERVER_DIR=%~dp0
set NODE_PATH=node

echo Регистрируем задачу в планировщике Windows...

schtasks /create /tn "%TASK_NAME%" /tr "cmd /c \"cd /d %SERVER_DIR% && node server.js >> %SERVER_DIR%print.log 2>&1\"" /sc onlogon /ru SYSTEM /rl HIGHEST /f

if errorlevel 1 (
    echo Ошибка создания задачи!
    pause
    exit /b 1
)

echo.
echo Готово! Print server будет запускаться автоматически при старте Windows.
echo Запустить сейчас:
schtasks /run /tn "%TASK_NAME%"
echo.
pause
