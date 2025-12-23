@echo off

title Zendarox Vault

cd /d "%~dp0"



if not exist node_modules (

  echo Installing dependencies...

  call npm install

)



echo.

call npm run stop >nul 2>&1

start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:4000"

call npm run server

