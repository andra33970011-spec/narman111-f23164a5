# Tahap A — Hardening Kritis (RBAC, Auth, RLS, Security)

Tujuan: kunci fondasi sebelum membangun workflow ASN. **Tidak ada fitur baru.** UI existing dipertahankan, struktur file dipertahankan semaksimal mungkin. Setiap perubahan adalah perbaikan production blocker.

---

## Urutan Eksekusi

Saya kerjakan dalam 4 batch sehingga setiap batch bisa diverifikasi build-nya sebelum lanjut.

### Batch 1 — Privilege Escalation & Auth Middleware (paling kritis)

**B4 — `src/lib/registration.functions.ts`**
- Whitelist field input via Zod (nama_lengkap, email, password, no_hp, nik, desa, opd_id, asn_type — TIDAK termasuk role/permission/system_position elevated).
- Paksa `role = 'asn'`, `verification_status = 'pending'`, tidak insert ke `user_permissions`.
- Tolak payload yang membawa field elevated (`role`, `system_position` elevated seperti `kepala_opd`/`kepala_bidang`, `permission_code`).
- Anti-duplicate: cek NIK/email sebelum signUp.
- Hash check error → response generik (tidak bocor info user existence).

**B1 — Fetch monkey patch**
- Audit `src/start.ts`: hapus override `window.fetch`/`globalThis.fetch` jika ada; biarkan hanya `attachSupabaseAuth` di `functionMiddleware`.
- `src/integrations/supabase/auth-attacher.ts` adalah file template auto-generated → tidak diedit (sesuai aturan project). Pastikan saja sudah ter-register di `start.ts`.
- Tambahkan same-origin guard di middleware kustom yang masih menyentuh fetch (jika ada).

**B6 — `src/features/rbac/admin.functions.ts`**
- Tambah helper `assertSuper(userId)` dan `assertSuperOrPemda(userId)` (server-side via service-role client, cek `user_roles`).
- Panggil `assertSuper` di semua fungsi audit RBAC (list audit, detail audit).
- Panggil `assertSuperOrPemda` di fungsi yang grant `admin_opd`/`admin_desa`/permission elevated. `super_admin` hanya bisa di-grant via DB langsung (sudah dilindungi trigger).
- Hilangkan ekspos data audit lintas user untuk role non-super.

### Batch 2 — Admin Pemda Consistency + Cleanup RBAC

**B8 — Konsistensi `admin_pemda`**
- `src/lib/auth-context.tsx`: tambah `isElevatedAdmin = super_admin || admin_pemda` helper.
- `src/features/rbac/guards.ts` + `hooks.ts` + `constants.ts`: gunakan helper yang sama; satu sumber kebenaran.
- UI gate (Header/AdminShell/AdminGuard): pakai helper, jangan cek role string ad-hoc.
- Server function: gunakan `assertSuperOrPemda` di tempat yang sebelumnya hanya cek `has_role('admin_pemda')` parsial.

**Remove dead RBAC routes**
- Hapus file: `src/routes/admin.rbac.tsx`, `admin.rbac.$userId.tsx`, `admin.rbac.audit.tsx`.
- Tambahkan redirect compatibility: ketiga path tersebut redirect ke `/admin/users` (RBAC sudah menyatu di Manajemen User). Implementasi via route file kecil dengan `beforeLoad: () => redirect(...)`.

**Dead code audit**
- Hapus helper duplikat permission di `src/features/rbac/*` yang sudah digantikan `has_permission`/`has_role` server-side.
- Konsolidasi cek role ad-hoc di komponen → pakai `useAuth()` helper.

### Batch 3 — RLS Hardening, Indexes, Verification Status

Satu migration SQL gabungan:

**RLS hardening**
- `dataset_submission`: hapus policy `sub user kelola sendiri` (overlap dengan policy `sub insert/select/update sendiri`), pastikan tidak ada `ALL` policy yang membuka DELETE tak terkontrol untuk user.
- `document_access`: revisi `da manage admin` agar `WITH CHECK` mewajibkan `granted_by = auth.uid()` (sudah ada), tapi `USING` di-scope ke OPD admin yang relevan, bukan semua admin_opd.
- `notifications`: tambahkan policy INSERT (saat ini disabled untuk semua) → izinkan hanya `service_role` (tidak perlu policy karena service_role bypass), eksplisit blok INSERT dari authenticated.
- `form_assignments`: pastikan `fa update self status` hanya boleh mengubah kolom `status` (via trigger guard) bukan field lain. Tambah trigger `prevent_form_assignment_tamper` yang menolak update di luar kolom `status`.

**Index optimization**
```sql
CREATE INDEX IF NOT EXISTS idx_form_assignments_form_id ON form_assignments(form_id);
CREATE INDEX IF NOT EXISTS idx_form_assignments_user_form ON form_assignments(user_id, form_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_requester ON data_requests(requester_user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_target_opd ON data_requests(target_opd_id);
```
(Tabel `submissions`/`submission_answers`/`submission_files` belum ada di skema — skip; akan dilampirkan ke task workflow ASN nanti.)

**Verification status consolidation**
- Trigger `sync_verified_at`: bila `verification_status` berubah ke `verified`, set `verified_at = now()`; jika berubah keluar dari `verified`, set `verified_at = null`. Sebaliknya, update langsung `verified_at` tidak diizinkan (di-handle trigger `protect_verified_profile` yang sudah ada).
- Backfill: untuk row dengan `verified_at IS NOT NULL` tapi `verification_status != 'verified'` → set status `verified` (atau sebaliknya, sesuai data mayoritas — akan dicek dulu).

### Batch 4 — Auth Session Hardening + Final Verification

**Auth session hardening (`src/lib/auth-context.tsx`)**
- Tambah listener `onAuthStateChange` untuk event `USER_UPDATED` → invalidate cache permission.
- Polling ringan permissions saat tab focus (refetch `get_effective_permissions`).
- Bila role berubah (deteksi via perbedaan snapshot), `supabase.auth.signOut()` + redirect `/auth`.

**Final pass**
- Jalankan supabase linter, perbaiki issue yang muncul akibat migration baru (search_path mutable bila ada).
- Build check.
- Update security memory dengan posture baru.

---

## Yang TIDAK Dikerjakan di Tahap A

- Workflow ASN baru (form, submission, dataset workflow runtime) — Tahap B.
- Rate limiting backend — sesuai panduan project, primitive belum tersedia; akan diberi catatan di security memory.
- Rewrite UI atau perubahan visual.
- Perubahan storage bucket / signed URL flow di luar yang sudah ada (akan diaudit, bukan diganti).

---

## Risiko & Mitigasi

- **Migration menyentuh RLS produksi** → migrasi idempoten (`DROP POLICY IF EXISTS` sebelum `CREATE`).
- **Penghapusan route RBAC** bisa memecahkan bookmark admin → diganti dengan redirect, bukan 404.
- **Forced logout saat role berubah** bisa terasa agresif → hanya trigger saat role *berkurang* (downgrade), bukan setiap perubahan.

---

Konfirmasi rencana ini (atau beri tahu batch mana yang ingin diprioritaskan / di-skip), lalu saya mulai dari Batch 1.