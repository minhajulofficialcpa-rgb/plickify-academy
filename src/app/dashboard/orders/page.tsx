"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingCart, Package, BookOpen, Clock, ArrowRight } from "lucide-react";

interface Order {
  id: string;
  item_type: string;
  status: string;
  total_amount: number;
  access_type: string;
  created_at: string;
  products: { id: string; title: string; slug: string; category: string; is_free: boolean } | null;
  courses: { id: string; title: string; slug: string } | null;
}

export default function DashboardOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("orders")
        .select("*, products!inner(id, title, slug, category, is_free)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((data as unknown as Order[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      "Waiting for Activation": "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
      Expired: "bg-gray-500/10 text-gray-400",
    };
    return variants[status] || "";
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-2">No Orders Yet</p>
            <p className="text-sm text-muted-foreground mb-6">Browse our shop for digital products</p>
            <Link href="/shop"><Button variant="outline">Browse Shop</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shrink-0">
                      {order.item_type === "course" ? (
                        <BookOpen className="h-5 w-5 text-white" />
                      ) : (
                        <Package className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{order.products?.title || order.courses?.title || "Order"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{order.item_type === "course" ? "Course" : (order.products?.category || "Product")}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={statusBadge(order.status)}>{order.status}</Badge>
                      {!order.products?.is_free && order.total_amount > 0 && (
                        <span className="text-sm font-bold">৳{order.total_amount.toLocaleString("bn-BD")}</span>
                      )}
                      {order.products?.is_free && (
                        <span className="text-sm font-bold text-green-400">Free</span>
                      )}
                    </div>
                    {order.status === "Active" && order.item_type === "product" && (
                      <Link href="/dashboard/downloads">
                        <Button size="sm" variant="ghost" className="mt-2 text-primary">
                          Download <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
