"use client";

import { useState, useEffect } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Shield, ShieldOff, UserCog, Loader2, ArrowLeft, ArrowRight } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  role: string;
  is_locked: boolean;
  is_suspended: boolean;
  onboarding_completed: boolean;
  created_at: string;
}

const ROLES = ["student", "support_moderator", "content_manager", "admin", "super_admin"];

export default function AdminUsersPage() {
  const supabase = createAdminClient();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const pageSize = 20;

  const loadUsers = async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, count } = await query.range(page * pageSize, (page + 1) * pageSize - 1);
    setUsers((data as Profile[]) || []);
    setTotal(count || 0);
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, [page, search]);

  const updateUser = async () => {
    if (!editUser) return;
    setSaving(true);
    const table = supabase.from("profiles");
    await (table as any)
      .update({
        role: editUser.role,
        is_suspended: editUser.is_suspended,
        is_locked: editUser.is_locked,
        full_name: editUser.full_name,
        phone_number: editUser.phone_number,
      })
      .eq("id", editUser.id);
    setSaving(false);
    setEditUser(null);
    loadUsers();
  };

  const toggleSuspend = async (user: Profile) => {
    const tbl = supabase.from("profiles");
    await (tbl as any)
      .update({ is_suspended: !user.is_suspended })
      .eq("id", user.id);
    loadUsers();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone_number || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      user.role === "super_admin" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      user.role === "admin" ? "bg-primary/10 text-primary border-primary/20" :
                      user.role === "content_manager" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      user.role === "support_moderator" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      "bg-gray-500/10 text-gray-400"
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_suspended ? (
                      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">Suspended</Badge>
                    ) : user.is_locked ? (
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Locked</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditUser({ ...user })}>
                        <UserCog className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSuspend(user)}
                        className={user.is_suspended ? "text-green-400" : "text-red-400"}
                      >
                        {user.is_suspended ? <Shield className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
          <span>{total} total users</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <span className="px-2">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={(o) => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user profile and role</DialogDescription>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={editUser.full_name || ""}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={editUser.phone_number || ""}
                  onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={editUser.role}
                  onValueChange={(v) => setEditUser({ ...editUser, role: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editUser.is_suspended}
                    onChange={(e) => setEditUser({ ...editUser, is_suspended: e.target.checked })}
                    className="rounded"
                  />
                  Suspended
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editUser.is_locked}
                    onChange={(e) => setEditUser({ ...editUser, is_locked: e.target.checked })}
                    className="rounded"
                  />
                  Profile Locked
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={updateUser} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
