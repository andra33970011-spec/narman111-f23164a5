// Detail RBAC user — assign asn_type, system_position, override permission.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/lib/auth-context";
import {
  rbacGetUser, rbacUpdateProfileMeta,
  rbacSetPermissionOverride, rbacRemovePermissionOverride,
} from "@/features/rbac/admin.functions";
import { ASN_TYPES, POSITIONS, ASN_TYPE_LABEL, POSITION_LABEL, ROLE_LABEL, type AppRole } from "@/features/rbac/constants";
import { ChevronLeft, Check, X, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/rbac/$userId")({
  head: () => ({ meta: [{ title: "Detail RBAC — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Page />
    </AdminGuard>
  ),
});

type Override = { permission_code: string; granted: boolean; expires_at: string | null; reason: string | null };
type Catalog = { code: string; label: string; kategori: string; description: string | null };
type State = {
  profile: { id: string; nama_lengkap: string; nip: string | null; jabatan: string | null; asn_type: string | null; system_position: string | null; opd: { singkatan: string | null; nama: string } | null } | null;
  roles: string[];
  overrides: Override[];
  effective: string[];
  catalog: Catalog[];
};

function Page() {
  const { isSuperAdmin } = useAuth();
  const { userId } = Route.useParams();
  const [s, setS] = useState<State | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function load() {
    rbacGetUser({ data: { user_id: userId } }).then((r) => setS(r as State));
  }
  useEffect(() => { if (isSuperAdmin) load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId, isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <AdminShell breadcrumb={[{ label: "RBAC", to: "/admin/rbac" }, { label: "Detail" }]}>
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Hanya untuk Super Admin.
        </div>
      </AdminShell>
    );
  }

  if (!s) {
    return (
      <AdminShell breadcrumb={[{ label: "RBAC", to: "/admin/rbac" }, { label: "Detail" }]}>
        <div className="p-8 text-sm text-muted-foreground">Memuat…</div>
      </AdminShell>
    );
  }

  const overrideMap = new Map(s.overrides.map((o) => [o.permission_code, o]));
  const effectiveSet = new Set(s.effective);

  type MetaPatch = { asn_type?: "pns" | "pppk_penuh_waktu" | "pppk_paruh_waktu" | "honorer" | null; system_position?: "kepala_opd" | "sekretaris" | "kepala_bidang" | "kepala_sekolah" | "operator" | "verifikator" | "staff" | "guru" | "tenaga_teknis" | "lainnya" | null };
  async function saveMeta(patch: MetaPatch) {
    setBusy(true); setMsg(null);
    try {
      await rbacUpdateProfileMeta({ data: { user_id: userId, ...patch } });
      setMsg("Tersimpan.");
      load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Gagal menyimpan"); }
    finally { setBusy(false); }
  }



  async function setOverride(code: string, granted: boolean) {
    setBusy(true); setMsg(null);
    try {
      await rbacSetPermissionOverride({ data: { user_id: userId, permission_code: code, granted } });
      load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }
  async function clearOverride(code: string) {
    setBusy(true); setMsg(null);
    try {
      await rbacRemovePermissionOverride({ data: { user_id: userId, permission_code: code } });
      load();
    } catch (e) { setMsg(e instanceof Error ? e.message : "Gagal"); }
    finally { setBusy(false); }
  }

  const groups = new Map<string, Catalog[]>();
  for (const c of s.catalog) {
    const arr = groups.get(c.kategori) ?? [];
    arr.push(c);
    groups.set(c.kategori, arr);
  }

  return (
    <AdminShell breadcrumb={[{ label: "RBAC", to: "/admin/rbac" }, { label: s.profile?.nama_lengkap ?? "Detail" }]}>
      <Link to="/admin/rbac" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-3 w-3" /> Kembali
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Profil</div>
          <h1 className="mt-1 font-display text-xl font-bold">{s.profile?.nama_lengkap || "(tanpa nama)"}</h1>
          <div className="mt-1 text-xs text-muted-foreground">{s.profile?.nip ?? "—"} • {s.profile?.jabatan ?? "—"}</div>
          <div className="mt-1 text-xs text-muted-foreground">OPD: {s.profile?.opd?.nama ?? "—"}</div>

          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Role</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {s.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
              {s.roles.map((r) => (
                <span key={r} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {ROLE_LABEL[r as AppRole] ?? r}
                </span>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Ubah role di halaman Manajemen User.</p>
          </div>

          <div className="mt-4 space-y-3 border-t border-border pt-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Tipe ASN</span>
              <select
                disabled={busy}
                value={s.profile?.asn_type ?? ""}
                onChange={(e) => saveMeta({ asn_type: (e.target.value || null) as Parameters<typeof saveMeta>[0]["asn_type"] })}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">— belum diatur —</option>
                {Object.values(ASN_TYPES).map((v) => <option key={v} value={v}>{ASN_TYPE_LABEL[v]}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Jabatan Sistem</span>
              <select
                disabled={busy}
                value={s.profile?.system_position ?? ""}
                onChange={(e) => saveMeta({ system_position: (e.target.value || null) as Parameters<typeof saveMeta>[0]["system_position"] })}
                className="mt-1 h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
              >
                <option value="">— belum diatur —</option>
                {Object.values(POSITIONS).map((v) => <option key={v} value={v}>{POSITION_LABEL[v]}</option>)}
              </select>
            </label>
            {msg && <div className="text-xs text-muted-foreground">{msg}</div>}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="font-display text-base font-bold">Permission</h2>
            <span className="text-[11px] text-muted-foreground">
              {effectiveSet.size} aktif • {s.overrides.length} override
            </span>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Centang hijau = aktif lewat role. Tombol <strong>Grant</strong> memaksa aktif, <strong>Deny</strong> memaksa tidak aktif, terlepas dari role.
          </p>

          <div className="space-y-4">
            {Array.from(groups.entries()).map(([kategori, items]) => (
              <div key={kategori}>
                <div className="mb-1 text-[10px] uppercase tracking-widest text-muted-foreground">{kategori}</div>
                <ul className="divide-y divide-border rounded-md border border-border">
                  {items.map((p) => {
                    const ov = overrideMap.get(p.code);
                    const active = effectiveSet.has(p.code);
                    return (
                      <li key={p.code} className="flex flex-wrap items-center gap-2 px-3 py-2 text-xs">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                              {active ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            </span>
                            <span className="font-medium">{p.label}</span>
                            <code className="text-[10px] text-muted-foreground">{p.code}</code>
                            {ov && (
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ov.granted ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                                {ov.granted ? "GRANT" : "DENY"}
                              </span>
                            )}
                          </div>
                          {p.description && <div className="ml-6 mt-0.5 text-[11px] text-muted-foreground">{p.description}</div>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            disabled={busy}
                            onClick={() => setOverride(p.code, true)}
                            className="rounded-md border border-success/40 bg-success/10 px-2 py-1 text-[10px] font-semibold text-success hover:bg-success/20"
                          >Grant</button>
                          <button
                            disabled={busy}
                            onClick={() => setOverride(p.code, false)}
                            className="rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/20"
                          >Deny</button>
                          {ov && (
                            <button
                              disabled={busy}
                              onClick={() => clearOverride(p.code)}
                              className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-semibold hover:bg-muted"
                              aria-label="Hapus override"
                            ><Trash2 className="h-3 w-3" /></button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
