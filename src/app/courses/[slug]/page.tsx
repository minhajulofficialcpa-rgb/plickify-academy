import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  TrendingUp,
  Layers,
} from "lucide-react";
import { EnrollButton } from "./EnrollButton";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("courses")
    .select("title, description, thumbnail_url")
    .eq("slug", slug)
    .single();

  const course = data as { title: string; description: string | null; thumbnail_url: string | null } | null;

  if (!course) return { title: "Course Not Found" };

  return {
    title: `${course.title} | Plickify Academy`,
    description: course.description || `Learn ${course.title} at Plickify Academy`,
    openGraph: {
      title: `${course.title} | Plickify Academy`,
      description: course.description || undefined,
      images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [],
    },
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: courseRaw } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  const course = courseRaw as unknown as {
    id: string; title: string; slug: string; description: string | null;
    thumbnail_url: string | null; price: number; is_featured: boolean; is_active: boolean;
    created_at: string; updated_at: string;
  } | null;

  if (!course || !course.is_active) notFound();

  type BatchRow = { id: string; course_id: string; batch_name: string; seat_limit: number | null; start_date: string | null; status: string; created_at: string; };
  type LessonRow = { id: string; course_id: string; batch_id: string | null; title: string; video_provider: string; video_id: string | null; duration_seconds: number | null; sort_order: number; is_locked: boolean; created_at: string; };

  const { data: batchesRaw } = await supabase
    .from("batches")
    .select("*")
    .eq("course_id", course.id)
    .order("created_at", { ascending: false });
  const batches = batchesRaw as unknown as BatchRow[] | null;

  const { data: lessonsRaw } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });
  const lessons = lessonsRaw as unknown as LessonRow[] | null;

  const activeBatch = batches?.find((b) => b.status === "Upcoming") || batches?.[0];

  const curriculum = lessons?.reduce<{ title: string; items: { title: string; duration: number | null }[] }[]>((acc, lesson) => {
    const key = `Module ${Math.ceil((lesson.sort_order || 1) / 5)}`;
    const existing = acc.find((m) => m.title === key);
    if (existing) {
      existing.items.push({ title: lesson.title, duration: lesson.duration_seconds });
    } else {
      acc.push({ title: key, items: [{ title: lesson.title, duration: lesson.duration_seconds }] });
    }
    return acc;
  }, []);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-sm">
              <span className="text-primary">Plickify</span> Academy
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href={activeBatch ? `/api/enroll?course_id=${course.id}&batch_id=${activeBatch.id}` : "#"}>
              <Button size="sm" className="bg-gradient-to-r from-primary to-orange-500">
                Enroll Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-background" />
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Featured Course
                  </Badge>
                  {activeBatch && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      {activeBatch.batch_name}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {course.description}
                </p>
                <div className="flex flex-wrap gap-4 mb-8">
                  {activeBatch && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Start: {new Date(activeBatch.start_date || "").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                  )}
                  {activeBatch?.seat_limit && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{activeBatch.seat_limit} seats</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span>{activeBatch?.status || batchLabel(activeBatch?.status)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4 text-primary" />
                    <span>{lessons?.length || 0} lessons</span>
                  </div>
                </div>
                <EnrollButton courseId={course.id} batchId={activeBatch?.id || null} />
              </div>

              <div className="hidden lg:block">
                <div className="bg-gradient-to-br from-card/50 to-card border border-primary/20 rounded-2xl p-8 shadow-2xl shadow-primary/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">{course.title}</p>
                      <p className="text-sm text-muted-foreground">{activeBatch?.batch_name || "Ongoing"}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {curriculum?.slice(0, 3).map((module, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                        <p className="font-medium text-sm mb-2">{module.title}</p>
                        <ul className="space-y-1">
                          {module.items.slice(0, 3).map((item, j) => (
                            <li key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle2 className="h-3 w-3 text-primary/60" />
                              <span>{item.title}</span>
                              {item.duration && <span className="ml-auto text-[10px]">{formatDuration(item.duration)}</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Course Curriculum</h2>
            <p className="text-muted-foreground mb-8">
              Complete {lessons?.length || 0} lessons across {curriculum?.length || 0} modules
            </p>
            <div className="space-y-3">
              {curriculum?.map((module, i) => (
                <Card key={i} className="bg-card/50 border-white/[0.06]">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{module.title}</h3>
                      <span className="text-xs text-muted-foreground">{module.items.length} lessons</span>
                    </div>
                    <div className="space-y-2">
                      {module.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{item.title}</p>
                          </div>
                          {item.duration && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                              <Clock className="h-3 w-3" />
                              <span>{formatDuration(item.duration)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-b from-background via-primary/[0.03] to-background">
          <div className="max-w-lg mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-muted-foreground mb-8">
              Join Plickify Academy and start building your AI-powered income stream today
            </p>
            <EnrollButton courseId={course.id} batchId={activeBatch?.id || null} />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                { q: "Do I need prior experience?", a: "No prior experience is required. We start from the basics and progress to advanced levels." },
                { q: "What equipment do I need?", a: "A PC or Laptop with an internet connection is sufficient. We'll guide you on all required software." },
                { q: "Will I get a certificate?", a: "Yes! Upon successful completion of the course, you'll receive a Plickify Academy certificate." },
                { q: "What is the refund policy?", a: "We offer the first 2 classes as free trials. No refunds on full course fees." },
              ].map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card/30 border border-white/[0.06] rounded-xl px-6 data-[state=open]:border-primary/20">
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.06] py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-muted-foreground">
              © 2026 Plickify Academy. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function batchLabel(status?: string) {
  switch (status) {
    case "Upcoming": return "Upcoming";
    case "Active": return "In Progress";
    case "Completed": return "Completed";
    default: return status || "N/A";
  }
}
