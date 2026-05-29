// Manajemen RBAC — daftar user dengan role/permission.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/lib/auth-context";
import { rbacListUsers } from "@/features/rbac/admin.functions";
import { ROLE_LABEL, ASN_TYPE_LABEL, POSITION_LABEL, type AppRole, type AsnType, type SystemPosition } from "@/features/rbac/constants";
import { Search, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/rbac")({
  head: () => ({ meta: [{ title: "RBAC — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Page />
    </AdminGuard>
  ),
});

type Row = {
  id: string;
  nama_lengkap: string;
  nip: string | null;
  jabatan: string | null;
  asn_type: AsnType | null;
  system_position: SystemPosition | null;
  opd: { singkatan: string | null; nama: string } | null;
  roles: string[];
};

function Page() {
  const { isSuperAdmin } = useAuth();
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const t = setTimeout(() => {
      setLoading(true);
      rbacListUsers({ data: { q } })
        .then((r) => setRows((r as { rows: Row[] }).rows))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <AdminShell breadcrumb={[{ label: "RBAC" }]}>
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Hanya untuk Super Admin.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell breadcrumb={[{ label: "RBAC" }]}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Manajemen RBAC</h1>
          <p className="text-sm text-muted-foreground">Atur role, tipe ASN, jabatan sistem, dan permission per user.</p>
        </div>
        <Link to="/admin/rbac/audit" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-medium hover:bg-muted">
          <ShieldCheck className="h-3.5 w-3.5" /> Audit RBAC
        </Link>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-md border border-border bg-background px-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          className="h-9 flex-1 bg-transparent text-sm outline-none"
          placeholder="Cari nama / NIP…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={80}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">OPD</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Tipe ASN</th>
              <th className="px-4 py-3 font-medium">Jabatan Sistem</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Memuat…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Tidak ada user.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.nama_lengkap || "(tanpa nama)"}</div>
                  <div className="text-[11px] text-muted-foreground">{r.nip ?? "-"} • {r.jabatan ?? "-"}</div>
                </td>
                <td className="px-4 py-3 text-xs">{r.opd?.singkatan ?? r.opd?.nama ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {r.roles.length === 0 && <span className="text-xs text-muted-foreground">—</span>}
                    {r.roles.map((role) => (
                      <span key={role} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {ROLE_LABEL[role as AppRole] ?? role}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">{r.asn_type ? ASN_TYPE_LABEL[r.asn_type] : "—"}</td>
                <td className="px-4 py-3 text-xs">{r.system_position ? POSITION_LABEL[r.system_position] : "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link to="/admin/rbac/$userId" params={{ userId: r.id }} className="text-xs font-semibold text-primary hover:underline">
                    Kelola →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
