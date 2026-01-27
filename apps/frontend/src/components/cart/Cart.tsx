'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, CreditCard, Building2 } from 'lucide-react';

export default function ShoppingCartPage() {
  const [activeTab, setActiveTab] = useState<'cart' | 'orders'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'paypal' | 'wallet' | 'bank'>('credit');
  const [selectedBank, setSelectedBank] = useState<'bca' | 'mandiri' | 'bni' | 'bri'>('bca');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: ''
  });

  // Check if cart is empty
  const isCartEmpty = true; // Set to false when you have items

  const handlePayment = (method: 'credit' | 'paypal' | 'wallet' | 'bank') => {
    setPaymentMethod(method);
    console.log('Payment method:', method);
    if (method === 'bank') {
      console.log('Selected bank:', selectedBank);
    }
    // Add payment logic here
  };

  const indonesianBanks = [
    { id: 'bca' as const, name: 'BCA', fullName: 'Bank Central Asia', color: 'bg-blue-600' },
    { id: 'mandiri' as const, name: 'Mandiri', fullName: 'Bank Mandiri', color: 'bg-yellow-600' },
    { id: 'bni' as const, name: 'BNI', fullName: 'Bank Negara Indonesia', color: 'bg-orange-600' },
    { id: 'bri' as const, name: 'BRI', fullName: 'Bank Rakyat Indonesia', color: 'bg-blue-700' }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Shopping Cart</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-4 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'cart'
                  ? 'border-yellow-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              My Cart
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'orders'
                  ? 'border-yellow-400 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
                }`}
            >
              Order Records
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'cart' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Side - Cart Items */}
            <div className="lg:col-span-2">
              {/* Minimum Payment Notice */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400">
                  The payment amount is at least $3 via credit card or PayPal.
                </p>
              </div>

              {/* Continue Shopping Button */}
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue shopping
              </Link>

              {/* Empty Cart State */}
              {isCartEmpty && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-32 h-32 bg-gray-900 rounded-full flex items-center justify-center mb-6">
                    <ShoppingCart className="w-16 h-16 text-gray-600" />
                  </div>
                  <p className="text-gray-400 text-lg mb-6">Your cart is empty.</p>
                  <Link
                    href="/catalog"
                    className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Browse 3D Models
                  </Link>
                </div>
              )}

              {/* If cart has items, show them here */}
              {/* <div className="space-y-4">
                Cart items will go here
              </div> */}
            </div>

            {/* Right Side - Payment Form (Desktop: Sticky Sidebar, Mobile: Full Width Below) */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 lg:sticky lg:top-4">
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <label className="block text-xs text-gray-400 mb-2">Contact info ⓘ</label>
                  <input
                    type="text"
                    placeholder="Telephone or Email"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-500"
                  />
                </div>

                {/* Payment Methods Title */}
                <h3 className="text-lg font-semibold mb-4">Payment Method</h3>

                {/* Credit Card Button */}
                <button
                  onClick={() => handlePayment('credit')}
                  disabled={isCartEmpty}
                  className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg transition-colors mb-3 cursor-pointer flex items-center justify-center gap-2"
                  style={{ touchAction: 'manipulation' }}
                >
                  <CreditCard className="w-5 h-5" />
                  Pay with Credit Card
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-gray-900/50 text-gray-500">or pay with</span>
                  </div>
                </div>

                {/* PayPal Button */}
                <button
                  onClick={() => handlePayment('paypal')}
                  disabled={isCartEmpty}
                  className="w-full bg-white hover:bg-gray-100 disabled:bg-gray-700 disabled:cursor-not-allowed text-black py-3 rounded-lg transition-colors mb-3 flex items-center justify-center cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  <svg className="w-20 h-6" viewBox="0 0 124 33" fill="none">
                    <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 13.075h-3.291a.954.954 0 0 0-.787.417l-4.539 6.686-1.924-6.425a.953.953 0 0 0-.912-.678h-3.234a.57.57 0 0 0-.541.754l3.625 10.638-3.408 4.811a.57.57 0 0 0 .465.9h3.287a.949.949 0 0 0 .781-.408l10.946-15.8a.57.57 0 0 0-.468-.895z" fill="#253B80" />
                    <path d="M94.992 6.749h-6.84a.95.95 0 0 0-.938.802l-2.766 17.537a.569.569 0 0 0 .562.658h3.51a.665.665 0 0 0 .656-.562l.785-4.971a.95.95 0 0 1 .938-.803h2.164c4.506 0 7.105-2.18 7.785-6.5.307-1.89.012-3.375-.873-4.415-.971-1.142-2.694-1.746-4.983-1.746zm.789 6.405c-.373 2.454-2.248 2.454-4.062 2.454h-1.031l.725-4.583a.568.568 0 0 1 .562-.481h.473c1.234 0 2.4 0 3.002.704.359.42.468 1.044.331 1.906zM115.434 13.075h-3.273a.567.567 0 0 0-.562.481l-.145.916-.23-.332c-.709-1.029-2.289-1.373-3.867-1.373-3.619 0-6.709 2.741-7.311 6.586-.312 1.918.131 3.752 1.219 5.031 1 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .564.66h2.949a.95.95 0 0 0 .938-.803l1.771-11.209a.571.571 0 0 0-.565-.658zm-4.565 6.374c-.314 1.871-1.801 3.127-3.695 3.127-.949 0-1.711-.305-2.199-.883-.484-.574-.666-1.391-.514-2.301.297-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.501.589.699 1.411.554 2.317zM119.295 7.23l-2.807 17.858a.569.569 0 0 0 .562.658h2.822c.469 0 .867-.34.938-.803l2.768-17.536a.57.57 0 0 0-.562-.659h-3.16a.571.571 0 0 0-.561.482z" fill="#179BD7" />
                    <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2c-.696.494-1.523.869-2.458 1.109-.906.236-1.939.355-3.072.355h-.73c-.522 0-1.029.188-1.427.525a2.21 2.21 0 0 0-.744 1.328l-.055.299-.924 5.855-.042.215c-.011.068-.03.102-.058.125a.155.155 0 0 1-.096.035H7.266z" fill="#253B80" />
                    <path d="M23.048 7.667c-.028.179-.06.362-.096.55-1.237 6.351-5.469 8.545-10.874 8.545H9.326c-.661 0-1.218.48-1.321 1.132L6.596 26.83l-.399 2.533a.704.704 0 0 0 .695.814h4.881c.578 0 1.069-.42 1.16-.99l.048-.248.919-5.832.059-.32c.09-.572.582-.992 1.16-.992h.73c4.729 0 8.431-1.92 9.513-7.476.452-2.321.218-4.259-.978-5.622a4.667 4.667 0 0 0-1.336-1.03z" fill="#179BD7" />
                    <path d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a1.172 1.172 0 0 0-1.159.992L8.05 17.605l-.045.289a1.336 1.336 0 0 1 1.321-1.132h2.752c5.405 0 9.637-2.195 10.874-8.545.037-.188.068-.371.096-.55a6.594 6.594 0 0 0-1.017-.429 9.045 9.045 0 0 0-.277-.087z" fill="#222D65" />
                    <path d="M9.614 7.699a1.169 1.169 0 0 1 1.159-.991h7.352c.871 0 1.684.057 2.426.177a9.757 9.757 0 0 1 1.481.353c.365.121.704.264 1.017.429.368-2.347-.003-3.945-1.272-5.392C20.378.682 17.853 0 14.622 0h-9.38c-.66 0-1.223.48-1.325 1.133L.01 25.898a.806.806 0 0 0 .795.932h5.791l1.454-9.225 1.564-9.906z" fill="#253B80" />
                  </svg>
                </button>

                {/* Indonesian Bank Transfer */}
                <div className="mb-3">
                  <button
                    onClick={() => handlePayment('bank')}
                    disabled={isCartEmpty}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Building2 className="w-5 h-5" />
                    Bank Transfer (Indonesia)
                  </button>

                  {/* Bank Selection - Show when bank transfer is selected */}
                  {paymentMethod === 'bank' && !isCartEmpty && (
                    <div className="mt-3 p-4 bg-gray-800 rounded-lg border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-sm text-gray-400 mb-3">Select your bank:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {indonesianBanks.map((bank) => (
                          <button
                            key={bank.id}
                            onClick={() => setSelectedBank(bank.id)}
                            className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedBank === bank.id
                                ? 'border-yellow-400 bg-gray-700'
                                : 'border-gray-700 hover:border-gray-600'
                              }`}
                            style={{ touchAction: 'manipulation' }}
                          >
                            <div className={`w-8 h-8 ${bank.color} rounded mb-2 flex items-center justify-center text-white font-bold text-sm`}>
                              {bank.name}
                            </div>
                            <p className="text-xs text-gray-300">{bank.fullName}</p>
                          </button>
                        ))}
                      </div>
                      {selectedBank && (
                        <div className="mt-3 p-3 bg-gray-900 rounded border border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Account Details:</p>
                          <p className="text-sm text-white font-mono">1234567890</p>
                          <p className="text-xs text-gray-400 mt-1">PT 3Dex Indonesia</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Wallet Option */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-gray-800 rounded border border-gray-700 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="7" width="18" height="13" rx="2" strokeWidth="2" />
                      <path d="M3 11h18M7 15h.01" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-400">Wallet $0</span>
                </div>

                <button
                  onClick={() => handlePayment('wallet')}
                  disabled={isCartEmpty}
                  className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors mb-6 cursor-pointer"
                  style={{ touchAction: 'manipulation' }}
                >
                  Pay with wallet
                </button>

                {/* Info Text */}
                <div className="space-y-4 text-xs text-gray-400">
                  <p>
                    You may pay via credit card, PayPal, bank transfer, or wallet. Rest assured, we use payment information solely for this transaction and do not store it.
                  </p>
                  <p>
                    You&apos;re not logged in. After purchase, logging in or registering, changing device or clearing cookies may cause the loss of your order record. Please go to the order record page to download the materials as soon as possible.
                  </p>
                  <p>
                    By placing your order, you agree to the{' '}
                    <Link href="/terms" className="text-white hover:text-yellow-400 underline cursor-pointer">
                      Terms of Use
                    </Link>
                    ,{' '}
                    <Link href="/privacy" className="text-white hover:text-yellow-400 underline cursor-pointer">
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link href="/payment-method" className="text-white hover:text-yellow-400 underline cursor-pointer">
                      PayPal&apos;s Payment Method
                    </Link>{' '}
                    Policies.
                  </p>
                  <p className="font-semibold text-white">
                    Important: Downloads are valid for 180 days after payment.
                  </p>
                  <p>
                    By clicking a checkout method, you represent that you are over 18, an authorized user of this payment method, and agree to the{' '}
                    <Link href="/terms" className="text-white hover:text-yellow-400 underline cursor-pointer">
                      Terms of Use
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="text-center py-16">
            <p className="text-gray-400">No order records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}