# 🌐 Guia de Deploy do Site Web - Controle de Colheita

Este guia explica como fazer deploy permanente do site web do **Controle de Colheita**.

---

## 📋 **Pré-requisitos**

- Node.js 18+ instalado
- Conta no Vercel, Netlify ou GitHub Pages
- Repositório Git configurado

---

## 🚀 **Opção 1: Deploy no Vercel (Recomendado)**

### **Vantagens:**
- ✅ Deploy automático a cada commit
- ✅ HTTPS gratuito
- ✅ CDN global
- ✅ Suporte a variáveis de ambiente
- ✅ Preview de PRs

### **Passos:**

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login**
   ```bash
   vercel login
   ```

3. **Fazer deploy**
   ```bash
   cd /caminho/para/harvest_maintenance_app
   vercel
   ```

4. **Configurar variáveis de ambiente**
   - Acesse o painel do Vercel
   - Vá em **Settings → Environment Variables**
   - Adicione:
     - `DATABASE_URL`: URL do MySQL (ex: PlanetScale, Railway)
     - `PORT`: 3000
     - Outras variáveis do `.env`

5. **Deploy de produção**
   ```bash
   vercel --prod
   ```

### **Resultado:**
- URL pública: `https://harvest-maintenance-app.vercel.app`

---

## 🌐 **Opção 2: Deploy no Netlify**

### **Vantagens:**
- ✅ Interface simples
- ✅ Integração com GitHub
- ✅ HTTPS gratuito
- ✅ Formulários e funções serverless

### **Passos:**

1. **Instalar Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Fazer login**
   ```bash
   netlify login
   ```

3. **Inicializar projeto**
   ```bash
   cd /caminho/para/harvest_maintenance_app
   netlify init
   ```

4. **Configurar build**
   - Build command: `pnpm export:web`
   - Publish directory: `dist`

5. **Fazer deploy**
   ```bash
   netlify deploy --prod
   ```

### **Resultado:**
- URL pública: `https://harvest-maintenance-app.netlify.app`

---

## 📦 **Opção 3: GitHub Pages (Gratuito)**

### **Vantagens:**
- ✅ 100% gratuito
- ✅ Integração com GitHub
- ✅ HTTPS automático

### **Limitações:**
- ⚠️ Apenas sites estáticos (sem backend)
- ⚠️ Precisa de backend externo (Railway, Render)

### **Passos:**

1. **Instalar gh-pages**
   ```bash
   cd /caminho/para/harvest_maintenance_app
   pnpm add -D gh-pages
   ```

2. **Adicionar script no package.json**
   ```json
   {
     "scripts": {
       "predeploy": "pnpm export:web",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Fazer deploy**
   ```bash
   pnpm deploy
   ```

4. **Configurar GitHub Pages**
   - Vá em **Settings → Pages**
   - Source: `gh-pages` branch
   - Salvar

### **Resultado:**
- URL pública: `https://seu-usuario.github.io/harvest_maintenance_app`

---

## 🗄️ **Deploy do Backend (Necessário)**

O site web precisa de um backend para funcionar. Escolha uma opção:

### **Opção A: Railway (Recomendado)**

