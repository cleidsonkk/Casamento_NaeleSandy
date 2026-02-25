# Convite Digital Interativo Ultra Luxo Premium 2026 - TODO

## Fase 1: Banco de Dados e Backend
- [x] Configurar schema Drizzle com tabelas: events, guests, gifts, payments, dietary_restrictions
- [x] Criar procedures tRPC para RSVP, presentes e pagamentos
- [x] Implementar autenticação OAuth com controle de roles (admin/user)
- [x] Criar helpers de banco de dados em server/db.ts
- [x] Implementar validações de dados no backend

## Fase 2: Página de Convite Digital
- [x] Criar página de convite com design ultra luxo (tema dourado/elegante)
- [x] Exibir informações do evento (data, local, horário, descrição)
- [x] Implementar animações elegantes e transições suaves
- [x] Adicionar tipografia sofisticada e paleta de cores premium
- [x] Responsividade mobile-first
- [x] Criar navegação para RSVP e lista de presentes

## Fase 3: Sistema de RSVP
- [x] Criar formulário de RSVP com campos: nome, WhatsApp, acompanhantes, restrições alimentares, mensagem
- [x] Validação de campos obrigatórios
- [x] Salvar RSVP no banco de dados
- [x] Redirecionamento automático para lista de presentes após RSVP
- [x] Mensagem de confirmação elegante
- [ ] Edição de RSVP existente

## Fase 4: Lista de Presentes
- [x] Criar catálogo visual de presentes com cards luxuosos
- [x] Exibir: imagem, nome, descrição, valor sugerido, status (disponível/reservado/concluído)
- [x] Sistema de seleção de presente por convidado
- [ ] Validação de reserva (1 presente por convidado, opção de cotas ilimitadas)
- [x] Atualizar status de presentes em tempo real
- [ ] Mostrar quem reservou cada presente

## Fase 5: Integração Pix
- [x] Gerar QR Code a partir da chave Pix
- [x] Exibir chave Pix formatada (celular ou aleatória)
- [x] Botão "Copiar chave" com feedback visual
- [x] Modal/página Pix com informações do presente e valor
- [x] Botão "Já fiz o Pix" para marcar como pagamento informado
- [x] Armazenar status de pagamento no banco

## Fase 6: Painel Administrativo
- [x] Criar layout com navegação por abas
- [x] Implementar sistema de login admin (OAuth)
- [x] Dashboard com cards de estatísticas: confirmações, acompanhantes, presentes, pagamentos
- [x] Aba de Convidados: tabela com filtros, ações de visualização/edição/exclusão
- [x] Aba de Presentes: tabela com gerenciamento completo
- [x] Aba de Pagamentos: tabela com filtros por status, ações de confirmação
- [x] Aba de Configurações: gerenciar chave Pix, nome recebedor, WhatsApp

## Fase 7: Gerenciamento de Convidados (Admin)
- [x] CRUD completo: adicionar, editar, remover convidados
- [ ] Visualizar detalhes de RSVP
- [ ] Filtros: por status, por data, por presente
- [ ] Exportar lista de convidados
- [ ] Visualizar restrições alimentares

## Fase 8: Gerenciamento de Presentes (Admin)
- [x] CRUD completo: adicionar, editar, remover presentes
- [ ] Upload de imagens para presentes (via URL)
- [ ] Editar valores sugeridos
- [ ] Ativar/desativar presentes
- [ ] Marcar como concluído
- [ ] Visualizar quem reservou cada presente
- [ ] Gerenciar disponibilidade e cotas

## Fase 9: Gerenciamento de Pagamentos (Admin)
- [x] Tabela de pagamentos com filtros: aguardando, informado, pago, cancelado
- [x] Confirmar pagamento manualmente
- [x] Voltar para "aguardando pagamento"
- [x] Adicionar observações internas
- [x] Histórico de confirmações
- [x] Atualizar status do presente quando pagamento confirmado

## Fase 10: Notificações ao Admin
- [x] Notificação quando novo RSVP confirmado
- [x] Notificação quando presente reservado
- [x] Notificação quando pagamento informado (aguardando confirmação)
- [x] Notificação quando pagamento confirmado
- [x] Integração com notifyOwner() do Manus

## Fase 11: Notificações por Email
- [ ] Configurar envio de email ao proprietário (via notifyOwner)
- [ ] Email ao confirmar novo RSVP
- [ ] Email ao reservar presente
- [ ] Email ao informar pagamento Pix
- [ ] Email ao confirmar pagamento
- [ ] Template de emails elegante e profissional

## Fase 12: Design Ultra Luxo Premium
- [x] Aplicar paleta de cores: dourado (OKLCH), branco, preto, cinza sofisticado
- [x] Tipografia sofisticada: fontes elegantes (Playfair Display, Montserrat)
- [x] Sombras difusas e bordas arredondadas (18-22px)
- [x] Espaçamento amplo e generoso
- [x] Animações suaves: fade-in, slide-in, hover effects
- [x] Botões dourados com efeito acetinado
- [x] Cards com sombra difusa
- [x] Microinterações elegantes
- [x] Feedback visual para ações (copiar chave, confirmar, etc)

## Fase 13: Testes e Validação
- [ ] Testar fluxo completo de convidado: convite → RSVP → presente → Pix
- [ ] Testar painel admin: login, gerenciamento de dados, confirmações
- [ ] Validar responsividade em mobile/tablet/desktop
- [ ] Testar notificações (Manus + email)
- [ ] Verificar segurança: autenticação, autorização, validações
- [ ] Testar performance e carregamento
- [x] Vitest: 12 testes passando para procedures críticas
- [ ] Criar checkpoint final

## Fase 14: Entrega
- [ ] Documentação de uso
- [ ] Instruções de configuração para novo evento
- [ ] Validação com usuário
- [ ] Deploy e publicação


## Fase 14: Correções e Melhorias Finais
- [x] Corrigir erro de query event.get (undefined)
- [x] Adicionar imports faltantes (useState, useEffect)
- [x] Validar testes vitest (12 testes passando)
- [x] Implementar edição de RSVP existente (buscar por WhatsApp)
- [x] Adicionar validação de limite de presentes por convidado
- [x] Melhorar tratamento de erros no frontend
- [x] Adicionar confirmação de email ao proprietário via notifyOwner
- [ ] Testar fluxo completo: convite → RSVP → presentes → Pix
