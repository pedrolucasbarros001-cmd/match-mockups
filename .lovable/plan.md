## Objetivo

Manter tudo o que já está construído. Só acrescentar as páginas e navegação que ainda faltam para completar os fluxos do **hóspede** e do **senhorio**, sem tocar no que já funciona (auth, onboarding atual, explore/swipe, chats, profile, score, dashboard, my-listings, candidates).

## Páginas novas a criar

### Hóspede
- `/explore/mapa` — vista mapa (SVG mockado de Bragança com pins de imóveis, mini-card ao clicar num pin, toggle Cards ↔ Mapa no header do Explore).
- `/para-ti` — feed de recomendações em secções ("Match do dia", "Novos perto de ti", "Baseado nos teus gostos"), reutiliza cards existentes.
- `/favorites` — lista de imóveis marcados (separado do `/interests`, que é fluxo de candidaturas).
- `/visits` — visitas agendadas (lista com data/hora, estado: pendente, confirmada, feita).

### Senhorio
- `/rooms` — gestão de quartos por imóvel (estado: disponível, reservado, ocupado).
- `/inbox` — inbox do senhorio agrupado por imóvel (vista alternativa de conversas focada em gestão).
- `/visits-manager` — visitas a marcar/confirmar com candidatos.
- `/account` — dados fiscais mock (NIF, morada), plano atual (Grátis/Pro) e faturação mock.

### Partilhadas
- `/help` — FAQ + contactos (link a partir de settings).
- `/legal/terms` e `/legal/privacy` — páginas estáticas simples (linkadas do registo/settings).

## Navegação a acrescentar

- No `AppShell` (bottom nav):
  - Hóspede: adicionar item "Para Ti" e ícone de mapa no header do Explore.
  - Senhorio: adicionar "Inbox" e link "Quartos" a partir do detalhe de `my-listings`.
- No `/profile`:
  - Link "Favoritos" e "Visitas" (hóspede) ou "Conta & Plano" (senhorio).
- No `/settings`: linkar Ajuda, Termos, Privacidade.
- No `/dashboard` (senhorio): atalhos com contadores para Quartos, Inbox e Visitas.

## Dados mock a estender em `src/lib/mock-data.ts`

- `rooms[]` por listing (id, nome, preço, estado).
- `recommendations[]` para `/para-ti`.
- `mapPins[]` (x, y, listingId).
- `visits[]` (listingId, candidateId, data, estado).
- `favorites[]` (ids de listings).
- `landlordAccount` (NIF, plano, faturas mock).

## O que NÃO muda

- Auth (`/login`, `/register`, `/reset-password`), onboarding atual, `/explore` + `/explore/$id`, `/interests`, `/chats` + `/chats/$id`, `/notifications`, `/profile` + `/profile/score`, `/settings`, `/dashboard`, `/my-listings` + `/new`, `/candidates` + `/$requestId`.
- Design system, `AppShell`, `ScoreBadge`, tokens em `src/styles.css`.
- Estrutura de rotas TanStack existente.

## Ficheiros a criar

```text
src/routes/explore.mapa.tsx
src/routes/para-ti.tsx
src/routes/favorites.tsx
src/routes/visits.tsx
src/routes/rooms.tsx
src/routes/inbox.tsx
src/routes/visits-manager.tsx
src/routes/account.tsx
src/routes/help.tsx
src/routes/legal.terms.tsx
src/routes/legal.privacy.tsx
```

Cada rota inclui `head()` com título próprio, usa `AppShell` + `PageHeader` e consome mock data.
