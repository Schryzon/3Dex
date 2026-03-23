import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/lib/api/services';
import { QUERY_KEYS } from '@/lib/constants/api';
import type { Order } from '@/lib/types';

export function useOrders() {
    const { data: orders = [], isLoading, error } = useQuery<Order[]>({
        queryKey: QUERY_KEYS.ORDERS,
        queryFn: () => orderService.getOrders(),
    });

    return {
        orders,
        isLoading,
        error,
    };
}
