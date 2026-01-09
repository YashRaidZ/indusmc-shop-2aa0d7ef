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
      delivery_commands: {
        Row: {
          command_text: string
          created_at: string
          delay_ms: number
          enabled: boolean
          id: string
          order_index: number
          product_id: string
        }
        Insert: {
          command_text: string
          created_at?: string
          delay_ms?: number
          enabled?: boolean
          id?: string
          order_index?: number
          product_id: string
        }
        Update: {
          command_text?: string
          created_at?: string
          delay_ms?: number
          enabled?: boolean
          id?: string
          order_index?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_commands_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_logs: {
        Row: {
          command_text: string | null
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          order_id: string
          rcon_server_id: string | null
          status: string
        }
        Insert: {
          command_text?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          order_id: string
          rcon_server_id?: string | null
          status: string
        }
        Update: {
          command_text?: string | null
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          order_id?: string
          rcon_server_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_logs_rcon_server_id_fkey"
            columns: ["rcon_server_id"]
            isOneToOne: false
            referencedRelation: "rcon_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_queue: {
        Row: {
          attempt_count: number
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number
          minecraft_ign: string
          next_attempt_at: string | null
          order_id: string
          status: Database["public"]["Enums"]["delivery_status"]
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          minecraft_ign: string
          next_attempt_at?: string | null
          order_id: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Update: {
          attempt_count?: number
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          minecraft_ign?: string
          next_attempt_at?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["delivery_status"]
        }
        Relationships: [
          {
            foreignKeyName: "delivery_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_inr: number
          coupon_code: string | null
          created_at: string
          delivery_log: Json | null
          delivery_status: Database["public"]["Enums"]["delivery_status"]
          discord_id: string | null
          discount_amount: number | null
          email: string
          gift_recipient_ign: string | null
          id: string
          is_gift: boolean
          minecraft_ign: string
          payment_id: string | null
          payment_provider: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          product_id: string
          quantity: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_inr: number
          coupon_code?: string | null
          created_at?: string
          delivery_log?: Json | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          discord_id?: string | null
          discount_amount?: number | null
          email: string
          gift_recipient_ign?: string | null
          id?: string
          is_gift?: boolean
          minecraft_ign: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_id: string
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_inr?: number
          coupon_code?: string | null
          created_at?: string
          delivery_log?: Json | null
          delivery_status?: Database["public"]["Enums"]["delivery_status"]
          discord_id?: string | null
          discount_amount?: number | null
          email?: string
          gift_recipient_ign?: string | null
          id?: string
          is_gift?: boolean
          minecraft_ign?: string
          payment_id?: string | null
          payment_provider?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      player_status: {
        Row: {
          id: string
          last_join_at: string | null
          last_leave_at: string | null
          minecraft_ign: string
          online: boolean
          server_name: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          last_join_at?: string | null
          last_leave_at?: string | null
          minecraft_ign: string
          online?: boolean
          server_name?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          last_join_at?: string | null
          last_leave_at?: string | null
          minecraft_ign?: string
          online?: boolean
          server_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_rcon_servers: {
        Row: {
          id: string
          product_id: string
          rcon_server_id: string
        }
        Insert: {
          id?: string
          product_id: string
          rcon_server_id: string
        }
        Update: {
          id?: string
          product_id?: string
          rcon_server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_rcon_servers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_rcon_servers_rcon_server_id_fkey"
            columns: ["rcon_server_id"]
            isOneToOne: false
            referencedRelation: "rcon_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          delivery_enabled: boolean
          description: string | null
          discord_role_id: string | null
          duration_days: number | null
          features: Json | null
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean
          lifetime: boolean
          mode: Database["public"]["Enums"]["game_mode"]
          name: string
          original_price_inr: number | null
          price_inr: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_enabled?: boolean
          description?: string | null
          discord_role_id?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          lifetime?: boolean
          mode: Database["public"]["Enums"]["game_mode"]
          name: string
          original_price_inr?: number | null
          price_inr: number
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_enabled?: boolean
          description?: string | null
          discord_role_id?: string | null
          duration_days?: number | null
          features?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          lifetime?: boolean
          mode?: Database["public"]["Enums"]["game_mode"]
          name?: string
          original_price_inr?: number | null
          price_inr?: number
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      rcon_servers: {
        Row: {
          created_at: string
          enabled: boolean
          host: string
          id: string
          mode: Database["public"]["Enums"]["game_mode"]
          name: string
          port: number
          priority: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          host: string
          id?: string
          mode: Database["public"]["Enums"]["game_mode"]
          name: string
          port?: number
          priority?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          host?: string
          id?: string
          mode?: Database["public"]["Enums"]["game_mode"]
          name?: string
          port?: number
          priority?: number
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "manager"
      delivery_status:
        | "pending"
        | "queued"
        | "processing"
        | "delivered"
        | "failed"
      game_mode: "survival" | "lifesteal"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      product_type: "rank" | "item" | "crate" | "bundle"
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
      app_role: ["admin", "manager"],
      delivery_status: [
        "pending",
        "queued",
        "processing",
        "delivered",
        "failed",
      ],
      game_mode: ["survival", "lifesteal"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      product_type: ["rank", "item", "crate", "bundle"],
    },
  },
} as const
