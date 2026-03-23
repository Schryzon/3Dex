import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, authKeys } from '@/lib/api/services/auth.service';
import type { LoginRequest, RegisterRequest } from '@/lib/types';

export function useAuth() {
    const queryClient = useQueryClient();

    const { data: user, isLoading, error } = useQuery({
        queryKey: authKeys.all,
        queryFn: () => authService.getCurrentUser(),
        // Always run this query — with HTTP-only cookies there is no client-side
        // way to know if a session exists. /auth/me returns null on 401.
        enabled: true,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.all, data.user);
        },
    });

    const registerMutation = useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        // register returns { id, email } only — session is established via the
        // auto-login that AuthProvider performs after registration
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.all });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            queryClient.setQueryData(authKeys.all, null);
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
