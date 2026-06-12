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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

const defaultCourse: Partial<Course> = {
  title: "",
  slug: "",
  description: "",
  thumbnail_url: "",
  price: 0,
  is_featured: false,
  is_active: true,
};

export default function AdminCoursesPage() {
  const supabase = createAdminClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Course> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses((data as Course[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing({ ...defaultCourse }); setDialogOpen(true); };
  const openEdit = (c: Course) => { setEditing({ ...c }); setDialogOpen(true); };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const payload = {
      title: editing.title,
      slug: editing.slug,
      description: editing.description || null,
      thumbnail_url: editing.thumbnail_url || null,
      price: editing.price || 0,
      is_featured: editing.is_featured || false,
      is_active: editing.is_active ?? true,
    };

    const table = supabase.from("courses");
    if (editing.id) {
      await (table as any).update(payload).eq("id", editing.id);
    } else {
      await (table as any).insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    await (supabase.from("courses") as any).delete().eq("id", id);
    load();
  };

  const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Course
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Featured</TableHead>
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
            ) : courses.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No courses yet</TableCell></TableRow>
            ) : (
              courses.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{c.slug}</TableCell>
                  <TableCell>৳{c.price.toLocaleString("bn-BD")}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={c.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.is_featured ? <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Featured</Badge> : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteCourse(c.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editing?.id ? "Edit Course" : "Add Course"}</DialogTitle>
            <DialogDescription>Fill in the course details below</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug *</label>
                <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (৳)</label>
                  <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thumbnail URL</label>
                  <Input value={editing.thumbnail_url || ""} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_featured || false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} className="rounded" />
                  Featured Course
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !editing?.title || !editing?.slug}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editing?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
