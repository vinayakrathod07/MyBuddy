export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          preferred_name: string | null
          college: string | null
          course: string | null
          semester: number | null
          academic_year: string | null
          timezone: string | null
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          preferred_name?: string | null
          college?: string | null
          course?: string | null
          semester?: number | null
          academic_year?: string | null
          timezone?: string | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          preferred_name?: string | null
          college?: string | null
          course?: string | null
          semester?: number | null
          academic_year?: string | null
          timezone?: string | null
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          title: string
          description: string | null
          task_type: string | null
          priority: string | null
          status: string | null
          due_at: string | null
          estimated_minutes: number | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          title: string
          description?: string | null
          task_type?: string | null
          priority?: string | null
          status?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          title?: string
          description?: string | null
          task_type?: string | null
          priority?: string | null
          status?: string | null
          due_at?: string | null
          estimated_minutes?: number | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed for type safety
    }
  }
}
