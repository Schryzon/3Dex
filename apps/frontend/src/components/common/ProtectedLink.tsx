'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';

interface ProtectedLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    requireAuth?: boolean;
}

export default function ProtectedLink({
    href,
    children,
    className = '',
    requireAuth = true
}: ProtectedLinkProps) {
    const { isAuthenticated, showLogin } = useAuth();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        if (requireAuth && !isAuthenticated) {
            e.preventDefault();
            showLogin();
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick}>
            {children}
        </Link>
    );
}
