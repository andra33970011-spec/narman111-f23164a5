// Server-side guard utilities. Pakai di handler createServerFn untuk menolak
// akses sebelum query. RLS tetap menjadi backstop.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { Permission } from "./constants";

type SB = SupabaseClient<Database>;

export async function userHasPermission(
  supabase: SB,
  userId: string,
  code: Permission,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_permission", {
    _user_id: userId,
    _code: code,
  });
  if (error) return false;
  return Boolean(data);
}

export async function requirePermissionOrThrow(
  supabase: SB,
  userId: string,
  code: Permission,
): Promise<void> {
  const ok = await userHasPermission(supabase, userId, code);
  if (!ok) throw new Error(`Akses ditolak: izin '${code}' tidak dimiliki.`);
}

// ---------- Fase 1: high-level domain guards ----------
// Helper-helper berikut dipanggil dari handler createServerFn untuk validasi
// kepemilikan & scoping OPD sebelum query. RLS tetap menjadi backstop.

async function getUserContext(supabase: SB, userId: string) {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("opd_id").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  const roleSet = new Set((roles ?? []).map((r) => r.role as string));
  return {
    opdId: (profile?.opd_id as string | null) ?? null,
    isSuper: roleSet.has("super_admin"),
    isPemda: roleSet.has("admin_pemda"),
    isAdminOpd: roleSet.has("admin_opd"),
    roleSet,
  };
}

export async function canManageForm(
  supabase: SB,
  userId: string,
  formOpdId: string | null,
): Promise<boolean> {
  const ctx = await getUserContext(supabase, userId);
  if (ctx.isSuper || ctx.isPemda) return true;
  if (ctx.isAdminOpd && formOpdId && ctx.opdId === formOpdId) return true;
  return userHasPermission(supabase, userId, "can_manage_forms" as Permission);
}

export async function canVerifySubmission(
  supabase: SB,
  userId: string,
  submissionOpdId: string | null,
): Promise<boolean> {
  const ctx = await getUserContext(supabase, userId);
  if (ctx.isSuper || ctx.isPemda) return true;
  if (ctx.isAdminOpd && submissionOpdId && ctx.opdId === submissionOpdId) return true;
  return userHasPermission(supabase, userId, "can_verify_submission" as Permission);
}

export async function canApproveDataRequest(
  supabase: SB,
  userId: string,
  targetOpdId: string | null,
): Promise<boolean> {
  const ctx = await getUserContext(supabase, userId);
  if (ctx.isSuper || ctx.isPemda) return true;
  if (ctx.isAdminOpd && targetOpdId && ctx.opdId === targetOpdId) return true;
  return userHasPermission(supabase, userId, "can_approve_data_request" as Permission);
}

export async function canApproveRegistration(
  supabase: SB,
  userId: string,
  candidateOpdId: string | null,
): Promise<boolean> {
  const ctx = await getUserContext(supabase, userId);
  if (ctx.isSuper || ctx.isPemda) return true;
  if (ctx.isAdminOpd && candidateOpdId && ctx.opdId === candidateOpdId) return true;
  return userHasPermission(supabase, userId, "can_approve_registration" as Permission);
}

export async function canAccessSubmission(
  supabase: SB,
  userId: string,
  submission: { user_id: string; opd_id: string | null },
): Promise<boolean> {
  if (submission.user_id === userId) return true;
  return canVerifySubmission(supabase, userId, submission.opd_id);
}

