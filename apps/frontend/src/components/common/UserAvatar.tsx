import Link from 'next/link';

interface UserAvatarProps {
    user: {
        username?: string;
        avatar?: string;
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

    const content = user?.avatar ? (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden relative flex-shrink-0 ${className}`}>
            <img
                src={user.avatar}
                alt={user.username || 'User avatar'}
                className="w-full h-full object-cover"
            />
        </div>
    ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-black font-bold flex-shrink-0 ${className}`}>
            {initials}
        </div>
    );

    if (linkToProfile && user?.username) {
        return (
            <Link href={`/u/${user.username}`}>
                {content}
            </Link>
        );
    }

    return content;
}
