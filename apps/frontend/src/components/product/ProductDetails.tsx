'use client';

import { useState } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  specifications: any;
  tags: string[];
  categories: string[];
}

interface Props {
  product: Product;
}

export default function ProductDetails({ product }: Props) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'license'>('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'license', label: 'License & Usage' },
  ];

  return (
    <div className="bg-[#141414] rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 font-medium transition-all relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'description' && (
          <div className="space-y-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-600/20 text-blue-400 border border-blue-600/50 hover:bg-blue-600/30 px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Technical Details</h3>
              <div className="space-y-3">
                <SpecRow label="Software Version" value={product.specifications.version} />
                <SpecRow label="Polygon Count" value={product.specifications.polygons.toLocaleString()} />
                <SpecRow label="Renderer" value={product.specifications.render} />
                <SpecRow label="File Size" value={product.specifications.size} />
                <SpecRow label="Plug-in Required" value={product.specifications.plugIn} />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Features Included</h3>
              <div className="space-y-3">
                <FeatureRow label="Textures" included={product.specifications.textures} />
                <FeatureRow label="Lighting Setup" included={product.specifications.light} />
                <FeatureRow label="Camera Setup" included={product.specifications.camera} />
                <FeatureRow label="Materials" included={true} />
                <FeatureRow label="UV Mapped" included={true} />
              </div>
            </div>

            {/* File Formats */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Available Formats</h3>
              <div className="flex flex-wrap gap-3">
                {['MAX', 'OBJ', 'FBX', 'STL', '3DS'].map((format) => (
                  <div
                    key={format}
                    className="bg-gray-800 px-4 py-2 rounded-lg font-mono text-sm"
                  >
                    .{format.toLowerCase()}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3 md:col-span-2 bg-gray-900/50 p-4 rounded-lg">
              <p className="text-sm text-gray-400">
                <strong className="text-white">Published:</strong> {product.specifications.publishedDate}
              </p>
              <p className="text-sm text-gray-400">
                <strong className="text-white">Model ID:</strong> {product.id}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'license' && (
          <div className="space-y-6">
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Royalty Free License
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                This is a Royalty Free License, meaning you can use this 3D model in your projects 
                without paying ongoing fees or royalties.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">You are allowed to:</h4>
              <ul className="space-y-3">
                <LicenseItem
                  allowed={true}
                  text="Use in commercial and personal projects"
                />
                <LicenseItem
                  allowed={true}
                  text="Modify, adapt, and build upon this model"
                />
                <LicenseItem
                  allowed={true}
                  text="Use in games, films, animations, and renders"
                />
                <LicenseItem
                  allowed={true}
                  text="Use in unlimited projects without additional fees"
                />
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold">You are NOT allowed to:</h4>
              <ul className="space-y-3">
                <LicenseItem
                  allowed={false}
                  text="Resell or redistribute the original model files"
                />
                <LicenseItem
                  allowed={false}
                  text="Share the model on other marketplaces or platforms"
                />
                <LicenseItem
                  allowed={false}
                  text="Claim the model as your own original work"
                />
                <LicenseItem
                  allowed={false}
                  text="Use in a way that competes with the original seller"
                />
              </ul>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mt-6">
              <h4 className="text-lg font-semibold mb-3">Attribution (Optional)</h4>
              <p className="text-sm text-gray-400 mb-4">
                While not required, attribution is appreciated. You can credit the creator as:
              </p>
              <code className="block bg-gray-800 p-3 rounded text-sm text-gray-300">
                Model by {product.title} - Available on 3Dex Marketplace
              </code>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <p className="text-xs text-gray-500">
                For more information about licensing, please contact the seller directly or 
                visit our <a href="/license-info" className="text-blue-500 hover:text-blue-400">licensing information page</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-gray-400">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-800">
      <span className="text-gray-400">{label}</span>
      {included ? (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
}

function LicenseItem({ allowed, text }: { allowed: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3">
      {allowed ? (
        <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )}
      <span className="text-gray-300">{text}</span>
    </li>
  );
}