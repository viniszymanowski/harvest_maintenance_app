# Design do Aplicativo de Controle de Colheita e Manutenção

## Visão Geral

Aplicativo mobile-first para controle diário de colheita terceirizada e manutenção de 4 máquinas (M1, M2, M3, M4), com foco em registro rápido de horas de motor, horas de trilha, controle de troca de óleo e revisão 50h.

## Orientação e Usabilidade

- **Orientação**: Retrato (9:16) exclusivamente
- **Uso**: Otimizado para operação com uma mão
- **Contexto**: Operadores em campo precisam lançar dados rapidamente, com poucos cliques

## Paleta de Cores

- **Primary**: `#10B981` (Verde agricultura) - Botões principais, destaque
- **Background**: `#FFFFFF` (light) / `#151718` (dark)
- **Surface**: `#F5F5F5` (light) / `#1E2022` (dark) - Cards e superfícies elevadas
- **Foreground**: `#11181C` (light) / `#ECEDEE` (dark) - Texto principal
- **Muted**: `#687076` (light) / `#9BA1A6` (dark) - Texto secundário
- **Border**: `#E5E7EB` (light) / `#334155` (dark)
- **Success**: `#22C55E` (light) / `#4ADE80` (dark) - Indicadores positivos
- **Warning**: `#F59E0B` (light) / `#FBBF24` (dark) - Alertas e divergências
- **Error**: `#EF4444` (light) / `#F87171` (dark) - Erros e validações

## Lista de Telas

### 1. Home (Tela Principal)
**Conteúdo**:
- Resumo do dia atual com 4 cards (M1, M2, M3, M4)
- Cada card mostra: status do lançamento (pendente/completo), operador, horas do motor
- Botão flutuante "+" para novo lançamento rápido
- Acesso rápido às outras seções via tab bar

**Funcionalidade**:
- Visualização rápida do status de todas as máquinas
- Navegação para lançamento rápido ou edição de registros existentes

### 2. Lançamento Rápido
**Conteúdo**:
- Formulário vertical scrollable otimizado para celular
- Seções agrupadas:
  - **Informações Básicas**: Data, Fazenda, Talhão, Máquina, Operador
  - **Horários**: Saída Programada, Saída Real, Chegada Lavoura
  - **Horímetros**: HM Motor Inicial/Final, HM Trilha Inicial/Final
  - **Horas do Dia**: Produção, Manutenção, Chuva, Deslocamento, Espera
  - **Outros**: Abasteceu (Sim/Não), Área (ha), Observações
- Cálculos em tempo real exibidos:
  - Horas Motor Dia = HM Motor Final - HM Motor Inicial
  - Horas Trilha Dia = HM Trilha Final - HM Trilha Inicial
  - Atraso (minutos) = Saída Real - Saída Programada
- Alerta visual se soma das horas do dia divergir das horas do motor (tolerância 0.5h)
- Dois botões na parte inferior: "Salvar" e "Salvar e Novo"

**Funcionalidade**:
- Entrada rápida de dados com validação em tempo real
- Feedback visual imediato sobre divergências
- Opção de lançar múltiplas máquinas sequencialmente

### 3. Registros do Dia
**Conteúdo**:
- Seletor de data no topo
- Lista de 4 cards (M1, M2, M3, M4) para a data selecionada
- Cada card exibe:
  - Operador
  - Horas Motor Dia / Horas Trilha Dia
  - Prod/Man/Chuva (resumo)
  - Área (ha)
  - Abasteceu (ícone)
  - Atraso (minutos) com cor indicativa
  - Badge "Divergente" se houver divergência
- Ações: Editar (ícone lápis) / Apagar (ícone lixeira)

**Funcionalidade**:
- Visualização consolidada dos registros diários
- Edição e exclusão de lançamentos
- Navegação por datas

### 4. Manutenção
**Conteúdo**:
- Lista de manutenções com filtros por data e máquina
- Botão "+" para nova manutenção
- Cada item da lista mostra:
  - Data, Máquina, Tipo (Preventiva/Corretiva Leve/Corretiva Pesada)
  - HM Motor no Serviço
  - Tempo Parado (h)
  - Badges: Troca de Óleo, Revisão 50h
  - Custo total de peças (se informado)
- Ao clicar, abre detalhes/edição

**Formulário de Manutenção**:
- Data, Máquina, Tipo
- HM Motor no Serviço
- Tempo Parado (h)
- Checkboxes: Troca de Óleo, Revisão 50h
- Observação (texto)
- Seção de Peças (lista dinâmica):
  - Nome da Peça, Quantidade, Valor Unitário
  - Valor Total calculado automaticamente
  - Botão "+" para adicionar peça
  - Botão "-" para remover peça

**Funcionalidade**:
- Registro de múltiplas manutenções por dia/máquina
- Controle automático de próximas trocas de óleo e revisões
- Gestão de peças utilizadas com cálculo de custos

### 5. Relatórios
**Conteúdo**:
- Seletor de período (data inicial e final)
- Duas abas: "Por Máquina" e "Por Operador"

**Aba Por Máquina**:
- Seletor de máquina (M1, M2, M3, M4)
- Cards com métricas:
  - Total Horas Motor / Horas Trilha
  - Distribuição de Horas (Prod/Man/Chuva/Desloc/Espera) com gráfico de barras
  - Total Área (ha)
  - Abastecimentos realizados
  - Manutenções (por tipo)
  - Trocas de Óleo / Revisões 50h
  - Custo Total de Peças
