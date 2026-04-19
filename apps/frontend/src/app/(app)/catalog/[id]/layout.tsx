import { Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const id = params.id;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  
  try {
    const res = await fetch(`${API_BASE_URL}/models/${id}`, { next: { revalidate: 3600 } });
    
    if (!res.ok) {
      return {
        title: 'Model Not Found | 3Dēx',
      };
    }
    
    const product = await res.json();
    const title = `${product.title} by ${product.artist?.username || 'Unknown'}`;
    const description = product.description?.substring(0, 160) || `Discover and download the 3D model ${product.title} on 3Dēx.`;
    const image = product.thumbnails?.[0] || '/og-image.png';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: image,
            width: 800,
            height: 600,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    return {
      title: '3D Model | 3Dēx'
    };
  }
}

export default function CatalogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
