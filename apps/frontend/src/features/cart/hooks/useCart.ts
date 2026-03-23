import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService, cartKeys } from '@/lib/api/services/cart.service';
import { useAuth } from '@/features/auth';
import type { CartItem } from '@/types';

export function useCart() {
    const queryClient = useQueryClient();
    const { isAuthenticated, showLogin } = useAuth();

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

    // Wrap mutations to intercept unauthenticated actions globally
    const handleAddToCart = async (vars: { modelId: string; quantity?: number }) => {
        if (!isAuthenticated) {
            showLogin?.();
            throw new Error('User must be logged in to add to cart');
        }
        return addToCartMutation.mutateAsync(vars);
    };

    const handleUpdateQuantity = async (vars: { itemId: string; quantity: number }) => {
        if (!isAuthenticated) return;
        return updateQuantityMutation.mutateAsync(vars);
    };

    const handleRemoveItem = async (itemId: string) => {
        if (!isAuthenticated) return;
        return removeItemMutation.mutateAsync(itemId);
    };

    const handleClearCart = async () => {
        if (!isAuthenticated) return;
        return clearCartMutation.mutateAsync();
    };

    return {
        items,
        isLoading,
        itemCount,
        total,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
        isAddingToCart: addToCartMutation.isPending,
        isUpdating: updateQuantityMutation.isPending,
        isRemoving: removeItemMutation.isPending,
    };
}
