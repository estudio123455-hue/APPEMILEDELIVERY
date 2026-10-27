export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: 'user' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: 'user' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      user_usage: {
        Row: {
          id: string;
          user_id: string;
          is_pro: boolean;
          dns_shield_active: boolean;
          market_searches_today: number;
          last_search_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          is_pro?: boolean;
          dns_shield_active?: boolean;
          market_searches_today?: number;
          last_search_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          is_pro?: boolean;
          dns_shield_active?: boolean;
          market_searches_today?: number;
          last_search_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_usage_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      monitored_domains: {
        Row: {
          id: string;
          user_id: string;
          domain: string;
          last_score: number;
          last_dmarc_policy: string;
          is_blacklisted: boolean;
          last_checked_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          domain: string;
          last_score?: number;
          last_dmarc_policy?: string;
          is_blacklisted?: boolean;
          last_checked_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          domain?: string;
          last_score?: number;
          last_dmarc_policy?: string;
          is_blacklisted?: boolean;
          last_checked_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'monitored_domains_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      domain_audits: {
        Row: {
          id: string;
          user_id: string | null;
          domain: string;
          score: number;
          status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
          spf_valid: boolean;
          dmarc_valid: boolean;
          dkim_valid: boolean;
          mx_valid: boolean;
          bimi_valid: boolean;
          critical_count: number;
          warning_count: number;
          issues: Json;
          raw_report: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          domain: string;
          score: number;
          status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
          spf_valid: boolean;
          dmarc_valid: boolean;
          dkim_valid: boolean;
          mx_valid: boolean;
          bimi_valid: boolean;
          critical_count: number;
          warning_count: number;
          issues?: Json;
          raw_report?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          domain?: string;
          score?: number;
          status?: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
          spf_valid?: boolean;
          dmarc_valid?: boolean;
          dkim_valid?: boolean;
          mx_valid?: boolean;
          bimi_valid?: boolean;
          critical_count?: number;
          warning_count?: number;
          issues?: Json;
          raw_report?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'domain_audits_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
