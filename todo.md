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

## Implementação - Tela de Manutenção
- [x] Criar lista de manutenções com cards informativos
- [x] Adicionar filtro por máquina
- [ ] Adicionar filtro por período (data inicial e final)
- [x] Criar modal de nova manutenção
- [x] Implementar seletor de máquina
- [x] Implementar campos de data, tipo, horímetro, tempo parado
- [x] Adicionar checkboxes para troca de óleo e revisão 50h
- [x] Criar lista dinâmica de peças com botões +/-
- [x] Implementar cálculo automático de valor total das peças
- [x] Adicionar campo de observações
- [x] Integrar com API para salvar manutenção e peças
- [ ] Exibir próximas manutenções previstas

## Integração e Melhorias Finais
- [x] Adicionar campos de edição de intervalos de manutenção na tela de Configurações
- [x] Implementar atualização de intervalos de troca de óleo
- [x] Implementar atualização de intervalos de revisão 50h
- [x] Integrar cálculo de próxima manutenção com horímetro dos lançamentos diários
- [x] Exibir indicador de próxima manutenção na tela Home
- [x] Testar fluxo completo: lançamento → atualização horímetro → cálculo próxima manutenção
- [x] Testar edição de intervalos e recálculo automático
- [x] Validar consistência de dados entre todos os módulos

## Sistema de Relatórios
- [x] Criar funções de agregação de dados para relatórios
- [x] Implementar relatório diário consolidado (resumo de todas as máquinas)
- [x] Implementar relatório por máquina (produtividade, horas, manutenções)
- [x] Implementar relatório por operador (ranking, performance)
- [x] Implementar relatório de manutenções (custos, peças, tempo parado)
- [x] Criar função de exportação CSV

## Envio Automático de Email
- [x] Configurar serviço de envio de email no backend
- [x] Criar template HTML de relatório diário
- [x] Implementar agendamento automático (cron job) para envio diário
- [x] Adicionar configuração de email do destinatário
- [ ] Testar envio automático de relatório

## Tela de Relatórios
- [x] Criar interface de seleção de tipo de relatório
- [x] Implementar filtros (período, máquina, operador)
- [x] Exibir métricas principais (cards com totais)
- [ ] Criar visualizações de dados (gráficos)
- [x] Adicionar botão de exportação CSV
- [ ] Adicionar botão de envio manual por email

## Funcionalidades Extras
- [x] Implementar edição de lançamentos diários
- [ ] Adicionar dashboard com gráficos de produtividade
- [ ] Implementar filtros avançados em todas as telas
- [ ] Adicionar histórico de alterações (audit log)
- [ ] Implementar backup automático de dados
- [ ] Adicionar modo offline com sincronização
- [ ] Criar sistema de notificações push para alertas
- [ ] Implementar comparação de períodos (mês atual vs anterior)

## Tema John Deere
- [x] Atualizar paleta de cores para verde e amarelo John Deere
- [x] Redesenhar logo com identidade John Deere
- [x] Atualizar ícones e elementos visuais
- [x] Ajustar contraste e acessibilidade das cores

## Melhorias de Software
- [x] Adicionar validação de formulários com feedback visual
- [x] Implementar loading states em todas as operações
- [x] Adicionar animações suaves de transição
- [ ] Otimizar queries do banco de dados
- [ ] Implementar cache local de dados frequentes
- [ ] Adicionar modo escuro (opcional)
- [ ] Melhorar feedback de erros com mensagens claras
- [ ] Adicionar confirmações antes de ações destrutivas
- [ ] Implementar busca/filtro em listas longas
- [ ] Adicionar indicadores de progresso em uploads

## Configuração de Email e WhatsApp
- [x] Criar schema de configurações no banco de dados
- [x] Criar tela de Configurações de Notificações
- [x] Adicionar formulário de cadastro de email
- [x] Adicionar toggle para ativar/desativar envio automático
- [x] Adicionar seletor de horário de envio
- [x] Adicionar formulário de cadastro de número WhatsApp
- [x] Adicionar toggle para ativar/desativar WhatsApp
- [ ] Implementar botão de teste de envio

