import React from 'react';

interface StaticPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function StaticPageLayout({ title, lastUpdated, children }: StaticPageLayoutProps) {
  return (
    <div className="bg-black min-h-screen text-gray-300 py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-gray-800 pb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            {title}
          </h1>
          <p className="text-gray-500 font-medium">
            Last Updated: {lastUpdated}
          </p>
        </header>

        <div className="prose prose-invert prose-emerald max-w-none prose-headings:text-white prose-headings:font-bold prose-p:leading-relaxed prose-li:my-1">
          {children}
        </div>

        <footer className="mt-20 pt-8 border-t border-gray-800 text-sm text-gray-500">
          <p>
            If you have any questions regarding this document, please contact us at{' '}
            <a href="mailto:privacy@3dex.com" className="text-emerald-500 hover:underline">
              privacy@3dex.com
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
