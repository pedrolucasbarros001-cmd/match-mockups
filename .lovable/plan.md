# Feed desktop + Definições completas + Preferências vs Filtros

## Diagnóstico da navegação atual (verificado no código)

O que já existe e está coerente:
- Inquilino: `/explore` (feed), `/explore/mapa`, `/explore/$id`, `/para-ti`, `/favorites`, `/matches`, `/chats`, `/visits`, `/interests`, `/feedback/$matchId`, `/preferences`, `/profile`, `/profile/score`.
- Senhorio: `/dashboard`, `/my-listings`, `/my-listings/new`, `/publish`, `/candidates`, `/candidates/$requestId`, `/visits-manager`, `/inbox`, `/account`, `/rental-close/$chatId`.
- Transversal: `/splash`, `/login`, `/register`, `/reset-password`, `/onboarding`, `/settings`, `/help`, `/legal/terms`, `/legal/privacy`, `/switch-user`.
- Store única (`src/lib/store.ts`) + fachada `src/lib/api.ts` já isolam os dados — boa base para ligar backend depois.

Lacunas encontradas:
1. **Feed preso ao formato telemóvel.** `AppShell width="feed"` fixa `max-w-[440px]` e o card usa `max-w-md`, por isso em desktop sobra ecrã vazio à direita (é exatamente o que se vê na captura).
2. **Definições com itens mortos.** Em `/settings`, "Privacidade e segurança", "Notificações" e "Idioma" não navegam para lado nenhum (não existem rotas).
3. **Plano só existe para senhorio.** `/account` está protegida por `useRoleGuard("landlord")` e só é alcançável pelo dashboard/definições; o inquilino não tem onde ver/gerir plano. Não há downgrade explicado nem comparação de planos.
4. **Preferências vs Filtros sobrepostos e desalinhados.** `/preferences` só edita arrendamento (`kind` fixo em `"rent"`, sem preço de compra, sem `kind`), enquanto o painel de filtros do feed escreve nos mesmos campos do store, incluindo compra. Resultado: dois ecrãs a editar a mesma coisa com campos diferentes (raio e data só existem nas preferências; tipos e preço existem nos dois).

## O que vai ser feito

### 1. Feed em desktop (`/explore`)
- Nova largura `feedWide` no `AppShell`: continua estreito em mobile, mas em `md+` passa a um layout de duas colunas dentro da área de conteúdo:
  - coluna esquerda: card de swipe centrado com altura confortável;
  - coluna direita (só `lg+`): painel fixo de filtros sempre visível (o mesmo estado do store), mais o resumo da pesquisa ativa e atalhos Mapa / Para Ti.
- Em `md+` o bottom sheet de filtros deixa de ser usado (o painel lateral substitui-o); em mobile mantém-se igual.
- Cabeçalho do feed alinhado à grelha do desktop (sem barra colada à esquerda) e botões de ação com estados hover.

### 2. Definições completas
Reorganizar `/settings` em grupos claros e criar as telas em falta:
- `/settings/account` — dados da conta (nome, email, telefone, alterar password), verificações.
- `/settings/notifications` — toggles por canal (push/email) e por tipo (matches, mensagens, visitas, avisos do sistema).
- `/settings/privacy` — visibilidade do perfil, quem pode contactar, bloqueios, sessões, apagar conta.
- `/settings/language` — idioma e região/moeda.
- `/settings/plan` — ver e gerir plano para **ambos os papéis**: comparação Free vs Pro, estado atual, upgrade, downgrade com ecrã de confirmação (o que se perde), e histórico de faturação. `/account` do senhorio passa a reencaminhar para aqui, mantendo os dados fiscais como secção própria.
- Grupos finais em Definições: Conta · Notificações · Privacidade · Plano e faturação · Descoberta (preferências) · Idioma · Sobre/Ajuda/Legal · Zona perigosa (repor dados de demo, terminar sessão).
- Todas as telas usam `PageShell` (sidebar em desktop) e escrevem no store via `api`.

### 3. Preferências vs Filtros — divisão lógica
Regra única e explícita:
- **Preferências** (`/preferences`) = o meu perfil de procura, duradouro: objetivo (Arrendar/Comprar), cidade, raio, data de entrada, orçamento por objetivo, tipos de espaço por objetivo, animais e mobilado. Passa a suportar os dois objetivos com separador Arrendar/Comprar, em vez de assumir arrendamento.
- **Filtros** (feed) = ajuste rápido da sessão sobre o mesmo store, com apenas: tipo de espaço, preço máximo e os toggles de convivência, mais um botão "Guardar como preferências" e "Repor às minhas preferências".
- Cada campo aparece uma só vez com o mesmo nome, mesma unidade e mesmos limites nos dois sítios, e o feed reage a ambos (já reage).

## Notas técnicas
- Sem backend: tudo continua em `src/lib/store.ts` + `src/lib/api.ts`; as novas definições acrescentam campos ao estado persistido (`notifications`, `privacy`, `locale`, `account`) com valores por defeito para não partir estados guardados.
- `plan` já existe no store; downgrade reutiliza `api.setPlan`.
- Guardas: as novas rotas de definições são neutras quanto ao papel (sem `useRoleGuard`), exceto a secção de dados fiscais, visível só a senhorio.
- Cada rota nova define `head()` próprio com título e descrição.
