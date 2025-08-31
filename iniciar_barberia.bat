@echo off
setlocal enabledelayedexpansion

set PORT=3000

rem 1) Verificar Node
where node >nul 2>nul
if errorlevel 1 (
  echo [Error] No se encontro Node.js. Abriendo pagina para descargar...
  start https://nodejs.org/en
  pause
  exit /b 1
)

rem 2) Instalar dependencias si faltan
if not exist "node_modules" (
  echo.
  echo [Info] Instalando dependencias...
  call npm install || goto :error
)

rem 3) Compilar produccion
echo.
echo [Info] Construyendo en modo produccion...
call npm run build || goto :error

rem 4) Iniciar servidor en una nueva ventana
echo.
echo [Info] Iniciando servidor en http://localhost:%PORT%
start "Barberia - Servidor" cmd /c "npm run start -- -p %PORT%"

rem 5) Abrir navegador (espera breve opcional)
timeout /t 2 >nul
start "" http://localhost:%PORT%

echo.
echo [Listo] Deberias ver la app en tu navegador. Esta ventana puede cerrarse.
pause
exit /b 0

:error
echo.
echo [Fallo] Ocurrio un error. Revisa el log anterior.
pause
exit /b 1
