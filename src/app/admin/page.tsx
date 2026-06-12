"use client";

import { useState, useEffect } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  ShoppingCart,
  DollarSign,
  GraduationCap,
  HeadphonesIcon,
  FileText,
  Star,
} from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeEnrollments: 0,
    openTickets: 0,
    totalAssignments: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createAdminClient();

        const { count: students } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { count: courses } = await supabase
          .from("courses")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        const { count: pendingOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "Pending");

        const { count: activeEnrollments } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("status", "Active");

        const { count: openTickets } = await supabase
          .from("support_tickets")
          .select("*", { count: "exact", head: true })
          .eq("status", "Open");

        const { count: pendingReviews } = await supabase
          .from("reviews")
          .select("*", { count: "exact", head: true })
          .eq("is_approved", false);

        setStats({
          totalStudents: students || 0,
          activeCourses: courses || 0,
          pendingOrders: pendingOrders || 0,
          totalRevenue: 0,
          activeEnrollments: activeEnrollments || 0,
          openTickets: openTickets || 0,
          totalAssignments: 0,
          pendingReviews: pendingReviews || 0,
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { icon: Users, label: "Total Students", value: stats.totalStudents, color: "from-blue-500 to-cyan-500" },
    { icon: BookOpen, label: "Active Courses", value: stats.activeCourses, color: "from-primary to-orange-500" },
    { icon: ShoppingCart, label: "Pending Orders", value: stats.pendingOrders, color: "from-yellow-500 to-orange-500" },
    { icon: DollarSign, label: "Total Revenue", value: `৳${stats.totalRevenue}`, color: "from-green-500 to-emerald-500" },
    { icon: GraduationCap, label: "Active Enrollments", value: stats.activeEnrollments, color: "from-purple-500 to-pink-500" },
    { icon: HeadphonesIcon, label: "Open Tickets", value: stats.openTickets, color: "from-red-500 to-rose-500" },
    { icon: FileText, label: "Assignments", value: stats.totalAssignments, color: "from-indigo-500 to-purple-500" },
    { icon: Star, label: "Pending Reviews", value: stats.pendingReviews, color: "from-teal-500 to-green-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 md:p-6">
              <div className={`h-9 w-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
