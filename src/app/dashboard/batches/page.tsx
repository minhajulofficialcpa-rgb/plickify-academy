"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Layers, Calendar, Users, PlayCircle, ArrowRight, Clock } from "lucide-react";

interface UserBatch {
  id: string;
  batch_id: string;
  enrolled_at: string;
  batches: {
    id: string;
    batch_name: string;
    seat_limit: number | null;
    start_date: string | null;
    status: string;
    courses: {
      id: string;
      title: string;
      slug: string;
    } | null;
  } | null;
}

export default function DashboardBatchesPage() {
  const [loading, setLoading] = useState(true);
  const [userBatches, setUserBatches] = useState<UserBatch[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_batches")
        .select("*, batches!inner(id, batch_name, seat_limit, start_date, status, courses!inner(id, title, slug))")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      setUserBatches((data as UserBatch[]) || []);
      setLoading(false);
    }
    load();
  }, [supabase]);

  const statusBadge = (status: string) => {
    const variants: Record<string, string> = {
      Upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Active: "bg-green-500/10 text-green-400 border-green-500/20",
      Completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return variants[status] || "";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Batches</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : userBatches.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-2">No Batches Yet</p>
            <p className="text-sm text-muted-foreground mb-6">
              You haven't been assigned to any batches yet
            </p>
            <Link href="/dashboard/courses">
              <Button variant="outline">View My Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userBatches.map((ub) => (
            <Card key={ub.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Layers className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold text-lg">
                        {ub.batches?.batch_name || "Untitled Batch"}
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ub.batches?.courses?.title || "Course"}
                    </p>
                  </div>
                  <Badge variant="outline" className={statusBadge(ub.batches?.status || "")}>
                    {ub.batches?.status || "N/A"}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                  {ub.batches?.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(ub.batches.start_date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {ub.batches?.seat_limit && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{ub.batches.seat_limit} seats</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>
                      Enrolled {new Date(ub.enrolled_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {ub.batches?.status === "Active" && (
                  <Link href="/dashboard/lessons">
                    <Button size="sm" className="group">
                      <PlayCircle className="h-4 w-4 mr-1.5" />
                      View Lessons
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
