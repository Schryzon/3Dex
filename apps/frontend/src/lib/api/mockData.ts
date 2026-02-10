import { Model, CartItem } from '../types';

export const MOCK_CATEGORIES = [
    { id: 'all', name: 'All', slug: 'all' },
    { id: 'architecture', name: 'Architecture', slug: 'architecture' },
    { id: 'characters', name: 'Characters', slug: 'characters' },
    { id: 'vehicles', name: 'Vehicles', slug: 'vehicles' },
    { id: 'nature', name: 'Nature', slug: 'nature' },
    { id: 'weapons', name: 'Weapons', slug: 'weapons' },
];

export const MOCK_MODELS: Model[] = [
    {
        id: '1',
        title: 'Cyberpunk Drone Prototype',
        description: 'A highly detailed cyberpunk drone model perfect for futuristic environments. Includes 4K textures and multiple file formats.',
        price: 450000,
        thumbnails: ['https://picsum.photos/800/600?random=1'],
        modelFileUrl: '/models/drone.glb',
        fileFormat: ['GLB', 'FBX', 'OBJ'],
        polyCount: 45000,
        category: 'Vehicles',
        tags: ['Sci-Fi', 'Drone', 'Future'],
        isPrintable: true,
        status: 'APPROVED',
        artistId: 'artist1',
        artist: {
            id: 'artist1',
            username: 'CyberSmith',
            avatar: 'https://i.pravatar.cc/150?u=artist1'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.8,
        reviewCount: 24
    },
    {
        id: '2',
        title: 'Ancient Warrior Armor',
        description: 'Full body warrior armor set from the medieval era. Rigged and ready for animation.',
        price: 750000,
        thumbnails: ['https://picsum.photos/800/600?random=2'],
        modelFileUrl: '/models/armor.glb',
        fileFormat: ['GLB', 'MAX'],
        polyCount: 120000,
        category: 'Characters',
        tags: ['Fantasy', 'Armor', 'Medieval'],
        isPrintable: false,
        status: 'APPROVED',
        artistId: 'artist2',
        artist: {
            id: 'artist2',
            username: 'Ironclad_3D',
            avatar: 'https://i.pravatar.cc/150?u=artist2'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.5,
        reviewCount: 12
    },
    {
        id: '3',
        title: 'Modern Coffee Shop Interior',
        description: 'Complete interior set for a modern coffee shop. Includes all furniture and lighting assets.',
        price: 1200000,
        thumbnails: ['https://picsum.photos/800/600?random=3'],
        modelFileUrl: '/models/cafe.glb',
        fileFormat: ['GLB', 'OBJ', 'C4D'],
        polyCount: 250000,
        category: 'Architecture',
        tags: ['Interior', 'Modern', 'Furniture'],
        isPrintable: false,
        status: 'APPROVED',
        artistId: 'artist3',
        artist: {
            id: 'artist3',
            username: 'ArchViz_Pro',
            avatar: 'https://i.pravatar.cc/150?u=artist3'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rating: 4.9,
        reviewCount: 36
    }
];
