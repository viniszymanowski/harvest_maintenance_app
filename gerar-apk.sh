#!/bin/bash

# Script para gerar APK do Harvest Maintenance App
# Autor: Manus AI
# Data: 11 de fevereiro de 2026

set -e

echo "🚜 Harvest Maintenance App - Gerador de APK"
echo "============================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "   Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"

# Verificar pnpm
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm não encontrado. Instalando..."
    npm install -g pnpm
fi

echo "✅ pnpm encontrado: $(pnpm --version)"

# Verificar EAS CLI
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI não encontrado. Instalando..."
    npm install -g eas-cli
fi

echo "✅ EAS CLI encontrado: $(eas --version)"
echo ""

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do projeto..."
    pnpm install
    echo "✅ Dependências instaladas!"
    echo ""
fi

# Verificar login
echo "🔐 Verificando login no Expo..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Você não está logado no Expo."
    echo "   Executando login..."
    eas login
else
    echo "✅ Você está logado como: $(eas whoami)"
fi

echo ""
echo "🎯 Escolha o perfil de build:"
echo "1) Development (com debugging, ~50-80 MB)"
echo "2) Preview (para testes, ~30-50 MB) [RECOMENDADO]"
echo "3) Production (otimizado, ~20-30 MB)"
echo ""
read -p "Digite o número (1, 2 ou 3): " choice

case $choice in
    1)
        PROFILE="development"
        ;;
    2)
        PROFILE="preview"
        ;;
    3)
        PROFILE="production"
        ;;
    *)
        echo "❌ Opção inválida. Usando 'preview' como padrão."
        PROFILE="preview"
        ;;
esac

echo ""
echo "🚀 Iniciando build do APK com perfil: $PROFILE"
echo "   Isso pode levar 15-30 minutos..."
echo ""

# Executar build
eas build --platform android --profile $PROFILE

echo ""
echo "🎉 Build concluído!"
echo ""
echo "📥 Próximos passos:"
echo "1. Acesse o link fornecido acima para baixar o APK"
echo "2. Ou acesse: https://expo.dev"
echo "3. Transfira o APK para seu celular Android"
echo "4. Instale o APK (habilite 'Fontes desconhecidas' se necessário)"
echo ""
echo "✅ Pronto! Seu app está pronto para uso."
