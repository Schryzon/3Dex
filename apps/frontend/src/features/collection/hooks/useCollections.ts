'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService, collectionKeys } from '@/lib/api/services/collection.service';
import { toast } from 'react-hot-toast';

export function useCollections() {
    const queryClient = useQueryClient();

    const { data: collections = [], isLoading } = useQuery({
        queryKey: collectionKeys.all,
        queryFn: () => collectionService.getMyCollections(),
    });

    const createMutation = useMutation({
        mutationFn: (name: string) => collectionService.createCollection(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Collection created');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to create collection');
        }
    });

    const addModelMutation = useMutation({
        mutationFn: ({ collectionId, modelId }: { collectionId: string, modelId: string }) => 
            collectionService.addToCollection(collectionId, modelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Added to collection');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to add to collection');
        }
    });

    return {
        collections,
        isLoading,
        createCollection: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        addModelToCollection: addModelMutation.mutateAsync,
        isAddingModel: addModelMutation.isPending,
    };
}
