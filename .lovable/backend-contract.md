# HomeMatch — Contrato de Backend

Todas as chamadas do frontend passam por `src/lib/api.ts`. Trocar o store
local por HTTP significa apenas reescrever esse ficheiro — as páginas não
mudam. Este documento lista os recursos e endpoints previstos.

## Autenticação
- `POST /auth/register` { email, password, role }
- `POST /auth/login` { email, password } → { token, user }
- `POST /auth/logout`
- `POST /auth/reset-password` { email }
- `GET  /me` → Profile

## Perfil e Preferências
- `PATCH /me` — Profile parcial
- `PATCH /me/preferences` — Preferences parcial
  - Preferences: city, maxDistanceKm, spaceTypes[], minPrice, maxPrice, moveInFrom, pets, needsFurnished

## Listings
- `GET /listings?city=&type=&maxPrice=` → Listing[]
- `GET /listings/:id` → Listing
- `POST /listings` — criar (senhorio autenticado)
- `PATCH /listings/:id` — editar (dono)
- `DELETE /listings/:id`
- Campos principais: title, price, city, neighborhood, distanceM, type,
  spaceType, lifecycle (draft|published|negotiating|rented), qualityScore,
  pets, smoke, availableFrom, moveInFrom, visitAvailability[], minMonths,
  capacity, description, amenities[], rules, photos[], owner{...}

## Favorites
- `GET /favorites` → listingId[]
- `POST /favorites/:listingId`
- `DELETE /favorites/:listingId`

## Interesses e Matches
- `POST /interests` { listingId, message } → cria Match(state=interested) + Chat
- `POST /interests/pass` { listingId }
- `GET /matches` → Match[]
- `PATCH /matches/:id/state` { state } — MatchState: interested | conversation |
  visit_scheduled | visit_done | negotiating | rental_confirmed | closed

## Chats
- `GET /chats` → Chat[]
- `GET /chats/:id` → Chat + messages[]
- `POST /chats/:id/messages` { text }
- (futuro) realtime via WebSocket / SSE

## Visitas
- `GET /visits` → Visit[]
- `POST /visits` { listingId, matchId, slot }
- `PATCH /visits/:id` { status } — proposed | accepted | rescheduled |
  confirmed | done | cancelled

## Notificações
- `GET /notifications` → Notification[]
  - categorias: interest | match | conversation | visit | availability |
    marketplace | system
- `PATCH /notifications/:id` { unread: false }
- `PATCH /notifications/read-all`

## Feedback
- `POST /feedback` { matchId, rating, comment }
- `GET /feedback?matchId=` → Feedback[]

## Regras de negócio
- 1 anúncio = 1 espaço (nunca agrupar múltiplos quartos num só anúncio).
- Ao confirmar arrendamento (`rental_confirmed`), o anúncio vai a `rented`
  e sai do feed público; chats existentes ficam read-only com banner.
- Reactivar um anúncio devolve `lifecycle=published` e desbloqueia os chats.
- Confirmação de arrendamento exige aceitação dos dois lados.

## Notas
- IDs: UUID.
- Datas: ISO 8601 UTC.
- Paginação: `?page=&pageSize=` (default 20).
- Fotos: upload via `POST /uploads` → devolve URL persistente.
