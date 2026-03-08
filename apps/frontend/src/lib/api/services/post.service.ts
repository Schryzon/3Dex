import { apiClient } from '../client';

export interface Post {
    id: string;
    caption: string;
    media_urls: string[];
    user: {
        id: string;
        username: string;
        display_name?: string;
        avatar_url?: string;
        role: string;
    };
    like_count: number;
    comment_count: number;
    is_nsfw?: boolean;
    is_liked?: boolean;
    created_at: string;
    _count?: {
        likes: number;
        comments: number;
    };
}

export const postService = {
    async getFeed(page = 1, limit = 10): Promise<Post[]> {
        return apiClient.get<Post[]>(`/posts/feed?page=${page}&limit=${limit}`);
    },

    async createPost(data: { caption: string; media_urls: string[]; is_nsfw?: boolean }): Promise<Post> {
        return apiClient.post<Post>('/posts', data);
    },

    async toggleLike(postId: string): Promise<{ message: string }> {
        return apiClient.post(`/posts/${postId}/like`, {});
    },

    async getComments(postId: string): Promise<any[]> {
        return apiClient.get(`/posts/${postId}/comments`);
    },

    async addComment(postId: string, content: string): Promise<any> {
        return apiClient.post(`/posts/${postId}/comments`, { content });
    },
};
