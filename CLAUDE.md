# Specialist Admin Portal (specialist-admin)

Next.js 16 (App Router) + React 19 + TypeScript internal admin panel for the Specialist
marketplace: manage users, professionals, companies and requests. Talks to the same
`specialist-be` NestJS API as `specialist-fe`, using only its `/admin/*` endpoints (requires
`user.isAdmin`). Sibling repos in `/var/www/specialist/`: `specialist-be` (backend),
`specialist-fe` (public web app), `specialist-shared` (shared TS package — consumed here via
`@specialist/shared`, see Gotchas).

Runs on port **3000** in dev (default Next port; backend runs on 5000). No i18n — UI copy is
inline English/Spanish per component, unlike `specialist-fe`. No `.claude/rules/` subdivision yet
beyond what's below; this app is still small (Fase 1/2 per `README.md`).

## Commands

```bash
npm run dev                  # next dev, http://localhost:3000/admin/login
npm run build                # next build
npm start                    # next start (production)
npm run lint                 # eslint (flat config, eslint.config.mjs)
```

There is **no test suite** in this repo (no `jest`/`vitest`, no `test` script). Definition of done
for a change here: `npm run lint` clean and `npm run build` passes; verify the flow manually in
the browser since there's no automated coverage.

## Architecture in one screen

```
app/admin/             All real routes live under /admin (login, dashboard, users, requests,
                        professionals, companies). app/admin/layout.tsx is the auth+role guard
                        and renders AdminSidebar + AdminHeader around children.
app/test-shared/       Scratch page exercising @specialist/shared — stale, see Gotchas.
components/admin/      sidebar.tsx, header.tsx. Feature UI otherwise lives inline under
                        app/admin/<feature>/ pages rather than being extracted to components/.
components/ui/         Not created yet, despite components.json being configured for shadcn/ui
                        (style "new-york", aliases @/components/ui, @/lib/utils). Use
                        `npx shadcn add <component>` to scaffold one instead of hand-rolling.
hooks/                 One file per resource (use-users.ts, use-requests.ts, use-professionals.ts,
                        use-companies.ts, use-dashboard.ts), TanStack Query wrappers, same shape
                        as specialist-fe's hooks/ but hitting /admin/* endpoints.
lib/api.ts             axios instance (`api`) + interceptors + `authApi` (login/logout/getMe).
lib/api/admin.ts       Admin-specific request functions + hand-written response interfaces
                        (DashboardStats, User, ...) — see Gotchas re: duplication with
                        @specialist/shared.
lib/utils.ts           `cn()` (clsx + tailwind-merge), the shadcn convention.
```

## Conventions

- Auth token key is `admin_token` in `localStorage` (distinct from `specialist-fe`'s `token` key —
  they do not share a session). `useAdminAuth()` (`hooks/use-admin-auth.ts`) is the single source
  of truth for auth state: it only marks the user authenticated if `getMe()` succeeds **and**
  `user.isAdmin` is true. A non-admin user with a valid token is treated as unauthenticated here.
- `AdminLayout` (`app/admin/layout.tsx`) guards every route under `app/admin/` except
  `/admin/login`: no token → redirect to login immediately; token present → wait for
  `useAdminAuth()`, then redirect if `!isAuthenticated`. It also gates first paint on a `mounted`
  flag to avoid a hydration mismatch from reading `localStorage` during SSR — keep that pattern
  (check `mounted` before touching `localStorage` or branching on client-only state) in any new
  top-level layout/guard.
- Data fetching follows the same one-hook-per-resource + TanStack Query pattern as
  `specialist-fe` (see that repo's `.claude/rules/01-data-fetching.md` for the general shape).
  Mutations invalidate the relevant `['admin', ...]`-prefixed query key in `onSuccess`.
- Styling: TailwindCSS v4 (`@tailwindcss/postcss`) + `cn()` for conditional classes +
  `class-variance-authority`/`radix-ui`/`lucide-react` for shadcn-style primitives once
  `components/ui/` exists.
- Prettier/ESLint here use no semicolons and single quotes in existing files (see `lib/api.ts`),
  even without a checked-in `.prettierrc` — match the surrounding file's style; `npm run lint`
  (flat ESLint config) is the enforced gate, not a Prettier config.
- Commits: mix of `feat(admin): ...`, `fix: ...`, and free-form (`improovements`) — prefer
  `feat(admin): ...` / `fix: ...` / `docs: ...` for new commits, consistent with `specialist-be`.

## Gotchas

- **`@specialist/shared`'s `User`/`UserRole` types are stale and do not match the real backend
  model.** `src/types/user.ts` in `specialist-shared` models a single `role: UserRole` enum
  (`USER|ADMIN|PROFESSIONAL|COMPANY`) and a `name` field; the actual backend `User` has
  `firstName`/`lastName` and multiple independent profile booleans
  (`hasClientProfile`/`hasProfessionalProfile`/`hasCompanyProfile`/`isAdmin`), matching what
  `AuthResponse.user` in the same package already reflects correctly. `app/test-shared/page.tsx`
  is a leftover scratch page built against the stale `User` type — don't copy its shape.
  `lib/api/admin.ts` re-declares its own local `User`/`DashboardStats` interfaces instead of
  importing from `@specialist/shared`, which is the practical workaround; keep doing that until
  `specialist-shared`'s `types/user.ts` is fixed (see that repo's CLAUDE.md).
- `@specialist/shared` is installed as `github:DiegoSana/specialist-shared#main` (not from npm,
  not a local `file:`/workspace link) — a change in `specialist-shared` is **not** picked up here
  until it's pushed to `main` there and `npm install` is re-run (its `postinstall` runs `tsc`).
  There is no monorepo/workspace linking between these repos.
- `next.config.ts` is currently the Next.js default (no rewrites, no env passthrough) — unlike
  `specialist-fe`, this app talks to the backend directly via `NEXT_PUBLIC_API_URL` with no `/api`
  proxy rewrite. `NEXT_PUBLIC_API_URL` here already includes the `/api` suffix
  (`http://localhost:5000/api`, per `README.md`), whereas `specialist-fe`'s equivalent var does
  **not** include `/api` — don't copy the value or the parsing logic between the two repos without
  checking this.
- `components.json` (shadcn) is configured but `components/ui/` doesn't exist yet — a `cn`-based
  hand-rolled component and a shadcn-generated one can end up styled inconsistently if you're not
  careful; prefer generating via shadcn once you need a first primitive.
