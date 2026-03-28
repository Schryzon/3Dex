import { api } from '@/lib/api';

export const collectionKeys = {
    all: ['my-collections'] as const,
    detail: (id: string) => ['collection', id] as const,
} as const;

export interface Collection {
    id: string;
    name: string;
    is_public: boolean;
    _count?: { items: number };
    items?: {
        model: { preview_url: string };
    }[];
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
    updateCollection: async (id: string, data: { name?: string; isPublic?: boolean }) => {
        const res = await api.put<Collection>(`/collections/${id}`, data);
        return res.data;
    },
    // Keep renameCollection as a convenience wrapper
    renameCollection: async (id: string, name: string) => {
        const res = await api.put<Collection>(`/collections/${id}`, { name });
        return res.data;
    },
    deleteCollection: async (id: string) => {
        return api.delete(`/collections/${id}`);
    },
    addToCollection: async (collectionId: string, modelId: string) => {
        return api.post(`/collections/${collectionId}/items`, { modelId });
    },
    removeFromCollection: async (collectionId: string, modelId: string) => {
        return api.delete(`/collections/${collectionId}/items/${modelId}`);
    },
};

