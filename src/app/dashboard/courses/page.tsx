"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, PlayCircle, ArrowRight, Clock, GraduationCap } from "lucide-react";

interface EnrolledCourse {
  id: string;
  course_id: string;
  status: string;
  access_type: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
  } | null;
  target_batch_id: string | null;
}

export default function DashboardCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("enrollments")
        .select("*, courses!inner(id, title, slug, description, thumbnail_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setEnrollments((data as EnrolledCourse[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      Rejected: "bg-red-500/10 text-red-400 border-red-500/20",
      Completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
    return variants[status] || "bg-gray-500/10 text-gray-400";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="h-40 rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-2">No Courses Yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't enrolled in any courses yet
            </p>
            <Link href="/courses">
              <Button className="bg-gradient-to-r from-primary to-orange-500">
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden hover:border-primary/30 transition-colors group">
              <div className="h-40 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/25">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-1 flex-1">
                    {enrollment.courses?.title || "Untitled Course"}
                  </h3>
                  <Badge variant="outline" className={`ml-2 text-[10px] ${statusBadge(enrollment.status)}`}>
                    {enrollment.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {enrollment.courses?.description || "No description"}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Enrolled {new Date(enrollment.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                  {enrollment.access_type === "free" && (
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                      Free
                    </Badge>
                  )}
                </div>
                {enrollment.status === "Active" && (
                  <Link href={`/dashboard/lessons`}>
                    <Button size="sm" className="w-full group">
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      Continue Learning
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
