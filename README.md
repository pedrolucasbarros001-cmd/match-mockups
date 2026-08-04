# HomeMatch

Protótipo funcional de app de arrendamento (estilo swipe/match) para inquilino e senhorio. **100% frontend** — sem backend, sem API real, sem conta de utilizador de verdade. Pensa nisto como um "clique-para-testar" que já tem toda a lógica de negócio pronta, à espera de um backend por trás.

## Como correr

```bash
npm install
npm run dev            # web, http://localhost:5174
```

Para o app nativo (iOS via Capacitor) — builda, sincroniza e abre o Xcode num só passo:

```bash
npm run ios:open
```

(Ou `npm run ios` para tentar correr direto no simulador via CLI.)

## O que é real e o que é simulado

| Coisa | Estado |
|---|---|
| Fluxo de swipe, matches, chat, visitas, fecho de arrendamento, avaliações | **Lógica real** — vive em `src/lib/store.ts` |
| Trust Score, Quality Score, limite de plano | **Calculados de verdade** a partir dos dados preenchidos, nunca hardcoded |
| Conta de utilizador, login | **Simulado** — `hm.session`/`hm.role` no localStorage, sem password real |
| Upload de fotos, OTP por SMS, mapa real, pagamento Pro | **Placeholder** — o botão existe, a ação é fake |
| Dados (perfil, anúncios, chats…) | **Só no dispositivo** — `localStorage`, chave `hm.store.v1`. Nada é enviado para lado nenhum. |

Não há conceito de "conta de outra pessoa": para testares os dois lados (inquilino/senhorio) na mesma sessão, usa `/switch-user` — os dados são partilhados, é o mesmo dispositivo a fingir ser dois utilizadores.

## Arquitetura em 3 camadas

```
src/routes/*.tsx     → UI. Nunca mexe direto no localStorage.
src/lib/api.ts        → Fachada. Hoje chama o store; amanhã troca por fetch()
                         sem os ecrãs saberem a diferença.
src/lib/store.ts       → Única fonte de verdade + todas as regras de negócio.
```

Quando houver backend a sério, o trabalho é (quase) só reescrever `api.ts` — os ecrãs ficam iguais.

## Arrendamento e venda

O mesmo motor serve os dois: um anúncio tem `kind: "rent" | "sale"` e tudo o resto deriva daí — vocabulário, passos do wizard, leitura do preço, campos que se pedem. O inquilino/comprador alterna com o toggle **Arrendar | Comprar** no topo do feed.

| | Arrendamento | Venda |
|---|---|---|
| Preço | `€450 / mês` | `€180.000` |
| Wizard | 9 passos | 8 (sem Regras) |
| Campos que desaparecem | — | regras de convivência, data de mudança, prazo, caução, despesas |
| Fecho | renda + duração | valor da proposta (sem duração) |
| Fase final | "Arrendado" | "Proposta aceite" |

A app **não é parte no contrato** e não intermedeia pagamentos — quando marcas um negócio como fechado, está apenas a registar o que as partes declararam. Está escrito nos [Termos de Uso](src/routes/legal.terms.tsx), sem interromper os fluxos.

## O padrão P ↔ Q (equivalência lógica) na UI/UX

Regra mais forte do que "se P então Q": **P e Q são o mesmo facto e nunca podem divergir**. Na prática:

**1. Uma verdade, um sítio.** Nada de guardar o mesmo facto em dois campos. "Já demonstrei interesse" deriva-se de `matches`, não se guarda em paralelo (guardar os dois fazia-os divergir quando o match mudava). O único facto não derivável do feed é `passed` — os anúncios dispensados.

**2. Ações equivalentes.** Arrastar o card ou carregar no botão passam pelo mesmo `onSwiped`. Marcar visita como feita no chat ou em `/visits-manager` chamam ambos `setVisitStatus` — nunca duas implementações da mesma regra.

**3. Estados visuais equivalentes.** `priceLabel()` decide como se lê um preço em toda a app; `nextActionFor()` decide o texto de "próxima ação" em `/matches`, `/chats` e na lista de conversas. Se cada ecrã escrevesse o seu, o mesmo estado passava a ter duas leituras.

