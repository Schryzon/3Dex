import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api/services';
import { QUERY_KEYS } from '@/lib/constants/api';
import type { LoginRequest, RegisterRequest } from '@/lib/types';

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery({
        queryKey: QUERY_KEYS.AUTH,
        queryFn: () => authService.getCurrentUser(),
        enabled: authService.isAuthenticated(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.AUTH, data.user);
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: (data) => {
            queryClient.setQueryData(QUERY_KEYS.AUTH, data.user);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.setQueryData(QUERY_KEYS.AUTH, null);
            queryClient.clear();
            // Redirect to home
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        },
    });

    return {
        user,
        isLoading,
        error,
        isAuthenticated: !!user,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        isLoginLoading: loginMutation.isPending,
        isRegisterLoading: registerMutation.isPending,
        isLogoutLoading: logoutMutation.isPending,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
}
