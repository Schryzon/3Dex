'use client';

import { useState } from 'react';

interface Props {
  productId: string;
  credits: number;
}

export default function DownloadButton({ productId, credits }: Props) {
  const [downloading, setDownloading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const checkUserCredits = async () => {
    try {
      const response = await fetch('/api/user/credits');
      const data = await response.json();
      setUserCredits(data.credits);
      return data.credits;
    } catch (error) {
      console.error('Error fetching user credits:', error);
      return null;
    }
  };

  const handleDownloadClick = async () => {
    const credits = await checkUserCredits();
    if (credits !== null && credits >= credits) {
      setShowConfirmModal(true);
    } else {
      // Show insufficient credits message
      alert('Insufficient credits. Please purchase more credits.');
    }
  };

  const handleConfirmDownload = async () => {
    try {
      setDownloading(true);
      const response = await fetch(`/api/products/${productId}/download`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-${productId}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        // Update user credits
        await checkUserCredits();
        setShowConfirmModal(false);
      } else {
        alert('Failed to download product. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading product:', error);
      alert('An error occurred while downloading. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownloadClick}
        disabled={downloading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        {downloading ? 'Downloading...' : `Download with ${credits} credits`}
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Confirm Download</h3>
                <p className="text-sm text-gray-400">Using credits from your account</p>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Cost</span>
                <span className="font-semibold">{credits} credits</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Your Balance</span>
                <span className="font-semibold">{userCredits} credits</span>
              </div>
              <div className="border-t border-gray-800 pt-3 flex justify-between">
                <span className="text-gray-400">After Download</span>
                <span className="font-bold text-green-500">
                  {userCredits !== null ? userCredits - credits : 0} credits
                </span>
              </div>
            </div>

            <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-3">
              <p className="text-sm text-yellow-500">
                <strong>Note:</strong> This action cannot be undone. Credits will be deducted immediately.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConfirmDownload}
                disabled={downloading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                {downloading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Downloading...
                  </div>
                ) : (
                  'Confirm Download'
                )}
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={downloading}
                className="flex-1 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}