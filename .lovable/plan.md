# Tahap D — Workflow ASN Runtime

Skema database inti sudah ada (`forms`, `form_fields`, `form_targets`, `form_assignments`, `dataset_template/submission`, `document_access`, `notifications`, `audit_log`). Plan ini menambahkan runtime di atas skema tersebut, bukan rewrite. Saya akan eksekusi per batch dan menunggu konfirmasi singkat tiap selesai 1 batch supaya bisa di-review.

## Asumsi & batasan
- Storage bucket aktif: `form-submissions` (privat). Signed URL TTL 5 menit untuk preview/download.
- State machine submission: `draft → submitted → under_review → (approved | rejected | revision_required → submitted)`. `approved`/`rejected` final + immutable. Disimpan di kolom `dataset_submission.status` (sudah ada, tipe text — tetap text, tidak ubah enum agar non-breaking).
- Tidak membuat tabel baru kalau bisa pakai yang ada. Tabel baru hanya jika perlu: `form_submission_files` (lampiran terikat submission), `form_submission_versions` (snapshot revisi).
- Form schema versioning: snapshot `form_fields` ke kolom JSONB `forms.schema_snapshot` saat publish → assignment & submission selalu mengacu snapshot, bukan field live.
- Tidak menyentuh UI existing `admin.cms`/`pengisian.*` di batch 1; batch 6 yang mengganti/menggabungkan UI lama.

## Arsitektur modular (folder baru)
```text
src/features/forms/
  schema/           types.ts, validator.ts (zod dari schema_snapshot), state-machine.ts
  builder/          FormBuilder, FieldEditor, TargetEditor, PreviewPane (komponen kecil)
  renderer/         SchemaRenderer + fields/{ShortText,LongText,Dropdown,Checkbox,Radio,Number,Date,FileUpload,MultiFileUpload}.tsx
  hooks/            useFormDraft (autosave), useUploadSession
src/lib/
  forms.functions.ts          server fns: createForm, updateForm, publishForm, archiveForm, getForm
  assignments.functions.ts    generateAssignments, listMyAssignments, getAssignment, updateAssignmentStatus
  submissions.functions.ts    saveDraft, submitSubmission, requestRevision, approveSubmission, rejectSubmission, listForReview
  uploads.functions.ts        createUploadSession (signed upload), finalizeUpload, getSignedPreview
  notifications.functions.ts  enqueueNotification (server-side producer)
```

Semua server-fn pakai `requireSupabaseAuth` + helper authorization Tahap B (`getUserContext`, `canAccessForm`, `canSubmitForm`, `canReviewSubmission`, dll). Tidak ada query langsung di komponen.

## Batches (urutan eksekusi)

### Batch 1 — Skema runtime tambahan (1 migrasi)
- `ALTER TABLE forms ADD COLUMN schema_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, ADD COLUMN published_by uuid;`
- Tabel `form_submission_files(id, submission_id, field_kode, storage_path, mime, size_bytes, uploaded_by, created_at)` + RLS (owner submission + reviewer scoped + admin).
- Tabel `form_submission_versions(id, submission_id, version int, data jsonb, files jsonb, created_at, created_by)` untuk audit revisi.
- Trigger validasi state transition di `dataset_submission` (raise jika `approved/rejected → *`).
- Trigger insert ke `audit_log` untuk perubahan status submission.
- GRANTs + index `(form_id, user_id)`, `(submission_id, field_kode)`.

### Batch 2 — Form Builder (admin)
- `src/features/forms/schema/*` (types + zod builder dari `form_fields`).
- `src/features/forms/builder/*` (komponen kecil, satu file per panel).
- `src/lib/forms.functions.ts`: CRUD draft, publish (snapshot fields → `schema_snapshot`, freeze), archive, duplicate.
- Route baru: `/admin/forms` (list + filter status), `/admin/forms/$id` (editor draft), `/admin/forms/$id/preview`.
- Authorization: `super_admin`, `admin_pemda`, `admin_opd` (scoped `opd_pemilik_id`), atau permission `can_manage_forms`.

### Batch 3 — Assignment engine
- `assignments.functions.ts.generateAssignments(formId)`: dipanggil pada `publishForm`. Resolve target dari `form_targets` (opd/asn_type/role/system_position/user) → upsert `form_assignments`.
- Notifikasi `assignment.created` via `notifications.functions.ts`.
- Route ASN: `/asn/tugas` (list assignment user) + filter status & due.

### Batch 4 — Submission runtime
- `submissions.functions.ts`: saveDraft (idempotent per assignment), submit (validasi terhadap `schema_snapshot`), requestRevision, approve, reject.
- State machine guard server-side + trigger DB.
- Route ASN: `/tugas/$assignmentId` → renderer schema-driven + autosave 5s debounce + status pill.
- Optimistic UI hanya untuk save draft; submit/approve menunggu konfirmasi server.

### Batch 5 — Upload workflow & signed URL
- `uploads.functions.ts.createUploadSession`: validasi mime/size/field, return signed upload URL (storage `form-submissions`, path `submissions/{submission_id}/{field}/{uuid}-{filename}`).
- `finalizeUpload`: validasi object exists, insert `form_submission_files`.
- `getSignedPreview`: TTL 300s, cek `canViewSubmission` / `canReviewSubmission`.
- Field `FileUpload`/`MultiFileUpload` pakai upload session, bukan upload langsung dari client tanpa validasi.

### Batch 6 — Verification UI & audit
- Route `/admin/verifikasi/submission` (reviewer scoped via `canReviewSubmission`).
- Aksi: approve, reject (wajib note), request_revision (wajib note). Tulis ke `audit_log` lewat trigger Batch 1 + entry eksplisit di server-fn.
- `/admin/verifikasi-log` (sudah ada) ditambahkan tab khusus submission.

### Batch 7 — Notification producer & reminder
- Insert `notifications` lewat `supabaseAdmin` di server-fn (assignment, approval, rejection, revision_required).
- Reminder: server route `/api/public/hooks/assignment-reminder` (dipanggil pg_cron) — cek due_at < now+24h && status assigned → notify. Pakai HMAC header.

### Batch 8 — Hardening
- Pagination (`range`) untuk list assignment/submission/forms (default 20).
- Realtime: 1 channel per route (assignment list per `user_id`, submission detail per `submission_id`) — bukan broad table.
- Replace UI lama `admin.dataset`/`pengisian.*` dengan redirect ke route baru (kompat).

## Non-goals (tetap dilarang sampai Tahap E)
- Skor/penilaian submission.
- Workflow approval multi-tier.
- Export Excel dari submission baru (tetap pakai `admin.dataset` export lama untuk dataset_template).
- Mobile-specific scanning untuk form (terpisah dari fitur QR absensi).

## Risiko
- Trigger state machine bisa konflik dengan policy update existing → akan diuji dengan unit insert sebelum dipakai UI.
- `forms.schema_snapshot` JSONB membutuhkan kontrak ketat — saya freeze versi 1 schema di batch 1, validator di Batch 2.
- Storage bucket `form-submissions` sudah ada (cek context); policy upload akan dibatasi via signed URL server-fn (tidak ada upload langsung dari client).

## Eksekusi
Saya mulai dari **Batch 1 (migrasi)** karena seluruh runtime bergantung padanya. Setelah migrasi disetujui & dijalankan, saya lanjut Batch 2–8 berturut-turut, melaporkan singkat tiap batch selesai supaya bisa di-review tanpa harus menelan satu PR raksasa.