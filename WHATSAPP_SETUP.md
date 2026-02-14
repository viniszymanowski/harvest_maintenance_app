# Configuração WhatsApp com Twilio

Este guia explica como configurar o envio automático de relatórios via WhatsApp usando a API do Twilio.

## 1. Criar Conta no Twilio

1. Acesse [https://www.twilio.com/](https://www.twilio.com/)
2. Clique em "Sign up" e crie uma conta gratuita
3. Após criar a conta, você receberá **$15 de crédito grátis** para testar

## 2. Obter Credenciais

1. Acesse o [Console do Twilio](https://console.twilio.com/)
2. Na página inicial, você verá:
   - **Account SID**: Identificador único da sua conta
   - **Auth Token**: Token de autenticação (clique em "Show" para revelar)
3. Copie esses valores, você precisará deles

## 3. Ativar WhatsApp Sandbox (Para Testes)

O Twilio oferece um **WhatsApp Sandbox** gratuito para testes, sem necessidade de aprovação.

### Passos:

1. Acesse [https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Você verá um número WhatsApp do Twilio (geralmente `+1 415 523 8886`)
3. Siga as instruções para conectar seu número:
   - Abra o WhatsApp no seu celular
   - Adicione o número do Twilio aos seus contatos
   - Envie a mensagem de código exibida na tela (ex: `join <código>`)
4. Após enviar, você receberá uma confirmação no WhatsApp

**Importante:** No modo Sandbox, você só pode enviar mensagens para números que enviaram o código de ativação.

## 4. Configurar Variáveis de Ambiente

No servidor do aplicativo, configure as seguintes variáveis de ambiente:

```bash
TWILIO_ACCOUNT_SID=seu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Nota:** O número `TWILIO_WHATSAPP_FROM` é o número do Sandbox. Se você tiver um número aprovado, substitua por ele.

### Como Configurar:

- **Desenvolvimento local**: Crie um arquivo `.env` na raiz do projeto
- **Produção (Manus)**: Use a interface de configuração de variáveis de ambiente

## 5. Testar Envio

1. Abra o aplicativo e vá para a aba **Notificações**
2. Preencha o campo "Número WhatsApp" com seu número no formato: `+55 11 99999-9999`
3. Clique em "📱 Enviar Teste WhatsApp"
4. Você deve receber uma mensagem no WhatsApp com o relatório de teste

## 6. Ativar Envio Automático

1. Na tela de Notificações, ative o toggle "Envio Automático" na seção WhatsApp
2. Configure o horário de envio (padrão: 18:00)
3. Clique em "Salvar Configurações"

O sistema enviará automaticamente um relatório diário no horário configurado.

## 7. Produção (Número Aprovado)

Para usar em produção com seu próprio número WhatsApp:

1. Acesse [https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
2. Clique em "Request to enable your Twilio number for WhatsApp"
3. Preencha o formulário de solicitação com:
   - Nome da empresa
   - Descrição do uso
   - Templates de mensagens
4. Aguarde aprovação (pode levar alguns dias)
5. Após aprovação, atualize `TWILIO_WHATSAPP_FROM` com seu número aprovado

## Formato de Números

- **Número do Twilio (FROM)**: `whatsapp:+14155238886`
- **Número do destinatário (TO)**: `whatsapp:+5511999999999`

O sistema formata automaticamente os números brasileiros adicionando o código do país `+55`.

## Custos

- **Sandbox**: Gratuito para testes
- **Produção**: 
  - Mensagens de texto: ~$0.005 por mensagem
  - Mensagens com mídia (PDF): ~$0.01 por mensagem
  - Crédito inicial: $15 (suficiente para ~1500 mensagens)

## Solução de Problemas

### Erro: "Credenciais Twilio não configuradas"
- Verifique se as variáveis `TWILIO_ACCOUNT_SID` e `TWILIO_AUTH_TOKEN` estão configuradas
- Reinicie o servidor após configurar

### Erro: "Permission to send an SMS has not been enabled"
- Certifique-se de que enviou o código de ativação no Sandbox
- Verifique se o número está no formato correto

### Mensagem não chega
- Confirme que o número está conectado ao Sandbox (enviou o código)
- Verifique os logs do servidor para erros
- Teste com o botão "Enviar Teste WhatsApp"

## Suporte

Para mais informações, consulte a [Documentação Oficial do Twilio WhatsApp API](https://www.twilio.com/docs/whatsapp/api).
