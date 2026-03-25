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
import { ROUTES } from './routes';

export interface NavItem {
    id: string;
    label: string;
    icon: LucideIcon;
    href: string;
    count?: number;
    requiresAuth?: boolean;
}

export const SIDEBAR_MENU: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home, href: ROUTES.PUBLIC.HOME },
    { id: 'browse', label: 'Catalog', icon: Grid3x3, href: ROUTES.PUBLIC.CATALOG },
    { id: 'print', label: 'Print Services', icon: Boxes, href: ROUTES.PUBLIC.PRINT_SERVICES },
    { id: 'community', label: 'Community', icon: Users, href: ROUTES.PUBLIC.COMMUNITY, requiresAuth: true },
];

export const SIDEBAR_MY_STUFF: NavItem[] = [
    { id: 'notifications', label: 'Notifications', icon: Bell, href: ROUTES.USER.NOTIFICATIONS },
    { id: 'downloads', label: 'Downloads', icon: Download, href: ROUTES.USER.DOWNLOADS },
    { id: 'orders', label: 'My Orders', icon: Package, href: ROUTES.USER.ORDERS },
    { id: 'saved', label: 'Saved', icon: Heart, href: ROUTES.USER.SAVED },
];

export const SIDEBAR_ARTIST: NavItem[] = [
    { id: 'upload', label: 'Upload Asset', icon: Upload, href: ROUTES.ARTIST.UPLOAD },
    { id: 'my-uploads', label: 'My Uploads', icon: LayoutDashboard, href: ROUTES.USER.PROFILE_UPLOADS },
    { id: 'collections', label: 'Collections', icon: FolderOpen, href: ROUTES.USER.PROFILE_COLLECTIONS },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: ROUTES.ARTIST.ANALYTICS },
];

export const SIDEBAR_ADMIN: NavItem[] = [
    { id: 'admin-dash', label: 'Dashboard', icon: LayoutDashboard, href: ROUTES.ADMIN.DASHBOARD },
    { id: 'users', label: 'Users', icon: Users, href: ROUTES.ADMIN.USERS },
    { id: 'models', label: 'Models', icon: FileText, href: ROUTES.ADMIN.MODELS },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: ROUTES.ADMIN.ANALYTICS },
];

export const SIDEBAR_PROVIDER: NavItem[] = [
    { id: 'service-mgmt', label: 'My Printing Service', icon: Printer, href: ROUTES.USER.PROFILE_SERVICE },
    { id: 'print-jobs', label: 'Active Jobs', icon: Box, href: ROUTES.USER.PROFILE_JOBS },
    { id: 'workshop', label: 'Workshop Setup', icon: Settings2, href: ROUTES.USER.PROFILE_WORKSHOP },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, href: ROUTES.PROVIDER.ANALYTICS },
];

export const SIDEBAR_BOTTOM: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings, href: ROUTES.USER.PROFILE_SETTINGS },
];
