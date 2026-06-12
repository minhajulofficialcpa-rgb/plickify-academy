"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedLessons: 0,
    certificates: 0,
    totalProgress: 0,
  });

  useEffect(() => {
    async function loadDashboard() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { count: enrollments } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "Active");

      const { count: certificates } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        enrolledCourses: enrollments || 0,
        completedLessons: 0,
        certificates: certificates || 0,
        totalProgress: 0,
      });
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const statCards = [
    { icon: BookOpen, label: "Enrolled Courses", value: stats.enrolledCourses, color: "from-blue-500 to-cyan-500" },
    { icon: TrendingUp, label: "Course Progress", value: `${stats.totalProgress}%`, color: "from-primary to-orange-500" },
    { icon: Award, label: "Certificates", value: stats.certificates, color: "from-green-500 to-emerald-500" },
    { icon: Clock, label: "Learning Hours", value: "0", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity. Start learning to see your progress here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
