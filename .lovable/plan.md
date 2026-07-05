## Objetivo

Alinhar telas, rótulos e navegação ao **MASTER_CONTEXT.md** e ao **User Flow Blueprint** que enviaste. Continua tudo *frontend-only* com mocks e `useState` — zero backend. Mantém-se o que já funciona: auth, onboarding, design system, `AppShell`, `PageHeader`, tokens de cor, `ScoreBadge` (como componente), `/help`, `/legal/*`, `/favorites`, `/visits`, `/account`, `/para-ti`, `/explore/mapa`, `/profile/score`.

## Mapa de fluxo (referência)

```text
Splash → Sessão? ── não → Login/Registo → Onboarding (1x) ─┐
                └── sim ────────────────────────────────────┤
                                                            ↓
                                                          Feed
Feed → Card → (swipe←|guardar|abrir|swipe→ interesse)
Interesse → Match → Chat (Mensagens + Timeline + Próxima acção)
Chat → Propor visita → Aceita? → Marcada → Feita → Negociação
Negociação → Proprietário confirma → Inquilino confirma → Arrendado
Arrendado → sai do Feed · chats permanecem · reactivação possível
```

Diagrama visual:

<lov-artifact url="/__l5e/documents/HomeMatch_UserFlow.mmd" mime_type="text/vnd.mermaid"></lov-artifact>

## Princípios aplicados ao produto actual

- **1 anúncio = 1 espaço.** Tipos: `Quarto`, `Suite`, `Quarto Partilhado`, `Estúdio`, `T1..T4+`. A ideia de "gerir quartos por imóvel" viola a regra → `/rooms` é substituído por atalho "Publicar novo anúncio" no detalhe de *Meus anúncios*.
- **Descoberta > Pesquisa.** Feed continua central; filtros em bottom sheet, nunca substituem o feed.
- **Compatibilidade explica, não pontua.** Substituir números/percentagens no card por 2–3 *razões* ("Dentro do orçamento", "Aceita animais", "Disponível em Agosto").
- **Histórico nunca desaparece.** Chats ficam sempre acessíveis, mesmo com anúncio arrendado; ganham banner "Este espaço foi arrendado" e ficam read-only até reactivação.
- **Ensinar > Bloquear.** Wizard de publicação com dicas por tipo de espaço; validação progressiva; nunca rejeição silenciosa.
- **Identidade ≠ Contexto.** Perfil é quem eu sou; Preferências é o que procuro agora.

## Bottom nav oficial

- **Inquilino:** Feed · Matches · Notificações · Perfil.
- **Proprietário:** Meus anúncios · Matches · Publicar · Notificações · Perfil.

## Componentes novos

- `NegotiationTimeline` — fixa no topo do Chat, mostra: `Interesse ✓ · Conversa ✓ · Visita marcada · Visita feita · Arrendamento confirmado`. Cada passo tem estado ✓ / ● / ○.
- `NextActionBar` — barra sob a timeline com a próxima acção recomendada (Propor visita · Aceitar · Reagendar · Confirmar visita · Confirmar arrendamento · Reactivar).
- `FilterSheet` — bottom sheet para filtros temporários (nunca escreve nas preferências).
- `CompatibilityReasons` — chips com 2–3 razões, sem número.
- `VisitProposalSheet` — calendário + horários mock, envia proposta.
- `ConfirmRentalSheet` — fluxo dos dois lados: primeiro confirma → estado "aguarda outra parte" → segundo confirma → "arrendado".
- `RentedBanner` e `ReactivateSheet` — no chat e em *Meus anúncios*.

## Telas novas

```text
src/routes/splash.tsx                 // splash + check de sessão mock
src/routes/matches.tsx                // agrega tudo: agrupado por estado do Match
src/routes/preferences.tsx            // Contexto (cidade, orçamento, tipo, data, raio)
src/routes/publish.index.tsx          // Wizard 1 Tipo de espaço
src/routes/publish.location.tsx       // 2 Localização
src/routes/publish.characteristics.tsx// 3 Características
src/routes/publish.photos.tsx         // 4 Fotos (guia por tipo)
src/routes/publish.pricing.tsx        // 5 Preço
src/routes/publish.rules.tsx          // 6 Regras
src/routes/publish.availability.tsx   // 7 Visita ≠ Move-in
src/routes/publish.review.tsx         // 8 Revisão + Quality Score interno
src/routes/feedback.$matchId.tsx      // Feedback pós-visita / pós-conversa
```

