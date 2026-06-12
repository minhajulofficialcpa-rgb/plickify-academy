import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = request.nextUrl.searchParams.get("product_id");
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!productId) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  // Verify user has access to this product
  const { data: order } = await supabase
    .from("orders")
    .select("id, status, products!inner(file_path, title)")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("status", "Active")
    .single();

  if (!order) {
    return NextResponse.json({ error: "No access" }, { status: 403 });
  }

  const orderData = order as any;
  const filePath = orderData.products?.file_path;

  if (!filePath) {
    return NextResponse.json({ error: "No file available" }, { status: 404 });
  }

  // Generate signed URL using service role client
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Determine bucket from path (format: bucket/path/to/file)
  const [bucket, ...pathParts] = filePath.split("/");
  const objectPath = pathParts.join("/");

  const { data: signedUrl } = await adminSupabase
    .storage
    .from(bucket)
    .createSignedUrl(objectPath, 300); // 5 minutes expiry

  if (!signedUrl) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Track download
  await supabase.from("downloads").upsert({
    user_id: user.id,
    product_id: productId,
    order_id: orderData.id,
    download_count: 1,
    last_downloaded_at: new Date().toISOString(),
  }, { onConflict: "user_id, product_id" });

  return NextResponse.json({ url: signedUrl.signedUrl });
}
