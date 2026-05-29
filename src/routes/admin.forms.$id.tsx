import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  getForm,
  updateFormMeta,
  saveFormFields,
  saveFormTargets,
  publishForm,
  archiveForm,
} from "@/lib/forms.functions";
import { FIELD_TYPES, type FormField } from "@/features/forms/schema/types";
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Send, Archive, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/forms/$id")({
  head: () => ({ meta: [{ title: "Admin — Edit Form" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <AdminShell breadcrumb={[{ label: "Form Builder", to: "/admin/forms" }, { label: "Edit" }]}>
        <Page />
      </AdminShell>
    </AdminGuard>
  ),
});

type Target = { target_type: "opd" | "asn_type" | "role" | "position" | "unit_kerja" | "individu"; target_value: string };

function emptyField(idx: number): FormField {
  return {
    kode: `field_${idx + 1}`,
    label: `Field ${idx + 1}`,
    tipe: "short_text",
    required: false,
    placeholder: null,
    help_text: null,
    options: [],
    validation: {},
    urutan: idx,
  };
}

function Page() {
  const { id } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState<{ judul: string; deskripsi: string; deadline: string; allow_multiple_submit: boolean; status: string }>({
    judul: "",
    deskripsi: "",
    deadline: "",
    allow_multiple_submit: false,
    status: "draft",
  });
  const [fields, setFields] = useState<FormField[]>([]);
  const [targets, setTargets] = useState<Target[]>([]);
  const [tab, setTab] = useState<"meta" | "fields" | "targets">("meta");

  async function load() {
    setLoading(true);
    try {
      const r = (await getForm({ data: { id } })) as {
        form: { judul: string; deskripsi: string | null; deadline: string | null; allow_multiple_submit: boolean; status: string };
        fields: Array<{ kode: string; label: string; tipe: FormField["tipe"]; required: boolean; placeholder: string | null; help_text: string | null; options: unknown; validation: unknown; urutan: number }>;
        targets: Target[];
      };
      setMeta({
        judul: r.form.judul,
        deskripsi: r.form.deskripsi ?? "",
        deadline: r.form.deadline ? r.form.deadline.slice(0, 16) : "",
        allow_multiple_submit: r.form.allow_multiple_submit,
        status: r.form.status,
      });
      setFields(
        r.fields.map((f, i) => ({
          kode: f.kode,
          label: f.label,
          tipe: f.tipe,
          required: f.required,
          placeholder: f.placeholder,
          help_text: f.help_text,
          options: (f.options as FormField["options"]) ?? [],
          validation: (f.validation as FormField["validation"]) ?? {},
          urutan: f.urutan ?? i,
        })),
      );
      setTargets(r.targets);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal memuat");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const readOnly = meta.status !== "draft";

  async function saveMeta() {
    setBusy(true);
    try {
      await updateFormMeta({
        data: {
          id,
          judul: meta.judul,
          deskripsi: meta.deskripsi || null,
          deadline: meta.deadline ? new Date(meta.deadline).toISOString() : null,
          allow_multiple_submit: meta.allow_multiple_submit,
        },
      });
      alert("Metadata tersimpan");
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }
  async function saveFields() {
    setBusy(true);
    try {
      await saveFormFields({ data: { id, fields: fields.map((f, i) => ({ ...f, urutan: i })) } });
      alert("Field tersimpan");
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }
  async function saveTargetsAct() {
    setBusy(true);
    try {
      await saveFormTargets({ data: { id, targets } });
      alert("Target tersimpan");
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }
  async function doPublish() {
    if (!confirm("Publish form? Setelah publish, schema akan dikunci dan assignment dibuat.")) return;
    setBusy(true);
    try {
      const r = (await publishForm({ data: { id } })) as { assignments: number };
      alert(`Form dipublish. ${r.assignments} assignment dibuat.`);
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }
  async function doArchive() {
    if (!confirm("Arsipkan form?")) return;
    setBusy(true);
    try {
      await archiveForm({ data: { id } });
      await load();
    } catch (e) { alert(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }

  function moveField(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= fields.length) return;
    const arr = [...fields];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setFields(arr);
  }

  if (loading) return <div className="text-sm text-muted-foreground">Memuat…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Link to="/admin/forms" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3 w-3" /> Kembali</Link>
          <h2 className="font-display text-xl font-bold">{meta.judul || "(Tanpa Judul)"}</h2>
          <p className="text-xs text-muted-foreground">Status: <span className="font-semibold uppercase">{meta.status}</span></p>
        </div>
        <div className="flex gap-2">
          {meta.status === "draft" && (
            <button onClick={doPublish} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-gradient-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-soft disabled:opacity-50">
              <Send className="h-4 w-4" /> Publish
            </button>
          )}
          {meta.status !== "archived" && (
            <button onClick={doArchive} disabled={busy} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm">
              <Archive className="h-4 w-4" /> Arsipkan
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["meta", "fields", "targets"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 text-sm font-medium ${tab === t ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {t === "meta" ? "Metadata" : t === "fields" ? "Field" : "Target Pengisi"}
          </button>
        ))}
      </div>

      {tab === "meta" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div>
            <label className="text-xs font-medium">Judul</label>
            <input value={meta.judul} onChange={(e) => setMeta({ ...meta, judul: e.target.value })} disabled={readOnly} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60" />
          </div>
          <div>
            <label className="text-xs font-medium">Deskripsi</label>
            <textarea value={meta.deskripsi} onChange={(e) => setMeta({ ...meta, deskripsi: e.target.value })} disabled={readOnly} rows={3} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium">Tenggat (opsional)</label>
              <input type="datetime-local" value={meta.deadline} onChange={(e) => setMeta({ ...meta, deadline: e.target.value })} disabled={readOnly} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60" />
            </div>
            <label className="flex items-center gap-2 text-sm self-end">
              <input type="checkbox" checked={meta.allow_multiple_submit} onChange={(e) => setMeta({ ...meta, allow_multiple_submit: e.target.checked })} disabled={readOnly} />
              Boleh submit berulang
            </label>
          </div>
          {!readOnly && (
            <button onClick={saveMeta} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Simpan Metadata</button>
          )}
        </div>
      )}

      {tab === "fields" && (
        <div className="space-y-3">
          {readOnly && <p className="text-xs text-amber-600">Field hanya dapat diubah saat form berstatus draft.</p>}
          {fields.map((f, i) => (
            <FieldEditor
              key={i}
              field={f}
              readOnly={readOnly}
              onChange={(nf) => {
                const arr = [...fields];
                arr[i] = nf;
                setFields(arr);
              }}
              onRemove={() => setFields(fields.filter((_, k) => k !== i))}
              onUp={() => moveField(i, -1)}
              onDown={() => moveField(i, 1)}
            />
          ))}
          {!readOnly && (
            <div className="flex gap-2">
              <button onClick={() => setFields([...fields, emptyField(fields.length)])} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Tambah Field</button>
              <button onClick={saveFields} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Simpan Semua Field</button>
            </div>
          )}
        </div>
      )}

      {tab === "targets" && (
        <div className="space-y-3 rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Tentukan siapa yang harus mengisi form ini. Jika kosong, default = semua user di OPD pemilik form.</p>
          {targets.map((t, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <select value={t.target_type} onChange={(e) => { const arr = [...targets]; arr[i] = { ...t, target_type: e.target.value as Target["target_type"] }; setTargets(arr); }} className="col-span-4 rounded-md border border-border bg-background px-2 py-1.5 text-sm">
                <option value="opd">OPD (id)</option>
                <option value="role">Role</option>
                <option value="asn_type">ASN Type</option>
                <option value="position">System Position</option>
                <option value="individu">User (id)</option>
                <option value="unit_kerja">Unit Kerja</option>
              </select>
              <input value={t.target_value} onChange={(e) => { const arr = [...targets]; arr[i] = { ...t, target_value: e.target.value }; setTargets(arr); }} placeholder="value" className="col-span-7 rounded-md border border-border bg-background px-2 py-1.5 text-sm" />
              <button onClick={() => setTargets(targets.filter((_, k) => k !== i))} className="col-span-1 inline-flex items-center justify-center rounded-md border border-border text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setTargets([...targets, { target_type: "role", target_value: "asn" }])} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm"><Plus className="h-4 w-4" /> Tambah Target</button>
            <button onClick={saveTargetsAct} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"><Save className="h-4 w-4" /> Simpan Target</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldEditor({ field, readOnly, onChange, onRemove, onUp, onDown }: {
  field: FormField;
  readOnly: boolean;
  onChange: (f: FormField) => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const hasOptions = ["dropdown", "radio", "checkbox"].includes(field.tipe);
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12">
        <div className="md:col-span-3">
          <label className="text-[10px] uppercase text-muted-foreground">Kode</label>
          <input value={field.kode} onChange={(e) => onChange({ ...field, kode: e.target.value.toLowerCase() })} disabled={readOnly} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono disabled:opacity-60" />
        </div>
        <div className="md:col-span-4">
          <label className="text-[10px] uppercase text-muted-foreground">Label</label>
          <input value={field.label} onChange={(e) => onChange({ ...field, label: e.target.value })} disabled={readOnly} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-60" />
        </div>
        <div className="md:col-span-3">
          <label className="text-[10px] uppercase text-muted-foreground">Tipe</label>
          <select value={field.tipe} onChange={(e) => onChange({ ...field, tipe: e.target.value as FormField["tipe"] })} disabled={readOnly} className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-60">
            {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 flex items-end gap-1">
          <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={field.required} onChange={(e) => onChange({ ...field, required: e.target.checked })} disabled={readOnly} /> Wajib</label>
        </div>
        <div className="md:col-span-12">
          <label className="text-[10px] uppercase text-muted-foreground">Placeholder / Help</label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <input value={field.placeholder ?? ""} onChange={(e) => onChange({ ...field, placeholder: e.target.value || null })} disabled={readOnly} placeholder="placeholder" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-60" />
            <input value={field.help_text ?? ""} onChange={(e) => onChange({ ...field, help_text: e.target.value || null })} disabled={readOnly} placeholder="help text" className="rounded-md border border-border bg-background px-2 py-1.5 text-sm disabled:opacity-60" />
          </div>
        </div>
        {hasOptions && (
          <div className="md:col-span-12">
            <label className="text-[10px] uppercase text-muted-foreground">Opsi (satu per baris: value|label)</label>
            <textarea
              value={field.options.map((o) => `${o.value}|${o.label}`).join("\n")}
              onChange={(e) => onChange({
                ...field,
                options: e.target.value.split("\n").filter(Boolean).map((line) => {
                  const [v, l] = line.split("|");
                  return { value: (v ?? "").trim(), label: (l ?? v ?? "").trim() };
                }).filter((o) => o.value),
              })}
              disabled={readOnly}
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs font-mono disabled:opacity-60"
              placeholder="opt1|Opsi 1"
            />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <button onClick={onUp} disabled={readOnly} className="rounded-md border border-border p-1 text-muted-foreground disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
        <button onClick={onDown} disabled={readOnly} className="rounded-md border border-border p-1 text-muted-foreground disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
        <button onClick={onRemove} disabled={readOnly} className="rounded-md border border-border p-1 text-destructive disabled:opacity-30"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    </div>
  );
}
