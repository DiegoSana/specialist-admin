---
paths:
  - "components/**"
  - "components.json"
  - "app/globals.css"
---

# UI components (shadcn/Tailwind)

- `components.json` configures shadcn/ui (style `new-york`, base color `neutral`, CSS variables
  on, `@/components/ui` alias) but **`components/ui/` doesn't exist yet** — no primitive has been
  generated. When a page needs a first button/input/dialog/etc., generate it with
  `npx shadcn add <component>` rather than hand-rolling a styled `<div>`/`<button>`, so future
  components share one primitive set.
- Use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) to compose conditional Tailwind classes,
  the same convention shadcn-generated components use internally.
- Feature-specific composite components (tables, forms, cards for a given admin section) can live
  either in `components/admin/` (if reused across pages, like `sidebar.tsx`/`header.tsx`) or
  inline under `app/admin/<feature>/` (current convention for most feature UI) — match whichever
  pattern the feature you're touching already uses rather than introducing a third location.
- TailwindCSS here is v4 (`@tailwindcss/postcss`), not v3 like `specialist-fe` — v4 config lives
  in CSS (`app/globals.css` `@theme`/`@import` directives), not a `tailwind.config.js`; don't add
  one.
