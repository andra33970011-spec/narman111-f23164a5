# Tahap B — Konsolidasi Authorization Layer (SELESAI)

## Yang sudah dikerjakan

### B1 — `src/features/rbac/guards.ts` (single source of truth)
- Export `getUserContext(supabase, userId)` → `AuthzContext` (roles, opd_id, desa, isPimpinan, isElevated).
- Helper sinkron baru (terima `AuthzContext`, no extra roundtrip):
  `canAccessForm`, `canSubmitForm`, `canViewSubmission`, `canReviewSubmission`,
  `canAccessAssignment`, `canUploadDocument`, `canShareDocument`,
  `canRequestDocument`, `canManageFormCtx`, `isElevated`, `isSameOpd`, `isSameDesa`.
- Util `assertOrThrow(check, msg)`.
- Helper async legacy (`canManageForm`, `canVerifySubmission`,
  `canApproveDataRequest`, `canApproveRegistration`, `canAccessSubmission`)
  diarahkan ke `getUserContext` + permission RPC.

### B2 — Refactor duplicate `getUserContext`
File-file ini sekarang delegate ke `getUserContext` shared (shim tipis dipertahankan agar handler tidak perlu di-rewrite):
- `src/lib/asn.functions.ts` (`userRolesAndOpd`)
- `src/lib/aset.functions.ts` (`userCtx`)
- `src/lib/dataset.functions.ts` (`userCtx`)
- `src/lib/verification.functions.ts` (`getRoles`, `getDesa`)
- `src/lib/admin-actions.functions.ts` (`assertSuperAdmin`, `assertAdminOrSuper`)
- `src/features/rbac/admin.functions.ts` (`assertSuper`, `assertSuperOrPemda`)

### B3 — UI authorization & permission cache
- `auth-context.tsx`: tambah `isElevated` (super_admin || admin_pemda).
- Realtime listener `user_permissions` per user → invalidate permission cache.
- `visibilitychange` refetch (throttle 60s) sebagai backstop.
- Listener existing `user_roles` (forced logout on downgrade) dipertahankan.

### B4 — Audit ringkas
- Semua route admin (`admin.*.tsx`) sudah dibungkus `AdminGuard` lewat
  `src/routes/__root.tsx`/`AdminShell`. Tidak ditemukan admin route tanpa guard.
- Semua `createServerFn` di `src/lib/*.functions.ts` & `src/features/rbac/*.functions.ts`
  menggunakan `requireSupabaseAuth` (kecuali public hooks di
  `src/routes/api/public/hooks/*` yang sengaja terbuka untuk cron + verifikasi signature).
- `PermissionGate` / `useCan` tetap satu-satunya jalur cek permission di UI.

## Catatan untuk Tahap C (workflow ASN)

- Gunakan `getUserContext` SEKALI di awal handler, lalu pakai helper sinkron
  (`canAccessForm`, `canViewSubmission`, dst) — jangan re-fetch role/opd.
- Untuk operasi sangat sensitif (RBAC, audit, backup) tetap pakai
  `assertSuper` / `assertSuperOrPemda` dari `admin.functions.ts`.
- Permission baru → daftarkan di `src/features/rbac/constants.ts` + tabel
  `permissions` (SQL); RPC `has_permission` & `get_effective_permissions`
  sudah mengkonsumsi dari sana.

## Non-goals (sengaja tidak dilakukan)
- Tidak ada perubahan skema DB / RLS.
- Tidak ada perubahan visual UI.
- Tidak ada workflow ASN baru — disimpan untuk Tahap C.