- Próximas manutenções previstas:
  - Próxima Troca de Óleo (HM Motor)
  - Próxima Revisão 50h (HM Motor)

**Aba Por Operador**:
- Lista de operadores com métricas:
  - Dias Trabalhados
  - Pontualidade (% de saídas no horário)
  - Média Prod (h)
  - Média Man (h)
- Ranking simples por pontualidade e produção

**Funcionalidade**:
- Análise de desempenho por máquina e operador
- Visualização de tendências e padrões
- Identificação de necessidades de manutenção

### 6. Configurações
**Conteúdo**:
- Configurações das máquinas (M1, M2, M3, M4):
  - Intervalo Troca de Óleo (horas motor) - padrão 250h
  - Intervalo Revisão 50h (horas motor) - padrão 50h
- Opção de exportar dados para CSV
- Tema (claro/escuro)

**Funcionalidade**:
- Personalização dos intervalos de manutenção por máquina
- Exportação de dados para análise externa

## Navegação (Tab Bar)

**Tabs principais** (parte inferior):
1. **Home** (ícone: house.fill) - Tela principal com resumo
2. **Lançamento** (ícone: plus.circle.fill) - Lançamento rápido
3. **Registros** (ícone: list.bullet) - Registros do dia
4. **Manutenção** (ícone: wrench.fill) - Módulo de manutenção
5. **Relatórios** (ícone: chart.bar.fill) - Relatórios e análises

## Fluxos Principais de Usuário

### Fluxo 1: Lançamento Diário Rápido
1. Usuário abre o app (Home)
2. Toca no botão "+" flutuante ou na tab "Lançamento"
3. Preenche o formulário de lançamento rápido
4. Sistema calcula e valida em tempo real
5. Usuário toca "Salvar" ou "Salvar e Novo"
6. Sistema salva e retorna à Home (ou limpa o formulário para novo lançamento)

### Fluxo 2: Visualizar e Editar Registros
1. Usuário navega para "Registros"
2. Seleciona a data desejada
3. Visualiza os cards das 4 máquinas
4. Toca em "Editar" em um card
5. Formulário abre com dados preenchidos
6. Usuário edita e salva
7. Sistema atualiza e retorna à lista de registros

### Fluxo 3: Registrar Manutenção
1. Usuário navega para "Manutenção"
2. Toca no botão "+" para nova manutenção
3. Preenche dados da manutenção
4. Marca "Troca de Óleo" ou "Revisão 50h" se aplicável
5. Adiciona peças utilizadas (opcional)
6. Sistema calcula próximas manutenções automaticamente
7. Usuário salva
8. Sistema registra e atualiza lista de manutenções

### Fluxo 4: Consultar Relatórios
1. Usuário navega para "Relatórios"
2. Define período (data inicial e final)
3. Seleciona aba "Por Máquina" ou "Por Operador"
4. Visualiza métricas e gráficos
5. Pode exportar dados para CSV se necessário

## Princípios de Design

### Hierarquia Visual
- Títulos grandes e claros (text-2xl, font-bold)
- Subtítulos médios (text-lg, font-semibold)
- Texto de corpo legível (text-base)
- Texto secundário menor (text-sm, text-muted)

### Espaçamento
- Padding generoso em cards (p-4, p-6)
- Gaps consistentes entre elementos (gap-2, gap-4, gap-6)
- Margens adequadas para respiração visual

### Feedback Visual
- Estados de press com opacity (active:opacity-80)
- Indicadores de loading durante operações assíncronas
- Badges coloridos para status (divergente, completo, pendente)
- Alertas visuais para validações e divergências

### Acessibilidade
- Contraste adequado entre texto e fundo
- Tamanhos de toque mínimos de 44x44 pixels
- Feedback tátil (haptics) em ações importantes
- Suporte a modo escuro

## Componentes Reutilizáveis

### MachineCard
Card para exibir resumo de uma máquina com status, operador, horas

### FormSection
Seção de formulário com título e campos agrupados

### TimeInput
Input otimizado para entrada de horários

### NumberInput
Input otimizado para entrada de números (horímetros, horas)

### CalculatedField
Campo somente leitura que exibe valores calculados em tempo real

### PieceListItem
Item de lista para peças de manutenção com campos editáveis

### ReportCard
Card para exibir métricas em relatórios

### DateSelector
Seletor de data com calendário

### MachineSelector
Seletor de máquina (M1, M2, M3, M4) com visual destacado

## Considerações Técnicas

- **Persistência**: SQLite local (offline-first) com sincronização opcional
- **Validações**: Realizadas tanto no frontend quanto no backend
- **Performance**: FlatList para listas longas, memoização de cálculos
- **Offline**: Fila de sincronização para quando a internet voltar
- **Export**: Geração de CSV para daily_logs, maintenance e maintenance_parts

## Notas de Implementação

- Usar `ScreenContainer` em todas as telas para SafeArea adequada
- Inputs de tempo com `returnKeyType="done"` para melhor UX mobile
- Formulários longos devem estar em `ScrollView`
- Validações em tempo real com feedback visual imediato
- Cálculos automáticos devem ser performáticos (useMemo quando necessário)
- Estados de loading claros durante operações de banco de dados
- Mensagens de erro amigáveis e acionáveis
