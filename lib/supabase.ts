import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      tools: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
          url: string;
          affiliate_url: string | null;
          description: string;
          category: string;
          pricing: 'Бесплатно' | 'Фримиум' | 'Платно' | 'Пробный период';
          domain: string;
          tags: string[];
          commission_rate: number;
          click_count: number;
          featured: boolean;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          slug?: string | null;
          url: string;
          affiliate_url?: string | null;
          description: string;
          category: string;
          pricing: 'Бесплатно' | 'Фримиум' | 'Платно' | 'Пробный период';
          domain: string;
          tags?: string[];
          commission_rate?: number;
          click_count?: number;
          featured?: boolean;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tools']['Insert']>;
      };
      clicks: {
        Row: {
          id: number;
          tool_id: number;
          ip: string | null;
          user_agent: string | null;
          country: string | null;
          device_type: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
          clicked_at: string;
        };
        Insert: {
          id?: number;
          tool_id: number;
          ip?: string | null;
          user_agent?: string | null;
          country?: string | null;
          device_type?: string | null;
          utm_source?: string | null;
          utm_medium?: string | null;
          utm_campaign?: string | null;
          clicked_at?: string;
        };
        Update: Partial<Database['public']['Tables']['clicks']['Insert']>;
      };
    };
    Views: {
      tools_analytics: {
        Row: {
          id: number;
          name: string;
          slug: string | null;
          category: string;
          pricing: string;
          domain: string;
          commission_rate: number;
          clicks: number;
          total_click_rows: number;
          unique_visitors: number;
          mobile_clicks: number;
          desktop_clicks: number;
          estimated_revenue: number;
          updated_at: string | null;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase public environment variables');
}

export const supabasePublic = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

export const supabaseAdmin = createClient<Database>(
  supabaseUrl ?? '',
  supabaseServiceRoleKey ?? supabaseAnonKey ?? '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
);

export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl ?? '', supabaseAnonKey ?? '', {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: Parameters<ReturnType<typeof cookies>['set']>[0]) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: Parameters<ReturnType<typeof cookies>['delete']>[0]) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}

export type ToolRow = Database['public']['Tables']['tools']['Row'];
export type ToolInsert = Database['public']['Tables']['tools']['Insert'];
export type ClickInsert = Database['public']['Tables']['clicks']['Insert'];
export type ToolAnalyticsRow = Database['public']['Views']['tools_analytics']['Row'];
export type ToolRecord = ToolRow & { tags: string[] };
export type JsonValue = Json;
