---
paths:
  - "hooks/**"
  - "lib/api.ts"
  - "lib/api/**"
  - "app/admin/**"
---

# Data fetching & server state

- One hook file per resource in `hooks/` (`use-users.ts`, `use-requests.ts`,
  `use-professionals.ts`, `use-companies.ts`, `use-dashboard.ts`), built on
  `@tanstack/react-query` on top of `lib/api.ts`'s `api` instance or a resource-specific module
  under `lib/api/` (e.g. `lib/api/admin.ts`). Don't call `api`/`axios` directly from a page —
  extend a hook.
- Most real endpoints here are under `/admin/*` on the backend (`admin.contract.ts` in
  `specialist-shared` documents the path shapes) and require `user.isAdmin`; a 403 from one of
  these usually means the logged-in user isn't an admin, not a bug in the request. The review
  moderation endpoints are the one exception: they live under `/reviews/admin/pending` and
  `/reviews/:id/approve|reject` (not `/admin/reviews/*`) — still guarded by `AdminGuard`, just a
  different resource prefix (see `lib/api/admin.ts`'s `getPendingReviews`/`approveReview`/
  `rejectReview`).
- Query keys are prefixed by resource, e.g. `['admin', 'me']`, and mutations invalidate the
  affected key(s) in `onSuccess` (see `useAdminAuth()`'s login mutation invalidating `['admin',
  'me']`). Follow the same convention for new resources.
- `lib/api/admin.ts` hand-declares response interfaces (`DashboardStats`, `User`, ...) rather than
  importing from `@specialist/shared` — this is deliberate (see root `CLAUDE.md` Gotchas re: the
  stale `User`/`UserRole` types in that package). Keep new admin-only response shapes local here
  too, unless/until `specialist-shared` is fixed.
