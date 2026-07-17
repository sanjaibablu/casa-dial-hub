
## Overview
Build a responsive admin dashboard with a collapsible sidebar and 4 CRUD sections, wired directly to your existing LEARNOVA Supabase project using `@supabase/supabase-js` with the anon key. No auth, no Lovable Cloud. Vercel-inspired clean modern aesthetic (neutral palette, subtle borders, generous spacing, monospace touches).

## Supabase wiring
- Add `@supabase/supabase-js`.
- Store URL + anon key as `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (via `set_secret` — anon key is publishable, safe in frontend).
- Create `src/lib/supabase.ts` exporting a browser client.
- All CRUD runs client-side. Assumes RLS on your tables permits anon read/write (or is disabled). If a table blocks anon, that section will show an error toast — you'll need to add RLS policies in Supabase.

## Routes (TanStack file-based)
- `src/routes/index.tsx` → redirect to `/properties`
- `src/routes/_dashboard.tsx` → layout with `SidebarProvider`, `AppSidebar`, header with `SidebarTrigger`, `<Outlet/>`
- `src/routes/_dashboard.properties.tsx`
- `src/routes/_dashboard.executives.tsx`
- `src/routes/_dashboard.dialect.tsx`
- `src/routes/_dashboard.knowledge.tsx`

## Components
- `src/components/app-sidebar.tsx` — collapsible icon sidebar, 4 nav items (Building2, Users, BookOpen, FileText), active-route highlight
- `src/components/data-table.tsx` — generic table (columns config, rows, edit/delete actions)
- `src/components/record-dialog.tsx` — shared create/edit modal with field config
- Reused shadcn: `sidebar`, `table`, `dialog`, `button`, `input`, `textarea`, `select`, `badge`, `sonner`

## Per-tab behavior
Each tab uses TanStack Query (`useSuspenseQuery` + `ensureQueryData` in loader) for list, and `useMutation` + `invalidateQueries` for create/update/delete.

- **Properties** — table columns: Name, Type, Status (badge), Location, Price. Create/Edit dialog with those fields. Type + Status as Select inputs (free text fallback if enum unknown).
- **Executives** — I'll fetch one row on load to detect columns, then render all non-system columns as inputs (since you didn't specify fields). CRUD by `id`.
- **Dialect Dictionary** — columns: Regional Word, Standard Meaning, Example. Simple form.
- **Knowledge Base** — form with Title input + large Content textarea → inserts into `company_documents`. Below the form, list of existing documents with expand/delete.

## Design system (Vercel-ish)
Update `src/styles.css` tokens:
- Background near-white `oklch(0.99 0 0)`, foreground near-black, subtle border `oklch(0.92 0 0)`, muted grey surfaces
- Dark mode mirror (near-black bg, subtle white borders)
- Geist Sans via `<link>` in `__root.tsx` head; mono for numbers/IDs
- Tight rounded-md, thin borders, no heavy shadows
- Update root `head()` title/description to "Admin Dashboard — LEARNOVA"

## Assumptions / open items
- Anon role must have SELECT/INSERT/UPDATE/DELETE on all 4 tables (or RLS policies allowing it). If not, we'll see permission errors and need to fix in Supabase.
- Executives schema unknown — dynamic field detection from first row. If the table is empty, I'll fall back to a minimal `{ name, email, phone }` form; tell me the real columns if different.
- `company_documents` assumed to have at least `title` and `content` columns.
- No file uploads for Knowledge Base — text content only, as specified.
