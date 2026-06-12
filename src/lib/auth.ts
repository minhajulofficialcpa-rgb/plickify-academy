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

  return {
    id: profile.id,
    email: profile.email || user.email || "",
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    role: (profile.role as UserRole) || "student",
    is_locked: profile.is_locked,
    is_suspended: profile.is_suspended,
    onboarding_completed: profile.onboarding_completed,
  };
}

/**
 * Check if a user has a specific role or higher.
 */
export function hasRole(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;

  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    support_moderator: 1,
    content_manager: 2,
    admin: 3,
    super_admin: 4,
  };

  const userLevel = roleHierarchy[user.role] ?? -1;
  const requiredLevel = roleHierarchy[requiredRole] ?? 99;

  return userLevel >= requiredLevel;
}
