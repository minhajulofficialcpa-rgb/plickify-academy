import type { AuthUser, UserRole } from "./auth";
import { hasRole } from "./auth";

export type Permission =
  | "manage_courses"
  | "manage_batches"
  | "manage_lessons"
  | "manage_products"
  | "manage_users"
  | "manage_roles"
  | "manage_orders"
  | "manage_enrollments"
  | "manage_tickets"
  | "manage_assignments"
  | "manage_certificates"
  | "manage_settings"
  | "view_audit_logs"
  | "approve_payments"
  | "review_submissions"
  | "support_reply";

const permissionMap: Record<Permission, UserRole> = {
  manage_courses: "content_manager",
  manage_batches: "content_manager",
  manage_lessons: "content_manager",
  manage_products: "content_manager",
  manage_users: "admin",
  manage_roles: "super_admin",
  manage_orders: "admin",
  manage_enrollments: "admin",
  manage_tickets: "support_moderator",
  manage_assignments: "content_manager",
  manage_certificates: "admin",
  manage_settings: "super_admin",
  view_audit_logs: "super_admin",
  approve_payments: "admin",
  review_submissions: "content_manager",
  support_reply: "support_moderator",
};

export function can(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  const requiredRole = permissionMap[permission];
  return hasRole(user, requiredRole);
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, "admin");
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return hasRole(user, "super_admin");
}
