import axios from 'axios';
import { apiClient } from '../client';

export const postKeys = {
    all: ['posts'] as const,
    feed: ['community-feed'] as const,
    comments: (postId: string) => ['post-comments', postId] as const,
} as const;

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
        is_followed?: boolean;
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
    async getFeed(page = 1, limit = 10): Promise<{ posts: Post[], following_count: number }> {
        return apiClient.get<{ posts: Post[], following_count: number }>(`/posts/feed?page=${page}&limit=${limit}`);
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

    async deletePost(postId: string): Promise<{ message: string }> {
        return apiClient.delete(`/posts/${postId}`);
    },

    async reportPost(postId: string, reason: string): Promise<{ message: string }> {
        return apiClient.post('/reports', {
            target_type: 'POST',
            post_id: postId,
            reason
        });
    },

    async getPostById(postId: string): Promise<Post> {
        return apiClient.get<Post>(`/posts/${postId}`);
    },
    async getUploadUrl(filename: string, contentType: string): Promise<{ url: string; key: string }> {
        return apiClient.post<{ url: string; key: string }>('/storage/upload-url', { filename, content_type: contentType });
    },
    async uploadToPresignedUrl(url: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
        await axios.put(url, file, {
            headers: { 'Content-Type': file.type },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(progress);
                }
            }
        });
    }
};
