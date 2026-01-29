// Spinner Loading Component
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizeStyles = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg
                className={`animate-spin ${sizeStyles[size]} text-blue-500`}
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
}

// Skeleton Loading Component
export function Skeleton({ className = '', width, height }: { className?: string; width?: string; height?: string }) {
    return (
        <div
            className={`animate-pulse bg-gray-800 rounded ${className}`}
            style={{ width, height }}
        />
    );
}

// Card Skeleton for Product Cards
export function CardSkeleton() {
    return (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
            {/* Image skeleton */}
            <Skeleton className="aspect-[4/3]" />

            <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <Skeleton height="20px" width="80%" />

                {/* Seller info skeleton */}
                <div className="flex items-center gap-2">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <Skeleton height="16px" width="100px" />
                </div>

                {/* Specs skeleton */}
                <div className="flex gap-2">
                    <Skeleton height="16px" width="60px" />
                    <Skeleton height="16px" width="80px" />
                </div>

                {/* Price skeleton */}
                <Skeleton height="24px" width="100px" />
            </div>
        </div>
    );
}

// Full Page Loading
export function PageLoading({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-400">{message}</p>
        </div>
    );
}

// Default export
export default Spinner;
