import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import LandingShell from '@/app/(landing)/LandingShell';

interface CategoryPlaceholderProps {
  title: string;
  description: string;
  category: string;
}

export default function CategoryPlaceholder({ title, description, category }: CategoryPlaceholderProps) {
  return (
    <div className="bg-black min-h-screen text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
              {title}
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed font-medium">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            Curating {category}
          </div>
        </div>

        {/* Empty Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="group relative aspect-[4/3] bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                 <div className="h-4 w-1/2 bg-gray-800 rounded mb-3 animate-pulse" />
                 <div className="h-3 w-1/3 bg-gray-900 rounded animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                <div className="bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  Coming Soon <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="mt-20 py-16 border-t border-gray-800 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold mb-6">Stay ahead of the curve</h2>
          <p className="text-gray-400 max-w-lg mb-10 leading-relaxed font-medium">
            Be the first to know when we publish new premium {category.toLowerCase()} assets. 
            Join our newsletter and get exclusive early access.
          </p>
          <div className="flex w-full max-w-md gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-5 outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
