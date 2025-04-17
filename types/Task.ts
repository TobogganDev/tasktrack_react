export interface Task {
    id?: number;
    user_id: string;
    title: string;
    description?: string | null;
    location?: Record<string, any> | null;
    done?: boolean | null;
    created_at?: Date;
}