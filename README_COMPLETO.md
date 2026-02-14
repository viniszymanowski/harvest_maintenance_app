# 🚜 Harvest Maintenance App

**Sistema completo de controle de colheita e manutenção de máquinas agrícolas**

Aplicativo mobile desenvolvido com **Expo SDK 54**, **React Native**, **TypeScript**, **tRPC** e **MySQL/TiDB** para gerenciar operações diárias de colheita terceirizada e manutenção preventiva de colheitadeiras.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Funcionalidades](#funcionalidades)
3. [Tecnologias Utilizadas](#tecnologias-utilizadas)
4. [Arquitetura](#arquitetura)
5. [Instalação](#instalação)
6. [Configuração](#configuração)
7. [Uso](#uso)
8. [Estrutura do Projeto](#estrutura-do-projeto)
9. [Banco de Dados](#banco-de-dados)
10. [Sistema Offline](#sistema-offline)
11. [Relatórios e Exportação](#relatórios-e-exportação)
12. [Deploy](#deploy)
13. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O **Harvest Maintenance App** é uma solução mobile-first para controle operacional de colheita terceirizada, desenvolvido para funcionar em áreas rurais com conectividade limitada. O sistema gerencia 4 colheitadeiras John Deere (modelos STS 9570, 9670, 9770) com registro de horas de motor, horas de trilha, controle de troca de óleo e revisões periódicas.

### Principais Diferenciais

O aplicativo foi projetado para **operação offline-first**, permitindo que operadores registrem lançamentos diários mesmo sem conexão com a internet. Os dados são armazenados localmente em SQLite e sincronizados automaticamente quando a conexão é restabelecida. O sistema implementa validações rigorosas de horímetros, atualização automática de valores das máquinas, e geração de relatórios em PDF e CSV.

---

## ✨ Funcionalidades

### 📱 Lançamento Rápido Diário

A tela de lançamento permite registro ágil de operações diárias com pré-preenchimento inteligente de dados. Ao selecionar uma máquina, o sistema carrega automaticamente os horímetros atuais (HM Motor e HM Trilha), persistindo o último operador e fazenda selecionados para agilizar entradas repetidas. O botão **"Salvar e Novo"** mantém o contexto (máquina, operador, fazenda) para múltiplos lançamentos consecutivos.

O sistema calcula automaticamente as horas trabalhadas (final - inicial) e valida se os horímetros finais são maiores que os iniciais, bloqueando salvamentos inválidos. Após salvar, os horímetros atuais da máquina são atualizados automaticamente com os valores finais do lançamento.

### 🔧 Gestão de Manutenções

O módulo de manutenção registra intervenções preventivas e corretivas com controle de peças utilizadas. Cada manutenção inclui tipo (preventiva/corretiva), data, horímetro, tempo parado, checkboxes para troca de óleo e revisão 50h, lista dinâmica de peças com cálculo automático de valor total, e campo de observações.

O sistema permite editar e excluir manutenções existentes, com confirmação antes de ações destrutivas. As manutenções são vinculadas às máquinas e aparecem no histórico completo.

### 📊 Relatórios Inteligentes

O sistema gera relatórios consolidados com filtros de período (semana, mês, safra, personalizado). Os relatórios incluem:

- **Relatório Diário**: Resumo de todas as máquinas com horas produtivas, área colhida, operadores
- **Relatório por Máquina**: Produtividade, horas trabalhadas, manutenções realizadas, custos
- **Relatório por Operador**: Ranking de performance, horas trabalhadas, máquinas operadas
- **Relatório de Manutenções**: Custos totais, peças mais utilizadas, tempo de parada

Todos os relatórios podem ser exportados em **PDF** (com logo John Deere) e **CSV** para análise em Excel.

### 🌐 Sistema Offline com Sincronização

O aplicativo funciona completamente offline, armazenando dados localmente em SQLite. A sincronização automática ocorre quando a conexão é restabelecida, com retry inteligente (até 5 tentativas com cooldown de 30 segundos) e resolução de conflitos por **last_write_wins**.

O componente **SyncIndicator** exibe status em tempo real:
- 📵 **Offline** (laranja): Sem conexão
- 🔄 **Sincronizando...** (azul): Enviando dados
- ⏳ **Pendências: X** (laranja): Registros aguardando
- ❌ **Erro: Y** (vermelho): Falhas na sincronização
- ✅ **Sincronizado** (verde): Tudo em dia

O usuário pode forçar sincronização manual, retentar itens com erro, ou limpar erros antigos.

### ⚙️ Configurações Completas

A tela de configurações permite gerenciar:

- **Máquinas**: Cadastro, edição e exclusão (com CASCADE delete automático de lançamentos e manutenções vinculadas)
- **Operadores**: Gerenciamento de operadores cadastrados
- **Fazendas**: Cadastro de fazendas com múltiplos talhões
- **Talhões**: Vinculação de talhões a fazendas, com área em hectares e cultura plantada
- **Intervalos de Manutenção**: Configuração de intervalos de troca de óleo e revisão 50h por máquina
- **Notificações**: Configuração de email e WhatsApp para envio automático de relatórios

### 📧 Envio Automático de Relatórios

O sistema agenda envio automático de relatórios diários por email e WhatsApp (via Twilio). O usuário configura horário de envio, destinatários, e pode testar o envio manualmente. Os relatórios são enviados em formato PDF anexado.

---

## 🛠️ Tecnologias Utilizadas

### Frontend Mobile

- **Expo SDK 54**: Framework React Native com ferramentas de desenvolvimento
- **React Native 0.81**: Framework mobile cross-platform
- **TypeScript 5.9**: Tipagem estática com strict mode
- **Expo Router 6**: Navegação baseada em arquivos
- **NativeWind 4**: Tailwind CSS para React Native
- **TanStack Query**: Gerenciamento de estado e cache de dados
- **expo-sqlite**: Banco de dados local para modo offline
- **@react-native-community/netinfo**: Detecção de conectividade

### Backend

- **tRPC 11**: API type-safe end-to-end
- **Express**: Servidor HTTP
- **Drizzle ORM**: ORM TypeScript-first para MySQL
- **MySQL 8 / TiDB Cloud**: Banco de dados relacional
- **Nodemailer**: Envio de emails
- **Twilio**: Envio de WhatsApp
- **jsPDF**: Geração de PDFs

### DevOps

- **pnpm**: Gerenciador de pacotes
- **tsx**: Execução TypeScript com hot reload
- **concurrently**: Execução paralela de scripts
- **Vitest**: Framework de testes

---

## 🏗️ Arquitetura

O sistema segue arquitetura **offline-first** com sincronização bidirecional:

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (Expo)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   UI Layer   │  │  tRPC Client │  │ SQLite Local │  │
│  │ (React Native)│  │ (TanStack Q) │  │  (Offline)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                 │           │
│           └────────────────┴─────────────────┘           │
│                            │                             │
└────────────────────────────┼─────────────────────────────┘
                             │ HTTP/WebSocket
                             │
┌────────────────────────────┼─────────────────────────────┐
│                    Backend Server                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ tRPC Router  │  │ Drizzle ORM  │  │   Services   │  │
│  │  (Express)   │  │   (MySQL)    │  │ (Email/SMS)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│           │                │                 │           │
│           └────────────────┴─────────────────┘           │
│                            │                             │
└────────────────────────────┼─────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    │  MySQL / TiDB   │
                    │   (Production)  │
                    └─────────────────┘
```

### Fluxo de Dados Offline

1. **Operação Offline**: Dados salvos em `daily_logs_local` + `sync_queue`
2. **Detecção de Conexão**: NetInfo monitora conectividade
3. **Sincronização Automática**: Hook `useSync` processa fila a cada 30s
4. **UPSERT Inteligente**: Evita duplicados por `entity_type + entity_id`
5. **Retry com Cooldown**: Até 5 tentativas com intervalo de 30s
6. **Resolução de Conflitos**: Last write wins (última atualização vence)
7. **Marcação Local**: Campo `synced=1` após sucesso
8. **Limpeza Automática**: Itens sincronizados há mais de 7 dias são removidos

---

## 📦 Instalação

### Pré-requisitos

- **Node.js 22+**: Runtime JavaScript
- **pnpm 9+**: Gerenciador de pacotes (instale com `npm install -g pnpm`)
- **MySQL 8+** ou **TiDB Cloud**: Banco de dados
- **Expo Go** (mobile): App para testar no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Passo 1: Clonar o Repositório

```bash
# Clone o projeto
cd harvest_maintenance_app

# Instale as dependências
pnpm install
```

### Passo 2: Configurar Banco de Dados

#### Opção A: MySQL Local (Desenvolvimento)

```bash
# Instale MySQL 8
# Windows: https://dev.mysql.com/downloads/installer/
# macOS: brew install mysql
# Linux: sudo apt install mysql-server

# Crie o banco de dados
mysql -u root -p
CREATE DATABASE harvest_maintenance_app;
CREATE USER 'harvest_user'@'localhost' IDENTIFIED BY 'sua_senha';
GRANT ALL PRIVILEGES ON harvest_maintenance_app.* TO 'harvest_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Opção B: TiDB Cloud (Produção)

1. Crie conta em https://tidbcloud.com/
2. Crie um cluster Serverless (gratuito)
3. Copie a connection string

### Passo 3: Configurar Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto (veja `ENV_TEMPLATE.md` para detalhes):

```env
DATABASE_URL=mysql://harvest_user:sua_senha@localhost:3306/harvest_maintenance_app
EXPO_PORT=8081
PORT=3000
OAUTH_SERVER_URL=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
```

### Passo 4: Executar Migrations

```bash
# Gera e executa migrations do banco de dados
pnpm db:push
```

### Passo 5: Iniciar Servidor

```bash
# Inicia backend (porta 3000) e Metro bundler (porta 8081)
pnpm dev
```

### Passo 6: Testar no Celular

1. Abra o **Expo Go** no celular
2. Escaneie o QR Code que aparece no terminal
3. Aguarde o app carregar

**Importante**: Celular e computador devem estar na **mesma rede Wi-Fi**.

---

## ⚙️ Configuração

### Configuração de Email (Opcional)

Para envio automático de relatórios por email, configure SMTP no `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=senha-de-app-do-gmail
```

**Como gerar senha de app do Gmail:**
1. Acesse https://myaccount.google.com/security
2. Ative "Verificação em duas etapas"
3. Vá em "Senhas de app" → "Mail"
4. Copie a senha gerada

### Configuração de WhatsApp (Opcional)

Para envio de relatórios via WhatsApp, configure Twilio no `.env`:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Como configurar Twilio:**
1. Crie conta em https://www.twilio.com/
2. Acesse Console → Account SID e Auth Token
3. Configure WhatsApp Sandbox em "Messaging > Try it out"

### Importar Máquinas Iniciais

Execute o script SQL para importar as 4 colheitadeiras:

```sql
INSERT INTO machines (id, nome, tipo, modelo, chassi, ano, hmMotorAtual, hmTrilhaAtual, intervaloTrocaOleo, intervaloRevisao50h) VALUES
('205', 'Colheitadeira 205', 'Colheitadeira', 'STS 9670', '1CQ9670AVA0090326', 2011, 0, 0, 250, 50),
('206', 'Colheitadeira 206', 'Colheitadeira', 'STS 9570', '1CQ9570AJC0091236', 2012, 0, 0, 250, 50),
('211', 'Colheitadeira 211', 'Colheitadeira', 'STS 9770', '1CQ9770AKD0091909', 2013, 0, 0, 250, 50),
('214', 'Colheitadeira 214', 'Colheitadeira', 'STS 9770', '1CQ9770AAC0091560', 2012, 0, 0, 250, 50);
```

---

## 🚀 Uso

### Fluxo de Trabalho Diário

1. **Abrir App**: Tela Home mostra resumo do dia (máquinas ativas, horas produtivas)
2. **Novo Lançamento**: Aba "Lançamento" → Selecionar máquina
3. **Preencher Dados**: Sistema pré-preenche horímetros, operador e fazenda
4. **Validação Automática**: Sistema valida horímetros e calcula horas trabalhadas
5. **Salvar**: Botão "Salvar e Novo" para múltiplos lançamentos
6. **Sincronização**: Dados sincronizam automaticamente quando online

### Registro de Manutenção

1. **Aba Manutenção**: Ver histórico de manutenções
2. **Botão "+"**: Nova manutenção
3. **Preencher Formulário**: Tipo, data, horímetro, tempo parado
4. **Adicionar Peças**: Lista dinâmica com cálculo de valor total
5. **Salvar**: Manutenção vinculada à máquina

### Geração de Relatórios

1. **Aba Relatórios**: Selecionar tipo (diário, máquina, operador, manutenções)
2. **Filtrar Período**: Semana, mês, safra, ou personalizado
3. **Visualizar Dados**: Métricas e estatísticas
4. **Exportar**: Botões "PDF" ou "CSV"
5. **Compartilhar**: WhatsApp, email, ou salvar localmente

---

## 📁 Estrutura do Projeto

```
harvest_maintenance_app/
├── app/                          # Frontend (Expo Router)
│   ├── (tabs)/                   # Navegação por abas
│   │   ├── index.tsx             # Home (resumo do dia)
│   │   ├── lancamento.tsx        # Lançamento rápido
│   │   ├── registros.tsx         # Histórico de lançamentos
│   │   ├── manutencao.tsx        # Gestão de manutenções
│   │   ├── relatorios.tsx        # Relatórios e exportação
│   │   └── configuracoes.tsx     # Configurações gerais
│   ├── _layout.tsx               # Layout raiz com providers
│   └── oauth/                    # Callbacks de autenticação
├── components/                   # Componentes reutilizáveis
│   ├── screen-container.tsx      # Container com SafeArea
│   ├── sync-indicator.tsx        # Indicador de sincronização
│   └── ui/                       # Componentes de UI
├── hooks/                        # Custom hooks
│   ├── use-sync.ts               # Hook de sincronização offline
│   ├── use-colors.ts             # Hook de tema
│   └── use-auth.ts               # Hook de autenticação
├── lib/                          # Bibliotecas e utilitários
│   ├── sqlite.ts                 # Camada de dados SQLite
│   ├── trpc.ts                   # Cliente tRPC
│   └── utils.ts                  # Funções auxiliares
├── server/                       # Backend (tRPC + Express)
│   ├── _core/                    # Núcleo do servidor
│   │   ├── index.ts              # Entry point
│   │   ├── context.ts            # Contexto tRPC
│   │   └── oauth.ts              # Rotas OAuth
│   ├── routers/                  # Routers tRPC
│   │   ├── index.ts              # Router principal
│   │   ├── machines.ts           # CRUD de máquinas
│   │   ├── daily-logs.ts         # CRUD de lançamentos
│   │   ├── maintenance.ts        # CRUD de manutenções
│   │   └── reports.ts            # Geração de relatórios
│   ├── db/                       # Drizzle ORM
│   │   ├── index.ts              # Conexão MySQL
│   │   └── schema.ts             # Schemas das tabelas
│   ├── email.ts                  # Serviço de email
│   ├── whatsapp.ts               # Serviço de WhatsApp
│   └── pdf.ts                    # Geração de PDFs
├── assets/                       # Imagens e ícones
├── docs/                         # Documentação Expo SDK
├── .env                          # Variáveis de ambiente (não commitar)
├── ENV_TEMPLATE.md               # Template de configuração
├── package.json                  # Dependências
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.js            # Configuração Tailwind
├── theme.config.js               # Paleta de cores
└── README_COMPLETO.md            # Este arquivo
```

---

## 🗄️ Banco de Dados

### Schema Principal

#### Tabela: `machines`

Armazena informações das máquinas agrícolas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | ID único da máquina (ex: "205") |
| `nome` | VARCHAR(255) | Nome personalizado |
| `tipo` | ENUM | Colheitadeira, Plataforma, Trator, Pulverizador |
| `modelo` | VARCHAR(100) | Modelo (ex: "STS 9770") |
| `chassi` | VARCHAR(100) | Número do chassi |
| `ano` | INT | Ano de fabricação |
| `fabricante` | VARCHAR(100) | Fabricante (ex: "John Deere") |
| `hmMotorAtual` | DECIMAL(10,2) | Horímetro motor atual |
| `hmTrilhaAtual` | DECIMAL(10,2) | Horímetro trilha atual |
| `intervaloTrocaOleo` | INT | Intervalo de troca de óleo (horas) |
| `intervaloRevisao50h` | INT | Intervalo de revisão (horas) |
| `implementoAgregadoId` | VARCHAR(50) | ID de implemento vinculado |
| `deleted` | BOOLEAN | Soft delete |

#### Tabela: `daily_logs`

Registros diários de operação.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `maquinaId` | VARCHAR(50) | FK para `machines` |
| `data` | DATE | Data do lançamento |
| `fazenda` | VARCHAR(255) | Nome da fazenda |
| `talhao` | VARCHAR(255) | Talhão trabalhado |
| `operador` | VARCHAR(255) | Nome do operador |
| `horaSaidaProgramada` | TIME | Horário programado |
| `horaSaidaReal` | TIME | Horário real de saída |
| `horaChegada` | TIME | Horário de chegada |
| `hmMotorInicial` | DECIMAL(10,2) | Horímetro motor inicial |
| `hmMotorFinal` | DECIMAL(10,2) | Horímetro motor final |
| `hmTrilhaInicial` | DECIMAL(10,2) | Horímetro trilha inicial |
| `hmTrilhaFinal` | DECIMAL(10,2) | Horímetro trilha final |
| `horasProd` | DECIMAL(5,2) | Horas produtivas |
| `horasMan` | DECIMAL(5,2) | Horas de manutenção |
| `horasChuva` | DECIMAL(5,2) | Horas paradas por chuva |
| `horasDesloc` | DECIMAL(5,2) | Horas de deslocamento |
| `horasEspera` | DECIMAL(5,2) | Horas de espera |
| `abasteceu` | BOOLEAN | Se abasteceu |
| `area` | DECIMAL(10,2) | Área colhida (ha) |

#### Tabela: `maintenance`

Registros de manutenções.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `maquinaId` | VARCHAR(50) | FK para `machines` |
| `data` | DATE | Data da manutenção |
| `tipo` | ENUM | Preventiva, Corretiva |
| `horimetro` | DECIMAL(10,2) | Horímetro no momento |
| `tempoParado` | DECIMAL(5,2) | Tempo parado (horas) |
| `trocouOleo` | BOOLEAN | Se trocou óleo |
| `revisao50h` | BOOLEAN | Se fez revisão 50h |
| `observacoes` | TEXT | Observações |

#### Tabela: `maintenance_parts`

Peças utilizadas em manutenções.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `maintenanceId` | VARCHAR(50) | FK para `maintenance` |
| `nome` | VARCHAR(255) | Nome da peça |
| `quantidade` | INT | Quantidade |
| `valorUnitario` | DECIMAL(10,2) | Valor unitário |
| `valorTotal` | DECIMAL(10,2) | Valor total (calculado) |

#### Tabela: `farms`

Fazendas cadastradas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `nome` | VARCHAR(255) | Nome da fazenda |
| `deleted` | BOOLEAN | Soft delete |

#### Tabela: `fields`

Talhões vinculados a fazendas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `fazendaId` | VARCHAR(50) | FK para `farms` |
| `nome` | VARCHAR(255) | Nome do talhão |
| `areaHa` | DECIMAL(10,2) | Área em hectares |
| `cultura` | VARCHAR(100) | Cultura plantada |
| `deleted` | BOOLEAN | Soft delete |

#### Tabela: `operators`

Operadores cadastrados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | VARCHAR(50) | UUID único |
| `nome` | VARCHAR(255) | Nome do operador |
| `deleted` | BOOLEAN | Soft delete |

### Schema SQLite Local (Offline)

#### Tabela: `sync_queue`

Fila de sincronização offline.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | ID autoincremental |
| `entity_type` | TEXT | Tipo da entidade (daily_log, maintenance) |
| `entity_id` | TEXT | ID da entidade |
| `payload_json` | TEXT | Dados JSON para sincronizar |
| `status` | TEXT | pending, syncing, synced, error |
| `attempts` | INTEGER | Número de tentativas |
| `last_error` | TEXT | Última mensagem de erro |
| `last_attempt_at` | INTEGER | Timestamp da última tentativa |
| `updated_at` | INTEGER | Timestamp de atualização |

**Índice único**: `(entity_type, entity_id)` para evitar duplicados.

#### Tabela: `daily_logs_local`

Espelho local de lançamentos diários.

Mesma estrutura de `daily_logs` + campo `synced` (0 ou 1).

#### Tabela: `maintenance_local`

Espelho local de manutenções.

Mesma estrutura de `maintenance` + campo `synced` (0 ou 1).

---

## 🌐 Sistema Offline

### Arquitetura de Sincronização

O sistema offline é implementado em três camadas:

1. **Camada de Dados (lib/sqlite.ts)**: Gerencia SQLite local com funções UPSERT, retry, e limpeza
2. **Camada de Lógica (hooks/use-sync.ts)**: Hook React que monitora conectividade e sincroniza automaticamente
3. **Camada de UI (components/sync-indicator.tsx)**: Componente visual que exibe status e permite ações manuais

### Fluxo de Salvamento Offline

```typescript
// 1. Usuário salva lançamento offline
await saveDailyLogLocal({
  id: uuid(),
  maquinaId: "205",
  data: "2026-02-10",
  // ... outros campos
});

// 2. Sistema salva em daily_logs_local + sync_queue
await db.runAsync(
  'INSERT INTO daily_logs_local (...) VALUES (...)',
  [...]
);
await addToSyncQueue('daily_log', id, payload);

// 3. Hook useSync detecta conexão e sincroniza
const { isOnline, isSyncing, pendingCount, errorCount } = useSync();

// 4. Ao sincronizar, envia para servidor via tRPC
await trpc.dailyLogs.create.mutate(payload);

// 5. Marca como sincronizado
await markAsSynced(queueItem.id);
await db.runAsync(
  'UPDATE daily_logs_local SET synced = 1 WHERE id = ?',
  [id]
);
```

### Resolução de Conflitos

O sistema usa estratégia **last_write_wins**: a última atualização sempre vence. Não há merge de campos individuais.

```typescript
// Servidor recebe payload com timestamp
const existingRecord = await db.query.dailyLogs.findFirst({
  where: eq(schema.dailyLogs.id, payload.id)
});

if (existingRecord) {
  // Atualiza registro existente (last write wins)
  await db.update(schema.dailyLogs)
    .set(payload)
    .where(eq(schema.dailyLogs.id, payload.id));
} else {
  // Cria novo registro
  await db.insert(schema.dailyLogs).values(payload);
}
```

### Retry Inteligente

O sistema tenta sincronizar itens com erro até 5 vezes, com cooldown de 30 segundos entre tentativas:

```typescript
// Hook useSync executa a cada 30s
useEffect(() => {
  const interval = setInterval(async () => {
    if (isOnline && (pendingCount > 0 || errorCount > 0)) {
      await syncPendingItems();
    }
  }, 30000); // 30 segundos

  return () => clearInterval(interval);
}, [isOnline, pendingCount, errorCount]);

// Função de sincronização com retry
async function syncPendingItems() {
  const items = await getPendingSyncItems(); // attempts < 5 e cooldown passado
  
  for (const item of items) {
    try {
      await sendToServer(item);
      await markAsSynced(item.id);
    } catch (error) {
      await markAsError(item.id, error.message);
    }
  }
}
```

### Limpeza Automática

Itens sincronizados há mais de 7 dias são removidos automaticamente:

```typescript
await db.runAsync(
  'DELETE FROM sync_queue WHERE status = "synced" AND updated_at < ?',
  [Date.now() - 7 * 24 * 60 * 60 * 1000]
);
```

---

## 📊 Relatórios e Exportação

### Tipos de Relatórios

#### 1. Relatório Diário Consolidado

Resumo de todas as máquinas em um período:

- Total de horas produtivas
- Total de área colhida (ha)
- Número de máquinas ativas
- Horas de parada (manutenção, chuva, espera)
- Lista de lançamentos por máquina

#### 2. Relatório por Máquina

Análise detalhada de uma máquina:

- Horas trabalhadas (motor e trilha)
- Área colhida total
- Produtividade média (ha/h)
- Manutenções realizadas
- Custos de manutenção
- Próxima manutenção prevista

#### 3. Relatório por Operador

Ranking de performance dos operadores:

- Horas trabalhadas
- Área colhida
- Produtividade média
- Máquinas operadas
- Número de lançamentos

#### 4. Relatório de Manutenções

Análise de custos e tempo de parada:

- Custo total de manutenções
- Tempo total de parada
- Peças mais utilizadas
- Manutenções por tipo (preventiva/corretiva)
- Histórico completo

### Exportação PDF

Os PDFs são gerados com **jsPDF** e incluem:

- Logo John Deere no cabeçalho
- Título e período do relatório
- Tabelas formatadas com dados
- Gráficos (se aplicável)
- Rodapé com data de geração

```typescript
import jsPDF from 'jspdf';

export function generateDailyReportPDF(data: DailyReport) {
  const doc = new jsPDF();
  
  // Cabeçalho com logo
  doc.addImage(logoBase64, 'PNG', 10, 10, 30, 15);
  doc.setFontSize(18);
  doc.text('Relatório Diário de Colheita', 50, 20);
  
  // Dados
  doc.setFontSize(12);
  doc.text(`Período: ${data.startDate} a ${data.endDate}`, 10, 40);
  doc.text(`Total de Horas Produtivas: ${data.totalHours}h`, 10, 50);
  
  // Tabela de lançamentos
  doc.autoTable({
    startY: 60,
    head: [['Máquina', 'Operador', 'Horas', 'Área (ha)']],
    body: data.logs.map(log => [
      log.machine,
      log.operator,
      log.hours,
      log.area
    ])
  });
  
  // Salvar
  doc.save('relatorio-diario.pdf');
}
```

### Exportação CSV

Os CSVs são gerados com separador `;` (ponto-e-vírgula) para compatibilidade com Excel brasileiro:

```typescript
export function generateCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]).join(';');
  const rows = data.map(row => 
    Object.values(row).join(';')
  ).join('\n');
  
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
```

### Envio Automático

O sistema agenda envio automático de relatórios usando cron jobs:

```typescript
import cron from 'node-cron';

// Envio diário às 18h
cron.schedule('0 18 * * *', async () => {
  const report = await generateDailyReport();
  const pdf = await generatePDF(report);
  
  // Enviar por email
  await sendEmail({
    to: process.env.REPORT_EMAIL,
    subject: `Relatório Diário - ${new Date().toLocaleDateString()}`,
    html: renderEmailTemplate(report),
    attachments: [{ filename: 'relatorio.pdf', content: pdf }]
  });
  
  // Enviar por WhatsApp
  await sendWhatsApp({
    to: process.env.REPORT_WHATSAPP,
    body: `Relatório diário gerado! Total: ${report.totalHours}h`,
    mediaUrl: uploadPDF(pdf)
  });
});
```

---

## 🚀 Deploy

### Deploy do Backend (Produção)

#### Opção 1: Railway

1. Crie conta em https://railway.app/
2. Conecte repositório GitHub
3. Configure variáveis de ambiente
4. Deploy automático a cada push

#### Opção 2: Heroku

```bash
# Instale Heroku CLI
npm install -g heroku

# Login
heroku login

# Crie app
heroku create harvest-maintenance-api

# Configure variáveis
heroku config:set DATABASE_URL=mysql://...
heroku config:set SMTP_HOST=smtp.gmail.com
heroku config:set SMTP_USER=...
heroku config:set SMTP_PASS=...

# Deploy
git push heroku main
```

#### Opção 3: VPS (DigitalOcean, AWS, etc)

```bash
# Conecte via SSH
ssh root@seu-servidor.com

# Clone repositório
git clone https://github.com/seu-usuario/harvest-maintenance-app.git
cd harvest-maintenance-app

# Instale dependências
pnpm install

# Configure .env
nano .env

# Build
pnpm build

# Inicie com PM2
npm install -g pm2
pm2 start dist/index.js --name harvest-api
pm2 save
pm2 startup
```

### Deploy do Mobile (APK Android)

#### Usando EAS Build (Recomendado)

```bash
# Instale EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK
eas build --platform android --profile preview

# Baixe APK
# Link aparece no terminal após build
```

#### Build Local (Alternativo)

```bash
# Instale Android Studio e SDK
# Configure ANDROID_HOME

# Build APK
npx expo run:android --variant release

# APK gerado em:
# android/app/build/outputs/apk/release/app-release.apk
```

### Atualização do App (OTA)

Expo permite atualizações over-the-air sem rebuild:

```bash
# Publique atualização
eas update --branch production --message "Correção de bugs"

# Usuários recebem atualização automaticamente
```

---

## 🐛 Troubleshooting

### Problema: Erro "OAUTH_SERVER_URL is not configured"

**Solução**: Comente a linha de OAuth no servidor:

```typescript
// server/_core/index.ts
// registerOAuthRoutes(app); // Comentar para dev local
```

### Problema: Erro "Unable to resolve module ./wa-sqlite/wa-sqlite.wasm"

**Causa**: expo-sqlite tenta carregar WASM na versão web.

**Solução**: Este erro **não afeta** o funcionamento no celular. Para eliminar na web, desabilite SQLite:

```typescript
// lib/sqlite.ts
import { Platform } from 'react-native';

export async function initDatabase() {
  if (Platform.OS === 'web') {
    console.log('SQLite desabilitado na web');
    return;
  }
  // ... resto do código
}
```

### Problema: App não conecta ao servidor

**Verificações**:

1. Celular e computador na mesma rede Wi-Fi?
2. Firewall bloqueando porta 8081?
3. URL do servidor correta no Expo Go?

**Solução**: Use túnel ngrok:

```bash
# Instale ngrok
npm install -g ngrok

# Crie túnel
ngrok http 8081

# Use URL gerada no Expo Go
```

### Problema: Dados não sincronizam

**Verificações**:

1. App está online? (Verifique SyncIndicator)
2. Servidor backend rodando?
3. Erros no console do servidor?

**Solução**: Force sincronização manual:

1. Toque no SyncIndicator
2. Selecione "Re-tentar Falhas"
3. Verifique logs no servidor

### Problema: MySQL "Access denied"

**Solução**: Verifique permissões do usuário:

```sql
GRANT ALL PRIVILEGES ON harvest_maintenance_app.* TO 'harvest_user'@'localhost';
FLUSH PRIVILEGES;
```

### Problema: Migrations não executam

**Solução**: Execute manualmente:

```bash
# Gere migrations
pnpm drizzle-kit generate

# Execute migrations
pnpm drizzle-kit migrate
```

### Problema: Email não envia

**Verificações**:

1. Credenciais SMTP corretas?
2. Senha de app do Gmail configurada?
3. Porta 587 aberta?

**Solução**: Teste com Ethereal (email fake):

```typescript
// server/email.ts
// Sistema usa Ethereal automaticamente se SMTP_HOST não configurado
const testAccount = await nodemailer.createTestAccount();
console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
```

### Problema: WhatsApp não envia

**Verificações**:

1. Twilio configurado corretamente?
2. WhatsApp Sandbox ativado?
3. Número de destino no formato correto? (`whatsapp:+5511999999999`)

**Solução**: Teste com Twilio Console:

1. Acesse https://console.twilio.com/
2. Vá em "Messaging > Try it out > Send a WhatsApp message"
3. Envie mensagem de teste

---

## 📝 Notas Finais

Este projeto foi desenvolvido para atender necessidades específicas de controle de colheita terceirizada, com foco em **robustez offline**, **validações rigorosas** e **facilidade de uso** em campo. O sistema está pronto para produção e pode ser expandido com novas funcionalidades conforme demanda.

### Possíveis Melhorias Futuras

- **Dashboard com gráficos**: Visualizações de produtividade, custos, e tendências
- **Modo escuro**: Alternativa visual para uso noturno
- **Notificações push**: Alertas de manutenção preventiva
- **Histórico de alterações**: Audit log de todas as operações
- **Backup automático**: Exportação periódica para cloud storage
- **Comparação de períodos**: Análise mês atual vs anterior
- **Integração com sensores IoT**: Telemetria em tempo real das máquinas
- **Previsão de manutenção**: Machine learning para prever falhas

### Suporte

Para dúvidas, sugestões ou reportar bugs, entre em contato ou abra uma issue no repositório.

---

**Desenvolvido com ❤️ para otimizar operações agrícolas**

*Última atualização: Fevereiro 2026*
