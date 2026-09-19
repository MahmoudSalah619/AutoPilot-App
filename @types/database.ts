/**
 * Generated from the live Supabase project (`mpryarxgnqnkcsplyfzc`).
 *
 * Do not edit by hand. Regenerate after any schema change with:
 *   npx supabase gen types typescript --project-id mpryarxgnqnkcsplyfzc
 *
 * The Supabase client in `apis/supabaseClient.ts` is deliberately *not*
 * parameterised with this type: the repositories for climate, trips,
 * notifications and diagnostics still reference tables the project does not
 * have yet (`PLANNED_TABLES` in `apis/config.ts`), and typing the client
 * would make those branches fail to compile before the migration lands.
 * Use these types directly where a row shape needs to be exact.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      car_makes: {
        Row: {
          created_at: string;
          id: number;
          is_active: boolean;
          logo: string | null;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_active: boolean;
          logo?: string | null;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_active?: boolean;
          logo?: string | null;
          name?: string | null;
        };
      };
      car_models: {
        Row: {
          body_type: Database['public']['Enums']['car_body_types'] | null;
          created_at: string;
          id: number;
          is_active: boolean | null;
          make: number | null;
          name: string | null;
          year: string | null;
        };
        Insert: {
          body_type?: Database['public']['Enums']['car_body_types'] | null;
          created_at?: string;
          id?: number;
          is_active?: boolean | null;
          make?: number | null;
          name?: string | null;
          year?: string | null;
        };
        Update: {
          body_type?: Database['public']['Enums']['car_body_types'] | null;
          created_at?: string;
          id?: number;
          is_active?: boolean | null;
          make?: number | null;
          name?: string | null;
          year?: string | null;
        };
      };
      gas_consumption: {
        Row: {
          created_at: string;
          date: string;
          efficiency: number | null;
          id: number;
          kilometers_driven: number;
          liters_consumed: number;
          vehicle_id: number;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: number;
          kilometers_driven: number;
          liters_consumed: number;
          vehicle_id: number;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: number;
          kilometers_driven?: number;
          liters_consumed?: number;
          vehicle_id?: number;
        };
      };
      maintenance: {
        Row: {
          cost: number | null;
          created_at: string;
          date: string | null;
          id: number;
          interval: number | null;
          notes: string | null;
          odometer: number;
          service_type: number;
          status: Database['public']['Enums']['maintenance_status'] | null;
          vehicle_id: number;
        };
        Insert: {
          cost?: number | null;
          created_at?: string;
          date?: string | null;
          id?: number;
          interval?: number | null;
          notes?: string | null;
          odometer: number;
          service_type: number;
          status?: Database['public']['Enums']['maintenance_status'] | null;
          vehicle_id: number;
        };
        Update: {
          cost?: number | null;
          created_at?: string;
          date?: string | null;
          id?: number;
          interval?: number | null;
          notes?: string | null;
          odometer?: number;
          service_type?: number;
          status?: Database['public']['Enums']['maintenance_status'] | null;
          vehicle_id?: number;
        };
      };
      service_reminders: {
        Row: {
          completed_at: string | null;
          created_at: string;
          date: string;
          id: number;
          is_completed: boolean | null;
          notes: string | null;
          vehicle_id: number;
        };
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          date: string;
          id?: number;
          is_completed?: boolean | null;
          notes?: string | null;
          vehicle_id: number;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          date?: string;
          id?: number;
          is_completed?: boolean | null;
          notes?: string | null;
          vehicle_id?: number;
        };
      };
      services_types: {
        Row: { created_at: string; id: number; interval: number | null; name: string | null };
        Insert: {
          created_at?: string;
          id?: number;
          interval?: number | null;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          interval?: number | null;
          name?: string | null;
        };
      };
      tips: {
        Row: {
          created_at: string;
          description: string | null;
          id: number;
          is_seen: boolean | null;
          screen: Database['public']['Enums']['screen names'];
          title: string;
          type: Database['public']['Enums']['tip_type'];
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: number;
          is_seen?: boolean | null;
          screen: Database['public']['Enums']['screen names'];
          title: string;
          type?: Database['public']['Enums']['tip_type'];
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: number;
          is_seen?: boolean | null;
          screen?: Database['public']['Enums']['screen names'];
          title?: string;
          type?: Database['public']['Enums']['tip_type'];
        };
      };
      vehicle_documents: {
        Row: {
          created_at: string;
          id: number;
          image: string;
          name: string | null;
          vehicle_id: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          image: string;
          name?: string | null;
          vehicle_id: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          image?: string;
          name?: string | null;
          vehicle_id?: number;
        };
      };
      vehicles: {
        Row: {
          created_at: string;
          id: number;
          is_primary: boolean;
          make: number | null;
          model: string | null;
          odometer: number | null;
          user_id: string;
          year: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_primary?: boolean;
          make?: number | null;
          model?: string | null;
          odometer?: number | null;
          user_id: string;
          year?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_primary?: boolean;
          make?: number | null;
          model?: string | null;
          odometer?: number | null;
          user_id?: string;
          year?: string | null;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      car_body_types: 'Sedan' | 'Hatchback' | 'SUV' | 'Van' | 'Sport';
      maintenance_status: 'completed' | 'upcoming' | 'overdue';
      'screen names':
        | 'dashboard'
        | 'gas_consumption'
        | 'error_guide'
        | 'vehicle_documents'
        | 'service_reminders';
      tip_type: 'tip' | 'alert';
    };
    CompositeTypes: Record<never, never>;
  };
};

/** Row type for a table, e.g. `Tables<'vehicles'>`. */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Insert payload for a table, e.g. `TablesInsert<'vehicles'>`. */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Update payload for a table, e.g. `TablesUpdate<'vehicles'>`. */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

/** A database enum, e.g. `Enums<'maintenance_status'>`. */
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
