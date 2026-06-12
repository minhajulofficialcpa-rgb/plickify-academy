"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export function EnrollButton({
  courseId,
  batchId,
}: {
  courseId: string;
  batchId: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, [supabase]);

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth?redirect=/courses/${courseId}`);
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("enrollments").insert({
      user_id: user.id,
      course_id: courseId,
      target_batch_id: batchId,
      status: "Pending",
      access_type: "purchase",
    });

    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        router.push("/dashboard/courses");
        return;
      }
      return;
    }

    router.push("/dashboard/courses");
  };

  return (
    <Button
      size="lg"
      className="h-14 px-8 text-base font-bold bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90 shadow-lg shadow-primary/25 group"
      onClick={handleEnroll}
      disabled={loading}
    >
      {loading ? "Processing..." : user ? "Enroll Now" : "Sign In to Enroll"}
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  );
}
