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
            activity_groups: {
                Row: {
                    id: string
                    user_id: string
                    created_at: string | null
                    name: string | null
                    color: string | null
                    is_archived: boolean | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    created_at?: string | null
                    name?: string | null
                    color?: string | null
                    is_archived?: boolean | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    created_at?: string | null
                    name?: string | null
                    color?: string | null
                    is_archived?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "activity_groups_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            activities: {
                Row: {
                    id: string
                    user_id: string
                    group_id: string
                    created_at: string | null
                    name: string | null
                    color: string | null
                    routine: string | null
                    is_completed: boolean | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    group_id: string
                    created_at?: string | null
                    name?: string | null
                    color?: string | null
                    routine?: string | null
                    is_completed?: boolean | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    group_id?: string
                    created_at?: string | null
                    name?: string | null
                    color?: string | null
                    routine?: string | null
                    is_completed?: boolean | null
                }
                Relationships: [
                    {
                        foreignKeyName: "activities_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "activities_group_id_fkey"
                        columns: ["group_id"]
                        referencedRelation: "activity_groups"
                        referencedColumns: ["id"]
                    }
                ]
            }
            time_entries: {
                Row: {
                    id: string
                    user_id: string
                    activity_id: string
                    time_start: string | null
                    time_end: string | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    activity_id: string
                    time_start?: string | null
                    time_end?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    activity_id?: string
                    time_start?: string | null
                    time_end?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "time_entries_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "time_entries_activity_id_fkey"
                        columns: ["activity_id"]
                        referencedRelation: "activities"
                        referencedColumns: ["id"]
                    }
                ]
            }
            daily_entries: {
                Row: {
                    id: string
                    user_id: string
                    date: string | null
                    completed_tasks: string[] | null
                }
                Insert: {
                    id?: string
                    user_id: string
                    date?: string | null
                    completed_tasks?: string[] | null
                }
                Update: {
                    id?: string
                    user_id?: string
                    date?: string | null
                    completed_tasks?: string[] | null
                }
                Relationships: [
                    {
                        foreignKeyName: "daily_entries_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
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
            [_ in never]: never
        }
    }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
