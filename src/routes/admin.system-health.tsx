// Admin diagnostics UI — surfaces operational metrics from cron_history,
// retry_queue, dead_letter_jobs and upload cleanup pipeline. Super admin only.
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle2, Clock, RefreshCw } from "lucide-react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell, StatCard } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getOpsStatusFn,
  getRecentCronHistory,
  getDeadLetterJobs,
} from "@/lib/ops/status.functions";

export const Route = createFileRoute("/admin/system-health")({
  head: () => ({
    meta: [
      { title: "Status Sistem — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminGuard>
      <SystemHealthPage />
    </AdminGuard>
  ),
});

function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  try {
    return new Date(s).toLocaleString("id-ID");
  } catch {
    return s;
  }
}

function fmtDuration(ms: number | null | undefined) {
  if (ms == null) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60_000).toFixed(1)}m`;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "completed" || status === "success"
      ? "bg-emerald-100 text-emerald-700"
      : status === "running"
      ? "bg-blue-100 text-blue-700"
      : status === "completed_with_errors"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tone}`}>
      {status}
    </span>
  );
}

function SystemHealthPage() {
  const fetchStatus = useServerFn(getOpsStatusFn);
  const fetchCron = useServerFn(getRecentCronHistory);
  const fetchDL = useServerFn(getDeadLetterJobs);

  const statusQ = useQuery({
    queryKey: ["ops-status"],
    queryFn: () => fetchStatus(),
    refetchInterval: 30_000,
  });
  const cronQ = useQuery({
    queryKey: ["ops-cron"],
    queryFn: () => fetchCron(),
    refetchInterval: 60_000,
  });
  const dlQ = useQuery({
    queryKey: ["ops-dead-letters"],
    queryFn: () => fetchDL(),
    refetchInterval: 60_000,
  });

  const s = statusQ.data;
  const refreshAll = () => {
    statusQ.refetch();
    cronQ.refetch();
    dlQ.refetch();
  };

  return (
    <AdminShell breadcrumb={[{ label: "Status Sistem" }]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Status Sistem</h1>
            <p className="text-sm text-muted-foreground">
              Pemantauan operasional: cron, retry queue, dead-letter, dan upload cleanup.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={refreshAll}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        {statusQ.isError && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Gagal memuat status: {(statusQ.error as Error)?.message ?? "unknown"}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Clock}
            label="Retry Pending"
            value={String((s?.retryQueue.pending ?? 0) + (s?.retryQueue.retrying ?? 0))}
            hint={`${s?.retryQueue.deadLetter ?? 0} dead-letter`}
          />
          <StatCard
            icon={AlertTriangle}
            label="Dead-letter belum dibereskan"
            value={String(s?.deadLetters.unresolved ?? 0)}
            hint={`total ${s?.deadLetters.total ?? 0}`}
          />
          <StatCard
            icon={Activity}
            label="Upload orphan"
            value={String(s?.uploads.orphanedPending ?? 0)}
            hint={`${s?.uploads.stuck ?? 0} stuck > 12 jam`}
          />
          <StatCard
            icon={CheckCircle2}
            label="Cron 24 jam"
            value={String(s?.cron.recentRuns ?? 0)}
            hint={`${s?.cron.failuresLast24h ?? 0} gagal`}
          />
        </div>

        {s?.cron.stale && s.cron.stale.length > 0 && (
          <Card className="border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="size-4" /> Cron job belum jalan dalam SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {s.cron.stale.map((j) => (
                <div key={j.jobName} className="flex justify-between border-b border-border/50 py-1 last:border-0">
                  <span className="font-medium">{j.jobName}</span>
                  <span className="text-muted-foreground">
                    {j.minutesSince ?? "—"} menit sejak sukses terakhir
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Cron (30 terakhir)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Job</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Mulai</th>
                  <th className="px-4 py-2">Durasi</th>
                  <th className="px-4 py-2">Rows</th>
                </tr>
              </thead>
              <tbody>
                {(cronQ.data ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-border/50">
                    <td className="px-4 py-2 font-medium">{r.job_name}</td>
                    <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-2 text-muted-foreground">{fmtDate(r.started_at)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{fmtDuration(r.duration_ms)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.affected_rows ?? "—"}</td>
                  </tr>
                ))}
                {(cronQ.data ?? []).length === 0 && !cronQ.isLoading && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Belum ada cron yang tercatat.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dead-letter Jobs (unresolved)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2">Job</th>
                  <th className="px-4 py-2">Pesan</th>
                  <th className="px-4 py-2">Retry</th>
                  <th className="px-4 py-2">Gagal pada</th>
                </tr>
              </thead>
              <tbody>
                {(dlQ.data ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-border/50">
                    <td className="px-4 py-2 font-medium">{r.job_name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.error_message ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.retry_count}</td>
                    <td className="px-4 py-2 text-muted-foreground">{fmtDate(r.failed_at)}</td>
                  </tr>
                ))}
                {(dlQ.data ?? []).length === 0 && !dlQ.isLoading && (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Tidak ada dead-letter aktif. 🎉</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          Data direfresh otomatis setiap 30–60 detik. Update terakhir: {fmtDate(s?.generatedAt)}
        </p>
      </div>
    </AdminShell>
  );
}
