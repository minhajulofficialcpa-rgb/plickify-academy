import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Package, Sparkles, ArrowRight, Search } from "lucide-react";

export const metadata = {
  title: "Shop | Plickify Academy",
  description: "Browse digital products at Plickify Academy",
};

const CATEGORIES = ["All", "Free", "Paid", "Software", "Subscription", "Manual Service"];

export default async function ShopPage(props: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams?.category || "All";
  const query = searchParams?.q || "";

  const supabase = await createServerSupabaseClient();

  let supabaseQuery = supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  if (category !== "All") {
    supabaseQuery = supabaseQuery.eq("category", category);
  }

  if (query) {
    supabaseQuery = supabaseQuery.ilike("title", `%${query}%`);
  }

  const { data: products } = await supabaseQuery.order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-sm"><span className="text-primary">Plickify</span> Academy</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth"><Button variant="ghost" size="sm">Sign In</Button></Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Digital Store
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Plickify Shop
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Premium digital products to accelerate your learning
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Link key={cat} href={`/shop?category=${cat}${query ? `&q=${query}` : ""}`}>
                    <Button
                      variant={category === cat ? "default" : "outline"}
                      size="sm"
                      className={category === cat ? "bg-gradient-to-r from-primary to-orange-500" : ""}
                    >
                      {cat}
                    </Button>
                  </Link>
                ))}
              </div>
              <form className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search products..."
                  defaultValue={query}
                  className="pl-9 w-64"
                />
              </form>
            </div>

            {/* Products grid */}
            {(!products || products.length === 0) ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No products found</p>
                <p className="text-sm text-muted-foreground">Try a different category or search term</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(products as any[]).map((product) => (
                  <Link key={product.id} href={`/products/${product.slug}`}>
                    <Card className="h-full overflow-hidden hover:border-primary/30 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5">
                      <div className="h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                          <Package className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold group-hover:text-primary transition-colors">{product.title}</h3>
                          <Badge variant="outline" className={
                            product.category === "Free" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                            product.category === "Software" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            product.category === "Subscription" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                          }>{product.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {product.description || "No description available"}
                        </p>
                        <div className="flex items-center justify-between">
                          {product.is_free ? (
                            <span className="text-lg font-bold text-green-400">Free</span>
                          ) : (
                            <span className="text-lg font-bold">৳{product.price?.toLocaleString("bn-BD") || "0"}</span>
                          )}
                          <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            View Details <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