## Exportação PDF
- [x] Instalar biblioteca de geração de PDF (jsPDF ou PDFKit)
- [x] Criar template de relatório em PDF
- [x] Adicionar logo John Deere no cabeçalho do PDF
- [x] Implementar exportação de relatório diário em PDF
- [x] Implementar exportação de relatório de operadores em PDF
- [x] Implementar exportação de relatório de manutenções em PDF
- [ ] Adicionar anexo PDF no email automático

## Integração WhatsApp
- [ ] Escolher método de integração (Twilio ou Baileys)
- [ ] Configurar credenciais da API
- [ ] Implementar envio de mensagem via WhatsApp
- [ ] Implementar envio de PDF via WhatsApp
- [ ] Adicionar agendamento automático para WhatsApp
- [ ] Testar envio automático

## Botão de Teste de Envio
- [x] Criar rota API para envio de teste de relatório
- [x] Atualizar serviço de email para suportar envio manual
- [x] Adicionar botão "Enviar Teste" na tela de Notificações
- [x] Implementar feedback visual de sucesso/erro
- [x] Testar envio de email com PDF anexado

## Correção de Envio de Email
- [x] Corrigir implementação do serviço de email (remover chamada HTTP incorreta)
- [x] Configurar Nodemailer corretamente
- [x] Testar envio de email de teste

## Configuração SMTP Personalizável
- [x] Adicionar variáveis de ambiente SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- [x] Atualizar server/email.ts para usar variáveis de ambiente
- [x] Adicionar fallback para Ethereal quando variáveis não estiverem configuradas
- [x] Documentar como configurar Gmail/Outlook/SendGrid
- [x] Testar envio com credenciais reais

## Integração de PDF
- [x] Criar rota API para gerar PDF de relatório diário
- [x] Criar rota API para gerar PDF de relatório de operadores
- [x] Criar rota API para gerar PDF de relatório de manutenções
- [x] Adicionar botão "Exportar PDF" na tela de Relatórios
- [x] Implementar download de PDF no mobile
- [x] Integrar PDF como anexo nos emails automáticos
- [ ] Testar geração e visualização de PDF

## Integração WhatsApp com Twilio
- [x] Instalar biblioteca twilio
- [x] Criar serviço whatsapp.ts para envio de mensagens
- [x] Configurar variáveis de ambiente TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
- [x] Implementar função de envio de mensagem de texto
- [x] Implementar função de envio de mensagem com mídia (PDF)
- [x] Criar rota API para teste de envio WhatsApp
- [x] Adicionar botão "Enviar Teste WhatsApp" na tela de Notificações
- [x] Integrar envio automático de relatório via WhatsApp
- [x] Testar envio com credenciais reais do Twilio
- [x] Documentar processo de configuração do Twilio WhatsApp Sandbox

## Campo Horário de Saída da Lavoura
- [x] Adicionar coluna horarioSaida na tabela registros (migration)
- [x] Atualizar schema do banco de dados (db.ts)
- [x] Adicionar campo "Horário de Saída" no formulário de lançamento
- [x] Exibir horário de saída na lista de registros
- [x] Incluir horário de saída nos relatórios (diário, operadores)
- [x] Adicionar horário de saída na exportação CSV
- [x] Adicionar horário de saída na exportação PDF
- [x] Testar criação e edição de registros com horário de saída

## Correção de Exportação PDF de Manutenções
- [x] Investigar erro na exportação de PDF do relatório de manutenções
- [x] Corrigir função generateMaintenanceReportPDF (substituir fetch por tRPC)
- [x] Testar exportação de PDF de manutenções

## Upload para GitHub
- [ ] Configurar repositório Git local
- [ ] Criar repositório no GitHub
- [ ] Fazer commit de todos os arquivos
- [ ] Fazer push para GitHub
- [ ] Entregar URL do repositório
