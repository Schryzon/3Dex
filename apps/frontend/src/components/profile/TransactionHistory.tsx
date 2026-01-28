'use client';

import { useState } from 'react';
import { User, Wallet, FolderOpen, Download, TrendingUp, Upload, FileText, Settings, Search, Calendar, ChevronDown, FileDown } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'purchase' | 'refund' | 'deposit' | 'withdrawal' | 'commission';
  modelName?: string;
  modelThumbnail?: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  date: string;
  invoiceUrl?: string;
}

export default function TransactionHistoryPage() {
  const [activeSection] = useState<'consumption'>('consumption');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'refund' | 'deposit' | 'withdrawal' | 'commission'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Sample transactions - will be populated from backend
  const [transactions] = useState<Transaction[]>([]);

  const menuItems = [
    { id: 'wallet', label: 'My wallet', icon: Wallet },
    { id: 'collections', label: 'My collections', icon: FolderOpen },
    { id: 'download', label: 'Download records', icon: Download },
    { id: 'consumption', label: 'Consumption records', icon: TrendingUp, active: true },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'upload-records', label: 'Upload records', icon: FileText },
    { id: 'account', label: 'Account settings', icon: Settings }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'refund', label: 'Refund' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'commission', label: 'Commission' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.modelName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateFrom && dateTo) {
      const transactionDate = new Date(transaction.date);
      matchesDate = transactionDate >= new Date(dateFrom) && transactionDate <= new Date(dateTo);
    }
    
    return matchesType && matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: Transaction['status']) => {
    const badges = {
      completed: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      failed: 'bg-red-500/20 text-red-400',
      refunded: 'bg-blue-500/20 text-blue-400'
    };
    return badges[status];
  };

  const getTypeBadge = (type: Transaction['type']) => {
    const badges = {
      purchase: 'bg-purple-500/20 text-purple-400',
      refund: 'bg-blue-500/20 text-blue-400',
      deposit: 'bg-green-500/20 text-green-400',
      withdrawal: 'bg-orange-500/20 text-orange-400',
      commission: 'bg-cyan-500/20 text-cyan-400'
    };
    return badges[type];
  };

  const totalSpent = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

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
            {/* Header with Stats */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6">Transaction History</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-red-400">${totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Total Refunded</p>
                  <p className="text-2xl font-bold text-green-400">${totalRefunded.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Search and Quick Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID or model name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20 placeholder-gray-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 justify-center border border-gray-700"
              >
                <span>Filters</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Type</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
                    >
                      {typeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as any)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date From */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">From Date</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">To Date</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-yellow-400 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Model Thumbnail (if applicable) */}
                      {transaction.modelThumbnail && (
                        <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={transaction.modelThumbnail}
                            alt={transaction.modelName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded ${getTypeBadge(transaction.type)}`}>
                                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(transaction.status)}`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </div>
                            <h3 className="font-semibold text-white mb-1">
                              {transaction.modelName || `Transaction ${transaction.id}`}
                            </h3>
                            <p className="text-sm text-gray-400">
                              ID: {transaction.id} • {transaction.paymentMethod}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-white mb-1">
                              ${transaction.amount.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-400">{transaction.date}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        {transaction.invoiceUrl && (
                          <div className="flex gap-3">
                            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                              <FileDown className="w-4 h-4" />
                              Download Invoice
                            </button>
                            <button className="text-sm text-gray-400 hover:text-white transition-colors">
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="flex flex-col items-center justify-center py-20 bg-gray-900/30 rounded-lg border border-gray-800">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <TrendingUp className="w-12 h-12 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No transactions found</h3>
                <p className="text-gray-400 mb-8 text-center max-w-md">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your filters or search query'
                    : 'Start exploring and purchasing 3D models to see your transaction history'}
                </p>
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8 py-3 rounded-lg transition-colors">
                  Browse Models
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}