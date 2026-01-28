'use client';

import { useState } from 'react';
import { User, Wallet, FolderOpen, Download, TrendingUp, Upload, FileText, Settings, Plus, MoreVertical, Eye, Heart } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  price?: number;
  uploadDate: string;
}

export default function PortfolioGalleryPage() {
  const [activeSection] = useState<'collections'>('collections');
  
  // Sample portfolio items - will be populated from backend
  const [portfolioItems] = useState<PortfolioItem[]>([]);

  const menuItems = [
    { id: 'wallet', label: 'My wallet', icon: Wallet },
    { id: 'collections', label: 'My collections', icon: FolderOpen, active: true },
    { id: 'download', label: 'Download records', icon: Download },
    { id: 'consumption', label: 'Consumption records', icon: TrendingUp },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'upload-records', label: 'Upload records', icon: FileText },
    { id: 'account', label: 'Account settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-bold text-yellow-400">ReleBook</div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                3D Models
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2"/>
                    <path d="M8 21h8"/>
                    <path d="M12 17v4"/>
                  </svg>
                </div>
                CG Models
              </a>
              <a href="#" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <path d="M3 9h18"/>
                    <path d="M9 21V9"/>
                  </svg>
                </div>
                Textures
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">Hi! Guest</h1>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 bg-gray-900/30 rounded-lg p-2 sticky top-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      item.active
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Header with Upload Button */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">My collections</h2>
                <p className="text-gray-400">
                  {portfolioItems.length} {portfolioItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Upload New Model
              </button>
            </div>

            {/* Portfolio Grid */}
            {portfolioItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-all group"
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-gray-800 relative overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <button className="p-2 bg-black/50 hover:bg-black/70 rounded-lg backdrop-blur-sm transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                      {item.price && (
                        <div className="absolute bottom-3 left-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                          ${item.price.toFixed(2)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 truncate">{item.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{item.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{item.likes}</span>
                          </div>
                        </div>
                        <span className="text-xs">{item.uploadDate}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-lg border border-gray-800">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <FolderOpen className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                  Start building your portfolio by uploading your first 3D model
                </p>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Upload Your First Model
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}