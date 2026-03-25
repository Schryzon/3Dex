'use client';

import { useAuth } from '@/features/auth';
import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';

interface ProtectedLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    requireAuth?: boolean;
    onClick?: () => void;
    onMouseEnter?: () => void;
    title?: string;
}

export default function ProtectedLink({
    href,
    children,
    className = '',
    requireAuth = true,
    onClick,
    onMouseEnter,
    title
}: ProtectedLinkProps) {
    const { isAuthenticated, showLogin } = useAuth();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {

        if (requireAuth && !isAuthenticated) {
            e.preventDefault();
            showLogin();
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick} title={title}>
            {children}
        </Link>
    );
}
