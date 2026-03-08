import { useState } from 'react';
import { Model } from '@/lib/types';

interface Props {
  product: Model;
}

export default function ProductDetails({ product }: Props) {
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'license'>('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'license', label: 'License & Usage' },
  ];

  return (
    <div className="bg-gray-700 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Tabs */}
      <div className="flex border-b border-gray-800 bg-black overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-4 text-sm font-semibold transition-all duration-300 relative whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:text-gray-300'
              }`}
          >
            {tab.label}
            {/* Active Indicator - Yellow underline */}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-500 animate-in slide-in-from-left duration-300" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6 lg:p-8 bg-black">
        {activeTab === 'description' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-base whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-sm font-semibold text-gray-400 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-800 border border-gray-800 hover:border-yellow-500/50 hover:bg-yellow-500/10 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 cursor-pointer text-gray-400 hover:text-yellow-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {/* Technical Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
              <div className="space-y-3">
                <SpecRow label="Software Version" value="v1.0.0+" />
                <SpecRow label="Polygon Count" value={product.polyCount?.toLocaleString() || 'N/A'} />
                <SpecRow label="Architecture" value={product.fileFormat[0] || 'Standard'} />
                <SpecRow label="Resource Size" value="Optimized" />
                <SpecRow label="Plug-ins" value="None Required" />
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
              <div className="space-y-3">
                <FeatureRow label="High-Res Textures" included={true} />
                <FeatureRow label="Light Environment" included={true} />
                <FeatureRow label="Camera Rigging" included={product.isPrintable} />
                <FeatureRow label="Universal Materials" included={true} />
                <FeatureRow label="Optimized UV Maps" included={true} />
              </div>
            </div>

            {/* Additional Info */}
            <div className="md:col-span-2 pt-6 border-t border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Release Date</p>
                <p className="text-base font-medium text-white">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Asset ID</p>
                <p className="text-base font-medium text-white font-mono truncate">
                  {product.id.split('-')[0]}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'license' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-6 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-xl flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Standard Digital License
                </h3>
              </div>
              <p className="text-base text-gray-300 leading-relaxed">
                This asset is provided under a Royalty Free License. You are granted a non-exclusive, perpetual,
                worldwide rights to use, modify, and reproduce the asset in any media for any purpose,
                except as prohibited below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-yellow-500">Permissions</h4>
                <ul className="space-y-3">
                  <LicenseItem allowed={true} text="Commercial & Personal Projects" />
                  <LicenseItem allowed={true} text="Real-time Engine Integration" />
                  <LicenseItem allowed={true} text="Modifications & Derived Works" />
                  <LicenseItem allowed={true} text="Unlimited Renders & Shots" />
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500">Restrictions</h4>
                <ul className="space-y-3">
                  <LicenseItem allowed={false} text="Resale of Source Files" />
                  <LicenseItem allowed={false} text="AI Model Training Input" />
                  <LicenseItem allowed={false} text="Claiming Original Authorship" />
                  <LicenseItem allowed={false} text="Direct Redistribution" />
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-gray-500">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs font-medium">
                  Need a custom license for large productions?
                  <a href="#" className="text-yellow-500 hover:text-yellow-400 ml-2 transition-colors duration-300">
                    Inquire Now
                  </a>
                </p>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-800">
                <p className="text-xs font-medium text-gray-400">
                  Document Ref: <span className="text-white">3DX-LI-2026-STD</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-800 hover:border-yellow-500/20 transition-colors duration-300 group gap-4">
      <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {label}
      </span>
      <span className="text-base font-medium text-white group-hover:text-yellow-500 transition-colors duration-300 text-right">
        {value || 'N/A'}
      </span>
    </div>
  );
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-800 hover:border-yellow-500/20 transition-colors duration-300 group gap-4">
      <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {label}
      </span>
      {included ? (
        <div className="p-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      ) : (
        <div className="p-1 rounded-full bg-gray-800 border border-gray-800 flex-shrink-0">
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
}

function LicenseItem({ allowed, text }: { allowed: boolean; text: string }) {
  return (
    <li className="flex items-start gap-3 p-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-yellow-500/20 transition-all duration-300">
      {allowed ? (
        <div className="mt-0.5 p-1 rounded-full bg-yellow-500/20 flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      ) : (
        <div className="mt-0.5 p-1 rounded-full bg-red-500/20 flex-shrink-0">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <span className="text-sm font-medium text-gray-300">{text}</span>
    </li>
  );
}