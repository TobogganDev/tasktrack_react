export interface Task {
    id?: number;
    title: string;
    description: string | null;
    done: boolean;
    created_at?: string;
    user_id?: string;
    location?: string | null;
}