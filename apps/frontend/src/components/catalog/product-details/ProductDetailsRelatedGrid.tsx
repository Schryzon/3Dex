'use client';

import Link from 'next/link';

interface RelatedProduct {
    id: string;
    title: string;
    image: string;
    price: number;
    author: string;
}

interface ProductDetailsRelatedGridProps {
    relatedProducts: RelatedProduct[];
}

export default function ProductDetailsRelatedGrid({
    relatedProducts,
}: ProductDetailsRelatedGridProps) {
    // The section is hidden entirely when there are no related products
    if (relatedProducts.length === 0) return null;

    return (
        <div className="border-t border-gray-800 px-4 md:px-6 py-6">
            <h3 className="text-white font-semibold mb-4">Related Products</h3>

            {/* Grid capped at 4 items to prevent the section from growing too tall */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.slice(0, 4).map((item) => (
                    <Link
                        key={item.id}
                        href={`/catalog/${item.id}`}
                        className="group bg-[#141414] rounded-lg overflow-hidden hover:bg-[#1a1a1a] transition-colors"
                    >
                        {/* Product thumbnail */}
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Product info: title, author, price */}
                        <div className="p-3">
                            <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                            <p className="text-gray-500 text-xs">{item.author}</p>
                            <p className="text-yellow-400 text-sm font-semibold mt-1">
                                ${item.price.toFixed(2)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
