export type Task = {
    id: string;
    user_id: string;
    day_start_at: string;
    completed_tasks: string[];
}

export type User = {
    id: string;
    instance_id: string;
    email: string;
}