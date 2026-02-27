'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Bell, Check, UserPlus, Box, Heart, CircleCheck, Info, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
    is_read: boolean;
    created_at: string;
}

export default function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            const res = await api.get<{ data: Notification[], unread_count: number }>('/notifications');
            return res.data;
        }
    });

    const markAsReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.put(`/notifications/${id}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllAsReadMutation = useMutation({
        mutationFn: async () => {
            await api.put('/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'FOLLOW': return <UserPlus className="w-5 h-5 text-blue-400" />;
            case 'MODEL_APPROVED': return <Check className="w-5 h-5 text-green-400" />;
            case 'SALE': return <Box className="w-5 h-5 text-yellow-400" />;
            case 'LIKE': return <Heart className="w-5 h-5 text-pink-400" />;
            default: return <Info className="w-5 h-5 text-gray-400" />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 min-h-screen bg-[#0a0a0a] pt-24 px-8 flex justify-center">
                <div className="animate-spin w-8 h-8 border-t-2 border-yellow-400 rounded-full" />
            </div>
        );
    }

    const notifications = data?.data || [];
    const unreadCount = data?.unread_count || 0;

    return (
        <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#0a0a0a] pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold border-l-4 border-yellow-400 pl-4 text-white">Notifications</h1>
                        <p className="text-gray-400 mt-2 pl-5">You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}.</p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => markAllAsReadMutation.mutate()}
                            disabled={markAllAsReadMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-all border border-gray-700"
                        >
                            <CircleCheck className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium">Mark all as read</span>
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-12 text-center">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">No notifications yet</h3>
                        <p className="text-gray-400">When you get updates, they'll show up here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif: Notification) => (
                            <div
                                key={notif.id}
                                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${notif.is_read
                                        ? 'bg-gray-900/20 border-gray-800/50 hover:bg-gray-900/40'
                                        : 'bg-gray-800/80 border-gray-700 hover:bg-gray-800 shadow-[0_0_20px_rgba(250,204,21,0.05)]'
                                    }`}
                            >
                                <div className={`p-3 rounded-xl flex-shrink-0 ${notif.is_read ? 'bg-gray-900/50' : 'bg-gray-900'
                                    }`}>
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1 pt-1">
                                    <h4 className={`text-sm font-bold mb-1 ${notif.is_read ? 'text-gray-300' : 'text-white'}`}>
                                        {notif.title}
                                    </h4>
                                    <p className={`text-sm ${notif.is_read ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {notif.message}
                                    </p>
                                    <span className="text-xs text-gray-600 mt-2 block">
                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                {!notif.is_read && (
                                    <button
                                        onClick={() => markAsReadMutation.mutate(notif.id)}
                                        title="Mark as read"
                                        className="p-2 text-gray-500 hover:text-white bg-gray-900 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <CircleCheck className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
