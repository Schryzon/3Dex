import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/lib/api/services';
import { QUERY_KEYS } from '@/lib/constants/api';
import type { CartItem } from '@/lib/types';

export function useCart() {
    const queryClient = useQueryClient();

    const { data: items = [], isLoading } = useQuery<CartItem[]>({
        queryKey: QUERY_KEYS.CART,
        queryFn: () => cartService.getCart(),
    });

    const addToCartMutation = useMutation({
        mutationFn: ({ modelId, quantity = 1 }: { modelId: string; quantity?: number }) =>
            cartService.addToCart(modelId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
            cartService.updateQuantity(itemId, quantity),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        },
    });

    const removeItemMutation = useMutation({
        mutationFn: (itemId: string) => cartService.removeItem(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: () => cartService.clearCart(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        },
    });

    // Computed values
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const total = items.reduce((sum, item) => sum + (item.model.price * item.quantity), 0);

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
