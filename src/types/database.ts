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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean | null
          badge: string | null
          badge_hi: string | null
          created_at: string | null
          id: string
          image: string
          imageFileId: string | null
          link: string | null
          order: number | null
          subtitle: string
          subtitle_hi: string | null
          title: string
          title_hi: string | null
        }
        Insert: {
          active?: boolean | null
          badge?: string | null
          badge_hi?: string | null
          created_at?: string | null
          id?: string
          image: string
          imageFileId?: string | null
          link?: string | null
          order?: number | null
          subtitle: string
          subtitle_hi?: string | null
          title: string
          title_hi?: string | null
        }
        Update: {
          active?: boolean | null
          badge?: string | null
          badge_hi?: string | null
          created_at?: string | null
          id?: string
          image?: string
          imageFileId?: string | null
          link?: string | null
          order?: number | null
          subtitle?: string
          subtitle_hi?: string | null
          title?: string
          title_hi?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image: string | null
          imageFileId: string | null
          name: string
          whatsappNumber: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          imageFileId?: string | null
          name: string
          whatsappNumber?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image?: string | null
          imageFileId?: string | null
          name?: string
          whatsappNumber?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          parentId: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          parentId?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          parentId?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parentId_fkey"
            columns: ["parentId"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          company_name: string | null
          created_at: string | null
          gst_number: string | null
          id: string
          order_type: string
          rfq_number: string
          status: string
          total_price: number
          user_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          order_type: string
          rfq_number: string
          status?: string
          total_price: number
          user_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          gst_number?: string | null
          id?: string
          order_type?: string
          rfq_number?: string
          status?: string
          total_price?: number
          user_id?: string | null
        }
        Relationships: []
      }
      parts: {
        Row: {
          brand: string | null
          brandId: string | null
          business_only: boolean | null
          business_price: number | null
          color: string | null
          created_at: string | null
          description: string
          description_hi: string | null
          discountPrice: number | null
          features: string
          features_hi: string | null
          gpd: number | null
          id: string
          image: string
          imageFileId: string | null
          inletOutletSize: string | null
          mainCategory: string
          material: string | null
          minQuantity: number | null
          name: string
          name_hi: string | null
          price: number
          sku: string | null
          stock: number | null
          subcategory: string
          updated_at: string | null
          updated_by: string | null
          voltage: string | null
        }
        Insert: {
          brand?: string | null
          brandId?: string | null
          business_only?: boolean | null
          business_price?: number | null
          color?: string | null
          created_at?: string | null
          description: string
          description_hi?: string | null
          discountPrice?: number | null
          features: string
          features_hi?: string | null
          gpd?: number | null
          id?: string
          image: string
          imageFileId?: string | null
          inletOutletSize?: string | null
          mainCategory: string
          material?: string | null
          minQuantity?: number | null
          name: string
          name_hi?: string | null
          price: number
          sku?: string | null
          stock?: number | null
          subcategory: string
          updated_at?: string | null
          updated_by?: string | null
          voltage?: string | null
        }
        Update: {
          brand?: string | null
          brandId?: string | null
          business_only?: boolean | null
          business_price?: number | null
          color?: string | null
          created_at?: string | null
          description?: string
          description_hi?: string | null
          discountPrice?: number | null
          features?: string
          features_hi?: string | null
          gpd?: number | null
          id?: string
          image?: string
          imageFileId?: string | null
          inletOutletSize?: string | null
          mainCategory?: string
          material?: string | null
          minQuantity?: number | null
          name?: string
          name_hi?: string | null
          price?: number
          sku?: string | null
          stock?: number | null
          subcategory?: string
          updated_at?: string | null
          updated_by?: string | null
          voltage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_brandId_fkey"
            columns: ["brandId"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_type_code: string | null
          city: string | null
          company_name: string | null
          created_at: string | null
          email: string
          gst_number: string | null
          id: string
          phone_number: string | null
          role: string
          state: string | null
          updated_at: string | null
          updated_by: string | null
          verification_status: string
        }
        Insert: {
          business_type_code?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email: string
          gst_number?: string | null
          id: string
          phone_number?: string | null
          role: string
          state?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string
        }
        Update: {
          business_type_code?: string | null
          city?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string
          gst_number?: string | null
          id?: string
          phone_number?: string | null
          role?: string
          state?: string | null
          updated_at?: string | null
          updated_by?: string | null
          verification_status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
