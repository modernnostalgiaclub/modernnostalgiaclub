export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_cache: {
        Row: {
          cache_key: string
          created_at: string
          data: Json
          expires_at: string
          id: string
        }
        Insert: {
          cache_key: string
          created_at?: string
          data: Json
          expires_at: string
          id?: string
        }
        Update: {
          cache_key?: string
          created_at?: string
          data?: Json
          expires_at?: string
          id?: string
        }
        Relationships: []
      }
      artist_track_access: {
        Row: {
          access_type: string | null
          created_at: string | null
          email: string
          id: string
          track_id: string | null
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          email: string
          id?: string
          track_id?: string | null
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          email?: string
          id?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artist_track_access_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "artist_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_tracks: {
        Row: {
          artist_name: string | null
          cover_art_url: string | null
          created_at: string | null
          disco_url: string
          duration: string | null
          id: string
          is_email_gated: boolean | null
          is_for_licensing: boolean | null
          is_published: boolean | null
          mp3_storage_paths: Json | null
          price: number | null
          sections: Json | null
          show_add_to_disco_button: boolean
          show_in_landing_player: boolean
          sort_order: number | null
          title: string
          track_type: string | null
          updated_at: string | null
          user_id: string
          versions: Json | null
        }
        Insert: {
          artist_name?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          disco_url: string
          duration?: string | null
          id?: string
          is_email_gated?: boolean | null
          is_for_licensing?: boolean | null
          is_published?: boolean | null
          mp3_storage_paths?: Json | null
          price?: number | null
          sections?: Json | null
          show_add_to_disco_button?: boolean
          show_in_landing_player?: boolean
          sort_order?: number | null
          title: string
          track_type?: string | null
          updated_at?: string | null
          user_id: string
          versions?: Json | null
        }
        Update: {
          artist_name?: string | null
          cover_art_url?: string | null
          created_at?: string | null
          disco_url?: string
          duration?: string | null
          id?: string
          is_email_gated?: boolean | null
          is_for_licensing?: boolean | null
          is_published?: boolean | null
          mp3_storage_paths?: Json | null
          price?: number | null
          sections?: Json | null
          show_add_to_disco_button?: boolean
          show_in_landing_player?: boolean
          sort_order?: number | null
          title?: string
          track_type?: string | null
          updated_at?: string | null
          user_id?: string
          versions?: Json | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      beat_license_submissions: {
        Row: {
          artist_name: string | null
          beats_interested: string
          created_at: string
          email: string
          full_name: string
          id: string
          license_option: string
          payment_status: string
          special_requests: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          artist_name?: string | null
          beats_interested: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          license_option: string
          payment_status?: string
          special_requests?: string | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          artist_name?: string | null
          beats_interested?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          license_option?: string
          payment_status?: string
          special_requests?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_name: string
          content: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "community_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          section_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          section_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          section_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "community_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_sections: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          slug: string
          sort_order: number | null
          title: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug: string
          sort_order?: number | null
          title: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          slug?: string
          sort_order?: number | null
          title?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_published: boolean | null
          min_tier: Database["public"]["Enums"]["patreon_tier"]
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          min_tier?: Database["public"]["Enums"]["patreon_tier"]
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean | null
          min_tier?: Database["public"]["Enums"]["patreon_tier"]
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      download_email_captures: {
        Row: {
          created_at: string
          email: string
          id: string
          track_id: string
          track_title: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          track_id: string
          track_title?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          track_id?: string
          track_title?: string | null
        }
        Relationships: []
      }
      example_tracks: {
        Row: {
          artist: string
          created_at: string
          description: string | null
          id: string
          is_download: boolean | null
          is_internal: boolean | null
          is_published: boolean | null
          link: string
          sort_order: number | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          artist: string
          created_at?: string
          description?: string | null
          id?: string
          is_download?: boolean | null
          is_internal?: boolean | null
          is_published?: boolean | null
          link: string
          sort_order?: number | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          artist?: string
          created_at?: string
          description?: string | null
          id?: string
          is_download?: boolean | null
          is_internal?: boolean | null
          is_published?: boolean | null
          link?: string
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      licensing_requests: {
        Row: {
          artist_user_id: string
          budget_range: string | null
          company: string | null
          created_at: string | null
          id: string
          project_description: string
          status: string | null
          supervisor_email: string
          supervisor_name: string
          track_id: string | null
        }
        Insert: {
          artist_user_id: string
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          id?: string
          project_description: string
          status?: string | null
          supervisor_email: string
          supervisor_name: string
          track_id?: string | null
        }
        Update: {
          artist_user_id?: string
          budget_range?: string | null
          company?: string | null
          created_at?: string | null
          id?: string
          project_description?: string
          status?: string | null
          supervisor_email?: string
          supervisor_name?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licensing_requests_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "artist_tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      member_subscriptions: {
        Row: {
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_grandfathered: boolean
          locked_billing_period: string
          locked_price: number
          notes: string | null
          plan_id: string | null
          started_at: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_grandfathered?: boolean
          locked_billing_period?: string
          locked_price?: number
          notes?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_grandfathered?: boolean
          locked_billing_period?: string
          locked_price?: number
          notes?: string | null
          plan_id?: string | null
          started_at?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          billing_period: string
          created_at: string
          description: string | null
          features: string[] | null
          grace_period_days: number
          id: string
          is_active: boolean
          is_popular: boolean
          limit_one_per_email: boolean
          name: string
          parent_plan_id: string | null
          price: number
          promo_codes: Json | null
          sort_order: number
          stripe_price_id: string | null
          stripe_product_id: string | null
          updated_at: string
        }
        Insert: {
          billing_period?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          grace_period_days?: number
          id?: string
          is_active?: boolean
          is_popular?: boolean
          limit_one_per_email?: boolean
          name: string
          parent_plan_id?: string | null
          price?: number
          promo_codes?: Json | null
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Update: {
          billing_period?: string
          created_at?: string
          description?: string | null
          features?: string[] | null
          grace_period_days?: number
          id?: string
          is_active?: boolean
          is_popular?: boolean
          limit_one_per_email?: boolean
          name?: string
          parent_plan_id?: string | null
          price?: number
          promo_codes?: Json | null
          sort_order?: number
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_parent_plan_id_fkey"
            columns: ["parent_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      networking_contacts: {
        Row: {
          company: string | null
          created_at: string
          email: string
          event_tag: string | null
          id: string
          name: string
          notes: string | null
          role: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          event_tag?: string | null
          id?: string
          name: string
          notes?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          event_tag?: string | null
          id?: string
          name?: string
          notes?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      networking_links: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_visible: boolean | null
          label: string
          sort_order: number | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          sort_order?: number | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          sort_order?: number | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      patreon_migration: {
        Row: {
          auth_method: string | null
          created_at: string
          google_user_id: string | null
          id: string
          migrated_at: string | null
          migration_status: string
          notified_at: string | null
          patreon_user_id: string
        }
        Insert: {
          auth_method?: string | null
          created_at?: string
          google_user_id?: string | null
          id?: string
          migrated_at?: string | null
          migration_status?: string
          notified_at?: string | null
          patreon_user_id: string
        }
        Update: {
          auth_method?: string | null
          created_at?: string
          google_user_id?: string | null
          id?: string
          migrated_at?: string | null
          migration_status?: string
          notified_at?: string | null
          patreon_user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          discord: string | null
          full_name: string | null
          has_publishing_account: boolean | null
          hero_image_url: string | null
          id: string
          instagram: string | null
          linktree: string | null
          name: string | null
          patreon_id: string | null
          patreon_tier: Database["public"]["Enums"]["patreon_tier"] | null
          pro: string | null
          profile_visibility: string | null
          publisher_ipi: string | null
          publishing_company: string | null
          soundcloud: string | null
          spotify: string | null
          stage_name: string | null
          stripe_account_id: string | null
          stripe_onboarding_complete: boolean
          tiktok: string | null
          tip_enabled: boolean | null
          tip_message: string | null
          twitter: string | null
          updated_at: string
          user_id: string
          username: string | null
          writer_ipi: string | null
          youtube: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          has_publishing_account?: boolean | null
          hero_image_url?: string | null
          id?: string
          instagram?: string | null
          linktree?: string | null
          name?: string | null
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          pro?: string | null
          profile_visibility?: string | null
          publisher_ipi?: string | null
          publishing_company?: string | null
          soundcloud?: string | null
          spotify?: string | null
          stage_name?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          tiktok?: string | null
          tip_enabled?: boolean | null
          tip_message?: string | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          writer_ipi?: string | null
          youtube?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          discord?: string | null
          full_name?: string | null
          has_publishing_account?: boolean | null
          hero_image_url?: string | null
          id?: string
          instagram?: string | null
          linktree?: string | null
          name?: string | null
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          pro?: string | null
          profile_visibility?: string | null
          publisher_ipi?: string | null
          publishing_company?: string | null
          soundcloud?: string | null
          spotify?: string | null
          stage_name?: string | null
          stripe_account_id?: string | null
          stripe_onboarding_complete?: boolean
          tiktok?: string | null
          tip_enabled?: boolean | null
          tip_message?: string | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          writer_ipi?: string | null
          youtube?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      reference_resources: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          sort_order: number | null
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      submissions: {
        Row: {
          created_at: string
          disco_url: string
          id: string
          internal_notes: string | null
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_type: Database["public"]["Enums"]["submission_type"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          disco_url: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type: Database["public"]["Enums"]["submission_type"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          disco_url?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_type?: Database["public"]["Enums"]["submission_type"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      sync_quiz_results: {
        Row: {
          answers: Json
          created_at: string
          email: string
          id: string
          result_type: string
          score: number
        }
        Insert: {
          answers: Json
          created_at?: string
          email: string
          id?: string
          result_type: string
          score: number
        }
        Update: {
          answers?: Json
          created_at?: string
          email?: string
          id?: string
          result_type?: string
          score?: number
        }
        Relationships: []
      }
      tracker_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tracker_reflections: {
        Row: {
          created_at: string
          id: string
          reflection_text: string | null
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          reflection_text?: string | null
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          reflection_text?: string | null
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      tracker_sessions: {
        Row: {
          created_at: string
          id: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          event_id: string
          id: string
          processed_at: string
          source: string
        }
        Insert: {
          event_id: string
          id?: string
          processed_at?: string
          source: string
        }
        Update: {
          event_id?: string
          id?: string
          processed_at?: string
          source?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_rate_limits: { Args: never; Returns: undefined }
      get_artist_profile: {
        Args: { p_username: string }
        Returns: {
          avatar_url: string
          bio: string
          discord: string
          hero_image_url: string
          instagram: string
          linktree: string
          profile_visibility: string
          soundcloud: string
          spotify: string
          stage_name: string
          tiktok: string
          tip_enabled: boolean
          tip_message: string
          twitter: string
          user_id: string
          youtube: string
        }[]
      }
      get_chat_profiles: {
        Args: { p_user_ids: string[] }
        Returns: {
          avatar_url: string
          name: string
          stage_name: string
          user_id: string
        }[]
      }
      get_landing_player_tracks: {
        Args: never
        Returns: {
          artist_name: string
          cover_art_url: string
          duration: string
          id: string
          mp3_storage_paths: Json
          sort_order: number
          title: string
          track_type: string
          versions: Json
        }[]
      }
      get_public_artist_tracks: {
        Args: { p_username: string }
        Returns: {
          artist_name: string
          cover_art_url: string
          created_at: string
          disco_url: string
          duration: string
          id: string
          is_email_gated: boolean
          is_for_licensing: boolean
          price: number
          sections: Json
          show_add_to_disco_button: boolean
          sort_order: number
          title: string
          track_type: string
          user_id: string
          versions: Json
        }[]
      }
      get_public_profile: {
        Args: { target_user_id: string }
        Returns: {
          avatar_url: string
          id: string
          patreon_tier: Database["public"]["Enums"]["patreon_tier"]
          pro: string
          stage_name: string
          user_id: string
        }[]
      }
      get_public_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          id: string
          instagram: string
          name: string
          patreon_tier: Database["public"]["Enums"]["patreon_tier"]
          pro: string
          soundcloud: string
          spotify: string
          stage_name: string
          user_id: string
          username: string
        }[]
      }
      get_site_setting: { Args: { setting_key: string }; Returns: Json }
      get_user_submissions:
        | {
            Args: never
            Returns: {
              created_at: string
              disco_url: string
              id: string
              notes: string
              reviewed_at: string
              reviewed_by: string
              reviewer_notes: string
              status: Database["public"]["Enums"]["submission_status"]
              submission_type: Database["public"]["Enums"]["submission_type"]
              title: string
              updated_at: string
              user_id: string
            }[]
          }
        | {
            Args: { _user_id: string }
            Returns: {
              created_at: string
              disco_url: string
              id: string
              notes: string
              reviewed_at: string
              reviewed_by: string
              reviewer_notes: string
              status: Database["public"]["Enums"]["submission_status"]
              submission_type: Database["public"]["Enums"]["submission_type"]
              title: string
              updated_at: string
              user_id: string
            }[]
          }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_access: {
        Args: {
          _action: string
          _details?: Json
          _record_id?: string
          _table_name: string
        }
        Returns: string
      }
      user_has_tier_access: {
        Args: { required_tier: Database["public"]["Enums"]["patreon_tier"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      patreon_tier: "lab-pass" | "creator-accelerator" | "creative-economy-lab"
      submission_status: "pending" | "in-review" | "reviewed" | "needs-revision"
      submission_type:
        | "sync-review"
        | "catalog-audit"
        | "branding"
        | "project-proposal"
        | "audio-mission"
        | "producer-mission"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      patreon_tier: ["lab-pass", "creator-accelerator", "creative-economy-lab"],
      submission_status: ["pending", "in-review", "reviewed", "needs-revision"],
      submission_type: [
        "sync-review",
        "catalog-audit",
        "branding",
        "project-proposal",
        "audio-mission",
        "producer-mission",
      ],
    },
  },
} as const
