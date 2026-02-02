'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductViewer3D from './ProductViewer3D';
import ProductDetails from './ProductDetails';
import ProductCard from './ProductCard';
import RelatedProducts from './RelatedProducts';
import ProductReviews from './ProductReviews';
import DownloadButton from './DownloadButton';

interface Product {
  id: string;
  title: string;
  price: number;
  discount?: number;
  seller: {
    name: string;
    avatar: string;
  };
  modelUrl: string;
  thumbnails: string[];
  specifications: {
    version: string;
    polygons: number;
    render: string;
    size: string;
    textures: boolean;
    light: boolean;
    camera: boolean;
    plugIn: string;
    publishedDate: string;
  };
  description: string;
  categories: string[];
  tags: string[];
  license: string;
  credits: number;
}

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    fetchProduct();
    checkCart();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const cart = await response.json();
      setIsInCart(cart.items.some((item: any) => item.productId === params.id));
    } catch (error) {
      console.error('Error checking cart:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id }),
      });
      setIsInCart(true);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white text-xl">Product not found</p>
      </div>
    );
  }

  const finalPrice = product.discount 
    ? product.price - (product.price * product.discount / 100)
    : product.price;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          {product.categories.map((category, index) => (
            <span key={index} className="flex items-center gap-2">
              {index > 0 && <span>&gt;</span>}
              <span className="hover:text-white cursor-pointer">{category}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Thumbnails & 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="flex gap-4">
              {/* Thumbnails */}
              <div className="flex flex-col gap-2 w-24 overflow-y-auto max-h-[600px]">
                {product.thumbnails.map((thumb, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-blue-500'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    <img
                      src={thumb}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
                {/* 3D View Button */}
                <button
                  onClick={() => setSelectedImage(-1)}
                  className={`rounded-lg border-2 transition-all h-20 flex items-center justify-center ${
                    selectedImage === -1
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                  }`}
                >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                </button>
              </div>

              {/* Main Viewer */}
              <div className="flex-1 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg overflow-hidden relative">
                {selectedImage === -1 ? (
                  <ProductViewer3D modelUrl={product.modelUrl} />
                ) : (
                  <img
                    src={product.thumbnails[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Share & Favorite Buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="bg-gray-900/80 hover:bg-gray-800 p-3 rounded-lg backdrop-blur-sm transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  <button className="bg-gray-900/80 hover:bg-gray-800 p-3 rounded-lg backdrop-blur-sm transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-[#141414] rounded-lg p-6 sticky top-4">
              <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
              <p className="text-sm text-gray-400 mb-4">ID {product.id}</p>

              {/* Seller Info */}
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={product.seller.avatar}
                  alt={product.seller.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm">{product.seller.name}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  {product.discount && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      -{product.discount}%
                    </span>
                  )}
                  <span className="text-3xl font-bold">${finalPrice.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {product.license} - Click for more
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                {isInCart ? (
                  <button
                    onClick={() => window.location.href = '/checkout'}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Go to checkout
                    <span className="text-xs">Model already added to your cart</span>
                  </button>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg transition-all"
                  >
                    Add to cart
                  </button>
                )}

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay with wallet
                </button>

                <DownloadButton productId={product.id} credits={product.credits} />
              </div>

              {/* Specifications */}
              <div className="border-t border-gray-800 pt-6">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <span className="bg-blue-600 px-2 py-1 rounded text-xs">MAX</span>
                  Specifications
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Version</span>
                    <span>{product.specifications.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Polygons</span>
                    <span>{product.specifications.polygons.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Render</span>
                    <span className="flex items-center gap-1">
                      {product.specifications.render === 'Vray' && (
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {product.specifications.render}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Size</span>
                    <span>{product.specifications.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Textures</span>
                    <span className="w-3 h-3 rounded-full bg-gray-600"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Light</span>
                    <span className="w-3 h-3 rounded-full bg-white"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Camera</span>
                    <span className="w-3 h-3 rounded-full bg-white"></span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">plug-in</span>
                    <span>{product.specifications.plugIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Published Date</span>
                    <span>{product.specifications.publishedDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-8">
          <ProductDetails product={product} />
        </div>

        {/* Product Reviews */}
        <div className="mt-8">
          <ProductReviews productId={product.id} />
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <RelatedProducts 
            productId={product.id} 
            categories={product.categories}
          />
        </div>
      </div>
    </div>
  );
}