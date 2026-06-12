export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          phone_number: string | null;
          avatar_url: string | null;
          role: string;
          is_locked: boolean;
          is_suspended: boolean;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_locked?: boolean;
          is_suspended?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          phone_number?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_locked?: boolean;
          is_suspended?: boolean;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          assigned_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          assigned_by?: string | null;
          created_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          thumbnail_url: string | null;
          price: number;
          is_featured: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          description?: string | null;
          thumbnail_url?: string | null;
          price?: number;
          is_featured?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      batches: {
        Row: {
          id: string;
          course_id: string;
          batch_name: string;
          seat_limit: number | null;
          start_date: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          batch_name: string;
          seat_limit?: number | null;
          start_date?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          batch_name?: string;
          seat_limit?: number | null;
          start_date?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      course_lessons: {
        Row: {
          id: string;
          course_id: string;
          batch_id: string | null;
          title: string;
          video_provider: string;
          video_id: string | null;
          duration_seconds: number | null;
          sort_order: number;
          is_locked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          batch_id?: string | null;
          title: string;
          video_provider?: string;
          video_id?: string | null;
          duration_seconds?: number | null;
          sort_order?: number;
          is_locked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          batch_id?: string | null;
          title?: string;
          video_provider?: string;
          video_id?: string | null;
          duration_seconds?: number | null;
          sort_order?: number;
          is_locked?: boolean;
          created_at?: string;
        };
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          target_batch_id: string | null;
          status: string;
          access_type: string;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          target_batch_id?: string | null;
          status?: string;
          access_type?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          target_batch_id?: string | null;
          status?: string;
          access_type?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_batches: {
        Row: {
          id: string;
          user_id: string;
          batch_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          batch_id: string;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          batch_id?: string;
          enrolled_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          category: string;
          description: string | null;
          price: number;
          file_path: string | null;
          is_free: boolean;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          category: string;
          description?: string | null;
          price?: number;
          file_path?: string | null;
          is_free?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          category?: string;
          description?: string | null;
          price?: number;
          file_path?: string | null;
          is_free?: boolean;
          is_active?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          item_type: string;
          course_id: string | null;
          product_id: string | null;
          status: string;
          total_amount: number;
          access_type: string;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: string;
          course_id?: string | null;
          product_id?: string | null;
          status?: string;
          total_amount?: number;
          access_type?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_type?: string;
          course_id?: string | null;
          product_id?: string | null;
          status?: string;
          total_amount?: number;
          access_type?: string;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      downloads: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          order_id: string | null;
          download_count: number;
          last_downloaded_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          product_id: string;
          order_id?: string | null;
          download_count?: number;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          product_id?: string;
          order_id?: string | null;
          download_count?: number;
          last_downloaded_at?: string | null;
          created_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          batch_id: string;
          title: string;
          instructions: string | null;
          max_marks: number | null;
          deadline: string | null;
          attachment_url: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          batch_id: string;
          title: string;
          instructions?: string | null;
          max_marks?: number | null;
          deadline?: string | null;
          attachment_url?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          batch_id?: string;
          title?: string;
          instructions?: string | null;
          max_marks?: number | null;
          deadline?: string | null;
          attachment_url?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          user_id: string;
          submission_url: string | null;
          submitted_text: string | null;
          marks: number | null;
          feedback: string | null;
          status: string;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          user_id: string;
          submission_url?: string | null;
          submitted_text?: string | null;
          marks?: number | null;
          feedback?: string | null;
          status?: string;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          user_id?: string;
          submission_url?: string | null;
          submitted_text?: string | null;
          marks?: number | null;
          feedback?: string | null;
          status?: string;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
      };
      watch_analytics: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          watched_seconds: number;
          progress_percent: number;
          last_position_seconds: number;
          completed: boolean;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          watched_seconds?: number;
          progress_percent?: number;
          last_position_seconds?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lesson_id?: string;
          watched_seconds?: number;
          progress_percent?: number;
          last_position_seconds?: number;
          completed?: boolean;
          last_watched_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          status: string;
          priority: string;
          assigned_admin: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject: string;
          status?: string;
          priority?: string;
          assigned_admin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject?: string;
          status?: string;
          priority?: string;
          assigned_admin?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      support_messages: {
        Row: {
          id: string;
          ticket_id: string;
          sender_id: string;
          message: string | null;
          attachment_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          sender_id: string;
          message?: string | null;
          attachment_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          ticket_id?: string;
          sender_id?: string;
          message?: string | null;
          attachment_url?: string | null;
          created_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          certificate_code: string;
          certificate_url: string | null;
          issued_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          certificate_code: string;
          certificate_url?: string | null;
          issued_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          certificate_code?: string;
          certificate_url?: string | null;
          issued_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          order_id: string;
          invoice_code: string;
          invoice_url: string | null;
          issued_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_id: string;
          invoice_code: string;
          invoice_url?: string | null;
          issued_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          order_id?: string;
          invoice_code?: string;
          invoice_url?: string | null;
          issued_at?: string;
        };
      };
      contact_messages: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          phone: string | null;
          message: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string | null;
          email?: string | null;
          phone?: string | null;
          message?: string | null;
          status?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string;
          name: string | null;
          rating: number | null;
          review_text: string | null;
          screenshot_url: string | null;
          is_featured: boolean;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string | null;
          rating?: number | null;
          review_text?: string | null;
          screenshot_url?: string | null;
          is_featured?: boolean;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string | null;
          rating?: number | null;
          review_text?: string | null;
          screenshot_url?: string | null;
          is_featured?: boolean;
          is_approved?: boolean;
          created_at?: string;
        };
      };
      device_sessions: {
        Row: {
          id: string;
          user_id: string;
          device_hash: string;
          user_agent: string | null;
          ip_address: string | null;
          is_active: boolean;
          last_seen_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_hash: string;
          user_agent?: string | null;
          ip_address?: string | null;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_hash?: string;
          user_agent?: string | null;
          ip_address?: string | null;
          is_active?: boolean;
          last_seen_at?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string | null;
          message: string | null;
          type: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          message?: string | null;
          type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string | null;
          message?: string | null;
          type?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string | null;
          target_table: string | null;
          target_id: string | null;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action?: string | null;
          target_table?: string | null;
          target_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string | null;
          target_table?: string | null;
          target_id?: string | null;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      abandoned_carts: {
        Row: {
          id: string;
          user_id: string | null;
          item_type: string | null;
          course_id: string | null;
          product_id: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          item_type?: string | null;
          course_id?: string | null;
          product_id?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          item_type?: string | null;
          course_id?: string | null;
          product_id?: string | null;
          status?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
