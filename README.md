# 🚜 Harvest Maintenance App

**Sistema completo de controle de colheita e manutenção de máquinas agrícolas**

Aplicativo mobile desenvolvido com **Expo SDK 54**, **React Native**, **TypeScript**, **tRPC** e **MySQL** para gerenciar operações diárias de colheita terceirizada e manutenção preventiva de colheitadeiras John Deere.

---

## 🎯 Visão Geral

O **Harvest Maintenance App** é uma solução mobile-first para controle operacional de colheita, desenvolvido para funcionar em áreas rurais com conectividade limitada. O sistema gerencia 4 colheitadeiras John Deere com registro de horas de motor, horas de trilha, controle de troca de óleo e revisões periódicas.

### ✨ Principais Funcionalidades

- 📱 **Lançamento Rápido Diário** com validações inteligentes
- 🔧 **Gestão de Manutenções** preventivas e corretivas
- 📊 **Relatórios Completos** (diário, por máquina, por operador)
- 🌐 **Sistema Offline-First** com sincronização automática
- ⚙️ **Configurações Completas** (máquinas, operadores, fazendas, talhões)
- 📧 **Envio Automático de Relatórios** (email e WhatsApp)
- 🎨 **Tema Visual John Deere** profissional e moderno

---

## 🚀 Início Rápido

### Pré-requisitos

- **Node.js 22+**
- **pnpm 9+** (`npm install -g pnpm`)
- **MySQL 8+** ou **TiDB Cloud**
- **Expo Go** (para testar no celular)

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/viniszymanowski/harvest_maintenance_app.git
cd harvest_maintenance_app

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp ENV_TEMPLATE.md .env
# Editar .env com suas credenciais de banco de dados

# 4. Executar migrations
pnpm db:push

# 5. Popular banco com dados de exemplo (opcional)
pnpm tsx scripts/seed-direct.ts

# 6. Iniciar servidor e app
pnpm dev
```

### Testar no Celular

1. Instalar **Expo Go** no celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
2. Escanear QR Code que aparece no terminal
3. Aguardar o app carregar

**Importante**: Celular e computador devem estar na mesma rede Wi-Fi.

---

## 📦 Melhorias Implementadas

### 🎨 Novos Componentes Visuais

#### 1. **EnhancedMachineCard**
Componente moderno para exibir informações de máquinas com tema John Deere.

**Características**:
- Badge colorido com ID da máquina
- Status visual (Trabalhando/Manutenção/Parado)
- Horímetros motor e trilha
- Métricas do dia (horas, área, operador)

#### 2. **DashboardStats**
Painel de estatísticas com 4 cards informativos.

**Métricas**:
- Máquinas ativas vs total
- Horas trabalhadas hoje
- Área colhida hoje
- Alertas de manutenção

#### 3. **MaintenanceAlert**
Alertas visuais de manutenção com barra de progresso.

**Tipos de alerta**:
- Troca de óleo
- Revisão 50h
- Manutenção geral

### 📊 Dados de Exemplo

O banco de dados foi populado com:
- **3 Fazendas**: Santa Rita, Boa Esperança, São João
- **5 Talhões**: Distribuídos entre as fazendas
- **4 Operadores**: João Silva, Pedro Santos, Carlos Oliveira, José Costa

---

## 📚 Documentação

- **[RESUMO_MELHORIAS.md](./RESUMO_MELHORIAS.md)**: Resumo completo das melhorias implementadas
- **[GUIA_MELHORIAS.md](./GUIA_MELHORIAS.md)**: Guia detalhado de como usar os novos componentes
- **[MELHORIAS_IMPLEMENTADAS.md](./MELHORIAS_IMPLEMENTADAS.md)**: Lista de todas as funcionalidades
- **[README_COMPLETO.md](./README_COMPLETO.md)**: Documentação técnica completa
- **[ENV_TEMPLATE.md](./ENV_TEMPLATE.md)**: Template de variáveis de ambiente

---

## 🛠️ Tecnologias Utilizadas

### Frontend Mobile
- **Expo SDK 54** + **React Native 0.81**
- **TypeScript 5.9** (strict mode)
- **Expo Router 6** (navegação)
- **NativeWind 4** (Tailwind CSS)
- **TanStack Query** (gerenciamento de estado)

### Backend
- **tRPC 11** (API type-safe)
- **Express** (servidor HTTP)
- **Drizzle ORM** (MySQL)
- **MySQL 8 / TiDB Cloud**

### DevOps
- **pnpm** (gerenciador de pacotes)
- **tsx** (execução TypeScript)
- **Vitest** (testes)

---

## 🎯 Como Usar

### Lançamento Rápido

1. Abrir aba **"Lançamento"**
2. Selecionar máquina (M1, M2, M3, M4)
3. Preencher dados (fazenda, talhão, operador, horímetros)
4. Clicar em **"Salvar"** ou **"Salvar e Novo"**

### Registros do Dia

1. Abrir aba **"Registros"**
2. Selecionar data
3. Visualizar lançamentos do dia
4. Editar ou excluir registros

### Manutenção

1. Abrir aba **"Manutenção"**
2. Clicar em **"+"** para nova manutenção
3. Preencher dados (tipo, horímetro, peças)
4. Salvar

### Relatórios

1. Abrir aba **"Relatórios"**
2. Selecionar tipo (diário, máquina, operador)
3. Escolher período
4. Exportar em PDF ou CSV

### Configurações

1. Abrir aba **"Configurações"**
2. Gerenciar máquinas, operadores, fazendas e talhões
3. Configurar intervalos de manutenção

---

## 📱 Estrutura do Projeto

```
harvest_maintenance_app/
├── app/                    # Telas do aplicativo (Expo Router)
│   ├── (tabs)/            # Navegação por tabs
│   │   ├── index.tsx      # Home
│   │   ├── lancamento.tsx # Lançamento rápido
│   │   ├── registros.tsx  # Registros do dia
│   │   ├── manutencao.tsx # Manutenção
│   │   ├── relatorios.tsx # Relatórios
│   │   └── configuracoes.tsx # Configurações
│   └── _layout.tsx        # Layout raiz
├── components/            # Componentes reutilizáveis
│   ├── enhanced-machine-card.tsx
│   ├── dashboard-stats.tsx
│   ├── maintenance-alert.tsx
│   └── ...
├── server/                # Backend (tRPC + Express)
│   ├── routers/          # Rotas API
│   ├── services/         # Serviços (email, PDF, etc)
│   └── db.ts             # Configuração do banco
├── drizzle/              # Schema e migrations
│   ├── schema.ts         # Definição das tabelas
│   └── migrations/       # Migrations SQL
├── hooks/                # React hooks customizados
├── lib/                  # Utilitários
├── scripts/              # Scripts de automação
│   └── seed-direct.ts    # Seed do banco de dados
└── .env                  # Variáveis de ambiente
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev              # Iniciar servidor e Metro bundler
pnpm check            # Verificar TypeScript
pnpm build            # Compilar servidor
pnpm db:push          # Executar migrations