**4. Esconder complexidade.** Escolher "Venda" já responde a "tem regras de convivência?" e "qual a data de mudança?" — esses passos desaparecem em vez de serem perguntados. O `spaceType` determina a `capacity`; o tipo T1–T4+ determina `type: "Apartamento"`.

**5. Contrapositiva visível.** Botão bloqueado ⇒ diz o que falta. `missingForStep()` devolve a razão ou `null`; o botão fica ativo se e só se for `null` e mostra essa razão quando não é — uma só função decide as duas coisas. O mesmo no feed vazio: distingue "não há anúncios" de "os filtros escondem tudo" e oferece a ação que resolve cada caso.

## O padrão P → Q (implicação lógica) usado no store

Regra do projeto: **se a condição P acontece, a consequência Q corre sozinha** — nenhum ecrã deve ter de "lembrar-se" de propagar um estado manualmente. Exemplos já implementados em `store.ts`:

- `sendInterest()` → cria match **e** chat **e** notificação, sempre juntos. Nunca existe um chat sem match.
- `setVisitStatus(id, "done")` → o match correspondente passa sozinho a `visit_done`. `setVisitStatus(id, "cancelled")` → o match volta a `conversation`. Isto corre quer a mudança venha do chat, quer de `/visits-manager` — **um único caminho**, sem duplicar a regra em dois sítios (era um bug real que existia antes desta sessão).
- `closeListing(reason="homematch")` → cria `ActiveRental` pendente **e** notifica o inquilino, automaticamente. Só quando o inquilino confirma (`confirmRentalSeeker`) é que o match avança para `rental_confirmed` **e** o anúncio muda para `rented`.
- `canPublishAnother()` → é chamado tanto no wizard de publicar como em "Reativar" no `/my-listings`, para o limite do plano Free nunca poder ser contornado por um caminho secundário.

Quando adicionares uma funcionalidade nova: pergunta "que Q depende automaticamente deste P?" e mete essa consequência dentro da mutação do store — nunca espalhada por vários `onClick` em ecrãs diferentes. É a forma de evitar os dois sistemas desligados (visita vs. chat) que existiam antes.

## Privacidade — postura atual

Não há nada a "vazar" hoje porque não há rede: tudo vive só no dispositivo. Quando ligarmos um backend a sério, os princípios a manter:

- Recolher o mínimo possível — só o que aparece no onboarding, nada de campos "por via das dúvidas".
- Documentos de identidade nunca guardados em bruto — só a flag `identityDeclared`/`ok`, como já está modelado.
- Contactos (telefone/email) só ficam visíveis à outra parte depois de aceitar candidato — já é assim na UI, tem de continuar a ser assim no backend.
- Sem venda/partilha de dados a terceiros.

## Limitações conhecidas (por decisão, não por esquecimento)

- Anúncio em `draft` (via "Vou reformular") ainda não tem edição — `/publish` só cria. Retomar um rascunho existente é trabalho futuro.
- Upload de fotos, verificação por SMS e mapa são placeholders — ver Parte 6 do briefing de wireframe.
- Pagamento do plano Pro não cobra nada de verdade (é só um toggle no store).
- `/preferences` edita só as preferências de arrendamento; os filtros de compra vivem no painel de filtros do feed.

## Cuidado ao ler do store

`useStore` usa `useSyncExternalStore`, que compara por **referência**. Um selector que constrói algo novo (`s.matches.map(...)`, `s.x.filter(...)`, `trustScoreBreakdown(s)`) devolve um objeto diferente a cada chamada e faz a página entrar em ciclo infinito de renders.

Seleciona a fatia crua e deriva com `useMemo`:

```ts
// ✗ ciclo infinito
const ids = useStore((s) => s.matches.map((m) => m.listingId));

// ✓
const matches = useStore((s) => s.matches);
const ids = useMemo(() => matches.map((m) => m.listingId), [matches]);
```
