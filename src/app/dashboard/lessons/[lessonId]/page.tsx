"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock } from "lucide-react";

interface LessonData {
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
  batches: { id: string; batch_name: string } | null;
}

interface ProfileData {
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [allLessons, setAllLessons] = useState<LessonData[]>([]);
  const [initialPosition, setInitialPosition] = useState(0);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email, phone_number")
        .eq("id", user.id)
        .single();

      setProfile(profileData as ProfileData);

      // Get lesson
      const { data: lessonData } = await supabase
        .from("course_lessons")
        .select("*, courses!inner(id, title, slug)")
        .eq("id", lessonId)
        .single();

      if (!lessonData) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const lesson = lessonData as unknown as LessonData;
      setLesson(lesson);

      // Layer 4: Server Access Check - verify enrollment
      if (lesson.batch_id) {
        const { data: batchAccess } = await supabase
          .from("user_batches")
          .select("id")
          .eq("user_id", user.id)
          .eq("batch_id", lesson.batch_id)
          .single();

        if (!batchAccess) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
      }

      // Get watch analytics for resume
      const { data: analytics } = await supabase
        .from("watch_analytics")
        .select("last_position_seconds, progress_percent, completed")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .single();

      if (analytics) {
        setInitialPosition(analytics.last_position_seconds || 0);
        setCurrentProgress(analytics.progress_percent || 0);
      }

      // Get all lessons in this course for navigation
      const { data: courseLessons } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("course_id", lesson.course_id)
        .order("sort_order", { ascending: true });

      if (courseLessons) {
        const all = courseLessons as LessonData[];
        setAllLessons(all);
        const currentIdx = all.findIndex((l) => l.id === lessonId);
        if (currentIdx > 0) setPrevLesson(all[currentIdx - 1].id);
        if (currentIdx < all.length - 1) setNextLesson(all[currentIdx + 1].id);
      }

      setLoading(false);
    }
    load();
  }, [lessonId, supabase, router]);

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="aspect-video rounded-xl mb-4" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  if (accessDenied || !lesson) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <span className="text-destructive text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
          You don't have access to this lesson. Please enroll in the course first.
        </p>
        <Link href="/dashboard/courses">
          <Button>View My Courses</Button>
        </Link>
      </div>
    );
  }

  const isSuspended = false; // TODO: Check from profile if suspended

  if (isSuspended) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-bold mb-2">Account Suspended</h2>
        <p className="text-sm text-muted-foreground">
          Your account has been suspended. Please contact support.
        </p>
      </div>
    );
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      {/* Back & Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard/lessons"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link href={`/dashboard/lessons/${prevLesson}`}>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            </Link>
          )}
          {nextLesson && (
            <Link href={`/dashboard/lessons/${nextLesson}`}>
              <Button variant="outline" size="sm">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Video Player */}
      {lesson.video_provider === "youtube" && lesson.video_id ? (
        <VideoPlayer
          lessonId={lesson.id}
          videoId={lesson.video_id}
          provider={lesson.video_provider}
          userName={profile?.full_name || "User"}
          userEmail={profile?.email || ""}
          userId={""} // Will be set from auth
          phoneLast4={profile?.phone_number?.slice(-4)}
          initialPosition={initialPosition}
          courseTitle={lesson.courses?.title || ""}
          lessonTitle={lesson.title}
        />
      ) : (
        <div className="aspect-video bg-card rounded-xl flex items-center justify-center">
          <p className="text-muted-foreground">Video unavailable</p>
        </div>
      )}

      {/* Lesson Info */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold">{lesson.sort_order}. {lesson.title}</h1>
          {currentProgress >= 90 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {lesson.courses && (
          <p className="text-sm text-muted-foreground mb-4">
            {lesson.courses.title} {lesson.batches?.batch_name ? `• ${lesson.batches.batch_name}` : ""}
          </p>
        )}

        {lesson.duration_seconds && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(lesson.duration_seconds)}</span>
          </div>
        )}

        {/* Course Curriculum Sidebar */}
        {allLessons.length > 1 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-3">Course Lessons</h3>
              <div className="space-y-1">
                {allLessons.map((l, i) => {
                  const isCurrent = l.id === lessonId;
                  return (
                    <Link
                      key={l.id}
                      href={`/dashboard/lessons/${l.id}`}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        isCurrent
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-white/[0.04] text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-white/[0.06] text-xs">
                        {i + 1}
                      </span>
                      <span className="truncate">{l.title}</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
