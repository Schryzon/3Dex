import { api } from '@/lib/api';
import { Post, PostComment, UserReview } from '@/types';

export const socialService = {
    // Posts
    createPost: async (data: { caption?: string; media_urls: string[] }) => {
        const response = await api.post<Post>('/posts', data);
        return response.data;
    },

    getUserPosts: async (userId: string, page = 1, limit = 10) => {
        const response = await api.get<Post[]>(`/posts/user/${userId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    toggleLike: async (postId: string) => {
        const response = await api.post<{ message: string }>(`/posts/${postId}/like`);
        return response.data;
    },

    addComment: async (postId: string, content: string) => {
        const response = await api.post<PostComment>(`/posts/${postId}/comments`, { content });
        return response.data;
    },

    getComments: async (postId: string) => {
        const response = await api.get<PostComment[]>(`/posts/${postId}/comments`);
        return response.data;
    },

    deletePost: async (postId: string) => {
        const response = await api.delete<{ message: string }>(`/posts/${postId}`);
        return response.data;
    },

    // Reviews
    addUserReview: async (data: { target_user_id: string; rating: number; comment: string }) => {
        const response = await api.post<UserReview>('/reviews/user', data);
        return response.data;
    },

    getUserReviews: async (userId: string, page = 1, limit = 10) => {
        const response = await api.get<UserReview[]>(`/reviews/user/${userId}?page=${page}&limit=${limit}`);
        return response.data;
    },

    addModelReview: async (modelId: string, data: { rating: number; comment: string }) => {
        const response = await api.post(`/reviews/model/${modelId}`, data);
        return response.data;
    },

    getModelReviews: async (modelId: string) => {
        const response = await api.get(`/reviews/model/${modelId}`);
        return response.data;
    }
};
