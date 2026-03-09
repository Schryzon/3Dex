import {
    Home,
    Grid3x3,
    Boxes,
    Users,
    Bell,
    Download,
    Package,
    Heart,
    Upload,
    LayoutDashboard,
    FolderOpen,
    BarChart3,
    FileText,
    Printer,
    Box,
    Settings2,
    Settings,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    count?: number;
}

export const SIDEBAR_MENU: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'browse', label: 'Catalog', icon: Grid3x3, href: '/catalog' },
    { id: 'print', label: 'Print Services', icon: Boxes, href: '/print-services' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
];

export const SIDEBAR_MY_STUFF: NavItem[] = [
    { id: 'notifications', label: 'Notifications', icon: Bell, href: '/notifications' },
    { id: 'downloads', label: 'Downloads', icon: Download, href: '/downloads' },
    { id: 'orders', label: 'My Orders', icon: Package, href: '/orders' },
    { id: 'saved', label: 'Saved', icon: Heart, href: '/saved' },
];

export const SIDEBAR_ARTIST: NavItem[] = [
    { id: 'upload', label: 'Upload Asset', icon: Upload, href: '/upload' },
    { id: 'my-uploads', label: 'My Uploads', icon: LayoutDashboard, href: '/profile?tab=uploads' },
    { id: 'collections', label: 'Collections', icon: FolderOpen, href: '/profile?tab=collections' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/artist/analytics' },
];

export const SIDEBAR_ADMIN: NavItem[] = [
    { id: 'admin-dash', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'models', label: 'Models', icon: FileText, href: '/admin/models' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
];

export const SIDEBAR_PROVIDER: NavItem[] = [
    { id: 'service-mgmt', label: 'My Printing Service', icon: Printer, href: '/profile?tab=service' },
    { id: 'print-jobs', label: 'Active Jobs', icon: Box, href: '/profile?tab=jobs' },
    { id: 'workshop', label: 'Workshop Setup', icon: Settings2, href: '/profile?tab=workshop' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/provider/analytics' },
];

export const SIDEBAR_BOTTOM: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings, href: '/profile?tab=settings' },
];