1. **Criar conta**: [railway.app](https://railway.app)
2. **Novo projeto** → **Deploy from GitHub**
3. **Selecionar repositório**
4. **Configurar variáveis de ambiente**:
   - `DATABASE_URL`: MySQL (Railway fornece gratuitamente)
   - `PORT`: 3000
5. **Deploy automático** a cada commit

**Custo:** Gratuito até $5/mês de uso

---

### **Opção B: Render**

1. **Criar conta**: [render.com](https://render.com)
2. **New → Web Service**
3. **Conectar GitHub**
4. **Build command**: `pnpm build`
5. **Start command**: `pnpm start`
6. **Adicionar variáveis de ambiente**

**Custo:** Gratuito (com limitações)

---

### **Opção C: Heroku**

1. **Criar conta**: [heroku.com](https://heroku.com)
2. **Instalar Heroku CLI**
3. **Deploy**:
   ```bash
   heroku login
   heroku create harvest-maintenance-api
   git push heroku main
   ```

**Custo:** $7/mês (plano básico)

---

## 🔧 **Configuração de Banco de Dados**

### **Opção A: PlanetScale (MySQL Serverless)**

1. **Criar conta**: [planetscale.com](https://planetscale.com)
2. **Criar database** → `harvest_maintenance_app`
3. **Copiar connection string**
4. **Adicionar no Vercel/Railway**:
   ```
   DATABASE_URL=mysql://user:pass@host/database?sslaccept=strict
   ```

**Custo:** Gratuito até 5GB

---

### **Opção B: Railway MySQL**

1. **No projeto Railway** → **New → Database → MySQL**
2. **Copiar `DATABASE_URL`**
3. **Adicionar nas variáveis de ambiente**

**Custo:** Incluído no plano gratuito

---

## 🌍 **Domínio Personalizado (Opcional)**

### **Comprar domínio:**
- [Namecheap](https://namecheap.com): ~$10/ano
- [Google Domains](https://domains.google): ~$12/ano

### **Configurar DNS:**

**Para Vercel:**
1. Vercel → **Settings → Domains**
2. Adicionar domínio: `colheita.com.br`
3. Configurar DNS:
   - Tipo: `A`
   - Nome: `@`
   - Valor: `76.76.21.21`

**Para Netlify:**
1. Netlify → **Domain settings**
2. Adicionar domínio personalizado
3. Seguir instruções de DNS

---

## 📱 **PWA - Instalar como App**

O site já está configurado como PWA! Usuários podem:

1. **No Chrome/Edge:**
   - Clicar no ícone de instalação na barra de endereço
   - Ou: Menu → "Instalar Controle de Colheita"

2. **No Safari (iOS):**
   - Compartilhar → "Adicionar à Tela de Início"

3. **No Android:**
   - Menu → "Adicionar à tela inicial"

---

## 🔒 **Segurança**

### **Variáveis de Ambiente:**
- ✅ Nunca commitar `.env` no Git
- ✅ Usar `.env.example` como template
- ✅ Configurar variáveis no painel do serviço de deploy

### **HTTPS:**
- ✅ Vercel/Netlify fornecem HTTPS automático
- ✅ GitHub Pages também tem HTTPS

### **CORS:**
- ✅ Configurar backend para aceitar requisições do domínio frontend
- ✅ Adicionar no `server/_core/index.ts`:
   ```typescript
   res.header("Access-Control-Allow-Origin", "https://seu-dominio.com");
   ```

---

## 📊 **Monitoramento**

### **Vercel Analytics (Gratuito):**
- Acesse: Vercel Dashboard → **Analytics**
- Métricas: Visitas, performance, erros

### **Google Analytics (Gratuito):**
1. Criar conta: [analytics.google.com](https://analytics.google.com)
2. Adicionar tracking ID no `app.config.ts`:
   ```typescript
   web: {
     config: {
       googleAnalytics: {
         trackingId: "G-XXXXXXXXXX"
       }
     }
   }
   ```

---

## 🚨 **Troubleshooting**

### **Erro: "Cannot connect to database"**
- ✅ Verificar `DATABASE_URL` nas variáveis de ambiente
- ✅ Testar conexão localmente primeiro
- ✅ Verificar se IP do servidor está na whitelist do MySQL

### **Erro: "404 Not Found"**
- ✅ Verificar se build foi feito corretamente
- ✅ Conferir `dist` directory no Netlify/Vercel
- ✅ Limpar cache e fazer rebuild

### **Erro: "CORS blocked"**
- ✅ Configurar CORS no backend
- ✅ Adicionar domínio frontend na whitelist
- ✅ Verificar se `Access-Control-Allow-Origin` está correto

---

## 📞 **Suporte**

- **Documentação Expo**: [docs.expo.dev](https://docs.expo.dev)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)

---

## 🎉 **Deploy Completo!**

Após seguir este guia, você terá:

✅ Site web funcionando 24/7  
✅ URL pública acessível de qualquer lugar  
✅ Backend conectado ao banco de dados  
✅ HTTPS automático  
✅ PWA instalável  
✅ Deploy automático a cada commit  

**URL de exemplo:** `https://harvest-maintenance-app.vercel.app`

---

**Criado por:** Manus AI  
**Data:** 11/02/2026  
**Versão:** 1.0
