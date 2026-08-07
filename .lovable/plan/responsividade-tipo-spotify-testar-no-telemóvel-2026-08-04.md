# Responsividade tipo Spotify + testar no telemóvel

## Situação atual

O `AppShell` força `max-w-[440px]` em todos os ecrãs e tem sempre uma bottom nav flutuante. Em desktop isso resulta numa coluna estreita centrada — não é um layout de desktop, é a app mobile esticada no meio do ecrã. É exatamente a diferença face ao Spotify: no mobile ele usa tab bar em baixo; no desktop usa sidebar à esquerda, header próprio, painel de detalhe à direita e grelhas que crescem com a largura.

## O que vou construir

### 1. AppShell com dois modos de navegação

- **Mobile (< 768px)**: mantém-se exatamente como está — coluna de 440px, bottom nav em pill, safe areas.
- **Desktop (>= 768px)**: sidebar fixa à esquerda (~240px, colapsa para ~72px só com ícones entre 768–1024px) com os mesmos destinos do papel ativo (hóspede/senhorio), logótipo em cima, "Eu"/Definições em baixo. A bottom nav desaparece.
- Um único componente decide, sem duplicar páginas: o mesmo array `seekerNav`/`landlordNav` alimenta as duas variantes.
- Feito por CSS/Tailwind (`hidden md:flex`, `md:hidden`), não por JS de largura de ecrã — evita saltos na hidratação.

### 2. Área de conteúdo que respira

- `maxWidth` deixa de ser um valor fixo: passa a variantes por ecrã — `feed` (continua estreito e centrado, o swipe deve manter-se com largura de cartão), `list` (até ~720px) e `wide` (até ~1200px, para grelhas).
- Páginas de lista/grelha ganham colunas responsivas: `/my-listings`, `/favorites`, `/para-ti`, `/candidates`, `/rooms`, `/visits`, `/visits-manager`, `/notifications`, `/matches` passam a `grid sm:grid-cols-2 xl:grid-cols-3` em vez de coluna única.
- Dashboard do senhorio: cartões de métrica em `grid-cols-2 lg:grid-cols-4` e atalhos numa grelha larga.

### 3. Padrão master–detail (o "painel direito" do Spotify)

- `/chats` e `/chats/$id`: em mobile continuam duas páginas com navegação; em desktop a lista fica à esquerda e a conversa aberta à direita, no mesmo ecrã.
- Mesmo tratamento em `/candidates` → `/candidates/$requestId`.
- Sem duplicar rotas: a rota de detalhe renderiza o painel; a rota índice mostra a lista, e em desktop mostra ambos com um estado vazio ("Escolhe uma conversa") quando não há detalhe.

### 4. PageHeader e cabeçalhos

- Em desktop o header deixa de ser sticky translúcido de 56px e passa a título grande com ações à direita; em mobile fica igual.
- Botão "voltar" some em desktop quando a navegação lateral já dá contexto.

### 5. Ecrãs de auth e onboarding

- `/login`, `/register`, `/reset-password`, `/onboarding`, `/publish`: em desktop passam a layout de duas colunas (painel de marca à esquerda, formulário à direita, máx. ~420px), em vez do formulário solto no meio.

### 6. Regras de responsividade aplicadas em todo o lado

Nas linhas com texto + ícones/botões: `grid-cols-[minmax(0,1fr)_auto]` em mobile, `flex` a partir de `sm:`, `min-w-0` nos contentores de texto, `shrink-0` nos ícones, `truncate` nos títulos. Corrige os cortes de texto que aparecem em ecrãs estreitos.

## Testar no telemóvel — Expo Go não serve

O Expo Go só corre projetos React Native/Expo (JavaScript com componentes nativos). Este projeto é uma app web React (TanStack Start) embrulhada em Capacitor para iOS — o Expo Go não consegue abrir isto, e migrar para Expo significaria reescrever todos os ecrãs em React Native. Não recomendo.

Três formas reais de testar no telefone, por ordem de esforço:

1. **URL de preview no browser do telefone** (zero configuração): abrir o link de preview do projeto no Safari/Chrome do telemóvel. Serve para validar 90% do layout responsivo.
2. **Adicionar ao ecrã principal (PWA)**: posso adicionar manifest + ícones para que, ao "Adicionar ao ecrã principal", abra em ecrã inteiro sem barra do browser — muito próximo da sensação de app. Sem offline, salvo pedido explícito.
3. **Capacitor com live reload** (é o equivalente ao Expo Go aqui): já existe `ios/` e os scripts `build:native`/`ios`. Com o `server.url` do Capacitor a apontar para o teu Mac, a app nativa carrega o dev server e recarrega ao guardar. Requer macOS + Xcode. Posso deixar essa configuração preparada e documentada no README.

Diz-me se queres o passo 2 (PWA) e/ou a configuração do passo 3 incluídos neste trabalho.

## Fora do âmbito

Sem backend, sem migração para React Native/Expo, sem mudar tokens de cor/tipografia, sem alterar lógica de negócio — só camada de layout e apresentação.

## Ordem de execução

1. `AppShell` — sidebar desktop + bottom nav mobile + variantes de largura.
2. `PageHeader` — variante desktop.
3. Grelhas responsivas nas páginas de lista (hóspede e senhorio).
4. Master–detail em chats e candidatos.
5. Auth/onboarding/publish em duas colunas.
6. Passagem final a 375px, 768px, 1280px e 1920px nos dois papéis.
