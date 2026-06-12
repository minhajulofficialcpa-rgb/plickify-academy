"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlayCircle, Lock, BookOpen, Clock, CheckCircle2, Layers, ArrowRight } from "lucide-react";

interface LessonWithCourse {
  id: string;
  title: string;
  video_provider: string;
  video_id: string | null;
  duration_seconds: number | null;
  sort_order: number;
  is_locked: boolean;
  course_id: string;
  batch_id: string | null;
  courses: { id: string; title: string; slug: string } | null;
  batches: { id: string; batch_name: string; status: string } | null;
  watch_analytics?: { completed: boolean; progress_percent: number }[];
}

export default function DashboardLessonsPage() {
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonWithCourse[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's batch IDs
      const { data: userBatches } = await supabase
        .from("user_batches")
        .select("batch_id")
        .eq("user_id", user.id);

      if (!userBatches?.length) {
        setLoading(false);
        return;
      }

      const batchIds = userBatches.map((ub) => ub.batch_id);

      // Get lessons for enrolled batches
      const { data: lessonsData } = await supabase
        .from("course_lessons")
        .select("*, courses!inner(id, title, slug)")
        .in("batch_id", batchIds)
        .order("sort_order", { ascending: true });

      if (!lessonsData?.length) {
        setLoading(false);
        return;
      }

      // Get watch analytics for these lessons
      const { data: analytics } = await supabase
        .from("watch_analytics")
        .select("lesson_id, completed, progress_percent")
        .eq("user_id", user.id)
        .in("lesson_id", lessonsData.map((l) => l.id));

      const analyticsMap = new Map(
        (analytics || []).map((a: any) => [a.lesson_id, a]),
      );

      // Group lessons by course
      const lessonsWithAnalytics = (lessonsData as unknown as LessonWithCourse[]).map((lesson) => ({
        ...lesson,
        watch_analytics: analyticsMap.has(lesson.id)
          ? [analyticsMap.get(lesson.id) as any]
          : [],
      }));

      setLessons(lessonsWithAnalytics);
      setLoading(false);
    }
    load();
  }, [supabase]);

  // Group lessons by course
  const groupedLessons = lessons.reduce<Record<string, { course: { id: string; title: string; slug: string }; lessons: LessonWithCourse[] }>>(
    (acc, lesson) => {
      const courseId = lesson.courses?.id || "unknown";
      if (!acc[courseId]) {
        acc[courseId] = {
          course: lesson.courses || { id: "unknown", title: "Unknown Course", slug: "" },
          lessons: [],
        };
      }
      acc[courseId].lessons.push(lesson);
      return acc;
    },
    {},
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Lessons</h1>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedLessons).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium mb-2">No Lessons Available</p>
            <p className="text-sm text-muted-foreground mb-6">
              You need to be enrolled in a course to access lessons
            </p>
            <Link href="/dashboard/courses">
              <Button variant="outline">View My Courses</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedLessons).map(([courseId, group]) => {
            const totalLessons = group.lessons.length;
            const completedLessons = group.lessons.filter(
              (l) => l.watch_analytics?.[0]?.completed,
            ).length;

            return (
              <div key={courseId}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">{group.course.title}</h2>
                    <p className="text-xs text-muted-foreground">
                      {completedLessons}/{totalLessons} lessons completed
                    </p>
                  </div>
                  <div className="h-2 w-32 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 transition-all"
                      style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {group.lessons.map((lesson) => {
                    const analytics = lesson.watch_analytics?.[0];
                    const isCompleted = analytics?.completed;
                    const progress = analytics?.progress_percent || 0;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/lessons/${lesson.id}`}
                        className="block"
                      >
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-card/30 border border-white/[0.06] hover:border-primary/20 hover:bg-card/50 transition-all group">
                          <div
                            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                              isCompleted
                                ? "bg-green-500/10 text-green-400"
                                : lesson.is_locked
                                  ? "bg-gray-500/10 text-gray-500"
                                  : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : lesson.is_locked ? (
                              <Lock className="h-5 w-5" />
                            ) : (
                              <PlayCircle className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {lesson.sort_order}. {lesson.title}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              {lesson.duration_seconds && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(lesson.duration_seconds)}
                                </span>
                              )}
                              {progress > 0 && !isCompleted && (
                                <span className="text-xs text-primary">
                                  {Math.round(progress)}% watched
                                </span>
                              )}
                              {isCompleted && (
                                <span className="text-xs text-green-400">Completed</span>
                              )}
                            </div>
                          </div>
                          {!lesson.is_locked && (
                            <div className="shrink-0">
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
