---
paths:
  - "lib/api.ts"
  - "hooks/use-admin-auth.ts"
  - "app/admin/layout.tsx"
  - "app/admin/login/**"
  - "components/admin/**"
---

# Auth & the admin guard

- Token lives in `localStorage` under `admin_token` (not `token` — that key is `specialist-fe`'s,
  a separate session, don't try to share it). Set/read/removed only in `lib/api.ts`
  (`authApi.login`/`authApi.logout`) and `hooks/use-admin-auth.ts`.
- `useAdminAuth()` is the only source of truth for "is this user allowed in the admin panel":
  it treats the user as authenticated only when `getMe()` resolves **and** `isAdmin` is true.
  Never gate a page purely on "token exists" — a valid token for a non-admin user must still be
  treated as unauthenticated here.
- `AdminLayout` (`app/admin/layout.tsx`) is the single guard for everything under `app/admin/**`
  except `/admin/login`. It reads `localStorage` only after a `mounted` state flips true (avoids
  an SSR/CSR hydration mismatch) — replicate that `mounted` gate in any new top-level guard or
  layout that branches on `localStorage`/`isAuthenticated` during first render.
- On a 401, `lib/api.ts`'s response interceptor already clears `admin_token` and hard-redirects to
  `/admin/login` — don't add a second 401 handler in a hook or page.
- New admin-only pages go under `app/admin/<feature>/`, inheriting the guard automatically; don't
  add pages outside `app/admin/` that also need the admin check without adding an equivalent guard.
