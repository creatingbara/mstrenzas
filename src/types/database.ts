export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type BookingStatus = "pendiente" | "confirmada" | "completada" | "cancelada";

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: string;
          description: string | null;
          price_from: number | null;
          price_to: number | null;
          duration_minutes: number | null;
          image_url: string | null;
          is_active: boolean;
          requires_quote: boolean;
          is_featured: boolean;
          recommendations: string | null;
          includes: string | null;
          not_included: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: string;
          description?: string | null;
          price_from?: number | null;
          price_to?: number | null;
          duration_minutes?: number | null;
          image_url?: string | null;
          is_active?: boolean;
          requires_quote?: boolean;
          is_featured?: boolean;
          recommendations?: string | null;
          includes?: string | null;
          not_included?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: [];
      };
      service_options: {
        Row: {
          id: string;
          service_id: string | null;
          name: string;
          description: string | null;
          extra_price: number | null;
          price_from: number | null;
          price_to: number | null;
          duration_minutes: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          service_id?: string | null;
          name: string;
          description?: string | null;
          extra_price?: number | null;
          price_from?: number | null;
          price_to?: number | null;
          duration_minutes?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["service_options"]["Insert"]>;
        Relationships: [];
      };
      gallery_items: {
        Row: {
          id: string;
          title: string | null;
          image_url: string;
          category: string | null;
          is_featured: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          image_url: string;
          category?: string | null;
          is_featured?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_items"]["Insert"]>;
        Relationships: [];
      };
      booking_requests: {
        Row: {
          id: string;
          client_name: string;
          phone: string;
          instagram: string | null;
          service_id: string | null;
          service_name: string | null;
          service_slug: string | null;
          preferred_date: string | null;
          preferred_time: string | null;
          reference_image_url: string | null;
          notes: string | null;
          status: BookingStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_name: string;
          phone: string;
          instagram?: string | null;
          service_id?: string | null;
          service_name?: string | null;
          service_slug?: string | null;
          preferred_date?: string | null;
          preferred_time?: string | null;
          reference_image_url?: string | null;
          notes?: string | null;
          status?: BookingStatus;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["booking_requests"]["Insert"]>;
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          whatsapp_number: string | null;
          instagram_url: string | null;
          address: string | null;
          schedule: string | null;
          hero_title: string | null;
          hero_subtitle: string | null;
          booking_policy: string | null;
          deposit_policy: string | null;
          cancellation_policy: string | null;
          whatsapp_message: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          whatsapp_number?: string | null;
          instagram_url?: string | null;
          address?: string | null;
          schedule?: string | null;
          hero_title?: string | null;
          hero_subtitle?: string | null;
          booking_policy?: string | null;
          deposit_policy?: string | null;
          cancellation_policy?: string | null;
          whatsapp_message?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number | null;
          stock: number | null;
          image_url: string | null;
          category: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price?: number | null;
          stock?: number | null;
          image_url?: string | null;
          category?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: number;
          is_active: boolean;
          start_time: string;
          end_time: string;
          slot_interval_minutes: number;
          buffer_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          is_active?: boolean;
          start_time?: string;
          end_time?: string;
          slot_interval_minutes?: number;
          buffer_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["business_hours"]["Insert"]>;
        Relationships: [];
      };
      availability_exceptions: {
        Row: {
          id: string;
          exception_date: string;
          is_available: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          exception_date: string;
          is_available?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability_exceptions"]["Insert"]>;
        Relationships: [];
      };
      appointment_bookings: {
        Row: {
          id: string;
          service_id: string | null;
          service_name: string;
          client_name: string;
          phone: string;
          instagram: string | null;
          email: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          status: "pendiente" | "confirmada" | "cancelada" | "completada" | "no_asistio";
          notes: string | null;
          reference_image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id?: string | null;
          service_name: string;
          client_name: string;
          phone: string;
          instagram?: string | null;
          email?: string | null;
          appointment_date: string;
          start_time: string;
          end_time: string;
          duration_minutes: number;
          status?: "pendiente" | "confirmada" | "cancelada" | "completada" | "no_asistio";
          notes?: string | null;
          reference_image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["appointment_bookings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
