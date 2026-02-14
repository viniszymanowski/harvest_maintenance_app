# Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

## 🗄️ Banco de Dados

### MySQL Local (Desenvolvimento)
```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/harvest_maintenance_app
```

### TiDB Cloud (Produção)
```env
DATABASE_URL=mysql://usuario:senha@gateway01.sa-east-1.prod.aws.tidbcloud.com:4000/harvest_maintenance_app?ssl={"rejectUnauthorized":true}
```

## 🚀 Servidor

```env
EXPO_PORT=8081
PORT=3000
```

## 🔐 OAuth (Opcional - Deixe vazio para desenvolvimento local)

```env
OAUTH_SERVER_URL=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
```

## 📧 Email (Opcional - Para envio de relatórios)

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-do-gmail
```

**Como gerar senha de app do Gmail:**
1. Acesse https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app"
4. Gere uma senha para "Mail"

### Outlook
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

## 📱 WhatsApp (Opcional - Twilio)

```env
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Como configurar Twilio:**
1. Crie conta em https://www.twilio.com/
2. Acesse o Console
3. Copie Account SID e Auth Token
4. Configure WhatsApp Sandbox em "Messaging > Try it out > Send a WhatsApp message"

---

## 📝 Exemplo Completo

```env
# Banco de Dados
DATABASE_URL=mysql://harvest_user:minhasenha@localhost:3306/harvest_maintenance_app

# Servidor
EXPO_PORT=8081
PORT=3000

# OAuth (vazio para dev local)
OAUTH_SERVER_URL=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=meu-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop

# WhatsApp (opcional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```
