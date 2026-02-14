// src/lib/shop/types.ts

export type ProductCategory = 'wearable' | 'scale' | 'sensor' | 'accessory';

export type CurieIntegrationLevel =
    | 'native'      // Sync automático vía API oficial (Withings, Oura)
    | 'api'         // Sync vía integración propia (webhooks, polling)
    | 'manual'      // Paciente ingresa datos manualmente
    | 'planned';    // En roadmap, no disponible aún

export interface Product {
    id: string;
    slug: string;
    name: string;
    brand: string;
    description: string;
    longDescription?: string;
    priceMXN: number;
    originalPriceMXN?: number;
    currency: string;
    image: string;
    images: string[];
    category: ProductCategory;
    tags: string[];
    features: ProductFeature[];
    specs: Record<string, string>;
    isRecommended?: boolean;
    stockStatus: 'in-stock' | 'out-of-stock' | 'pre-order';
    connectivity: ('bluetooth' | 'wifi' | 'cellular')[];
    rating?: number;
    reviewCount?: number;
    clipPaymentUrl?: string;
    affiliateUrl?: string;

    // NUEVO: Integración con Curie
    curieIntegration: {
        level: CurieIntegrationLevel;
        syncFields: string[];           // Qué datos sincroniza: ['weight', 'bodyFat', 'heartRate', 'sleep']
        syncFrequency: 'real-time' | 'hourly' | 'daily' | 'manual';
        requiresAuth: boolean;          // ¿OAuth necesario?
        curieScore: number;             // 0-100, qué tan completa es la integración
    };

    // NUEVO: Metadatos para mercado latino
    marketLatam: {
        availableIn: ('MX' | 'CO' | 'AR' | 'CL' | 'PE')[];
        shippingDays: number;
        warrantyMonths: number;
        supportUrl?: string;
        localDistributor?: string;
    };

    // NUEVO: Para el "factor sorpresa" y novedades
    releaseDate?: string;               // ISO date, para mostrar "Nuevo"
    isNew?: boolean;                    // Flag calculado (releaseDate < 30 días)
}

export interface ProductFeature {
    icon: string;
    label: string;
    description: string;
}

export interface ShopFilters {
    category: ProductCategory | 'all';
    brand: string | 'all';
    maxPrice: number;
    connectivity: string[];
    integrationLevel?: CurieIntegrationLevel | 'all';  // NUEVO filtro
}

export type SortOption = 'recommended' | 'price-low' | 'price-high' | 'popular' | 'newest';  // NUEVO: newest

// NUEVO: Interfaces para el futuro schema Prisma
export interface ProductInventory {
    productId: string;
    sku: string;
    quantity: number;
    reserved: number;
    lastRestock?: Date;
}

export interface PatientProductRecommendation {
    id: string;
    patientId: string;
    productId: string;
    reason: string;
    score: number;
    shownAt: Date;
    clickedAt?: Date;
    purchasedAt?: Date;
}