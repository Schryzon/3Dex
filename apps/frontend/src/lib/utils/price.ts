export const USD_TO_IDR = 16900; // Exchange rate: 1 USD = 16,900 IDR

export function formatPrice(price: number) {
    const idrAmount = Number.isFinite(price) ? price : 0;
    const usdAmount = idrAmount / USD_TO_IDR;

    return {
        idr: new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(idrAmount),
        usd: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(usdAmount),
    };
}
