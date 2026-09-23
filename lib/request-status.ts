// Shared status label/color map for Request records.
//
// The real backend `RequestStatus` enum (`@prisma/client`, specialist-be) has 15 values.
// Keep this list in sync with that enum — it's duplicated here rather than imported from
// `@specialist/shared` per this repo's convention (see CLAUDE.md Gotchas: `lib/api/admin.ts`
// hand-declares response shapes instead of relying on the stale/partial shared package).
export const REQUEST_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'SENT',
  'CONTACT_RELEASED',
  'IN_PROGRESS',
  'FINISHED',
  'CLOSED',
  'UNDER_REVIEW',
  'EXPIRED',
  'NO_RESPONSE',
  'REJECTED',
  'CANCELLED',
  'NOT_COMPLETED',
  'INTERRUPTED',
  'ABANDONED',
] as const

export type RequestStatus = (typeof REQUEST_STATUSES)[number]

// Statuses that `PUT /admin/requests/:id/status` (specialist-be, RequestService.updateStatus,
// see PROVIDER_REQUIRED_STATUSES in request.entity.ts) rejects with a 400 when the request has
// no assigned provider. Kept here as the one shared source of truth so the status <select> can
// disable these options instead of letting the admin hit the server error. DRAFT, PUBLISHED,
// EXPIRED and CANCELLED are exempt on the backend and must stay out of this set.
export const PROVIDER_REQUIRED_STATUSES: ReadonlySet<RequestStatus> = new Set([
  'SENT',
  'CONTACT_RELEASED',
  'IN_PROGRESS',
  'FINISHED',
  'CLOSED',
  'UNDER_REVIEW',
  'NOT_COMPLETED',
  'INTERRUPTED',
  'ABANDONED',
  'REJECTED',
  'NO_RESPONSE',
])

interface RequestStatusMeta {
  label: string
  badgeClass: string
}

// Grouped by family: draft/pending (greys), active/in-progress (blues-purples),
// success (greens), review/attention (yellows), terminal/failure (reds).
export const REQUEST_STATUS_META: Record<RequestStatus, RequestStatusMeta> = {
  DRAFT: { label: 'Draft', badgeClass: 'bg-gray-100 text-gray-800' },
  PUBLISHED: { label: 'Published', badgeClass: 'bg-slate-100 text-slate-800' },

  SENT: { label: 'Sent', badgeClass: 'bg-sky-100 text-sky-800' },
  CONTACT_RELEASED: {
    label: 'Contact Released',
    badgeClass: 'bg-indigo-100 text-indigo-800',
  },
  IN_PROGRESS: { label: 'In Progress', badgeClass: 'bg-purple-100 text-purple-800' },

  FINISHED: { label: 'Finished', badgeClass: 'bg-green-100 text-green-800' },
  CLOSED: { label: 'Closed', badgeClass: 'bg-emerald-100 text-emerald-800' },

  UNDER_REVIEW: { label: 'Under Review', badgeClass: 'bg-yellow-100 text-yellow-800' },
  EXPIRED: { label: 'Expired', badgeClass: 'bg-amber-100 text-amber-800' },
  NO_RESPONSE: { label: 'No Response', badgeClass: 'bg-orange-100 text-orange-800' },

  REJECTED: { label: 'Rejected', badgeClass: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelled', badgeClass: 'bg-rose-100 text-rose-800' },
  NOT_COMPLETED: { label: 'Not Completed', badgeClass: 'bg-pink-100 text-pink-800' },
  INTERRUPTED: { label: 'Interrupted', badgeClass: 'bg-red-200 text-red-900' },
  ABANDONED: { label: 'Abandoned', badgeClass: 'bg-stone-200 text-stone-800' },
}

const DEFAULT_STATUS_BADGE_CLASS = 'bg-gray-100 text-gray-800'

/** Tailwind badge classes for a status. Falls back to a neutral grey for anything unrecognized. */
export function getStatusBadgeColor(status: string): string {
  return (
    REQUEST_STATUS_META[status as RequestStatus]?.badgeClass ??
    DEFAULT_STATUS_BADGE_CLASS
  )
}

/** Human-readable label for a status. Falls back to the raw value for anything unrecognized. */
export function getStatusLabel(status: string): string {
  return REQUEST_STATUS_META[status as RequestStatus]?.label ?? status
}
