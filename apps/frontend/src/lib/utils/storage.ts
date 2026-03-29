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
    // Note: bucket is hardcoded to '3dex-models' to match the system's structure
    const base = MINIO_BASE_URL.replace(/\/$/, '');
    return `${base}/3dex-models/${path}`;
};
