export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      avatar_customizations: {
        Row: {
          attire: Json | null
          avatar_id: string
          background: Json | null
          brand_settings: Json | null
          created_at: string
          id: string
          speaking_style: Json | null
          updated_at: string
        }
        Insert: {
          attire?: Json | null
          avatar_id: string
          background?: Json | null
          brand_settings?: Json | null
          created_at?: string
          id?: string
          speaking_style?: Json | null
          updated_at?: string
        }
        Update: {
          attire?: Json | null
          avatar_id?: string
          background?: Json | null
          brand_settings?: Json | null
          created_at?: string
          id?: string
          speaking_style?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avatar_customizations_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      avatar_training_data: {
        Row: {
          avatar_id: string
          created_at: string
          feedback_notes: string | null
          id: string
          photos: Json | null
          processing_status: string
          quality_score: number | null
          video_url: string | null
        }
        Insert: {
          avatar_id: string
          created_at?: string
          feedback_notes?: string | null
          id?: string
          photos?: Json | null
          processing_status?: string
          quality_score?: number | null
          video_url?: string | null
        }
        Update: {
          avatar_id?: string
          created_at?: string
          feedback_notes?: string | null
          id?: string
          photos?: Json | null
          processing_status?: string
          quality_score?: number | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avatar_training_data_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_content: {
        Row: {
          created_at: string
          generation_status: Database["public"]["Enums"]["project_status"]
          id: string
          project_id: string
          script_alternatives: Json | null
          script_text: string | null
          template_used: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          generation_status?: Database["public"]["Enums"]["project_status"]
          id?: string
          project_id: string
          script_alternatives?: Json | null
          script_text?: string | null
          template_used?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          generation_status?: Database["public"]["Enums"]["project_status"]
          id?: string
          project_id?: string
          script_alternatives?: Json | null
          script_text?: string | null
          template_used?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generated_content_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_content_template_used_fkey"
            columns: ["template_used"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          financial_data: Json | null
          id: string
          name: string
          pdf_url: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          financial_data?: Json | null
          id?: string
          name: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          financial_data?: Json | null
          id?: string
          name?: string
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          preview_image: string | null
          style_config: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          preview_image?: string | null
          style_config: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          preview_image?: string | null
          style_config?: Json
        }
        Relationships: []
      }
      user_avatars: {
        Row: {
          created_at: string
          heygen_avatar_id: string | null
          id: string
          name: string
          preview_video_url: string | null
          status: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          heygen_avatar_id?: string | null
          id?: string
          name: string
          preview_video_url?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          heygen_avatar_id?: string | null
          id?: string
          name?: string
          preview_video_url?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_profiles: {
        Row: {
          avatar_id: string | null
          created_at: string
          elevenlabs_voice_id: string | null
          id: string
          language: string
          name: string
          sample_audio_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_id?: string | null
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          language?: string
          name: string
          sample_audio_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_id?: string | null
          created_at?: string
          elevenlabs_voice_id?: string | null
          id?: string
          language?: string
          name?: string
          sample_audio_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_profiles_avatar_id_fkey"
            columns: ["avatar_id"]
            isOneToOne: false
            referencedRelation: "user_avatars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      project_status: "uploading" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_status: ["uploading", "processing", "completed", "failed"],
    },
  },
} as const
