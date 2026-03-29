import { MINIO_BASE_URL } from '../constants/endpoints';

/**
 * Normalizes a storage path (avatar_url, banner_url, preview_url) 
 * into a full URL using the configured storage base and bucket.
 * 
 * @param path The relative path from the database (e.g., "banner_1_123.jpg")
 * @returns {string} The full URL for storage access
 */
export const getStorageUrl = (path: string | undefined | null): string => {
    if (!path) return '';

    // If it's already a full URL (starts with http), return as-is
    if (path.startsWith('http')) {
        return path;
    }

    // Otherwise, prefix with base URL and default bucket
    // Note: use bucket from env or default to '3dex-models'
    const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || '3dex-models';
    const base = MINIO_BASE_URL.replace(/\/$/, '');
    return `${base}/${bucket.replace(/^\//, '')}/${path.replace(/^\//, '')}`;
};
