import { authKeys } from '@/lib/api/services/auth.service';
import { productKeys } from '@/lib/api/services/product.service';
import { orderKeys } from '@/lib/api/services/order.service';
import { wishlistKeys } from '@/lib/api/services/wishlist.service';
import { cartKeys } from '@/lib/api/services/cart.service';
import { purchaseKeys } from '@/lib/api/services/purchase.service';
import { userKeys } from '@/lib/api/services/user.service';

export * from './endpoints';

export const QUERY_KEYS = {
    AUTH: authKeys.all,
    MODELS: productKeys.all,
    MODEL_DETAIL: productKeys.detail,
    ORDERS: orderKeys.all,
    ORDER_DETAIL: orderKeys.detail,
    WISHLIST: wishlistKeys.all,
    CART: cartKeys.all,
    PURCHASES: purchaseKeys.all,
    USER_PROFILE: userKeys.profile(),
} as const;
