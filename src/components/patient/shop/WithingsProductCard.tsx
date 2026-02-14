// src/components/patient/shop/WithingsProductCard.tsx
import React from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/shop/types';
import { MOCK_PRODUCTS } from '@/lib/shop/mockProducts';

export const WithingsProductCard = () => {
    const withingsScale = MOCK_PRODUCTS.find(p => p.id === 'withings-body-scan');

    if (!withingsScale) return null;

    return <ProductCard product={withingsScale} priority={true} />;
};
