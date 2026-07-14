## Problema

Duas dores no mesmo tema — separação de papéis (hóspede vs senhorio) e separação semântica entre ecrãs parecidos:

1. **Perfil do hóspede continua a mostrar "ÁREA SENHORIO"** (Gerir visitas), o que não deve existir para quem está em modo hóspede. Simétrico: senhorio não deve ver "Favoritos" nem "As minhas visitas" do hóspede.
2. **Matches e Avisos parecem o mesmo ecrã** — mesmos chips (Todos / Interesse / Em conversa / Visita) e mesma leitura visual. São coisas diferentes: Matches é a lista de **relações ativas** (uma conversa por candidatura); Avisos é o **histórico de eventos** (log).
3. Vários ecrãs ainda misturam papéis por baixo: `visits-manager` importa mocks antigos, `notifications` mostra tudo a toda a gente, `matches` no lado senhorio deveria mostrar candidatos-por-anúncio e não anúncios-por-candidato.

## Objetivo

Cada ecrã tem um único papel dono e mostra só o que faz sentido nesse papel; ecrãs que sobrevivem em ambos os papéis (Matches, Avisos, Chats) têm variantes visuais e conteúdo filtrado. Nada de campos do outro lado.

## Alterações

### 1. Perfil (`src/routes/profile.tsx`)
- Reforçar o `role === "seeker"` vs `role === "landlord"` (já existe; auditar e garantir que **nenhum** bloco senhorio renderiza em modo hóspede).
- Hóspede: Identidade → Completar perfil → **O que procuro agora** (Preferências) → **Atividade** (Verificações, Favoritos, As minhas visitas) → Definições / Sair.
- Senhorio: Identidade → Completar perfil → **Área senhorio** (Meus anúncios, Candidatos, Gerir visitas, Conta e plano) → **Confiança** (Verificações) → Definições / Sair. Sem Favoritos, sem "As minhas visitas", sem Preferências de descoberta.

### 2. Matches (`src/routes/matches.tsx`) — diferenciar de Avisos
- **Header próprio**: subtítulo "As tuas negociações ativas" + contador ("3 ativas · 1 fechada"). Distingue-se logo do topo de Avisos.
- **Substituir chips por segmented control de estado do funil** (Ativas / Visita / Fechadas) — 3 grupos, não 7. As sub-fases (interesse, conversa, visita marcada, visita feita, arrendado) aparecem como *badge* dentro do cartão, não como aba.
- **Cartão richer**: foto + título + linha da timeline mini ("● ● ● ○ ○") + próxima ação em bold + CTA "Abrir conversa". Diferente do estilo de linha de log dos Avisos.
- **Variante por papel**:
  - Hóspede: uma linha por *listing* candidatado (é o que já faz).
  - Senhorio: uma linha por *candidato × anúncio*; foto do candidato, não do imóvel; título = nome do candidato, subtítulo = anúncio.

### 3. Avisos (`src/routes/notifications.tsx`) — assumir-se como log
- Manter chips, mas mudar rótulos e ordem para **eventos** (Todas / Não lidas / Hoje / Esta semana) em vez de replicar os estados de Matches. As categorias (Interesse, Match, Visita…) passam a ser só o *pill* dentro do item, não a navegação.
- **Filtrar por papel**: hóspede não vê categorias `marketplace` de senhorio (novo candidato, anúncio expirou); senhorio não vê categorias de descoberta (novo match sugerido, imóvel novo perto). Adicionar campo `audience: "seeker" | "landlord" | "both"` nos eventos (já parcialmente presente via `category`; mapear).
- Estilo denso de linha temporal com timestamps proeminentes — visualmente diferente do cartão-conversa de Matches.

### 4. Visitas
- **Hóspede** (`/visits`): já OK, só afinar cabeçalho ("As minhas visitas") e remover se abrir em modo senhorio (redirect para `/visits-manager`).
- **Senhorio** (`/visits-manager`): trocar imports de `mock-data` (`visits`, `listings`) por `useStore` e filtrar apenas visitas dos anúncios do próprio senhorio. Botões Confirmar/Recusar ligados a `api.confirmVisit` / `api.cancelVisit`.

### 5. Guardas de rota (papel)
Adicionar um pequeno hook `useRoleGuard(expected)` em `src/lib/user-state.ts` e aplicar:
- `seeker`: `/explore`, `/explore/$id`, `/explore/mapa`, `/favorites`, `/visits`, `/preferences`, `/para-ti`.
- `landlord`: `/dashboard`, `/my-listings`, `/my-listings/new`, `/publish`, `/candidates`, `/candidates/$requestId`, `/visits-manager`, `/account`.
- Ambos: `/matches`, `/chats`, `/notifications`, `/profile`, `/settings`, `/onboarding`, páginas legais/help.

Se o papel não bate, redireciona para o home do papel atual (`/explore` ou `/dashboard`) — evita URLs "cruzados" que confundem o teste.

### 6. AppShell
Já reage a `useRole()`. Só validar que o nav do senhorio não tem "Avisos" duplicado com "Matches" e vice-versa — manter os dois separados nos dois papéis.

## Fora do âmbito

Sem alterações a tokens/CSS, sem novo backend, sem novos componentes de design system, sem mexer em Cloud.

## Ordem de execução

1. `store.ts` — expor helpers `visitsForLandlord()`, `matchesForLandlord()` (candidato×anúncio) e `notificationsForRole(role)`.
2. `profile.tsx` — auditar e limpar mistura de papéis.
3. `matches.tsx` — novo header, 3 grupos, variante senhorio.
4. `notifications.tsx` — filtro por papel + chips reformulados (log style).
5. `visits-manager.tsx` — passar a usar store + ações reais.
6. `user-state.ts` — `useRoleGuard`; aplicar nas rotas listadas.
7. Passagem final: abrir cada rota nos dois papéis e confirmar que nada "vaza".
