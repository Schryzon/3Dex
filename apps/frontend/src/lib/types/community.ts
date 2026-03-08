import { User } from "./user";

export interface Post {
    id: string;
    user_id: string;
    user?: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    caption?: string;
    media_urls: string[];
    like_count: number;
    comment_count: number;
    created_at: string;
    is_nsfw?: boolean;
    liked_by_me?: boolean;
}

export interface PostComment {
    id: string;
    post_id: string;
    user_id: string;
    user: {
        id: string;
        username: string;
        avatar_url?: string;
    };
    content: string;
    created_at: string;
}
