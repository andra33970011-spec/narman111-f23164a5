import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getAssignment } from "@/lib/assignments.functions";
import { saveDraft, submitSubmission } from "@/lib/submissions.functions";
import { createUploadSession, finalizeUpload, getSignedPreview, deleteSubmissionFile } from "@/lib/uploads.functions";
import { PageShell } from "@/components/site/PageShell";
import type { FormField, FormSchemaSnapshot } from "@/features/forms/schema/types";
import { ArrowLeft, Save, Send, Upload, X, FileText, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/tugas/$assignmentId")({
  head: () => ({ meta: [{ title: "Pengisian Tugas" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

type FileRow = { id: string; field_kode: string; storage_path: string; mime: string | null; size_bytes: number | null };
type SubmissionRow = { id: string; status: string; data: Record<string, unknown>; review_note: string | null };

function Page() {
  const { assignmentId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState<FormSchemaSnapshot | null>(null);
  const [judul, setJudul] = useState("");
  const [submission, setSubmission] = useState<SubmissionRow | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [data, setData] = useState<Record<string, unknown>>({});
  const lastSavedRef = useRef<string>("");
  const dirtyRef = useRef(false);

  async function load() {
    setLoading(true);
    try {
      const r = (await getAssignment({ data: { id: assignmentId } })) as {
        assignment: { id: string; forms: { judul: string; schema_snapshot: FormSchemaSnapshot } };
        submission: SubmissionRow | null;
      };
      setJudul(r.assignment.forms.judul);
      setSnapshot(r.assignment.forms.schema_snapshot);
      setSubmission(r.submission);
      setData((r.submission?.data as Record<string, unknown>) ?? {});
      lastSavedRef.current = JSON.stringify(r.submission?.data ?? {});
      if (r.submission) await loadFiles(r.submission.id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }

  async function loadFiles(_subId: string) {
    setFiles([]);
  }

  useEffect(() => {
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, assignmentId]);

  useEffect(() => {
    const t = setInterval(async () => {
      if (!dirtyRef.current || busy) return;
      if (submission && !["draft", "revision_required"].includes(submission.status)) return;
      const snap = JSON.stringify(data);
      if (snap === lastSavedRef.current) return;
      try {
        const r = (await saveDraft({
          data: submission
            ? { submissionId: submission.id, data }
            : { assignmentId, data },
        })) as { id: string };
        lastSavedRef.current = snap;
        if (!submission) setSubmission({ id: r.id, status: "draft", data, review_note: null });
        dirtyRef.current = false;
      } catch {
      }
    }, 5000);
    return () => clearInterval(t);
  }, [data, submission, busy, assignmentId]);

  function setField(kode: string, value: unknown) {
    dirtyRef.current = true;
    setData((d) => ({ ...d, [kode]: value }));
  }

  async function manualSave() {
    setBusy(true);
    try {
      const r = (await saveDraft({
        data: submission ? { submissionId: submission.id, data } : { assignmentId, data },
      })) as { id: string };
      lastSavedRef.current = JSON.stringify(data);
      if (!submission) setSubmission({ id: r.id, status: "draft", data, review_note: null });
      dirtyRef.current = false;
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }

  async function doSubmit() {
    if (!submission) { await manualSave(); }
    setBusy(true);
    try {
      const r = (await saveDraft({
        data: submission ? { submissionId: submission.id, data } : { assignmentId, data },
      })) as { id: string };
      await submitSubmission({ data: { submissionId: submission?.id ?? r.id } });
      alert("Submission terkirim untuk review.");
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal submit"); }
    finally { setBusy(false); }
  }

  if (authLoading || loading) return <PageShell><div className="py-20 text-center text-muted-foreground">Memuat…</div></PageShell>;
  if (!user) return <PageShell><div className="py-20 text-center"><Link to="/auth" className="text-primary">Silakan masuk</Link></div></PageShell>;
  if (!snapshot) return <PageShell><div className="py-20 text-center text-muted-foreground">Schema form tidak tersedia.</div></PageShell>;

  const readOnly = submission ? !["draft", "revision_required"].includes(submission.status) : false;

  return (
    <PageShell>
      <div className="container-page py-6">
        <Link to="/asn/tugas" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3 w-3" /> Kembali ke daftar tugas</Link>
        <h1 className="mt-2 font-display text-2xl font-bold">{judul}</h1>
        {submission && (
          <div className="mt-1 text-xs">Status: <span className="font-semibold uppercase">{submission.status}</span>{submission.review_note && <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-amber-700">Catatan: {submission.review_note}</span>}</div>
        )}

        <form onSubmit={(e) => e.preventDefault()} className="mt-4 space-y-4">
          {snapshot.fields.map((f) => (
            <FieldRenderer
              key={f.kode}
              field={f}
              value={data[f.kode]}
              onChange={(v) => setField(f.kode, v)}
              readOnly={readOnly}
              submissionId={submission?.id ?? null}
              files={files.filter((x) => x.field_kode === f.kode)}
              onFilesChanged={async () => { if (submission) await loadFiles(submission.id); }}
            />
          ))}
          {!readOnly && (
            <div className="flex flex-wrap gap-2 pt-2">
              <button onClick={manualSave} disabled={busy} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm"><Save className="h-4 w-4" /> Simpan Draft</button>
              <button onClick={doSubmit} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft"><Send className="h-4 w-4" /> Submit</button>
            </div>
          )}
        </form>
      </div>
    </PageShell>
  );
}

function FieldRenderer({ field, value, onChange, readOnly, submissionId, files, onFilesChanged }: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
  submissionId: string | null;
  files: FileRow[];
  onFilesChanged: () => Promise<void> | void;
}) {
  const inputCls = "mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60";
  const label = (
    <label className="text-sm font-medium">{field.label}{field.required && <span className="text-destructive"> *</span>}</label>
  );
  const help = field.help_text && <p className="mt-1 text-xs text-muted-foreground">{field.help_text}</p>;

  switch (field.tipe) {
    case "short_text":
      return <div>{label}<input type="text" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} placeholder={field.placeholder ?? ""} className={inputCls} />{help}</div>;
    case "long_text":
      return <div>{label}<textarea value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} placeholder={field.placeholder ?? ""} rows={4} className={inputCls} />{help}</div>;
    case "number":
      return <div>{label}<input type="number" value={(value as number | string) ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} disabled={readOnly} className={inputCls} />{help}</div>;
    case "date":
      return <div>{label}<input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} className={inputCls} />{help}</div>;
    case "dropdown":
      return <div>{label}<select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={readOnly} className={inputCls}><option value="">-- pilih --</option>{field.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help}</div>;
    case "radio":
      return (
        <div>{label}
          <div className="mt-1 space-y-1">
            {field.options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input type="radio" name={field.kode} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} disabled={readOnly} /> {o.label}
              </label>
            ))}
          </div>
          {help}
        </div>
      );
    case "checkbox": {
      const arr = (Array.isArray(value) ? value : []) as string[];
      return (
        <div>{label}
          <div className="mt-1 space-y-1">
            {field.options.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={arr.includes(o.value)} onChange={(e) => {
                  const next = e.target.checked ? [...arr, o.value] : arr.filter((v) => v !== o.value);
                  onChange(next);
                }} disabled={readOnly} /> {o.label}
              </label>
            ))}
          </div>
          {help}
        </div>
      );
    }
    case "file_upload":
    case "multi_file_upload":
      return (
        <FileUploader
          field={field}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          submissionId={submissionId}
          files={files}
          onFilesChanged={onFilesChanged}
          label={label}
          help={help}
        />
      );
    default:
      return null;
  }
}

function FileUploader({ field, value, onChange, readOnly, submissionId, files, onFilesChanged, label, help }: {
  field: FormField;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
  submissionId: string | null;
  files: FileRow[];
  onFilesChanged: () => Promise<void> | void;
  label: React.ReactNode;
  help: React.ReactNode;
}) {
  const multi = field.tipe === "multi_file_upload";
  const paths: string[] = useMemo(() => {
    if (multi) return Array.isArray(value) ? (value as string[]) : [];
    return value ? [value as string] : [];
  }, [value, multi]);
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f || !submissionId) {
      if (!submissionId) alert("Simpan draft terlebih dahulu sebelum upload");
      return;
    }
    setUploading(true);
    try {
      const sess = (await createUploadSession({
        data: { submissionId, fieldKode: field.kode, filename: f.name, mime: f.type, sizeBytes: f.size },
      })) as { signedUrl: string; path: string };
      const up = await fetch(sess.signedUrl, { method: "PUT", body: f, headers: { "Content-Type": f.type } });
      if (!up.ok) throw new Error("Upload gagal");
      await finalizeUpload({ data: { submissionId, fieldKode: field.kode, storagePath: sess.path, mime: f.type, sizeBytes: f.size } });
      const next = multi ? [...paths, sess.path] : sess.path;
      onChange(next);
      await onFilesChanged();
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal upload"); }
    finally { setUploading(false); }
  }

  async function preview(path: string) {
    const f = files.find((x) => x.storage_path === path);
    if (!f) return alert("File belum siap, simpan dulu");
    const r = (await getSignedPreview({ data: { fileId: f.id, ttlSeconds: 300 } })) as { url: string };
    window.open(r.url, "_blank", "noopener");
  }
  async function remove(path: string) {
    const f = files.find((x) => x.storage_path === path);
    if (f) await deleteSubmissionFile({ data: { fileId: f.id } });
    const next = multi ? paths.filter((p) => p !== path) : null;
    onChange(next);
    await onFilesChanged();
  }

  return (
    <div>
      {label}
      <div className="mt-1 space-y-1">
        {paths.map((p) => (
          <div key={p} className="flex items-center gap-2 rounded-md border border-border bg-card px-2 py-1 text-xs">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate font-mono">{p.split("/").pop()}</span>
            <button type="button" onClick={() => preview(p)} className="inline-flex items-center gap-1 text-primary"><ExternalLink className="h-3 w-3" /></button>
            {!readOnly && <button type="button" onClick={() => remove(p)} className="text-destructive"><X className="h-3 w-3" /></button>}
          </div>
        ))}
        {!readOnly && (multi || paths.length === 0) && (
          <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-border px-3 py-2 text-xs hover:bg-muted">
            <Upload className="h-3.5 w-3.5" /> {uploading ? "Mengunggah…" : "Pilih file"}
            <input type="file" className="hidden" onChange={onFile} disabled={uploading} />
          </label>
        )}
      </div>
      {help}
    </div>
  );
}
