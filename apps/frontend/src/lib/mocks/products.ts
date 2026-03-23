import { Model } from '@/types';

const CATEGORIES = ['Characters', 'Vehicles', 'Buildings', 'Props', 'Nature', 'Interior'];
const FORMATS = ['.obj', '.fbx', '.blend', '.stl', '.glb'];
const ARTISTS = [
    { username: 'PolyMaster', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=128' },
    { username: 'MeshQueen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128' },
    { username: 'RenderWiz', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=128' },
    { username: 'VertexNinja', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=128' },
    { username: 'PixelArchitect', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128' }
];

const THUMBNAILS = [
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800', // Cyber-city
    'https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=800', // Mars base
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', // Industrial robot
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800', // Hologram
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', // Vintage PC
    'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', // Abstract sculpt
    'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', // Sci-fi corridor
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', // Minimalist chair
    'https://images.unsplash.com/photo-1605142859862-978be7eba909?w=800', // Modern building
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'  // Circuitry
];

const generateMockProducts = (count: number): Model[] => {
    return Array.from({ length: count }).map((_, i) => {
        const id = `mock-${i + 1}`;
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const artist = ARTISTS[Math.floor(Math.random() * ARTISTS.length)];
        const price = Math.floor(Math.random() * 500000) + 15000; // 15k - 500k IDR
        const rating = (Math.random() * 2) + 3; // 3.0 - 5.0
        const formats = FORMATS.filter(() => Math.random() > 0.5);
        if (formats.length === 0) formats.push('.blend');

        return {
            id,
            title: `${category} Model #${i + 1}`,
            description: `This is a high-quality 3D ${category.toLowerCase()} model, optimized for real-time applications and high-fidelity rendering. Perfect for game development and architectural visualization.`,
            price,
            thumbnails: [THUMBNAILS[Math.floor(Math.random() * THUMBNAILS.length)]],
            images: [THUMBNAILS[Math.floor(Math.random() * THUMBNAILS.length)]],
            modelFileUrl: '#',
            fileFormat: formats,
            polyCount: Math.floor(Math.random() * 100000) + 500,
            category,
            tags: [category.toLowerCase(), 'low-poly', 'game-ready', 'pbr'],
            isPrintable: Math.random() > 0.7,
            status: 'APPROVED',
            artistId: artist.username.toLowerCase(),
            artist: {
                id: artist.username.toLowerCase(),
                username: artist.username,
                avatar_url: artist.avatar
            },
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
            updatedAt: new Date().toISOString(),
            rating: parseFloat(rating.toFixed(1)),
            reviewCount: Math.floor(Math.random() * 100) + 1,
            isPurchased: false
        };
    });
};

export const MOCK_PRODUCTS = generateMockProducts(100);
