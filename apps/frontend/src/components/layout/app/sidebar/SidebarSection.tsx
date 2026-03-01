'use client';

import React from 'react';

interface SidebarSectionProps {
    label: string;
    isVisible: boolean;
    children: React.ReactNode;
}

export default function SidebarSection({ label, isVisible, children }: SidebarSectionProps) {
    return (
        <div>
            {isVisible && (
                <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 px-3">
                    {label}
                </div>
            )}
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );
}
