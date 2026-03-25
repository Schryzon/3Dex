export const USD_TO_IDR = 16900; // Exchange rate: 1 USD = 16,900 IDR

export function formatPrice(price: number) {

    return {
        idr: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price * USD_TO_IDR),
        usd: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price),
    };
}
