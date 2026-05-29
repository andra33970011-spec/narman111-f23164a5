# Tahap B — Konsolidasi Authorization Layer

Tujuan: jadikan `src/features/rbac/guards.ts` sebagai single source of truth untuk authorization (server + UI), hilangkan duplikasi `getUserContext`, dan standardize permission/OPD scoping.

## Scope (tidak menambah fitur baru)

### 1. Centralized server authorization — `src/features/rbac/guards.ts`

Tambah/normalisasi helper berikut. Semua menerima `(supabase, userId, resource)` dan return `boolean`. Sumber tunggal `getUserContext` (sudah ada) dipakai semua helper.

- `canAccessForm(supabase, userId, form: { opd_id, target_role })`
- `canSubmitForm(supabase, userId, assignment: { user_id, form_id })`
- `canViewSubmission(supabase, userId, submission: { user_id, opd_id })`
- `canReviewSubmission(supabase, userId, submission: { opd_id })` — alias semantik untuk `canVerifySubmission`
- `canAccessAssignment(supabase, userId, assignment: { user_id, opd_id })`
- `canUploadDocument(supabase, userId, ctx: { opd_id })`
- `canShareDocument(supabase, userId, doc: { owner_user_id, opd_id })`
- `canRequestDocument(supabase, userId)`

Tambah util:
- `assertOrThrow(check: Promise<boolean>, msg?)` — wrapper untuk handler.
- Export type `AuthzContext = Awaited<ReturnType<typeof getUserContext>>` agar bisa dipakai luar.

### 2. Konsolidasi `getUserContext` duplikat

File-file ini punya helper user-roles/OPD sendiri → refactor untuk import dari `guards.ts`:

- `src/lib/asn.functions.ts` — `userRolesAndOpd()` → ganti `getUserContext` shared.
- `src/lib/aset.functions.ts` — cek & ganti jika ada helper sejenis.
- `src/lib/dataset.functions.ts` — cek & ganti.
- `src/lib/verification.functions.ts` — cek & ganti.
- `src/lib/admin-actions.functions.ts` — cek & ganti.
- `src/features/rbac/admin.functions.ts` — `assertSuper/assertSuperOrPemda` tetap, tapi delegate ke `getUserContext`.

Ekspos `getUserContext` dari `guards.ts` (saat ini private). Tetap server-only.

### 3. Hardcoded role check → helper

Cari `isSuperAdmin || isAdminOpd`, `roles.includes("admin_opd")`, `role === "..."` lalu ganti pakai `ctx.isSuper / ctx.isAdminOpd` dari `getUserContext` atau permission-based check.

### 4. UI authorization consistency

- `src/lib/auth-context.tsx`: tambah memo `isElevatedAdmin = isSuperAdmin || isAdminPemda` (jika belum) dan pastikan UI gates pakai itu, bukan re-check string role.
- `AdminGuard.tsx`: tetap minimal, tapi pakai `isElevatedAdmin` + `isAdminDesa` untuk admin desa.
- Pastikan `PermissionGate` / `useCan` (di `src/features/rbac/hooks.ts` & `components.tsx`) tetap satu-satunya jalur cek di komponen. Tidak ada perubahan API.

### 5. Permission cache invalidation

Di `auth-context.tsx`:
- Listener `onAuthStateChange` untuk `TOKEN_REFRESHED`, `USER_UPDATED` → refetch `getEffectivePermissions`.
- Realtime subscribe ke `user_roles` & `user_permissions` filter `user_id=eq.<me>` → invalidate permissions cache; jika role hilang → force signOut (sudah ada dari Tahap A, pastikan jalan untuk permission update juga).
- Refetch on `visibilitychange` (focus polling ringan, 60s throttle).

### 6. Type safety

- Pastikan helper di `guards.ts` menerima `Permission`/`AppRole` dari `constants.ts` (sudah typed).
- Return type `AuthzResult = { allowed: boolean; reason?: string }` opsional — TIDAK diadopsi sekarang agar perubahan minimal; tetap boolean + throw.

### 7. Audit pass

Grep cepat:
- `createServerFn` tanpa `requireSupabaseAuth` middleware (kecuali public hooks) → tandai.
- Route `admin.*.tsx` tanpa `AdminGuard` → tandai.
- Komponen yang menampilkan tombol admin tanpa `useCan`/`PermissionGate` → tandai.

Output audit ditulis sebagai komentar singkat di `.lovable/plan.md` (bukan rewrite besar).

## Non-goals

- Tidak menambah workflow ASN baru.
- Tidak mengubah skema DB.
- Tidak mengubah UI visual.
- Tidak refactor RLS policies (sudah selesai Tahap A).

## Batches

1. **B1** — `guards.ts`: export `getUserContext`, tambah 8 helper baru.
2. **B2** — Refactor server fn (asn, aset, dataset, verification, admin-actions) untuk pakai shared context.
3. **B3** — `auth-context.tsx`: tambah realtime permission invalidation + visibility refetch.
4. **B4** — Audit pass + ringkasan di `.lovable/plan.md`.

Setiap batch selesai → typecheck via build harness.
