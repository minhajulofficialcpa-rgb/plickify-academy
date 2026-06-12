import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Package, ArrowLeft, CheckCircle2, Shield, Download, Clock } from "lucide-react";
import { BuyButton } from "./BuyButton";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("products").select("title, description").eq("slug", slug).single();
  const product = data as { title: string; description: string | null } | null;
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.title} | Plickify Shop`,
    description: product.description || `Buy ${product.title}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: raw } = await supabase.from("products").select("*").eq("slug", slug).single();
  const product = raw as {
    id: string; title: string; slug: string; category: string;
    description: string | null; price: number; file_path: string | null;
    is_free: boolean; is_active: boolean;
  } | null;

  if (!product || !product.is_active) notFound();

  const categoryColors: Record<string, string> = {
    Free: "bg-green-500/10 text-green-400 border-green-500/20",
    Paid: "bg-primary/10 text-primary border-primary/20",
    Software: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Subscription: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Manual Service": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-sm"><span className="text-primary">Plickify</span> Academy</span>
          </Link>
          <Link href="/shop">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop</Button>
          </Link>
        </div>
      </nav>

      <div className="pt-16">
        <section className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Product info */}
              <div className="lg:col-span-3">
                <Badge variant="outline" className={`mb-4 ${categoryColors[product.category] || ""}`}>
                  {product.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-black mb-4">{product.title}</h1>
                <p className="text-lg text-muted-foreground mb-6">{product.description || "No description available."}</p>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: Download, text: "Instant digital download upon purchase" },
                    { icon: Shield, text: "Secure payment & lifetime access" },
                    { icon: Clock, text: product.category === "Subscription" ? "Subscription auto-managed" : "No expiration" },
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                      <span>{feature.text}</span>
                    </div>
                  ))}
                </div>

                {product.file_path && (
                  <Card className="bg-card/50 border-white/[0.06]">
                    <CardContent className="p-4 flex items-center gap-3">
                      <Download className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Digital Download</p>
                        <p className="text-xs text-muted-foreground">Available after purchase</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Purchase card */}
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="text-center mb-6">
                        {product.is_free ? (
                          <span className="text-4xl font-black text-green-400">Free</span>
                        ) : (
                          <>
                            <p className="text-3xl font-black">৳{product.price?.toLocaleString("bn-BD")}</p>
                            <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                          </>
                        )}
                      </div>
                      <BuyButton product={product} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
