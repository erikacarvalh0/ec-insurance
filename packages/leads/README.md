# Leads & CRM domain

Own lead intake, assignment, deduplication and lifecycle.

## First RED tests

- Creating a lead returns a stable internal identifier.
- Duplicate submissions with the same idempotency key yield one request.
- Lead ownership can change only with an authorized action.
- Invalid state transitions are rejected and recorded.
- New leads are retained even when quotation processing fails.

Use transport-agnostic domain types and no real personal data in fixtures.

## Atualização de status

`PATCH /api/leads/:id/status` recebe JSON `{ "status": "contacted" }` e exige
um token Bearer válido. Corretores alteram seus próprios leads, gerentes os de
sua equipe e administradores qualquer lead. O ator do histórico vem do token.

A API retorna `200` com `{ "lead": { "id": "...", "status": "contacted" } }`,
`400` para payload inválido, `401` sem autenticação, `403` para papel não
permitido e `404` para lead inexistente ou fora do escopo. Transições inválidas
(incluindo repetir o status) e alterações concorrentes retornam `409`.
Status e histórico são gravados na mesma transação Prisma; falha no histórico
desfaz a atualização. O cliente deve recarregar o lead antes de tentar novamente
após um conflito.
