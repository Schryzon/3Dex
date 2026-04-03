import Link from 'next/link';
import { getStorageUrl } from '@/lib/utils/storage';

interface UserAvatarProps {
    user: {
        username?: string;
        avatar?: string;
        avatar_url?: string;
    } | null | undefined;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    linkToProfile?: boolean;
}

const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 md:w-40 md:h-40 text-3xl md:text-5xl',
};

export default function UserAvatar({ user, size = 'md', className = '', linkToProfile = false }: UserAvatarProps) {
    const initials = user?.username?.charAt(0).toUpperCase() || 'U';
    // Backend returns avatar_url (from Google or uploaded), with avatar as legacy fallback
    const avatarSrc = user?.avatar_url || user?.avatar || null;

    const fallbackDiv = (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-black font-bold flex-shrink-0 ${className}`}>
            {initials}
        </div>
    );

    const content = avatarSrc ? (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative flex-shrink-0 ${className}`}>
            <img
                src={getStorageUrl(avatarSrc)}
                alt={user?.username || 'User avatar'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                    // If image fails to load (e.g. expired Google URL), show initials
                    (e.currentTarget.parentElement as HTMLDivElement).replaceWith(
                        Object.assign(document.createElement('div'), {
                            className: e.currentTarget.parentElement?.className || '',
                            textContent: initials,
                        })
                    );
                }}
            />
        </div>
    ) : fallbackDiv;

    if (linkToProfile && user?.username) {
        return (
            <Link href={`/u/${user.username}`}>
                {content}
            </Link>
        );
    }

    return content;
}
