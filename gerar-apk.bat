@echo off
REM Script para gerar APK do Harvest Maintenance App (Windows)
REM Autor: Manus AI
REM Data: 11 de fevereiro de 2026

echo.
echo ========================================
echo  Harvest Maintenance App - Gerador de APK
echo ========================================
echo.

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERRO] Node.js nao encontrado!
    echo        Instale em: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version

REM Verificar pnpm
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] pnpm nao encontrado. Instalando...
    call npm install -g pnpm
)

echo [OK] pnpm encontrado
pnpm --version

REM Verificar EAS CLI
where eas >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] EAS CLI nao encontrado. Instalando...
    call npm install -g eas-cli
)

echo [OK] EAS CLI encontrado
eas --version

echo.

REM Instalar dependências
if not exist "node_modules" (
    echo [INFO] Instalando dependencias do projeto...
    call pnpm install
    echo [OK] Dependencias instaladas!
    echo.
)

REM Verificar login
echo [INFO] Verificando login no Expo...
eas whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [AVISO] Voce nao esta logado no Expo.
    echo         Executando login...
    call eas login
) else (
    echo [OK] Voce esta logado no Expo
)

echo.
echo Escolha o perfil de build:
echo 1) Development (com debugging, ~50-80 MB)
echo 2) Preview (para testes, ~30-50 MB) [RECOMENDADO]
echo 3) Production (otimizado, ~20-30 MB)
echo.
set /p choice="Digite o numero (1, 2 ou 3): "

if "%choice%"=="1" (
    set PROFILE=development
) else if "%choice%"=="2" (
    set PROFILE=preview
) else if "%choice%"=="3" (
    set PROFILE=production
) else (
    echo [AVISO] Opcao invalida. Usando 'preview' como padrao.
    set PROFILE=preview
)

echo.
echo [INFO] Iniciando build do APK com perfil: %PROFILE%
echo        Isso pode levar 15-30 minutos...
echo.

REM Executar build
call eas build --platform android --profile %PROFILE%

echo.
echo ========================================
echo  Build concluido!
echo ========================================
echo.
echo Proximos passos:
echo 1. Acesse o link fornecido acima para baixar o APK
echo 2. Ou acesse: https://expo.dev
echo 3. Transfira o APK para seu celular Android
echo 4. Instale o APK (habilite 'Fontes desconhecidas' se necessario)
echo.
echo [OK] Pronto! Seu app esta pronto para uso.
echo.
pause
