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
import { Plus, Edit, Trash2, Loader2, Layers } from "lucide-react";

interface Batch {
  id: string;
  course_id: string;
  batch_name: string;
  seat_limit: number | null;
  start_date: string | null;
  status: string;
  created_at: string;
  courses?: { title: string } | null;
}

const STATUSES = ["Upcoming", "Active", "Completed", "Cancelled"];

export default function AdminBatchesPage() {
  const supabase = createAdminClient();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Batch> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: batchesData } = await supabase
      .from("batches")
      .select("*, courses!inner(title)")
      .order("created_at", { ascending: false });
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_active", true);
    setBatches((batchesData as unknown as Batch[]) || []);
    setCourses((coursesData as { id: string; title: string }[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing({ batch_name: "", course_id: "", seat_limit: null, start_date: null, status: "Upcoming" });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing || !editing.batch_name || !editing.course_id) return;
    setSaving(true);
    const payload = {
      course_id: editing.course_id,
      batch_name: editing.batch_name,
      seat_limit: editing.seat_limit || null,
      start_date: editing.start_date || null,
      status: editing.status || "Upcoming",
    };

    const table = supabase.from("batches");
    if (editing.id) {
      await (table as any).update(payload).eq("id", editing.id);
    } else {
      await (table as any).insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const deleteBatch = async (id: string) => {
    if (!confirm("Delete this batch?")) return;
    await supabase.from("batches").delete().eq("id", id);
    load();
  };

  const statusStyle = (s: string) => {
    const map: Record<string, string> = {
      Upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return map[s] || "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Batch
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Batch Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Seats</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : batches.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No batches yet</TableCell></TableRow>
            ) : (
              batches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-primary" />
                      {b.batch_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{b.courses?.title || "—"}</TableCell>
                  <TableCell><Badge variant="outline" className={statusStyle(b.status)}>{b.status}</Badge></TableCell>
                  <TableCell>{b.seat_limit || "∞"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {b.start_date ? new Date(b.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing({ ...b }); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBatch(b.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Batch" : "Add Batch"}</DialogTitle>
            <DialogDescription>Configure batch details</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course *</label>
                <Select value={editing.course_id || ""} onValueChange={(v) => setEditing({ ...editing, course_id: v })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Name *</label>
                <Input value={editing.batch_name || ""} onChange={(e) => setEditing({ ...editing, batch_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={editing.status || "Upcoming"} onValueChange={(v) => setEditing({ ...editing, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Seat Limit</label>
                  <Input type="number" value={editing.seat_limit || ""} onChange={(e) => setEditing({ ...editing, seat_limit: Number(e.target.value) || null })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={editing.start_date?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, start_date: e.target.value || null })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !editing?.batch_name || !editing?.course_id}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editing?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
