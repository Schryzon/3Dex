import { useQuery } from '@tanstack/react-query';
import { orderService, orderKeys } from '@/lib/api/services/order.service';
import { useAuth } from '@/features/auth';
import type { Order } from '@/types';

export function useOrders() {
    const { isAuthenticated } = useAuth();

    const { data: orders = [], isLoading, error } = useQuery<Order[]>({
        queryKey: orderKeys.all,
        queryFn: () => orderService.getOrders(),
        enabled: isAuthenticated,
    });

    return {
        orders,
        isLoading,
        error,
    };
}
