'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/lib/api/services/user.service';
import { Search, User, UserCheck, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce'; // Assuming this exists or I'll create it

export default function UserSearch() {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const debouncedQuery = useDebounce(query, 300);
    const containerRef = useRef<HTMLDivElement>(null);

    const { data: results, isLoading } = useQuery({
        queryKey: ['user-search', debouncedQuery],
        queryFn: () => userService.searchUsers(debouncedQuery),
        enabled: debouncedQuery.length > 0
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                <input
                    type="text"
                    placeholder="Search artists, providers, or creators..."
                    className="w-full bg-[#141414] border border-gray-800 rounded-2xl pl-12 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/50 focus:ring-4 focus:ring-yellow-400/5 transition-all shadow-xl"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white rounded-full hover:bg-gray-800 transition-all"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Results Dropdown */}
            {isOpen && (debouncedQuery.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#141414] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-8 flex flex-col items-center justify-center gap-3">
                                <Loader2 className="w-6 h-6 text-yellow-400 animate-spin" />
                                <p className="text-sm text-gray-500 font-medium">Searching for creators...</p>
                            </div>
                        ) : results && results.length > 0 ? (
                            <div className="p-2">
                                <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profiles</div>
                                {results.map((user) => (
                                    <Link
                                        key={user.id}
                                        href={`/u/${user.username}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                    >
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 overflow-hidden group-hover:border-yellow-400/50 transition-colors">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            {user.role === 'ARTIST' && (
                                                <div className="absolute -bottom-1 -right-1 p-0.5 bg-purple-500 rounded-full border-2 border-[#141414]">
                                                    <UserCheck className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <h4 className="font-bold text-white text-sm truncate group-hover:text-yellow-400 transition-colors">
                                                    {user.display_name || user.username}
                                                </h4>
                                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                                    user.role === 'ARTIST' ? 'bg-purple-500/10 text-purple-400' :
                                                    user.role === 'PROVIDER' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">@{user.username}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 bg-gray-800/50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <User className="w-6 h-6 text-gray-600" />
                                </div>
                                <p className="text-gray-400 font-medium">No users found for "{debouncedQuery}"</p>
                                <p className="text-xs text-gray-600 mt-1 text-balance">Check the spelling or try searching for another name</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