## Telas a ajustar (sem reescrever)

- `index.tsx` → passa a redirecionar para `/splash`.
- `explore.index.tsx`: card com `CompatibilityReasons` em vez de score numérico; botão de filtros abre `FilterSheet`; mantém atalhos Mapa e Para Ti.
- `explore.$id.tsx`: CTA "Tenho interesse"; secções separadas *Disponibilidade de visitas* vs *Disponível a partir de*; secção "Porque este espaço combina contigo"; secundárias "Guardar", "Partilhar", "Reportar".
- `interests.tsx` → rótulo "Matches" e agrupamento por estado do lifecycle (Interessado · Em conversa · Visita marcada · Visita feita · Em negociação · Arrendado · Fechado). Rota mantida como alias.
- `chats.index.tsx`: mostra próxima acção por conversa e estado do Match.
- `chats.$id.tsx`: introduz `NegotiationTimeline` fixa no topo + `NextActionBar`; integra `VisitProposalSheet` e `ConfirmRentalSheet`; quando arrendado mostra `RentedBanner` e desactiva input.
- `notifications.tsx`: separar por categorias oficiais (Interesse · Match · Conversa · Visita · Disponibilidade · Marketplace · Sistema); abrir a notificação marca como lida e navega ao destino útil.
- `my-listings.index.tsx`: cada item exibe estado do lifecycle (Rascunho · Publicado · Em negociação · Arrendado); acções contextuais "Editar", "Ver interessados", "Ver visitas", "Reactivar", "Arquivar"; CTA principal "Publicar novo anúncio" → `/publish`.
- `my-listings.new.tsx`: passa a redirect para `/publish` (mantém link antigo).
- `dashboard.tsx`: cartões de saúde do meu marketplace pessoal (anúncios activos, interesses hoje, visitas por confirmar, tempo médio de resposta) — tudo mock. Remove atalho "Quartos".
- `profile.tsx`: separa **Identidade** (foto, nome, bio) de **Contexto/Preferências** com link para `/preferences`. `ScoreBadge` fica apenas como progresso interno "Completar perfil".
- `settings.tsx`: acrescenta acesso a Preferências e Plano; mantém Ajuda, Termos, Privacidade.
- `rooms.tsx` → redirect para `/my-listings` (viola 1 anúncio = 1 espaço).
- `inbox.tsx` → redirect para `/matches`.
- `visits-manager.tsx`: continua, mas acedida a partir de cada Match (aba Visitas). Sai da bottom nav.

## Estados canónicos (mock)

- **Anúncio:** `draft · published · negotiating · rented · reactivated`.
- **Conversa/Match:** `interested · conversation · visit_scheduled · visit_done · negotiating · rental_confirmed · closed`.
- **Visita:** `proposed · accepted · rescheduled · confirmed · done · cancelled`.

## Extensão de `src/lib/mock-data.ts`

- `SpaceType`, `ListingLifecycle`, `MatchState`, `VisitState` como uniões.
- Em `Listing`: `spaceType`, `lifecycle`, `qualityScore` (interno), `moveInFrom`, `visitAvailability: string[]`.
- `Match[]` com `timeline: TimelineEvent[]` e `compatibilityReasons: string[]`.
- `context` (preferências permanentes do utilizador).
- Helper `compatibilityReasons(listing, context)` → 2–3 strings.

## O que NÃO muda

- Tokens, `src/styles.css`, `AppShell`, `PageHeader`, `ScoreBadge`.
- Auth (`/login`, `/register`, `/reset-password`), `/onboarding`.
- Estrutura TanStack Router (só se acrescentam rotas dot-separated).
- Rotas já criadas: `/help`, `/legal/*`, `/favorites`, `/visits`, `/account`, `/para-ti`, `/explore/mapa`, `/profile/score`.
- Zero backend.

## Cenário-chave coberto

30 interessados → 30 Matches → 30 Chats abertos → 10 propostas de visita → 10 visitas → 1 confirmado pelos dois lados → anúncio sai do Feed → 29 chats ganham banner "Este espaço foi arrendado" e ficam read-only → histórico intacto → ao reactivar, chats voltam a ficar activos no ponto onde pararam.
