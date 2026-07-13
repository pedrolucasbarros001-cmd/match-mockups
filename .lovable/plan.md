# Preparar HomeMatch para uso prático (frontend completo, pronto para backend)

## Objetivo
Deixar todas as páginas coerentes, navegáveis e funcionais com estado local, com contratos de dados bem definidos para trocar por backend depois — sem escrever backend agora.

## 1. Camada de dados (preparar para backend)

Criar `src/lib/store.ts` — store client-side (Zustand ou `useSyncExternalStore` + localStorage) com:
- `listings`, `matches`, `chats`, `messages`, `visits`, `notifications`, `favorites`, `interests`, `feedback`
- Ações CRUD tipadas (`createListing`, `sendMessage`, `proposeVisit`, `confirmRental`, `reactivateListing`, `toggleFavorite`, `sendInterest`, etc.)
- Persistência em `localStorage` com chave versionada (`hm.store.v1`)

Refatorar `src/lib/mock-data.ts`:
- Manter só **tipos** (`Listing`, `Match`, `Chat`, `Message`, `Visit`, `Notification`, `Feedback`, enums de estado) e helpers puros (`nextActionFor`, `compatibilityReasons`, `MATCH_STEPS`)
- Remover arrays exportados

Criar `src/lib/api.ts` — fachada única que hoje chama o store; amanhã troca-se por `fetch`/Supabase sem tocar nos componentes. Todos os componentes passam a importar daqui, nunca do store direto.

## 2. Páginas — completar e ligar ao store

**Hóspede (seeker)**
- `/explore` — feed com swipe/like/skip → grava `interest` + cria `match(interested)`
- `/explore/$id` — botão "Tenho interesse" cria match e chat
- `/explore/mapa` — placeholder coerente ligado aos mesmos listings
- `/favorites` — lê/escreve via store
- `/matches` — lista real filtrada por role
- `/chats` + `/chats/$id` — envia mensagens (persistidas), timeline reflete `match.state`, propor/confirmar visita muda estado
- `/visits` — lista visitas do seeker
- `/feedback/$matchId` — grava feedback
- `/para-ti` — recomendações a partir de `preferences` + `listings`

**Senhorio (landlord)**
- `/my-listings` — lista, editar, arquivar, reactivar, ver candidatos
- `/publish` — wizard 8 passos → `createListing` no store, redireciona para `/my-listings`
- `/candidates` + `/candidates/$requestId` — aceitar/recusar interesse, cria chat
- `/visits-manager` — aceitar/reagendar/confirmar visitas
- Chat partilhado com seeker (mesma rota, papel diferente)

**Comum**
- `/notifications` — geradas por ações no store (interesse recebido, visita proposta, etc.)
- `/inbox` — redireciona para `/chats`
- `/profile`, `/profile/score`, `/preferences`, `/account`, `/settings`, `/help`, `/legal/*` — completar campos, guardar em `localStorage`
- `/onboarding` — recolhe perfil inicial, escreve em store
- `/login`, `/register`, `/reset-password` — fake auth local (email + role), sem backend
- `/splash` — decide destino conforme sessão/role
- `/dashboard` — resumo real do store por role

## 3. Coerência de navegação e papel
- `AppShell` já reage a `useRole()` — auditar cada página para não misturar UI de seeker/landlord
- Rotas legadas (`/rooms`, `/inbox`, `/interests`, `/my-listings/new`) mantêm redirects
- Adicionar guardas: se rota é só landlord e role=seeker, redireciona para `/explore` (e vice-versa)
- Alternador de modo em `/settings` mantido para testes

## 4. Preparação explícita para backend
- `src/lib/api.ts` com assinatura assíncrona (`async`/`Promise`) desde já, mesmo que o store seja síncrono — assim trocar por `fetch` não muda componentes
- Comentário `// TODO(backend):` em cada função do `api.ts` indicando o endpoint futuro
- `.env.example` com `VITE_API_URL` (não usado ainda)
- Documento `.lovable/backend-contract.md` — lista de recursos, campos e endpoints esperados (Listings, Matches, Chats, Messages, Visits, Notifications, Auth, Profiles, Feedback)

## 5. Fora do âmbito
- Sem Lovable Cloud / Supabase agora
- Sem pagamentos, sem upload real de fotos (usa URLs mock ou placeholders)
- Sem realtime — polling manual/refresh basta

## Detalhes técnicos
- Store: `useSyncExternalStore` (padrão já usado em `user-state.ts`) para evitar dependência nova; se preferires Zustand, adiciono
- IDs: `crypto.randomUUID()`
- Datas: ISO strings
- Sem alterações a tokens, `styles.css`, `AppShell` shell, componentes de design

## Ordem de execução
1. Tipos + store + api.ts + reset localStorage
2. Auth fake + splash + onboarding
3. Publish → my-listings → candidates (fluxo landlord)
4. Explore → interest → matches → chats → visits (fluxo seeker)
5. Notifications + feedback + dashboards
6. Guardas de role + auditoria de coerência
7. `backend-contract.md`

Diz-me se preferes **Zustand** ou manter `useSyncExternalStore`, e se queres que o alternador seeker/landlord fique visível em produção ou só em `/settings`.
