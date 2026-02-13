'use client';

import {
    User,
    Settings,
    FolderOpen,
    Bookmark,
    Upload,
    BarChart3,
    ShieldCheck,
    CreditCard,
    Bell,
    Package,
    Printer,
    Box,
    Settings2
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface ProfileSidebarProps {
    activeTab: string;
    setActiveTab: (tab: any) => void;
}

export default function ProfileSidebar({ activeTab, setActiveTab }: ProfileSidebarProps) {
    const { user } = useAuth();

    const sections = [
        {
            title: 'Account',
            items: [
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'settings', label: 'Preferences', icon: Settings },
                { id: 'security', label: 'Security', icon: ShieldCheck },
            ]
        },
        {
            title: 'Activity',
            items: [
                { id: 'collections', label: 'Collections', icon: FolderOpen },
                { id: 'bookmarks', label: 'Saved Assets', icon: Bookmark },
                { id: 'shipping', label: 'Orders & Shipping', icon: Package },
                { id: 'notifications', label: 'Notifications', icon: Bell },
            ]
        },
        ...(user?.role === 'ARTIST' || user?.role === 'ADMIN' ? [
            {
                title: 'Creator Tools',
                items: [
                    { id: 'uploads', label: 'My Uploads', icon: Upload },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                    { id: 'billing', label: 'Earnings & Billing', icon: CreditCard },
                ]
            }
        ] : []),
        ...(user?.role === 'PROVIDER' || user?.role === 'ADMIN' ? [
            {
                title: 'Provider Tools',
                items: [
                    { id: 'service', label: 'My Service', icon: Printer },
                    { id: 'jobs', label: 'Print Jobs', icon: Box },
                    { id: 'workshop', label: 'Workshop Setup', icon: Settings2 },
                ]
            }
        ] : [])
    ];

    return (
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6 md:space-y-8">
            {sections.map((section) => (
                <div key={section.title} className="space-y-3">
                    <h4 className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-widest px-3">
                        {section.title}
                    </h4>
                    <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide no-scrollbar">
                        {section.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`flex-shrink-0 flex items-center gap-3 px-4 md:px-3 py-2 md:py-2.5 rounded-xl transition-all text-xs md:text-sm font-medium whitespace-nowrap ${isActive
                                        ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/10'
                                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </aside>
    );
}
