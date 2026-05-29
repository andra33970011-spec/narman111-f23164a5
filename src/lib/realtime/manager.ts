// Centralized realtime subscription manager.
// - Scoped channel names: "<scope>:<key>"
// - Reference-counted: multiple subscribers to the same scoped channel share one connection.
// - Auto cleanup on last unsubscribe.
// - Safe across React StrictMode double-effects.
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Listener = (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
type Binding = {
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  table: string;
  filter?: string;
};

type Entry = {
  channel: RealtimeChannel;
  refCount: number;
  listeners: Set<Listener>;
};

const registry = new Map<string, Entry>();

export type SubscribeOptions = {
  /** Stable channel name, e.g. "notifications:user:<uid>" */
  channelName: string;
  binding: Binding;
  onPayload: Listener;
};

/**
 * Subscribe to a scoped realtime channel. Returns an unsubscribe function.
 * Multiple subscribers to the same channelName share one underlying channel.
 */
export function subscribeRealtime({ channelName, binding, onPayload }: SubscribeOptions): () => void {
  let entry = registry.get(channelName);
  if (!entry) {
    const channel = supabase.channel(channelName);
    const listeners = new Set<Listener>();
    (channel as unknown as {
      on: (
        type: "postgres_changes",
        cfg: Record<string, string | undefined>,
        cb: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void,
      ) => RealtimeChannel;
    }).on(
      "postgres_changes",
      {
        event: binding.event,
        schema: binding.schema ?? "public",
        table: binding.table,
        ...(binding.filter ? { filter: binding.filter } : {}),
      },
      (payload) => {
        listeners.forEach((fn) => {
          try {
            fn(payload);
          } catch {
            /* swallow listener errors */
          }
        });
      },
    );
    channel.subscribe();
    entry = { channel, refCount: 0, listeners };
    registry.set(channelName, entry);
  }
  entry.listeners.add(onPayload);
  entry.refCount += 1;

  let unsubscribed = false;
  return () => {
    if (unsubscribed) return;
    unsubscribed = true;
    const e = registry.get(channelName);
    if (!e) return;
    e.listeners.delete(onPayload);
    e.refCount -= 1;
    if (e.refCount <= 0) {
      try {
        supabase.removeChannel(e.channel);
      } catch {
        /* ignore */
      }
      registry.delete(channelName);
    }
  };
}

/** Helper for the most common pattern: scoped per-user notification channel. */
export function subscribeUserNotifications(userId: string, onInsert: Listener): () => void {
  return subscribeRealtime({
    channelName: `notifications:user:${userId}`,
    binding: { event: "INSERT", table: "notifications", filter: `user_id=eq.${userId}` },
    onPayload: onInsert,
  });
}
