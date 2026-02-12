# 📱 Guia Completo: Como Gerar o APK do Harvest Maintenance App

## 🎯 Visão Geral

Este guia mostra como gerar o APK do aplicativo para instalação em dispositivos Android usando o **EAS Build** (serviço de build do Expo).

---

## ⚙️ Pré-requisitos

### 1. Node.js e Git
- **Node.js 18+** instalado ([Download](https://nodejs.org/))
- **Git** instalado ([Download](https://git-scm.com/))

### 2. Conta Expo (Gratuita)
- Criar conta em: https://expo.dev/signup
- Anotar email e senha

---

## 🚀 Passo a Passo

### Passo 1: Clonar o Repositório

```bash
# Clonar o repositório
git clone https://github.com/viniszymanowski/harvest_maintenance_app.git
cd harvest_maintenance_app

# Instalar dependências
npm install -g pnpm
pnpm install
```

### Passo 2: Instalar EAS CLI

```bash
# Instalar EAS CLI globalmente
npm install -g eas-cli

# Verificar instalação
eas --version
```

### Passo 3: Fazer Login no Expo

```bash
# Login com sua conta Expo
eas login

# Digite seu email e senha quando solicitado
```

### Passo 4: Configurar Projeto (Primeira vez apenas)

```bash
# Configurar EAS Build
eas build:configure

# Quando perguntado:
# - "Generate a new Android Keystore?" -> Pressione ENTER (Yes)
```

### Passo 5: Gerar o APK

```bash
# Gerar APK de preview (desenvolvimento)
eas build --platform android --profile preview

# OU gerar APK de produção (otimizado)
eas build --platform android --profile production
```

**O que acontece**:
1. EAS envia o código para a nuvem
2. Build é executado em servidores do Expo
3. Processo leva **15-30 minutos**
4. Você receberá um link para download do APK

### Passo 6: Baixar o APK

Após o build concluir:

1. Acesse o link fornecido no terminal
2. OU acesse: https://expo.dev/accounts/[seu-usuario]/projects/harvest_maintenance_app/builds
3. Clique no build mais recente
4. Clique em **"Download"** para baixar o APK

### Passo 7: Instalar no Celular

**Opção A - Via USB**:
```bash
# Conectar celular via USB
# Habilitar "Depuração USB" nas configurações do Android
# Transferir APK para o celular
# Abrir o APK no celular e instalar
```

**Opção B - Via Link**:
1. Abrir o link do build no celular
2. Baixar o APK diretamente
3. Abrir e instalar

**Importante**: Habilitar "Instalar apps de fontes desconhecidas" nas configurações do Android.

---

## 📋 Comandos Resumidos

```bash
# 1. Clonar e instalar
git clone https://github.com/viniszymanowski/harvest_maintenance_app.git
cd harvest_maintenance_app
npm install -g pnpm
pnpm install

# 2. Instalar EAS CLI
npm install -g eas-cli

# 3. Login
eas login

# 4. Configurar (primeira vez)
eas build:configure

# 5. Gerar APK
eas build --platform android --profile preview

# 6. Aguardar build (15-30 min)
# 7. Baixar APK do link fornecido
```

---

## 🔧 Perfis de Build Disponíveis

### Development (Desenvolvimento)
```bash
eas build --platform android --profile development
```
- APK com Expo Dev Client
- Permite hot reload e debugging
- Tamanho maior (~50-80 MB)

### Preview (Pré-visualização)
```bash
eas build --platform android --profile preview
```
- APK standalone para testes
- Sem debugging
- Tamanho médio (~30-50 MB)
- **Recomendado para distribuição interna**

### Production (Produção)
```bash
eas build --platform android --profile production
```
- APK otimizado para publicação
- Tamanho reduzido (~20-30 MB)
- Pronto para Google Play Store

---

## 🎨 Personalizar o App Antes do Build

### Alterar Nome do App

Editar `app.config.ts`:
```typescript
const env = {
  appName: "Seu Nome Aqui", // Alterar aqui
  appSlug: "harvest_maintenance_app",
  // ...
};
```

### Alterar Ícone

Substituir arquivos em `assets/images/`:
- `icon.png` (1024x1024)
- `android-icon-foreground.png` (512x512)
- `android-icon-background.png` (512x512)

### Alterar Cores

Editar `theme.config.js`:
```javascript
const themeColors = {
  primary: { light: '#367C2B', dark: '#4A9B3E' }, // Verde
  secondary: { light: '#FFDE00', dark: '#FFE933' }, // Amarelo
  // ...
};
```

---

## ⚠️ Troubleshooting

### Erro: "EAS CLI not found"
```bash
npm install -g eas-cli
```

### Erro: "Not logged in"
```bash
eas login
```

### Erro: "Build failed"
- Verificar logs no terminal
- Acessar https://expo.dev/accounts/[usuario]/builds
- Clicar no build com erro e ver detalhes

### Build muito lento
- Normal! Builds levam 15-30 minutos
- Acompanhar progresso em: https://expo.dev

### APK não instala no celular
1. Habilitar "Fontes desconhecidas" nas configurações
2. Verificar se o APK foi baixado completamente
3. Tentar baixar novamente

---

## 📊 Informações do Build

### Tamanhos Aproximados
- **Development**: 50-80 MB
- **Preview**: 30-50 MB
- **Production**: 20-30 MB

### Tempo de Build
- **Primeira vez**: 20-30 minutos
- **Builds subsequentes**: 15-20 minutos

### Limites Gratuitos (Expo)
- **30 builds/mês** no plano gratuito
- Builds ilimitados com plano pago

---

## 🔐 Segurança

### Keystore (Chave de Assinatura)

O EAS gera automaticamente uma **keystore** para assinar o APK. Esta chave é:
- Armazenada com segurança no Expo
- Necessária para updates futuros
- **Não compartilhar com ninguém**

Para ver informações da keystore:
```bash
eas credentials
```

---

## 📱 Alternativa Rápida: Expo Go

Se você só quer testar o app rapidamente **sem gerar APK**:

```bash
# 1. Instalar Expo Go no celular
# Android: https://play.google.com/store/apps/details?id=host.exp.exponent
# iOS: https://apps.apple.com/app/expo-go/id982107779

# 2. Iniciar servidor
pnpm dev

# 3. Escanear QR Code com Expo Go
```

**Vantagens**:
- Sem build necessário
- Atualização instantânea
- Ideal para desenvolvimento

**Desvantagens**:
- Requer Expo Go instalado
- Não funciona offline
- Algumas funcionalidades limitadas

---

## 🎯 Próximos Passos Após Gerar o APK

### 1. Testar o APK
- Instalar em pelo menos 2 dispositivos diferentes
- Testar todas as funcionalidades
- Verificar performance

### 2. Distribuir Internamente
- Enviar APK via WhatsApp/Email
- Ou usar serviços como Firebase App Distribution
- Ou hospedar em servidor próprio

### 3. Publicar na Google Play Store (Opcional)
```bash
# Gerar APK de produção
eas build --platform android --profile production

# Seguir guia do Google Play Console
# https://play.google.com/console
```

---

## 📞 Suporte

### Documentação Oficial
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo**: https://docs.expo.dev/

### Comunidade
- **Discord Expo**: https://chat.expo.dev/
- **Fórum**: https://forums.expo.dev/

### Problemas Comuns
- Verificar: https://docs.expo.dev/build-reference/troubleshooting/

---

## ✅ Checklist Final

Antes de gerar o APK:

- [ ] Código testado localmente (`pnpm dev`)
- [ ] TypeScript sem erros (`pnpm check`)
- [ ] Nome do app configurado (`app.config.ts`)
- [ ] Ícones personalizados (opcional)
- [ ] Conta Expo criada
- [ ] EAS CLI instalado
- [ ] Login realizado (`eas login`)

Durante o build:

- [ ] Comando executado: `eas build --platform android --profile preview`
- [ ] Build iniciado com sucesso
- [ ] Aguardar conclusão (15-30 min)

Após o build:

- [ ] APK baixado
- [ ] APK instalado no celular
- [ ] App testado e funcionando
- [ ] APK distribuído para usuários

---

## 🎉 Conclusão

Seguindo este guia, você conseguirá gerar o APK do **Harvest Maintenance App** e distribuí-lo para instalação em dispositivos Android.

**Tempo total estimado**: 30-45 minutos (incluindo build)

**Dificuldade**: Fácil (apenas seguir os comandos)

Boa sorte! 🚀
