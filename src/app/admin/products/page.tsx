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
import { Plus, Edit, Trash2, Loader2, Package } from "lucide-react";

interface Product {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  file_path: string | null;
  is_free: boolean;
  is_active: boolean;
  created_at: string;
}

const CATEGORIES = ["Free", "Paid", "Software", "Subscription", "Manual Service"];

export default function AdminProductsPage() {
  const supabase = createAdminClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing({ title: "", slug: "", category: "Paid", description: "", price: 0, file_path: "", is_free: false, is_active: true });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing || !editing.title || !editing.slug || !editing.category) return;
    setSaving(true);
    const payload = {
      title: editing.title,
      slug: editing.slug,
      category: editing.category,
      description: editing.description || null,
      price: editing.price || 0,
      file_path: editing.file_path || null,
      is_free: editing.is_free || false,
      is_active: editing.is_active ?? true,
    };

    const table = supabase.from("products");
    if (editing.id) {
      await (table as any).update(payload).eq("id", editing.id);
    } else {
      await (table as any).insert(payload);
    }
    setSaving(false);
    setDialogOpen(false);
    load();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await (supabase.from("products") as any).delete().eq("id", id);
    load();
  };

  const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const categoryStyle = (cat: string) => {
    const map: Record<string, string> = {
      Free: "bg-green-500/10 text-green-400 border-green-500/20",
      Paid: "bg-primary/10 text-primary border-primary/20",
      Software: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Subscription: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      "Manual Service": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    };
    return map[cat] || "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={openCreate} className="bg-gradient-to-r from-primary to-orange-500">
          <Plus className="h-4 w-4 mr-1" /> Add Product
        </Button>
      </div>

      <div className="rounded-xl border border-white/[0.06] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>File</TableHead>
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
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No products yet</TableCell></TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      <span className="font-medium">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className={categoryStyle(p.category)}>{p.category}</Badge></TableCell>
                  <TableCell>{p.is_free ? <span className="text-green-400 font-semibold">Free</span> : `৳${p.price.toLocaleString("bn-BD")}`}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={p.is_active ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.file_path ? "✓ Uploaded" : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing({ ...p }); setDialogOpen(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProduct(p.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
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
            <DialogTitle>{editing?.id ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>Configure product details</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Slug *</label>
                  <Input value={editing.slug || ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={editing.category || "Paid"} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (৳)</label>
                  <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">File Path</label>
                <Input value={editing.file_path || ""} onChange={(e) => setEditing({ ...editing, file_path: e.target.value })} placeholder="Supabase storage path or URL" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.is_free || false} onChange={(e) => setEditing({ ...editing, is_free: e.target.checked, price: e.target.checked ? 0 : editing.price })} className="rounded" />
                  Free Product
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
            <Button onClick={save} disabled={saving || !editing?.title || !editing?.slug || !editing?.category}>
              {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {editing?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
