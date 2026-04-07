import { Model } from "./catalog";

export interface CartItem {
    id: string;
    model_id: string;
    model: Model;
    quantity: number;
    print_config?: PrintConfig;
    type?: 'DIGITAL' | 'PRINT';
}
import { User, Address } from "./auth";

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
    proof_urls?: string[];
    created_at: string;
    updated_at: string;
}

export interface Purchase {
    id: string;
    user_id: string;
    model_id: string;
    price_paid: number;
    license: 'PERSONAL_USE' | 'COMMERCIAL_USE';
    created_at: string;
    model: Model;
}
