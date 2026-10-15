@echo off
title EL LENTE TARIJENO - Servidor Local
chcp 65001 >nul
cls

echo =======================================================
echo          EL LENTE TARIJEÑO - DIARIO DIGITAL
echo =======================================================
echo.
echo Iniciando el entorno local...
echo.

:: Cambiar al directorio donde se encuentra este archivo .bat
cd /d "%~dp0"

:: Verificar si node_modules existe, si no, instalar dependencias
if not exist "node_modules\" (
    echo [1/3] Instalando dependencias de Node.js...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] No se pudieron instalar las dependencias.
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencias ya instaladas.
)

:: Abrir el navegador automáticamente en segundo plano
echo [2/3] Abriendo el navegador en http://localhost:3000...
start http://localhost:3000

:: Iniciar el servidor Next.js
echo [3/3] Iniciando el servidor de desarrollo (npm run dev)...
echo.
echo Presiona Ctrl + C en esta ventana para detener el servidor.
echo =======================================================
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] El servidor se detuvo con errores.
    pause
)
