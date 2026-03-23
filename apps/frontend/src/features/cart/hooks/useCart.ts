import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, cartKeys } from '@/lib/api/services/cart.service';
import { useAuth } from '@/features/auth';
import type { CartItem } from '@/types';

export function useCart() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const { data: items = [], isLoading } = useQuery<CartItem[]>({
        queryKey: cartKeys.all,
        queryFn: () => cartService.getCart(),
        enabled: isAuthenticated,
    });

    const addToCartMutation = useMutation({
        mutationFn: ({ modelId, quantity = 1 }: { modelId: string; quantity?: number }) =>
            cartService.addToCart(modelId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            cartService.updateQuantity(itemId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (itemId: string) => cartService.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });

    // Computed values
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + ((item.model?.price ?? 0) * item.quantity), 0);

    return {
        items,
        isLoading,
        itemCount,
        total,
        addToCart: addToCartMutation.mutateAsync,
        updateQuantity: updateQuantityMutation.mutateAsync,
        removeItem: removeItemMutation.mutateAsync,
        clearCart: clearCartMutation.mutateAsync,
        isAddingToCart: addToCartMutation.isPending,
        isUpdating: updateQuantityMutation.isPending,
        isRemoving: removeItemMutation.isPending,
    };
}
