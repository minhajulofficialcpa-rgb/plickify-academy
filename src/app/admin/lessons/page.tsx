"use client";

import { useState, useEffect } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Edit, Trash2, Loader2, GripVertical } from "lucide-react";

interface Lesson {
  id: string;
  course_id: string;
  batch_id: string | null;
  title: string;
  video_provider: string;
  video_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_locked: boolean;
  created_at: string;
  courses?: { title: string } | null;
}

export default function AdminLessonsPage() {
  const supabase = createAdminClient();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [batches, setBatches] = useState<{ id: string; batch_name: string; course_id: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Lesson> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: lessonsData } = await supabase
      .from("course_lessons")
      .select("*, courses!inner(title)")
      .order("sort_order", { ascending: true });
    const { data: coursesData } = await supabase.from("courses").select("id, title");
    const { data: batchesData } = await supabase.from("batches").select("id, batch_name, course_id").order("created_at", { ascending: false });
    setLessons((lessonsData as unknown as Lesson[]) || []);
    setCourses((coursesData as { id: string; title: string }[]) || []);
    setBatches((batchesData as { id: string; batch_name: string; course_id: string }[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filteredBatches = batches.filter((b) => b.course_id === editing?.course_id);

  const openCreate = () => {
    setEditing({ title: "", course_id: "", batch_id: null, video_provider: "youtube", video_id: "", duration_seconds: null, sort_order: (lessons.length || 0) + 1, is_locked: true });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing || !editing.title || !editing.course_id) return;
    setSaving(true);
    const payload = {
      course_id: editing.course_id,
      batch_id: editing.batch_id || null,
      title: editing.title,
      video_provider: editing.video_provider || "youtube",
      video_id: editing.video_id || null,
      duration_seconds: editing.duration_seconds || null,
      sort_order: editing.sort_order ?? ((lessons.length || 0) + 1),
      is_locked: editing.is_locked ?? true,
    };

    const table = supabase.from("course_lessons");
    if (editing.id) {
      await (table as any).update(payload).eq("id", editing.id);
    } else {
      await (table as any).insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Delete this lesson?")) return;
    await (supabase.from("course_lessons") as any).delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Lesson Management</h1>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Lesson
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Video</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Locked</TableHead>
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
            ) : lessons.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No lessons yet</TableCell></TableRow>
            ) : (
              lessons.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="text-muted-foreground">{l.sort_order}</TableCell>
                  <TableCell className="font-medium">{l.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{l.courses?.title || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.video_provider} {l.video_id ? "✓" : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.duration_seconds ? `${Math.floor(l.duration_seconds / 60)}:${(l.duration_seconds % 60).toString().padStart(2, "0")}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={l.is_locked ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : "bg-green-500/10 text-green-400 border-green-500/20"}>
                      {l.is_locked ? "Locked" : "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing({ ...l }); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteLesson(l.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Lesson" : "Add Lesson"}</DialogTitle>
            <DialogDescription>Configure lesson details</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course *</label>
                <Select value={editing.course_id || ""} onValueChange={(v) => setEditing({ ...editing, course_id: v, batch_id: null })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch (optional)</label>
                <Select value={editing.batch_id || ""} onValueChange={(v) => setEditing({ ...editing, batch_id: v || null })}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="All batches" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— All batches —</SelectItem>
                    {filteredBatches.map((b) => <SelectItem key={b.id} value={b.id}>{b.batch_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort Order</label>
                  <Input type="number" value={editing.sort_order || 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (seconds)</label>
                  <Input type="number" value={editing.duration_seconds || ""} onChange={(e) => setEditing({ ...editing, duration_seconds: Number(e.target.value) || null })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video Provider</label>
                  <Select value={editing.video_provider || "youtube"} onValueChange={(v) => setEditing({ ...editing, video_provider: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Video ID</label>
                  <Input value={editing.video_id || ""} onChange={(e) => setEditing({ ...editing, video_id: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_locked ?? true} onChange={(e) => setEditing({ ...editing, is_locked: e.target.checked })} className="rounded" />
                Locked (requires enrollment)
              </label>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !editing?.title || !editing?.course_id}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editing?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
