import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { productService } from '@/lib/api/services';
import { QUERY_KEYS } from '@/lib/constants/api';
import type { ModelFilters } from '@/lib/types';

export function useProducts(filters?: ModelFilters) {
    return useQuery({
        queryKey: [...QUERY_KEYS.MODELS, filters],
        queryFn: () => productService.getProducts(filters),
    });
}

export function useInfiniteProducts(filters?: ModelFilters) {
    return useInfiniteQuery({
        queryKey: [...QUERY_KEYS.MODELS, 'infinite', filters],
        queryFn: ({ pageParam = 1 }) =>
            productService.getProducts({ ...filters, page: pageParam as number }),
        getNextPageParam: (lastPage) => {
            if (lastPage?.pagination && lastPage.pagination.page < lastPage.pagination.totalPages) {
                return lastPage.pagination.page + 1;
            }
            return undefined;
        },
        initialPageParam: 1,
    });
}

export function useProduct(id: string) {
    return useQuery({
        queryKey: QUERY_KEYS.MODEL_DETAIL(id),
        queryFn: () => productService.getProductById(id),
        enabled: !!id,
    });
}

export function useProductReviews(id: string) {
    return useQuery({
        queryKey: ['models', id, 'reviews'],
        queryFn: () => productService.getProductReviews(id),
        enabled: !!id,
    });
}

export function useUploadProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ formData, onProgress }: { formData: FormData; onProgress?: (progress: number) => void }) =>
            productService.uploadProduct(formData, onProgress),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODELS });
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productService.deleteProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODELS });
        },
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
            productService.updateProduct(id, data as any),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODELS });
        },
    });
}

export function useAddReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { rating: number; comment: string } }) =>
            productService.addReview(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['models', variables.id, 'reviews'] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MODEL_DETAIL(variables.id) });
        },
    });
}
