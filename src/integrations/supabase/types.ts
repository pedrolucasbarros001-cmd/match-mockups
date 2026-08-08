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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string
          id: string
          last_at: string
          last_message: string
          listing_id: string
          locked: boolean
          match_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_at?: string
          last_message?: string
          listing_id: string
          locked?: boolean
          match_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_at?: string
          last_message?: string
          listing_id?: string
          locked?: boolean
          match_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["listing_kind"]
          landlord_confirmed: boolean
          listing_id: string
          match_id: string
          months: number | null
          move_in: string
          reason: Database["public"]["Enums"]["close_reason"]
          seeker_confirmed: boolean
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          landlord_confirmed?: boolean
          listing_id: string
          match_id: string
          months?: number | null
          move_in?: string
          reason?: Database["public"]["Enums"]["close_reason"]
          seeker_confirmed?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          landlord_confirmed?: boolean
          listing_id?: string
          match_id?: string
          months?: number | null
          move_in?: string
          reason?: Database["public"]["Enums"]["close_reason"]
          seeker_confirmed?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          answer: string
          audience: string
          category: string
          id: string
          published: boolean
          question: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer: string
          audience?: string
          category?: string
          id?: string
          published?: boolean
          question: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string
          audience?: string
          category?: string
          id?: string
          published?: boolean
          question?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          currency: string
          id: string
          issued_at: string
          label: string
          status: string
          user_id: string
        }
        Insert: {
          amount?: number
          currency?: string
          id?: string
          issued_at?: string
          label: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          currency?: string
          id?: string
          issued_at?: string
          label?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      listing_passes: {
        Row: {
          created_at: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_passes_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          amenities: string[]
          available_from: string
          capacity: number
          city: string
          created_at: string
          description: string
          distance_m: number
          id: string
          kind: Database["public"]["Enums"]["listing_kind"]
          lifecycle: Database["public"]["Enums"]["listing_lifecycle"]
          min_months: number
          move_in_from: string
          neighborhood: string
          owner_id: string
          pets: boolean
          photos: string[]
          price: number
          quality_score: number
          rules: string
          smoke: boolean
          space_type: string
          title: string
          type: string
          updated_at: string
          visit_availability: string[]
        }
        Insert: {
          amenities?: string[]
          available_from?: string
          capacity?: number
          city?: string
          created_at?: string
          description?: string
          distance_m?: number
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          lifecycle?: Database["public"]["Enums"]["listing_lifecycle"]
          min_months?: number
          move_in_from?: string
          neighborhood?: string
          owner_id: string
          pets?: boolean
          photos?: string[]
          price?: number
          quality_score?: number
          rules?: string
          smoke?: boolean
          space_type?: string
          title?: string
          type?: string
          updated_at?: string
          visit_availability?: string[]
        }
        Update: {
          amenities?: string[]
          available_from?: string
          capacity?: number
          city?: string
          created_at?: string
          description?: string
          distance_m?: number
          id?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          lifecycle?: Database["public"]["Enums"]["listing_lifecycle"]
          min_months?: number
          move_in_from?: string
          neighborhood?: string
          owner_id?: string
          pets?: boolean
          photos?: string[]
          price?: number
          quality_score?: number
          rules?: string
          smoke?: boolean
          space_type?: string
          title?: string
          type?: string
          updated_at?: string
          visit_availability?: string[]
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          landlord_id: string
          listing_id: string
          message: string
          reasons: string[]
          seeker_id: string
          state: Database["public"]["Enums"]["match_state"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          landlord_id: string
          listing_id: string
          message?: string
          reasons?: string[]
          seeker_id: string
          state?: Database["public"]["Enums"]["match_state"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          landlord_id?: string
          listing_id?: string
          message?: string
          reasons?: string[]
          seeker_id?: string
          state?: Database["public"]["Enums"]["match_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          chat_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          chat_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          chat_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          category: Database["public"]["Enums"]["notification_category"]
          created_at: string
          icon: string
          id: string
          link: string | null
          title: string
          unread: boolean
          user_id: string
        }
        Insert: {
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          icon?: string
          id?: string
          link?: string | null
          title: string
          unread?: boolean
          user_id: string
        }
        Update: {
          body?: string
          category?: Database["public"]["Enums"]["notification_category"]
          created_at?: string
          icon?: string
          id?: string
          link?: string | null
          title?: string
          unread?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          authorized_to_list: boolean
          avatar_url: string
          billing_period: Database["public"]["Enums"]["billing_period"]
          bio: string
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"] | null
          email: string
          email_verified: boolean
          fiscal_address: string
          fiscal_name: string
          has_income: boolean
          id: string
          is_student: boolean
          language: string
          name: string
          nif: string
          occupation: string
          onboarding_completed: boolean
          phone: string
          phone_verified: boolean
          plan: Database["public"]["Enums"]["plan_id"]
          property_docs_in_order: boolean
          resident_in_portugal: boolean
          terms_accepted: boolean
          updated_at: string
        }
        Insert: {
          authorized_to_list?: boolean
          avatar_url?: string
          billing_period?: Database["public"]["Enums"]["billing_period"]
          bio?: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string
          email_verified?: boolean
          fiscal_address?: string
          fiscal_name?: string
          has_income?: boolean
          id: string
          is_student?: boolean
          language?: string
          name?: string
          nif?: string
          occupation?: string
          onboarding_completed?: boolean
          phone?: string
          phone_verified?: boolean
          plan?: Database["public"]["Enums"]["plan_id"]
          property_docs_in_order?: boolean
          resident_in_portugal?: boolean
          terms_accepted?: boolean
          updated_at?: string
        }
        Update: {
          authorized_to_list?: boolean
          avatar_url?: string
          billing_period?: Database["public"]["Enums"]["billing_period"]
          bio?: string
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"] | null
          email?: string
          email_verified?: boolean
          fiscal_address?: string
          fiscal_name?: string
          has_income?: boolean
          id?: string
          is_student?: boolean
          language?: string
          name?: string
          nif?: string
          occupation?: string
          onboarding_completed?: boolean
          phone?: string
          phone_verified?: boolean
          plan?: Database["public"]["Enums"]["plan_id"]
          property_docs_in_order?: boolean
          resident_in_portugal?: boolean
          terms_accepted?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_id: string
          by_role: Database["public"]["Enums"]["app_role"]
          comment: string
          created_at: string
          id: string
          match_id: string
          rating: number
          tags: string[]
        }
        Insert: {
          author_id: string
          by_role: Database["public"]["Enums"]["app_role"]
          comment?: string
          created_at?: string
          id?: string
          match_id: string
          rating: number
          tags?: string[]
        }
        Update: {
          author_id?: string
          by_role?: Database["public"]["Enums"]["app_role"]
          comment?: string
          created_at?: string
          id?: string
          match_id?: string
          rating?: number
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "reviews_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_staff: boolean
          sender_id: string | null
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id?: string | null
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          sender_id?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          city: string
          kind: Database["public"]["Enums"]["listing_kind"]
          max_distance_km: number
          max_price: number
          max_sale_price: number
          min_price: number
          move_in_from: string
          needs_furnished: boolean
          pets: boolean
          space_types_rent: string[]
          space_types_sale: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          max_distance_km?: number
          max_price?: number
          max_sale_price?: number
          min_price?: number
          move_in_from?: string
          needs_furnished?: boolean
          pets?: boolean
          space_types_rent?: string[]
          space_types_sale?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          kind?: Database["public"]["Enums"]["listing_kind"]
          max_distance_km?: number
          max_price?: number
          max_sale_price?: number
          min_price?: number
          move_in_from?: string
          needs_furnished?: boolean
          pets?: boolean
          space_types_rent?: string[]
          space_types_sale?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          channel_email: boolean
          channel_push: boolean
          notif_conversation: boolean
          notif_interest: boolean
          notif_marketplace: boolean
          notif_match: boolean
          notif_visit: boolean
          privacy_discoverable: boolean
          privacy_personalised: boolean
          privacy_show_activity: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          channel_email?: boolean
          channel_push?: boolean
          notif_conversation?: boolean
          notif_interest?: boolean
          notif_marketplace?: boolean
          notif_match?: boolean
          notif_visit?: boolean
          privacy_discoverable?: boolean
          privacy_personalised?: boolean
          privacy_show_activity?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          channel_email?: boolean
          channel_push?: boolean
          notif_conversation?: boolean
          notif_interest?: boolean
          notif_marketplace?: boolean
          notif_match?: boolean
          notif_visit?: boolean
          privacy_discoverable?: boolean
          privacy_personalised?: boolean
          privacy_show_activity?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          match_id: string
          notes: string
          proposed_by: string | null
          scheduled_at: string | null
          slot: string
          status: Database["public"]["Enums"]["visit_state"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          match_id: string
          notes?: string
          proposed_by?: string | null
          scheduled_at?: string | null
          slot?: string
          status?: Database["public"]["Enums"]["visit_state"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          match_id?: string
          notes?: string
          proposed_by?: string | null
          scheduled_at?: string | null
          slot?: string
          status?: Database["public"]["Enums"]["visit_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_role_is: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chat_party: { Args: { _chat_id: string }; Returns: boolean }
      is_match_party: { Args: { _match_id: string }; Returns: boolean }
      listing_owner_card: {
        Args: { _listing_id: string }
        Returns: {
          avatar_url: string
          document_ok: boolean
          email_verified: boolean
          name: string
          occupation: string
          phone_verified: boolean
        }[]
      }
      owns_ticket: { Args: { _ticket_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "seeker" | "landlord"
      billing_period: "monthly" | "annual"
      close_reason: "homematch" | "outside" | "paused" | "rework"
      document_type: "cc" | "passaporte" | "titulo-residencia"
      listing_kind: "rent" | "sale"
      listing_lifecycle:
        | "draft"
        | "published"
        | "paused"
        | "negotiating"
        | "rented"
      match_state:
        | "interested"
        | "conversation"
        | "visit_scheduled"
        | "visit_done"
        | "negotiating"
        | "rental_confirmed"
        | "closed"
      notification_category:
        | "interest"
        | "match"
        | "conversation"
        | "visit"
        | "availability"
        | "marketplace"
        | "system"
      plan_id: "free" | "pro"
      ticket_status: "open" | "pending" | "resolved" | "closed"
      visit_state:
        | "proposed"
        | "accepted"
        | "rescheduled"
        | "confirmed"
        | "done"
        | "cancelled"
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
      app_role: ["seeker", "landlord"],
      billing_period: ["monthly", "annual"],
      close_reason: ["homematch", "outside", "paused", "rework"],
      document_type: ["cc", "passaporte", "titulo-residencia"],
      listing_kind: ["rent", "sale"],
      listing_lifecycle: [
        "draft",
        "published",
        "paused",
        "negotiating",
        "rented",
      ],
      match_state: [
        "interested",
        "conversation",
        "visit_scheduled",
        "visit_done",
        "negotiating",
        "rental_confirmed",
        "closed",
      ],
      notification_category: [
        "interest",
        "match",
        "conversation",
        "visit",
        "availability",
        "marketplace",
        "system",
      ],
      plan_id: ["free", "pro"],
      ticket_status: ["open", "pending", "resolved", "closed"],
      visit_state: [
        "proposed",
        "accepted",
        "rescheduled",
        "confirmed",
        "done",
        "cancelled",
      ],
    },
  },
} as const
