import { useQuery } from '@tanstack/react-query';
import { orderService, orderKeys } from '@/lib/api/services/order.service';
import type { Order } from '@/types';

export function useOrders() {
    const { data: orders = [], isLoading, error } = useQuery<Order[]>({
        queryKey: orderKeys.all,
        queryFn: () => orderService.getOrders(),
    });

    return {
        orders,
        isLoading,
        error,
    };
}
