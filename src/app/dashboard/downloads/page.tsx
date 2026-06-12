"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Download, Package, ShoppingCart, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface DownloadItem {
  id: string;
  product_id: string;
  download_count: number;
  last_downloaded_at: string | null;
  products: {
    id: string;
    title: string;
    slug: string;
    category: string;
    description: string | null;
    file_path: string | null;
  } | null;
  orders: { status: string } | null;
}

export default function DashboardDownloadsPage() {
  const [loading, setLoading] = useState(true);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get orders with active products
      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, products!inner(id, title, slug, category, description, file_path)")
        .eq("user_id", user.id)
        .eq("status", "Active")
        .not("product_id", "is", null);

      if (!orders?.length) {
        setLoading(false);
        return;
      }

      // Get existing download records
      const orderData = orders as any[];
      const productIds = orderData.map((o) => o.products.id);
      const { data: downloadRecords } = await supabase
        .from("downloads")
        .select("*")
        .eq("user_id", user.id)
        .in("product_id", productIds);

      const downloadMap = new Map(
        (downloadRecords || []).map((d: any) => [d.product_id, d]),
      );

      const items: DownloadItem[] = orderData
        .filter((o) => o.products?.file_path)
        .map((o) => ({
          id: o.id,
          product_id: o.products.id,
          download_count: downloadMap.get(o.products.id)?.download_count || 0,
          last_downloaded_at: downloadMap.get(o.products.id)?.last_downloaded_at || null,
          products: o.products,
          orders: { status: o.status },
        }));

      setDownloads(items);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const handleDownload = async (productId: string) => {
    setDownloading(productId);
    try {
      const res = await fetch(`/api/downloads?product_id=${productId}`);
      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        setDownloading(null);
        return;
      }

      // Open the signed URL
      window.open(data.url, "_blank");
      toast.success("Download started!");
      setDownloading(null);

      // Reload to update download count
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Failed to generate download link");
      setDownloading(null);
    }
  };

  // Also check for products without file_path (manual delivery)
  const manualItems = downloads.filter((d) => !d.products?.file_path);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Downloads</h1>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : downloads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Download className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-2">No Downloads Available</p>
            <p className="text-sm text-muted-foreground mb-6">
              Purchase products from the shop to access downloads
            </p>
            <Link href="/shop"><Button variant="outline">Browse Shop</Button></Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Digital downloads */}
          {downloads.filter((d) => d.products?.file_path).map((item) => (
            <Card key={item.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shrink-0">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.products?.title || "Product"}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          {item.products?.category || "Digital"}
                        </Badge>
                        <span>{item.download_count} download{item.download_count !== 1 ? "s" : ""}</span>
                        {item.last_downloaded_at && (
                          <span>Last: {new Date(item.last_downloaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(item.product_id)}
                    disabled={downloading === item.product_id}
                    className="shrink-0"
                  >
                    {downloading === item.product_id ? (
                      <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-1.5" /> Download</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Manual delivery items */}
          {manualItems.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground mt-8 mb-4">Manual Delivery</h3>
              {manualItems.map((item) => (
                <Card key={item.id} className="border-yellow-500/20">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{item.products?.title || "Product"}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This product requires manual delivery. Contact support if you haven't received it.
                          </p>
                        </div>
                      </div>
                      <Link href="/dashboard/support">
                        <Button variant="outline" size="sm">Get Support</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
