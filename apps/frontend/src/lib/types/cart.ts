import { Model } from "./product";
import { PrintConfig } from "./order";

export interface CartItem {
    id: string;
    model_id: string;
    model: Model;
    quantity: number;
    print_config?: PrintConfig;
    type?: 'DIGITAL' | 'PRINT';
}
