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

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; isPublic?: boolean } }) =>
            collectionService.updateCollection(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            // Also invalidate specific collection detail if needed
            toast.success('Collection updated');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to update collection');
        }
    });

    const renameMutation = useMutation({
        mutationFn: ({ id, name }: { id: string; name: string }) =>
            collectionService.renameCollection(id, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Collection renamed');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to rename collection');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => collectionService.deleteCollection(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Collection deleted');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete collection');
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

    const removeModelMutation = useMutation({
        mutationFn: ({ collectionId, modelId }: { collectionId: string; modelId: string }) =>
            collectionService.removeFromCollection(collectionId, modelId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: collectionKeys.all });
            toast.success('Removed from collection');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to remove from collection');
        }
    });

    return {
        collections,
        isLoading,
        createCollection: createMutation.mutateAsync,
        isCreating: createMutation.isPending,
        updateCollection: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        renameCollection: renameMutation.mutateAsync,
        isRenaming: renameMutation.isPending,
        deleteCollection: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
        addModelToCollection: addModelMutation.mutateAsync,
        isAddingModel: addModelMutation.isPending,
        removeModelFromCollection: removeModelMutation.mutateAsync,
        isRemovingModel: removeModelMutation.isPending,
    };
}
