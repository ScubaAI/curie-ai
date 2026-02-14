// src/components/patient/shop/WearablesShop.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PRODUCTS } from '@/lib/shop/mockProducts';
import { Product, ProductCategory, SortOption } from '@/lib/shop/types';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { ProductSort } from './ProductSort';
import { EmptyShopState } from './EmptyShopState';
import { RecommendedBanner } from './RecommendedBanner';
import { getRecommendedProducts } from '@/lib/shop/getRecommendedProducts';
import { ProductTrustBadges } from '@/components/shared/ProductTrustBadges';

export const WearablesShop = () => {
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
    const [selectedBrand, setSelectedBrand] = useState<string | 'all'>('all');
    const [currentSort, setCurrentSort] = useState<SortOption>('recommended');

    const brands = useMemo(() => Array.from(new Set(MOCK_PRODUCTS.map(p => p.brand))), []);

    // Simulación de datos del paciente para recomendaciones
    const patientData = { goals: ['sueño'], hasWithings: false };
    const recommendations = getRecommendedProducts(patientData);

    const filteredProducts = useMemo(() => {
        let result = [...MOCK_PRODUCTS];

        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (selectedBrand !== 'all') {
            result = result.filter(p => p.brand === selectedBrand);
        }

        // Sorting
        switch (currentSort) {
            case 'price-low':
                result.sort((a, b) => a.priceMXN - b.priceMXN);
                break;
            case 'price-high':
                result.sort((a, b) => b.priceMXN - a.priceMXN);
                break;
            case 'popular':
                result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
                break;
            case 'recommended':
                result.sort((a, b) => (a.isRecommended ? -1 : 1));
                break;
        }

        return result;
    }, [selectedCategory, selectedBrand, currentSort]);

    const handleReset = () => {
        setSelectedCategory('all');
        setSelectedBrand('all');
        setCurrentSort('recommended');
    };

    return (
        <div className="space-y-12 pb-20">
            {/* Banner de Recomendaciones Personales */}
            <RecommendedBanner products={recommendations} />

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Sidebar de filtros */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="sticky top-24">
                        <ProductFilters
                            selectedCategory={selectedCategory}
                            onCategoryChange={setSelectedCategory}
                            brands={brands}
                            selectedBrand={selectedBrand}
                            onBrandChange={setSelectedBrand}
                        />
                    </div>
                </aside>

                {/* Grid de productos */}
                <main className="flex-1">
                    <ProductSort
                        currentSort={currentSort}
                        onSortChange={setCurrentSort}
                        resultCount={filteredProducts.length}
                    />

                    <AnimatePresence mode="popLayout">
                        {filteredProducts.length > 0 ? (
                            <motion.div
                                layout
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                            >
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </motion.div>
                        ) : (
                            <EmptyShopState onReset={handleReset} />
                        )}
                    </AnimatePresence>

                    <div className="mt-16">
                        <ProductTrustBadges />
                    </div>
                </main>
            </div>
        </div>
    );
};
