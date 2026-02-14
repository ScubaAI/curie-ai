// src/components/patient/shop/RelatedProducts.tsx
import React from 'react';
import { MOCK_PRODUCTS } from '@/lib/shop/mockProducts';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
    currentProductId: string;
}

export default function RelatedProducts({ currentProductId }: RelatedProductsProps) {
    const related = MOCK_PRODUCTS.filter(p => p.id !== currentProductId).slice(0, 3);

    return (
        <section className="space-y-10">
            <h2 className="text-3xl font-bold text-white text-center lg:text-left">Otros dispositivos recomendados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {related.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
