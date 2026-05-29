import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { listMyAssignments } from "@/lib/assignments.functions";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageShell } from "@/components/site/PageShell";
import { ListChecks, ArrowRight, Clock } from "lucide-react";

export const Route = createFileRoute("/asn/tugas")({
  head: () => ({ meta: [{ title: "Tugas ASN" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

type Row = {
  id: string;
  form_id: string;
  status: string;
  due_at: string | null;
  assigned_at: string;
  forms: { judul: string; deskripsi: string | null; deadline: string | null; status: string } | null;
};

function Page() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setBusy(true);
      try {
        const r = (await listMyAssignments({ data: { page: 0, pageSize: 50 } })) as { rows: Row[] };
        setRows(r.rows);
      } finally {
        setBusy(false);
      }
    })();
  }, [user]);

  if (loading) return <PageShell><div className="py-20 text-center text-muted-foreground">Memuat…</div></PageShell>;
  if (!user) {
    return (
      <>
        <Header />
        <PageShell>
          <div className="py-20 text-center">
            <h1 className="font-display text-2xl font-bold">Masuk diperlukan</h1>
            <p className="mt-2 text-sm text-muted-foreground">Silakan masuk untuk melihat tugas Anda.</p>
            <Link to="/auth" className="mt-4 inline-flex h-10 items-center rounded-md bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground">Masuk</Link>
          </div>
        </PageShell>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-4 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h1 className="font-display text-2xl font-bold">Tugas Saya</h1>
        </div>
        {busy ? (
          <div className="py-10 text-center text-muted-foreground">Memuat…</div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">Belum ada tugas.</div>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Link key={r.id} to="/tugas/$assignmentId" params={{ assignmentId: r.id }} className="block rounded-xl border border-border bg-card p-4 hover:border-primary">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">{r.forms?.status ?? "—"}</div>
                    <h3 className="mt-0.5 font-display text-lg font-bold">{r.forms?.judul ?? "(form dihapus)"}</h3>
                    {r.forms?.deskripsi && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.forms.deskripsi}</p>}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className={`rounded px-1.5 py-0.5 font-semibold uppercase ${r.status === "submitted" ? "bg-success/15 text-success" : r.status === "overdue" ? "bg-destructive/15 text-destructive" : "bg-amber-100 text-amber-700"}`}>{r.status}</span>
                      {r.due_at && <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="h-3 w-3" /> Tenggat: {new Date(r.due_at).toLocaleDateString("id-ID")}</span>}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </PageShell>
      <Footer />
    </>
  );
}
