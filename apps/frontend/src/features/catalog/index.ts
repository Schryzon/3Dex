// Catalog feature barrel export

// Components — re-export from sub-barrels
export * from './components/filters';
export * from './components/product-card';
export * from './components/product-details';
export * from './components/reviews';
export * from './components/viewer';

// Hooks
export { useProducts, useInfiniteProducts, useProduct, useProductReviews, useUploadProduct, useDeleteProduct, useUpdateProduct, useAddReview } from './hooks/useProducts';
export { useProductDetails } from './hooks/useProductDetails';
export { useWishlist } from './hooks/useWishlist';
