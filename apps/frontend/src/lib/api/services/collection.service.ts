import { api } from '@/lib/api';

export const collectionKeys = {
    all: ['my-collections'] as const,
} as const;

export interface Collection {
    id: string;
    name: string;
    is_public: boolean;
}

export const collectionService = {
    getMyCollections: async () => {
        const res = await api.get<{ data: Collection[] }>('/collections/my');
        return res.data.data;
    },
    createCollection: async (name: string) => {
        const res = await api.post<Collection>('/collections', { name, isPublic: true });
        return res.data;
    },
    addToCollection: async (collectionId: string, modelId: string) => {
        return api.post(`/collections/${collectionId}/items`, { modelId });
    }
};
