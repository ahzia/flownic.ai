/**
 * Generated Database types will replace this file via `supabase gen types`.
 * Do not hand-edit a generated file once codegen is wired; until then this
 * stub documents the intended shape for early TypeScript work.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string;
          display_name: string | null;
          timezone: string;
          ui_locale: string;
          feedback_locale: string;
          age_confirmed: boolean;
          exam_date: string | null;
          acquisition_channel: string | null;
          is_staff: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_staff: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
};
