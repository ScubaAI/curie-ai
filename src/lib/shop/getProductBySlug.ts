// src/lib/shop/getProductBySlug.ts
import { Product } from './types';
import { MOCK_PRODUCTS } from './mockProducts';

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 300));

    return MOCK_PRODUCTS.find(p => p.slug === slug);
}
