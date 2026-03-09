import { Model } from "./product";
import { User, Address } from "./user";

export interface PrintConfig {
    material: string;
    color: string;
    scale: number;
    infill?: number;
    layerHeight?: number;
}

export interface OrderItem {
    id: string;
    model_id: string;
    model?: Model;
    quantity: number;
    price: number;
    print_config?: PrintConfig;
    print_status?: 'PENDING' | 'ACCEPTED' | 'PRINTING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

export interface Order {
    id: string;
    user_id: string;
    provider_id?: string;
    provider?: User;
    items: OrderItem[];
    total_amount: number;
    status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    type: 'PURCHASE' | 'PRINT_JOB';
    payment_method?: string;
    shipping_address?: Address;
    courier_name?: string;
    tracking_number?: string;
    created_at: string;
    updated_at: string;
}

export interface Purchase {
    id: string;
    user_id: string;
    model_id: string;
    model: Model;
    amount: number;
    download_count: number;
    max_downloads: number;
    expires_at: string;
    created_at: string;
}
