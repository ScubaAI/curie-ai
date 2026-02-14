// src/components/patient/shop/OuraProductCard.tsx
import React from 'react';
import { ProductCard } from './ProductCard';
import { MOCK_PRODUCTS } from '@/lib/shop/mockProducts';

export const OuraProductCard = () => {
    const ouraRing = MOCK_PRODUCTS.find(p => p.id === 'oura-ring-gen3');

    if (!ouraRing) return null;

    return <ProductCard product={ouraRing} />;
};
