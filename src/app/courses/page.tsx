import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Clock,
  Users,
  Sparkles,
  GraduationCap,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Courses | Plickify Academy",
  description: "Browse all courses at Plickify Academy",
};

export default async function CoursesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*, batches!inner(*), course_lessons!inner(id)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

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
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <section className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Our Courses
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Choose Your Path
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Select a course and start building your AI-powered income stream today
              </p>
            </div>

            {(!courses || courses.length === 0) ? (
              <div className="text-center py-16">
                <BookOpen className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No Courses Available</p>
                <p className="text-sm text-muted-foreground">Check back soon for new courses</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(courses as any[]).map((course) => {
                  const activeBatch = course.batches?.find((b: any) => b.status === "Upcoming") || course.batches?.[0];
                  const lessonCount = Array.isArray(course.course_lessons) ? course.course_lessons.length : 0;

                  return (
                    <Link key={course.id} href={`/courses/${course.slug}`}>
                      <Card className="h-full overflow-hidden hover:border-primary/30 transition-all duration-300 group hover:shadow-lg hover:shadow-primary/5">
                        <div className="h-48 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />
                          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                            <GraduationCap className="h-10 w-10 text-white" />
                          </div>
                          {course.is_featured && (
                            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-primary to-orange-500 border-0">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                            {course.title}
                          </h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                              {course.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {activeBatch && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                <span>{activeBatch.seat_limit || "Limited"} seats</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3.5 w-3.5" />
                              <span>{lessonCount} lessons</span>
                            </div>
                            {course.price > 0 && (
                              <div className="flex items-center gap-1 font-semibold text-primary">
                                ৳{course.price.toLocaleString("bn-BD")}
                              </div>
                            )}
                            {course.price === 0 && (
                              <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">
                                Free
                              </Badge>
                            )}
                          </div>
                          <div className="mt-4 flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                            View Course <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
