'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image: string;
    author: string;
}

export interface OrderRecord {
    id: string;
    total: number;
    items: CartItem[];
    date: string;
    paymentMethod: string;
}

interface CartState {
    items: CartItem[];
    orders: OrderRecord[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    completeOrder: (paymentMethod: string) => void;
    total: number;
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            orders: [],
            total: 0,
            addItem: (item) => {
                const items = get().items;
                const isItemInCart = items.some((i) => i.id === item.id);

                if (!isItemInCart) {
                    const newItems = [...items, item];
                    set({
                        items: newItems,
                        total: Number(newItems.reduce((acc, curr) => acc + curr.price, 0).toFixed(2))
                    });
                }
            },
            removeItem: (id) => {
                const items = get().items;
                const newItems = items.filter((i) => i.id !== id);
                set({
                    items: newItems,
                    total: Number(newItems.reduce((acc, curr) => acc + curr.price, 0).toFixed(2))
                });
            },
            clearCart: () => set({ items: [], total: 0 }),
            completeOrder: (paymentMethod) => {
                const { items, total, orders } = get();
                if (items.length === 0) return;

                const newOrder: OrderRecord = {
                    id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    total,
                    items: [...items],
                    date: new Date().toISOString(),
                    paymentMethod
                };

                set({
                    orders: [newOrder, ...orders],
                    items: [],
                    total: 0
                });
            }
        }),
        {
            name: 'cart-storage',
        }
    )
);
