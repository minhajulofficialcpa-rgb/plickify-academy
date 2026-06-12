import { createServerSupabaseClient } from "./supabase/server";

export type UserRole = "student" | "support_moderator" | "content_manager" | "admin" | "super_admin";

export type AuthUser = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_locked: boolean;
  is_suspended: boolean;
  onboarding_completed: boolean;
};

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: string;
  is_locked: boolean;
  is_suspended: boolean;
  onboarding_completed: boolean;
}

/**
 * Get the current authenticated user with profile data.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  const p = profile as unknown as ProfileData;

  return {
    id: p.id,
    email: p.email || user.email || "",
    full_name: p.full_name,
    avatar_url: p.avatar_url,
    role: (p.role as UserRole) || "student",
    is_locked: p.is_locked,
    is_suspended: p.is_suspended,
    onboarding_completed: p.onboarding_completed,
  };
}

const roleHierarchy: Record<string, number> = {
  student: 0,
  support_moderator: 1,
  content_manager: 2,
  admin: 3,
  super_admin: 4,
};

/**
 * Check if a user has a specific role or higher.
 */
export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  const userLevel = roleHierarchy[user.role] ?? -1;
  const requiredLevel = roleHierarchy[requiredRole] ?? 99;
  return userLevel >= requiredLevel;
}
