'use client';

import { useState } from 'react';
import { User, Wallet, FolderOpen, Download, TrendingUp, Upload, FileText, Settings } from 'lucide-react';

export default function UserProfilePage() {
  const [activeSection, setActiveSection] = useState<'account'>('account');
  const [formData, setFormData] = useState({
    username: '',
    userId: '',
    email: '',
    password: '',
    newsletterSubscribed: false,
    memberSince: ''
  });

  const [isEditing, setIsEditing] = useState({
    username: false,
    email: false,
    password: false
  });

  const menuItems = [
    { id: 'wallet', label: 'My wallet', icon: Wallet },
    { id: 'collections', label: 'My collections', icon: FolderOpen },
    { id: 'download', label: 'Download records', icon: Download },
    { id: 'consumption', label: 'Consumption records', icon: TrendingUp },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'upload-records', label: 'Upload records', icon: FileText },
    { id: 'account', label: 'Account settings', icon: Settings, active: true }
  ];

  const handleEdit = (field: 'username' | 'email' | 'password') => {
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  const handleSave = (field: 'username' | 'email' | 'password') => {
    // Add save logic here
    setIsEditing({ ...isEditing, [field]: false });
  };

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
              <h1 className="text-xl sm:text-2xl font-semibold">
                Hi! {formData.username ? formData.username.split('_')[0] + '...' : 'Guest'}
              </h1>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-bold">Your account</h2>
            <p className="text-gray-400 mt-1">Manage your personal information and settings</p>
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
                    onClick={() => setActiveSection(item.id as any)}
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
            <div className="bg-gray-900/30 rounded-lg p-6 sm:p-8">
              <div className="space-y-8">
                {/* Username Field */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">User name</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      disabled={!isEditing.username}
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => isEditing.username ? handleSave('username') : handleEdit('username')}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isEditing.username ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* User ID Field */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">User ID</label>
                  <input
                    type="text"
                    value={formData.userId}
                    disabled
                    className="w-full bg-gray-800 text-gray-400 px-4 py-3 rounded-lg border border-gray-700 cursor-not-allowed"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Email address</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing.email}
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => isEditing.email ? handleSave('email') : handleEdit('email')}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isEditing.email ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Newsletter Checkbox */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={formData.newsletterSubscribed}
                    onChange={(e) => setFormData({ ...formData, newsletterSubscribed: e.target.checked })}
                    className="mt-1 w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-yellow-400 focus:ring-2"
                  />
                  <label htmlFor="newsletter" className="text-sm text-gray-400 cursor-pointer">
                    Receive tips, news, and community content in newsletter
                  </label>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Password</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={!isEditing.password}
                      className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => isEditing.password ? handleSave('password') : handleEdit('password')}
                      className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors whitespace-nowrap"
                    >
                      {isEditing.password ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm text-gray-400 mb-3">Member since</label>
                  <div className="text-white">
                    {formData.memberSince 
                      ? new Date(formData.memberSince).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'N/A'
                    }
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-6 border-t border-gray-800">
                  <h3 className="text-lg font-semibold mb-4 text-red-400">Danger Zone</h3>
                  <button className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}