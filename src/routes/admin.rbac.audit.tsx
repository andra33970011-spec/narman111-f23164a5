// Audit khusus perubahan RBAC.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { useAuth } from "@/lib/auth-context";
import { rbacAuditList } from "@/features/rbac/admin.functions";
import { fmtDateTime } from "@/lib/permohonan";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/admin/rbac/audit")({
  head: () => ({ meta: [{ title: "Audit RBAC — Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminGuard>
      <Page />
    </AdminGuard>
  ),
});

type Row = {
  id: string;
  created_at: string;
  aksi: string;
  entitas: string;
  data_sebelum: unknown;
  data_sesudah: unknown;
  actor: { nama_lengkap: string } | null;
  target: { nama_lengkap: string } | null;
};

function Page() {
  const { isSuperAdmin, isAdminPemda } = useAuth();
  const allowed = isSuperAdmin || isAdminPemda;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allowed) return;
    rbacAuditList()
      .then((r) => setRows((r as { rows: Row[] }).rows))
      .finally(() => setLoading(false));
  }, [allowed]);

  if (!allowed) {
    return (
      <AdminShell breadcrumb={[{ label: "RBAC", to: "/admin/rbac" }, { label: "Audit" }]}>
        <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
          Hanya Super Admin / Admin Pemda.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell breadcrumb={[{ label: "RBAC", to: "/admin/rbac" }, { label: "Audit" }]}>
      <Link to="/admin/rbac" className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-3 w-3" /> Kembali
      </Link>
      <h1 className="mb-1 font-display text-2xl font-bold">Audit RBAC</h1>
      <p className="mb-4 text-sm text-muted-foreground">200 perubahan role/permission/profil terbaru.</p>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-soft">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-surface text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Aktor</th>
              <th className="px-4 py-3 font-medium">Target</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
              <th className="px-4 py-3 font-medium">Entitas</th>
              <th className="px-4 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Memuat…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Belum ada catatan.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{fmtDateTime(r.created_at)}</td>
                <td className="px-4 py-3 text-xs">{r.actor?.nama_lengkap ?? "—"}</td>
                <td className="px-4 py-3 text-xs">{r.target?.nama_lengkap ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.aksi}</td>
                <td className="px-4 py-3 text-xs">{r.entitas}</td>
                <td className="px-4 py-3 text-xs">
                  {(r.data_sebelum || r.data_sesudah) ? (
                    <pre className="max-w-md overflow-x-auto rounded bg-muted p-2 text-[10px] text-foreground">
                      {JSON.stringify({ before: r.data_sebelum, after: r.data_sesudah })}
                    </pre>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
