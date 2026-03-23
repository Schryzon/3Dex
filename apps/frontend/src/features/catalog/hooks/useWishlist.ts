'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistService, wishlistKeys } from '@/lib/api/services/wishlist.service';
import { useAuth } from '@/features/auth';

export function useWishlist() {
    const { isAuthenticated } = useAuth();
    const queryClient = useQueryClient();

    const { data: wishlistItems = [], isLoading } = useQuery({
        queryKey: wishlistKeys.all,
        queryFn: () => wishlistService.getWishlist(),
        enabled: isAuthenticated,
    });

    const addMutation = useMutation({
        mutationFn: (modelId: string) => wishlistService.addToWishlist(modelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
    });

    const removeMutation = useMutation({
        mutationFn: (modelId: string) => wishlistService.removeFromWishlist(modelId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all }),
    });

    const isInWishlist = (modelId: string) =>
        wishlistItems.some((item: any) => item.model_id === modelId || item.modelId === modelId);

    const toggle = async (modelId: string) => {
        if (isInWishlist(modelId)) {
            await removeMutation.mutateAsync(modelId);
        } else {
            await addMutation.mutateAsync(modelId);
        }
    };

    return {
        wishlistItems,
        isLoading,
        isInWishlist,
        toggle,
        addToWishlist: addMutation.mutateAsync,
        removeFromWishlist: removeMutation.mutateAsync,
        isToggling: addMutation.isPending || removeMutation.isPending,
    };
}
