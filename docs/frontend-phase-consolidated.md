# Frontend Consolidado - Fase Atual

Documento de manutenção interna com o estado real implementado no frontend.

## 1) Mapa de páginas/telas implementadas

- `auth/login` - login com redirecionamento por `next`.
- `auth/register` - cadastro e entrada automática na sessão.
- `onboarding/family` - criação da primeira família quando usuário não possui família.
- `/` - Home/Dashboard operacional (cards, próximos vencimentos, vencidos, categoria, dia, projeção resumida).
- `/next-12-months` - projeção completa dos próximos 12 meses.
- `/family` - gestão familiar (dados da família, membros, convite pendente, role, remoção, permissões).
- `/categories` - CRUD de categorias.
- `/accounts` - listagem e operações base de contas (ativar/desativar/excluir).
- `/accounts/new` - criação de conta.
- `/accounts/[id]` - detalhe de conta.
- `/accounts/[id]/edit` - edição de conta.
- `/occurrences` - listagem de ocorrências + operações (marcar pago, desmarcar, sobrescrever valor).

## 2) Componentes principais por módulo

- **Auth**
  - `features/auth/components/login-form.tsx`
  - `features/auth/components/register-form.tsx`
- **Família**
  - `features/families/components/create-family-form.tsx`
  - `features/families/components/create-pending-member-form.tsx`
  - `features/families/components/member-permissions-form.tsx`
- **Categorias**
  - `features/categories/components/category-form.tsx`
- **Contas**
  - `features/accounts/components/account-form.tsx`
- **Ocorrências**
  - `features/occurrences/components/occurrence-form.tsx` (componente disponível no módulo)
- **Layout/feedback compartilhado**
  - `components/shared/layout/app-shell.tsx`
  - `components/shared/layout/page-header.tsx`
  - `components/shared/data/section-card.tsx`
  - `components/shared/data/toolbar.tsx`
  - `components/shared/data/data-table.tsx`
  - `components/shared/feedback/loading-state.tsx`
  - `components/shared/feedback/error-state.tsx`
  - `components/shared/feedback/empty-state.tsx`
  - `components/shared/feedback/inline-feedback.tsx`
  - `components/shared/filters/view-scope-selector.tsx`

## 3) Hooks principais por módulo

- **API base**
  - `hooks/api/use-api-query.ts`
  - `hooks/api/use-api-mutation.ts`
- **Auth**
  - `features/auth/hooks.ts` (`useLoginMutation`, `useRegisterMutation`, `useAuthMeQuery`)
  - `providers/auth-provider.tsx` (estado de sessão usado pelas telas)
- **Família**
  - `features/families/hooks.ts` (família atual, membros, permissões e mutações)
  - `providers/family-provider.tsx` (estado global da família e onboarding)
- **Autorização**
  - `hooks/auth/use-authorization.ts`
- **Contexto visual (Pessoal/Família/Visível)**
  - `hooks/view/use-view-scope.ts`
  - `providers/view-scope-provider.tsx`
- **Financeiro**
  - `features/categories/hooks.ts`
  - `features/accounts/hooks.ts`
  - `features/occurrences/hooks.ts`
  - `features/dashboard/hooks.ts`

## 4) Services principais por módulo

- **Cliente HTTP e eventos**
  - `lib/api/client.ts` (baseURL, headers, bearer, querystring, tratamento de erro)
  - `lib/api/events.ts` (eventos `unauthorized` e `request-error`)
- **Auth**
  - `features/auth/api.ts` (`/auth/login`, `/auth/register`, `/auth/me`)
  - `lib/auth/token-storage.ts` (persistência do access token)
  - `features/auth/session.ts` (helpers de sessão)
- **Família**
  - `features/families/api.ts`
- **Categorias**
  - `features/categories/api.ts`
- **Contas**
  - `features/accounts/api.ts`
- **Ocorrências**
  - `features/occurrences/api.ts`
- **Dashboard**
  - `features/dashboard/api.ts`
- **Health**
  - `features/health/api.ts` (`/health`)

## 5) Guards e regras de acesso

- **Guards de fluxo**
  - `components/shared/guards/session-flow-guard.tsx`
  - Modos:
    - `guest` (área auth)
    - `onboarding` (área onboarding de família)
    - `private` (shell autenticado)
- **Decisão de fluxo**
  - `lib/routing/session-flow.ts` decide `allow` / `loading` / `redirect`.
- **Guard de permissão**
  - `components/shared/guards/permission-guard.tsx` suporta:
    - `action` (autorização por ação de negócio)
    - permissão única
    - permissão any/all
- **Autorização por ação**
  - `lib/authorization/actions.ts` mapeia ações -> permissões possíveis.
  - `lib/authorization/helpers.ts` (`canExecuteAction`, `isFamilyAdmin`, etc.).
  - `hooks/auth/use-authorization.ts` entrega booleans de UI (`canManageMembers`, `canManageCategories`, etc.).

## 6) Rotas de backend consumidas por tela

- **`auth/login`**
  - `POST /auth/login`
