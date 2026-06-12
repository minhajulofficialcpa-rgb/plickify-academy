const TOKEN = "sbp_150c2708d4f1be0f89118880ff23093bf0520fa5";
const REF = "cpouhlqthdbqhorzselb";

async function query(sql: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) console.error("SQL error:", text.substring(0, 300));
  else if (text.trim()) console.log("OK:", text.substring(0, 200));
  return { ok: res.ok, data: text };
}

async function main() {
  // 1. Add missing columns to profiles
  console.log("=== Adding missing columns to profiles ===");
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';`);
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;`);

  // 2. Add missing columns to reviews
  console.log("=== Adding missing columns to reviews ===");
  await query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS name TEXT;`);
  await query(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`);

  // 3. Create triggers
  console.log("=== Creating triggers ===");
  await query(`
CREATE OR REPLACE FUNCTION public.allocate_user_to_junction_batch()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Active' THEN
        INSERT INTO public.user_batches (user_id, batch_id)
        VALUES (NEW.user_id, NEW.target_batch_id)
        ON CONFLICT (user_id, batch_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `.trim());

  await query(`
DROP TRIGGER IF EXISTS on_enrollment_approval_junction ON public.enrollments;
CREATE TRIGGER on_enrollment_approval_junction
    AFTER UPDATE OF status ON public.enrollments
    FOR EACH ROW
    EXECUTE FUNCTION public.allocate_user_to_junction_batch();
  `.trim());

  await query(`
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `.trim());

  await query(`
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  `.trim());

  // 4. Create indexes
  console.log("=== Creating indexes ===");
  const indexes = [
    `CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);`,
    `CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);`,
    `CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);`,
    `CREATE INDEX IF NOT EXISTS idx_courses_is_active ON courses(is_active);`,
    `CREATE INDEX IF NOT EXISTS idx_courses_is_featured ON courses(is_featured) WHERE is_featured = true;`,
    `CREATE INDEX IF NOT EXISTS idx_batches_course_id ON batches(course_id);`,
    `CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);`,
    `CREATE INDEX IF NOT EXISTS idx_course_lessons_sort ON course_lessons(course_id, sort_order);`,
    `CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON enrollments(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`,
    `CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);`,
    `CREATE INDEX IF NOT EXISTS idx_watch_analytics_user_id ON watch_analytics(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);`,
    `CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);`,
    `CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment_id ON assignment_submissions(assignment_id);`,
    `CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user_id ON assignment_submissions(user_id);`,
  ];
  for (const idx of indexes) {
    await query(idx);
  }

  // 5. Enable RLS on all tables and create policies
  console.log("=== Setting up RLS ===");
  
  // Enable RLS on all tables
  const tables = [
    "profiles", "admin_roles", "courses", "batches", "course_lessons",
    "enrollments", "user_batches", "products", "orders", "downloads",
    "assignments", "assignment_submissions", "watch_analytics",
    "support_tickets", "support_messages", "certificates", "invoices",
    "contact_messages", "reviews", "device_sessions", "notifications",
    "audit_logs", "abandoned_carts"
  ];
  
  for (const table of tables) {
    await query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`);
  }

  // Drop existing policies first
  const allPolicies = [
    "Users can read own profile", "Users can update own profile (if not locked)",
    "Admin can read all profiles", "Admin can update any profile",
    "Anyone can read active courses", "Admin/content_manager can manage courses",
    "Admin/content_manager can update courses",
    "Anyone can read active batches", "Admin/content_manager can manage batches",
    "Users can read lessons from enrolled batches", "Admin/content_manager can manage lessons",
    "Users can read own enrollments", "Users can create enrollments", "Admin can manage enrollments",
    "Users can read own batch mappings", "Admin can manage batch mappings",
    "Anyone can read active products", "Admin/content_manager can manage products",
    "Users can read own orders", "Admin can manage orders",
    "Users can read/create own tickets", "Users can create tickets", "Admin/support can manage tickets",
    "Users can read batch assignments", "Admin/content_manager can manage assignments",
    "Users can read/submit own submissions", "Admin can read/review all submissions", "Admin can update submissions",
    "Only super_admin can read audit logs",
    "Users can read own notifications", "Users can update own notifications",
    "Anyone can read approved reviews", "Users can create reviews", "Admin can manage reviews",
    "Admin can read contact messages",
    "Users can read own downloads",
    "Users can read/update own analytics", "Admin can read analytics",
    "Users can read own sessions", "Admin can read sessions",
    "Anyone can verify certificates", "Admin can manage certificates",
    "Anyone can verify invoices", "Admin can manage invoices",
    "Users can read own carts", "Admin can manage carts",
    "Users can read/create own ticket messages", "Users can create messages",
  ];
  
  // Drop all existing policies
  for (const table of ["profiles", "courses", "batches", "course_lessons", "enrollments", "user_batches", "products", "orders", "assignments", "assignment_submissions", "audit_logs", "notifications", "reviews", "contact_messages", "downloads", "watch_analytics", "device_sessions", "certificates", "invoices", "abandoned_carts", "support_tickets", "support_messages"]) {
    const policiesRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: `SELECT policyname FROM pg_policies WHERE tablename = '${table}' AND schemaname = 'public';` }),
    });
    const policiesData: any = await policiesRes.json();
    if (Array.isArray(policiesData)) {
      for (const p of policiesData) {
        await query(`DROP POLICY IF EXISTS "${p.policyname}" ON ${table};`);
      }
    }
  }

  // Create RLS policies
  const policies = [
    // profiles
    `CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);`,
    `CREATE POLICY "Users can update own profile (if not locked)" ON profiles FOR UPDATE USING (auth.uid() = id AND is_locked = false);`,
    `CREATE POLICY "Admin can read all profiles" ON profiles FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager', 'support_moderator')));`,
    `CREATE POLICY "Admin can update any profile" ON profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // courses
    `CREATE POLICY "Anyone can read active courses" ON courses FOR SELECT USING (is_active = true);`,
    `CREATE POLICY "Admin/content_manager can manage courses" ON courses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    `CREATE POLICY "Admin/content_manager can update courses" ON courses FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // batches
    `CREATE POLICY "Anyone can read active batches" ON batches FOR SELECT USING (true);`,
    `CREATE POLICY "Admin/content_manager can manage batches" ON batches FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // lessons
    `CREATE POLICY "Users can read lessons from enrolled batches" ON course_lessons FOR SELECT USING (EXISTS (SELECT 1 FROM user_batches WHERE user_batches.user_id = auth.uid() AND user_batches.batch_id = course_lessons.batch_id));`,
    `CREATE POLICY "Admin/content_manager can manage lessons" ON course_lessons FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // enrollments
    `CREATE POLICY "Users can read own enrollments" ON enrollments FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Users can create enrollments" ON enrollments FOR INSERT WITH CHECK (user_id = auth.uid());`,
    `CREATE POLICY "Admin can manage enrollments" ON enrollments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // user_batches
    `CREATE POLICY "Users can read own batch mappings" ON user_batches FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Admin can manage batch mappings" ON user_batches FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // products
    `CREATE POLICY "Anyone can read active products" ON products FOR SELECT USING (is_active = true);`,
    `CREATE POLICY "Admin/content_manager can manage products" ON products FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // orders
    `CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Admin can manage orders" ON orders FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // support_tickets
    `CREATE POLICY "Users can read/create own tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());`,
    `CREATE POLICY "Admin/support can manage tickets" ON support_tickets FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support_moderator')));`,
    
    // assignments
    `CREATE POLICY "Users can read batch assignments" ON assignments FOR SELECT USING (EXISTS (SELECT 1 FROM user_batches WHERE user_batches.batch_id = assignments.batch_id AND user_batches.user_id = auth.uid()));`,
    `CREATE POLICY "Admin/content_manager can manage assignments" ON assignments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // assignment_submissions
    `CREATE POLICY "Users can read/submit own submissions" ON assignment_submissions FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`,
    `CREATE POLICY "Admin can read/review all submissions" ON assignment_submissions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    `CREATE POLICY "Admin can update submissions" ON assignment_submissions FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // audit_logs
    `CREATE POLICY "Only super_admin can read audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));`,
    
    // notifications
    `CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());`,
    
    // reviews
    `CREATE POLICY "Anyone can read approved reviews" ON reviews FOR SELECT USING (is_approved = true);`,
    `CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);`,
    `CREATE POLICY "Admin can manage reviews" ON reviews FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // contact_messages
    `CREATE POLICY "Admin can read contact messages" ON contact_messages FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // downloads
    `CREATE POLICY "Users can read own downloads" ON downloads FOR SELECT USING (user_id = auth.uid());`,
    
    // watch_analytics
    `CREATE POLICY "Users can read/update own analytics" ON watch_analytics FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());`,
    `CREATE POLICY "Admin can read analytics" ON watch_analytics FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'content_manager')));`,
    
    // device_sessions
    `CREATE POLICY "Users can read own sessions" ON device_sessions FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Admin can read sessions" ON device_sessions FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // certificates
    `CREATE POLICY "Anyone can verify certificates" ON certificates FOR SELECT USING (true);`,
    `CREATE POLICY "Admin can manage certificates" ON certificates FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // invoices
    `CREATE POLICY "Anyone can verify invoices" ON invoices FOR SELECT USING (true);`,
    `CREATE POLICY "Admin can manage invoices" ON invoices FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // abandoned_carts
    `CREATE POLICY "Users can read own carts" ON abandoned_carts FOR SELECT USING (user_id = auth.uid());`,
    `CREATE POLICY "Admin can manage carts" ON abandoned_carts FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));`,
    
    // support_messages
    `CREATE POLICY "Users can read/create own ticket messages" ON support_messages FOR SELECT USING (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND (support_tickets.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support_moderator')))));`,
    `CREATE POLICY "Users can create messages" ON support_messages FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM support_tickets WHERE support_tickets.id = support_messages.ticket_id AND (support_tickets.user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support_moderator')))));`,
  ];

  for (const policy of policies) {
    await query(policy);
  }

  console.log("\n=== Migration fixup complete! ===");
}

main().catch(console.error);
