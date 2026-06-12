"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ProductInfo {
  id: string;
  title: string;
  slug: string;
  price: number;
  is_free: boolean;
  category: string;
}

export function BuyButton({ product }: { product: ProductInfo }) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleBuy = async () => {
    if (!user) {
      router.push(`/auth?redirect=/products/${product.slug}`);
      return;
    }

    setLoading(true);

    if (product.is_free) {
      // Free product - create zero-value order directly
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        item_type: "product",
        product_id: product.id,
        status: "Active",
        total_amount: 0,
        access_type: "free",
      });

      if (error) {
        if (error.code === "23505") {
          toast("You already have this product");
        } else {
          toast.error("Failed to process order");
        }
        setLoading(false);
        return;
      }

      toast.success("Product added to your account!");
      router.push("/dashboard/downloads");
    } else {
      // Paid product - create pending order
      const { error } = await supabase.from("orders").insert({
        user_id: user.id,
        item_type: "product",
        product_id: product.id,
        status: "Pending",
        total_amount: product.price,
        access_type: "purchase",
      });

      if (error) {
        if (error.code === "23505") {
          toast("You already have this product");
        } else {
          toast.error("Failed to create order");
        }
        setLoading(false);
        return;
      }

      toast.success("Order created! Awaiting confirmation.");
      router.push("/dashboard/orders");
    }

    setLoading(false);
  };

  return (
    <Button
      size="lg"
      className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? (
        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Processing...</>
      ) : (
        <><ShoppingCart className="h-5 w-5 mr-2" /> {user ? (product.is_free ? "Get it Free" : "Buy Now") : "Sign In to Purchase"}</>
      )}
    </Button>
  );
}
