# Project TODO

## Backend - Database Schema
- [x] Criar tabela machines (M1, M2, M3, M4) com intervalos de manutenção
- [x] Criar tabela daily_logs com todos os campos de lançamento
- [x] Criar tabela maintenance com controle de óleo e revisão 50h
- [x] Criar tabela maintenance_parts para peças utilizadas
- [x] Executar migrations no banco de dados

## Backend - API Routes
- [x] Implementar rotas CRUD para daily_logs
- [x] Implementar rotas CRUD para maintenance
- [x] Implementar rotas CRUD para maintenance_parts
- [x] Implementar rota GET /daily-logs?date=YYYY-MM-DD
- [x] Implementar rota GET /maintenance com filtros de máquina e período
- [x] Implementar rotas de relatórios por máquina
- [x] Implementar rotas de relatórios por operador
- [x] Implementar rotas para configuração de máquinas
- [x] Adicionar validações e cálculos automáticos (horas_motor_dia, atraso_min, divergente)

## Frontend - Navegação e Estrutura
- [x] Configurar tab bar com 5 tabs (Home, Lançamento, Registros, Manutenção, Relatórios)
- [x] Adicionar mapeamento de ícones em icon-symbol.tsx
- [x] Atualizar paleta de cores no theme.config.js

## Frontend - Tela Home
- [x] Criar componente MachineCard para exibir resumo de máquina
- [x] Implementar tela Home com 4 cards (M1, M2, M3, M4)
- [x] Adicionar botão flutuante "+" para novo lançamento
- [x] Integrar com API para buscar dados do dia atual

## Frontend - Lançamento Rápido
- [x] Criar formulário vertical de lançamento rápido
- [x] Implementar inputs para informações básicas (data, fazenda, talhão, máquina, operador)
- [x] Implementar inputs para horários (saída programada, real, chegada)
- [x] Implementar inputs para horímetros (motor e trilha inicial/final)
- [x] Implementar inputs para horas do dia (prod, man, chuva, desloc, espera)
- [x] Implementar toggle abasteceu e input área (ha)
- [x] Adicionar cálculos em tempo real (horas_motor_dia, horas_trilha_dia, atraso_min)
- [x] Adicionar validação de divergência com alerta visual
- [x] Implementar botões "Salvar" e "Salvar e Novo"
- [x] Integrar com API para salvar dados

## Frontend - Registros do Dia
- [x] Criar seletor de data
- [x] Implementar lista de 4 cards com dados do dia selecionado
- [x] Adicionar ações de editar e apagar em cada card
- [ ] Implementar navegação para edição de registro
- [x] Integrar com API para buscar, editar e deletar registros

## Frontend - Manutenção
- [ ] Criar lista de manutenções com filtros
- [ ] Implementar botão "+" para nova manutenção
- [ ] Criar formulário de manutenção com todos os campos
- [ ] Implementar checkboxes para troca de óleo e revisão 50h
- [ ] Criar lista dinâmica de peças com cálculo automático de valor total
- [ ] Adicionar botões "+" e "-" para adicionar/remover peças
- [ ] Implementar cálculo automático de próximas manutenções
- [ ] Integrar com API para CRUD de manutenções e peças

## Frontend - Relatórios
- [ ] Criar seletor de período (data inicial e final)
- [ ] Implementar aba "Por Máquina" com métricas e gráficos
- [ ] Implementar aba "Por Operador" com ranking
- [ ] Adicionar visualização de próximas manutenções previstas
- [ ] Integrar com API para buscar dados de relatórios

## Frontend - Configurações
- [ ] Criar tela de configurações de máquinas
- [ ] Implementar edição de intervalos de troca de óleo e revisão 50h
- [ ] Adicionar opção de exportar dados para CSV
- [ ] Integrar com API para salvar configurações

## Funcionalidades Adicionais
- [ ] Implementar exportação CSV (daily_logs, maintenance, maintenance_parts)
- [x] Criar seed de dados de exemplo (M1..M4 + 1 semana de dados)
- [x] Adicionar testes básicos de validação

## Branding e Finalização
- [x] Gerar logo personalizado para o app
- [x] Atualizar app.config.ts com nome e logo
- [x] Testar fluxos completos end-to-end
- [x] Criar checkpoint final

## Correção de Build
- [x] Corrigir arquivos de ícone para resolver erro de build Android
- [x] Verificar que todos os ícones estão válidos e não vazios
- [x] Testar build novamente

## Melhorias - Gerenciamento de Máquinas
- [x] Atualizar schema machines para adicionar campo nome personalizado
- [x] Criar migration para adicionar coluna nome
- [x] Atualizar funções do banco para suportar nomes personalizados
- [x] Criar rota API para editar nome da máquina
- [x] Criar rota API para cadastrar nova máquina
- [x] Criar tela de Configurações com lista de máquinas
- [x] Adicionar formulário de edição de nome de máquina
- [x] Adicionar formulário de cadastro de nova máquina
- [x] Atualizar tela Home para exibir nomes personalizados
- [x] Testar funcionalidades de edição e cadastro
