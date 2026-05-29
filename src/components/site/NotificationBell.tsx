// Notification bell with scoped realtime channel and optimistic mark-as-read.
import { useEffect, useState, useCallback, useRef } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
} from "@/lib/notifications.functions";

type Notif = {
  id: string;
  tipe: string;
  judul: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [rows, setRows] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const refreshCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const r = (await unreadCount()) as { count: number };
      setCount(r.count ?? 0);
    } catch {
      /* ignore */
    }
  }, [user?.id]);

  const loadList = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const r = (await listMyNotifications({ data: { page: 0, pageSize: 15 } })) as { rows: Notif[] };
      setRows(r.rows ?? []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Scoped realtime channel per user
  useEffect(() => {
    if (!user?.id) {
      setCount(0);
      setRows([]);
      return;
    }
    refreshCount();
    const ch = supabase
      .channel(`notifications:user:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          setCount((c) => c + 1);
          if (open) loadList();
        },
      )
      .subscribe();
    channelRef.current = ch;
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    };
  }, [user?.id, open, refreshCount, loadList]);

  useEffect(() => {
    if (open) loadList();
  }, [open, loadList]);

  async function handleMarkAll() {
    const prev = count;
    setCount(0);
    setRows((rs) => rs.map((r) => ({ ...r, read_at: r.read_at ?? new Date().toISOString() })));
    try {
      await markAllRead();
    } catch {
      setCount(prev); // rollback on failure
    }
  }

  async function handleOpenItem(n: Notif) {
    if (!n.read_at) {
      setRows((rs) => rs.map((r) => (r.id === n.id ? { ...r, read_at: new Date().toISOString() } : r)));
      setCount((c) => Math.max(0, c - 1));
      try {
        await markRead({ data: { ids: [n.id] } });
      } catch {
        /* swallow; UI already updated */
      }
    }
    setOpen(false);
  }

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground hover:bg-muted"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-[18px] rounded-full bg-destructive px-1 text-[10px] font-bold leading-[18px] text-destructive-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-[340px] max-w-[92vw] rounded-lg border border-border bg-popover shadow-elegant">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <span className="text-sm font-semibold">Notifikasi</span>
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Tandai semua dibaca
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && <div className="px-3 py-6 text-center text-xs text-muted-foreground">Memuat…</div>}
              {!loading && rows.length === 0 && (
                <div className="px-3 py-10 text-center text-xs text-muted-foreground">Tidak ada notifikasi</div>
              )}
              {!loading &&
                rows.map((n) => {
                  const content = (
                    <div
                      className={`flex flex-col gap-0.5 border-b border-border/60 px-3 py-2 text-sm transition hover:bg-muted ${n.read_at ? "opacity-70" : "bg-primary/[0.03]"}`}
                    >
                      <span className="font-medium leading-tight">{n.judul}</span>
                      {n.body && <span className="line-clamp-2 text-xs text-muted-foreground">{n.body}</span>}
                      <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                        {new Date(n.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  );
                  return n.link ? (
                    <Link key={n.id} to={n.link} onClick={() => handleOpenItem(n)}>
                      {content}
                    </Link>
                  ) : (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleOpenItem(n)}
                      className="block w-full text-left"
                    >
                      {content}
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
