# EC Insurance — Operações e critérios de lançamento

Este runbook descreve procedimentos verificáveis. Ele **não** comprova que staging,
produção, backups ou integrações externas já estejam configurados.

## Inicialização e verificações

- API em memória (desenvolvimento): `npm run start:api`.
- API persistente: definir `DATABASE_URL` e `SESSION_SECRET` (mínimo de 32 bytes), então executar `npm run start:api:db`.
- Aplicar migrações somente no ambiente correto, com autorização: `npm run db:migrate`.
- Executar `npm test` e `npm run build:web` antes de solicitar o merge.
- Verificar `GET /health`: HTTP 200 com `{"status":"ok"}` indica que a sonda de banco respondeu; HTTP 503 indica indisponibilidade. A sonda **não** substitui testes de fluxos de negócio.

## Incidente: API indisponível ou erros 5xx

1. Registrar horário, ambiente, versão/commit implantado e impacto, sem copiar tokens ou dados de leads.
2. Verificar processo da API, conectividade do PostgreSQL e resultado de `GET /health`.
3. Consultar logs estruturados por `requestId`; não incluir corpo, cabeçalhos de autorização ou parâmetros pessoais em tickets.
4. Se houver regressão após implantação, interromper novas implantações e executar o rollback de aplicação descrito abaixo.
5. Se a falha envolver migração de esquema, **não** executar downgrade manual nem apagar dados. Validar compatibilidade e plano de recuperação com o responsável pelo banco.
6. Após restabelecimento, executar smoke tests de login, captação e consulta autorizada de leads; registrar causa e medidas preventivas.

## Rollback de aplicação

1. Identificar o último commit/release previamente validado.
2. Confirmar se a versão anterior é compatível com o esquema atual do banco.
3. Reimplantar o artefato anterior usando o mecanismo aprovado do ambiente; não usar `git reset --hard` em servidores como substituto de deploy.
4. Verificar saúde, autenticação, leitura/escrita e erros antes de reabrir o tráfego.
5. Registrar quem autorizou, o horário, o commit anterior/atual e o resultado.

## Backups e recuperação

- Antes de migrações destrutivas, exigir backup PostgreSQL com retenção e acesso restrito definidos pelo operador.
- Verificar restauração em ambiente isolado com dados protegidos ou anonimizados.
- Registrar RPO/RTO acordados, data do último teste de restauração e responsável.
- Nunca restaurar dados de produção sobre staging ou desenvolvimento sem aprovação e controles de privacidade.
- A existência e a frequência de backups **não foram verificadas neste repositório**.

## Checklist de readiness v1.0

- [ ] CI de testes e build aprovado no commit candidato.
- [ ] Migrações aplicadas e testadas em PostgreSQL real, incluindo rollback/recuperação.
- [ ] Autenticação, autorização e revogação de sessões verificadas.
- [ ] Captação, histórico e atribuição de leads validados ponta a ponta.
- [ ] Notificações com retry/idempotência e integrações externas homologadas.
- [ ] Logs, métricas, alertas e retenção de dados pessoais revisados.
- [ ] Backup restaurado em ambiente isolado; RPO/RTO aceitos.
- [ ] Segredos e permissões de staging/produção aprovados.
- [ ] Responsáveis, plano de incidentes e janela de rollback definidos.
- [ ] Aprovação humana explícita para publicação.

Nenhum item acima deve ser marcado apenas porque existe código correspondente:
é necessária evidência de execução no ambiente-alvo.
