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