- **`auth/register`**
  - `POST /auth/register`
- **Hidratação de sessão (global em `AuthProvider`)**
  - `GET /auth/me`
- **Logout**
  - local (limpa token/sessão); sem endpoint dedicado.
- **`onboarding/family`**
  - `POST /families`
  - (estado global também consulta `GET /families/me`)
- **`/family`**
  - `GET /families/me`
  - `GET /families/me/members`
  - `POST /families/current/members`
  - `PATCH /families/current/members/{memberId}/role`
  - `DELETE /families/current/members/{memberId}`
  - `GET /families/current/members/{memberId}/permissions`
  - `PUT /families/current/members/{memberId}/permissions`
- **`/categories`**
  - `GET /categories`
  - `GET /categories/{id}`
  - `POST /categories`
  - `PUT /categories/{id}`
  - `DELETE /categories/{id}`
- **`/accounts`**
  - `GET /accounts` (com `scope`)
  - `PATCH /accounts/{id}/activate`
  - `PATCH /accounts/{id}/deactivate`
  - `DELETE /accounts/{id}`
- **`/accounts/new`**
  - `POST /accounts`
- **`/accounts/[id]`**
  - `GET /accounts/{id}`
  - `GET /categories` (resolução de nome)
  - `GET /families/me/members` (responsável da conta familiar)
- **`/accounts/[id]/edit`**
  - `GET /accounts/{id}`
  - `PUT /accounts/{id}`
- **`/occurrences`**
  - `GET /occurrences` (filtros: scope/status/category/text/start/end/month)
  - `GET /occurrences/{id}`
  - `PATCH /occurrences/{id}/mark-paid`
  - `PATCH /occurrences/{id}/unmark-paid`
  - `PATCH /occurrences/{id}/override-amount`
  - `GET /accounts` (catálogo auxiliar por escopo)
  - `GET /categories` (catálogo auxiliar)
- **`/` (dashboard/home)**
  - `GET /dashboard/home?month=yyyy-MM`
  - `GET /dashboard/day?date=yyyy-MM-dd`
  - `GET /dashboard/category-summary?month=yyyy-MM`
  - `GET /dashboard/next-12-months?includeDetails=false`
  - `GET /categories` (nomes para resumo por categoria)
- **`/next-12-months`**
  - `GET /dashboard/next-12-months?includeDetails=true`

## 7) Fluxos de navegação principais

- **Fluxo guest -> auth**
  - Usuário não autenticado acessando área privada é redirecionado para `auth/login?next=...`.
- **Fluxo login/cadastro -> app**
  - Login e cadastro autenticam localmente e redirecionam para `next` ou `/`.
- **Fluxo sem família**
  - Usuário autenticado sem família (`NO_FAMILY_FOR_USER`) vai para `onboarding/family`.
- **Fluxo com família**
  - Usuário autenticado com família entra no shell (`/`) e navega por menu lateral/topo.
- **Fluxo de contexto visual**
  - Escopo global (`VISIBLE_TO_ME`/`PERSONAL`/`FAMILY`) é compartilhado entre contas e ocorrências.
  - Persistência leve em `localStorage`.
- **Fluxo financeiro**
  - Categorias -> contas -> ocorrências -> dashboard.
  - Mutações financeiras invalidam cache de dashboard para manter Home coerente.

## 8) Checklist do que ficou pronto

- [x] Base HTTP central com token bearer, erros e eventos globais.
- [x] Autenticação completa (cadastro, login, hidratação, logout local).
- [x] Guards de sessão (`guest`, `onboarding`, `private`).
- [x] Onboarding de família e contexto de família carregado globalmente.
- [x] Gestão de membros (listar, convidar pendente, trocar role, remover).
- [x] Gestão de permissões por membro.
- [x] Camada de autorização reutilizável por ação/permissão.
- [x] CRUD de categorias.
- [x] CRUD base de contas + ativar/desativar.
- [x] Listagem e operações de ocorrências (mark/unmark/override + filtros).
- [x] Home/dashboard operacional com widgets por endpoint real.
- [x] Projeção de 12 meses com detalhamento.
- [x] Contexto pessoal/família/visível compartilhado entre telas.
- [x] Refino de UX (feedback visual consistente, estados e responsividade).
- [x] Refino técnico final (tipagem, redução de duplicação, testes adicionais).

## 9) Pontos preparados para evolução futura

- Estrutura em `features/*` com separação `api/hooks/components/types/schema`.
- `queryKeys` centralizado para evolução de cache/invalidação.
- Guardas e autorização desacoplados da UI (reuso em novas telas).
- Contexto de escopo (`ViewScopeProvider`) pronto para ser consumido por novos módulos.
- `InlineFeedback`, `ErrorState`, `EmptyState`, `LoadingState` padronizados para UX consistente.
- Dashboard já dividido em widgets independentes (facilita novos blocos sem quebrar página inteira).
- Testes de API por módulo e testes utilitários de sessão/armazenamento já estabelecem base para ampliar cobertura de componentes.