# Testes
pnpm test             # Executar testes
pnpm lint             # Lint
pnpm format           # Formatar código

# Seed
pnpm tsx scripts/seed-direct.ts  # Popular banco de dados

# Build nativo
pnpm android          # Build Android
pnpm ios              # Build iOS (apenas macOS)
```

---

## 🎨 Tema Visual

### Cores John Deere

- **Verde**: `#367C2B` (primary)
- **Amarelo**: `#FFDE00` (secondary)
- **Branco**: `#FFFFFF` (surface)
- **Cinza Claro**: `#F9FAFB` (background)

### Design System

- **Sombras suaves** para profundidade
- **Bordas arredondadas** (12-16px)
- **Espaçamento consistente** (12-20px)
- **Tipografia hierárquica** (11px a 28px)

---

## 🚀 Próximos Passos

### Curto Prazo
- [ ] Integrar novos componentes nas telas existentes
- [ ] Adicionar gráficos de produtividade
- [ ] Implementar notificações push
- [ ] Criar tutorial inicial (onboarding)

### Médio Prazo
- [ ] Dashboard analytics com KPIs
- [ ] Previsão de manutenção baseada em histórico
- [ ] Integração com IoT
- [ ] Build para Play Store e App Store

### Longo Prazo
- [ ] Multi-tenancy (múltiplas empresas)
- [ ] Machine Learning para otimização
- [ ] Integração ERP
- [ ] API pública

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Consultar documentação em `/docs`
2. Verificar logs de erro no console
3. Executar `pnpm check` para validar TypeScript
4. Reiniciar Metro bundler: `pnpm dev`

---

## 📄 Licença

Este projeto é privado e de propriedade exclusiva.

---

## 🎉 Status

✅ **Pronto para uso e desenvolvimento**

- Infraestrutura completa
- Componentes visuais modernos
- Documentação detalhada
- Código sem erros
- Banco de dados configurado

---

**Desenvolvido com ❤️ para otimizar operações de colheita agrícola**
