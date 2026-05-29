// Notification producer (server-side). Memakai supabaseAdmin karena
// notifications.INSERT memang tidak diizinkan oleh RLS untuk user biasa
// (lihat policy notifications).
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type EnqueueArgs = {
  userId: string;
  tipe: string;
  judul: string;
  body?: string | null;
  link?: string | null;
  meta?: Record<string, unknown> | null;
};

export async function enqueueNotification(args: EnqueueArgs): Promise<void> {
  await supabaseAdmin.from("notifications").insert({
    user_id: args.userId,
    tipe: args.tipe,
    judul: args.judul,
    body: args.body ?? null,
    link: args.link ?? null,
    meta: (args.meta as never) ?? null,
  });
}

export async function enqueueMany(items: EnqueueArgs[]): Promise<void> {
  if (items.length === 0) return;
  await supabaseAdmin.from("notifications").insert(
    items.map((i) => ({
      user_id: i.userId,
      tipe: i.tipe,
      judul: i.judul,
      body: i.body ?? null,
      link: i.link ?? null,
      meta: (i.meta as never) ?? null,
    })),
  );
}
