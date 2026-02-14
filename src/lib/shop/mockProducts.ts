// src/lib/shop/mockProducts.ts
import { Product } from './types';

export const MOCK_PRODUCTS: Product[] = [
    {
        id: 'withings-body-scan',
        slug: 'withings-body-scan',
        name: 'Withings Body Scan',
        brand: 'Withings',
        description: 'La báscula clínica más avanzada con ECG de 6 derivaciones y análisis segmental.',
        longDescription: 'Body Scan lleva el seguimiento de la salud a un nuevo nivel con análisis segmental de composición corporal, ECG de 6 derivaciones y evaluación vascular. Diseñada para integrarse perfectamente con Curie AI, cada medición enriquece tu perfil de salud en tiempo real.',
        priceMXN: 5499,
        originalPriceMXN: 6299,
        currency: 'MXN',
        image: '/images/products/body-scan.png',
        images: [
            '/images/products/body-scan.png',
            '/images/products/body-scan-2.png',
            '/images/products/body-scan-3.png'
        ],
        category: 'scale',
        tags: ['ECG', 'Segmental BIA', 'Clinical', 'Native Sync'],
        features: [
            { icon: 'Heart', label: 'ECG 6 derivaciones', description: 'Detección clínica de fibrilación auricular' },
            { icon: 'Activity', label: 'BIA Multifrecuencia', description: 'Análisis segmental: torso, brazos, piernas' },
            { icon: 'Zap', label: 'Salud Vascular', description: 'Velocidad de onda de pulso (VOP)' }
        ],
        specs: {
            'Precisión': '±50g',
            'Batería': 'Hasta 12 meses',
            'Material': 'Vidrio templado de alta resistencia',
            'Conectividad': 'WiFi 2.4GHz + Bluetooth 5.0',
            'Peso máximo': '200kg',
            'App': 'Withings Health Mate + Curie AI'
        },
        isRecommended: true,
        stockStatus: 'in-stock',
        connectivity: ['wifi', 'bluetooth'],
        rating: 4.8,
        reviewCount: 1247,
        clipPaymentUrl: 'https://pay.clip.mx/withings-body-scan',
        affiliateUrl: 'https://www.withings.com/mx/es/body-scan',

        // INTEGRACIÓN CURIE: Nivel nativo, sync perfecto
        curieIntegration: {
            level: 'native',
            syncFields: ['weight', 'bodyFatPercentage', 'muscleMass', 'boneMass', 'waterPercentage', 'visceralFat', 'heartRate', 'vascularAge', 'electrocardiogram'],
            syncFrequency: 'real-time',
            requiresAuth: true, // OAuth Withings
            curieScore: 98 // Casi perfecto, todos los datos relevantes
        },

        // MERCADO LATAM
        marketLatam: {
            availableIn: ['MX', 'CO', 'AR', 'CL'],
            shippingDays: 3,
            warrantyMonths: 24,
            supportUrl: 'https://support.withings.com/mx',
            localDistributor: 'Withings México Oficial'
        },

        releaseDate: '2022-04-15',
        isNew: false
    },

    {
        id: 'oura-ring-gen3',
        slug: 'oura-ring-gen3',
        name: 'Oura Ring Gen3',
        brand: 'Oura',
        description: 'El estándar de oro en monitoreo de sueño y recuperación en un diseño icónico.',
        longDescription: 'Un anillo que desaparece en tu mano mientras revela los secretos de tu sueño, recuperación y readiness. Oura se sincroniza con Curie para completar tu foto de salud con datos que solo el descanso puede revelar.',
        priceMXN: 7999,
        currency: 'MXN',
        image: '/images/products/oura-ring.png',
        images: [
            '/images/products/oura-ring.png',
            '/images/products/oura-ring-gold.png',
            '/images/products/oura-ring-stealth.png'
        ],
        category: 'wearable',
        tags: ['Sleep', 'Recovery', 'Premium', 'API Sync'],
        features: [
            { icon: 'Moon', label: 'Análisis de Sueño', description: 'Fases REM, profundo, ligero y latencia' },
            { icon: 'Thermometer', label: 'Temperatura', description: 'Seguimiento de tendencias nocturnas' },
            { icon: 'Battery', label: 'Batería 7 días', description: 'Carga completa en 80 minutos' },
            { icon: 'Activity', label: 'Readiness Score', description: '¿Tu cuerpo está listo para el día?' }
        ],
        specs: {
            'Material': 'Titanio grado 5, recubrimiento PVD',
            'Peso': '4-6g (según tamaño)',
            'Resistencia': '100m (natación y buceo)',
            'Sensores': 'LED infrarrojo, NTC, acelerómetro 3D',
            'Tallas': '6-13 (kit de sizing incluido)',
            'App': 'Oura App + Curie AI (integración parcial)'
        },
        isRecommended: true,
        stockStatus: 'in-stock',
        connectivity: ['bluetooth'],
        rating: 4.7,
        reviewCount: 893,
        affiliateUrl: 'https://ouraring.com',
        clipPaymentUrl: 'https://pay.clip.mx/oura-ring',

        // INTEGRACIÓN CURIE: Nivel API, requiere polling
        curieIntegration: {
            level: 'api',
            syncFields: ['sleepScore', 'sleepStages', 'restingHeartRate', 'hrv', 'bodyTemperature', 'activity', 'readiness'],
            syncFrequency: 'daily', // Oura API se actualiza al día siguiente
            requiresAuth: true, // OAuth Oura
            curieScore: 85 // Bueno, pero no tiempo real
        },

        // MERCADO LATAM
        marketLatam: {
            availableIn: ['MX', 'CO', 'AR', 'CL', 'PE'],
            shippingDays: 5,
            warrantyMonths: 12,
            supportUrl: 'https://support.ouraring.com',
            localDistributor: 'Oura Internacional (envío directo)'
        },

        releaseDate: '2021-11-01',
        isNew: false
    },

    {
        id: 'withings-scanwatch-2',
        slug: 'withings-scanwatch-2',
        name: 'ScanWatch 2',
        brand: 'Withings',
        description: 'Reloj híbrido con monitoreo continuo de temperatura y ECG clínico.',
        longDescription: 'La elegancia de un reloj analógico con el poder de la medicina preventiva. ScanWatch 2 monitorea tu temperatura 24/7, detecta fibrilación auricular y rastrea tu sueño—todo sincronizado con Curie para alertas tempranas y tendencias de salud.',
        priceMXN: 6899,
        currency: 'MXN',
        image: '/images/products/scanwatch-2.png',
        images: [
            '/images/products/scanwatch-2.png',
            '/images/products/scanwatch-2-details.png',
            '/images/products/scanwatch-2-wrist.png'
        ],
        category: 'wearable',
        tags: ['Hybrid', 'Heart', 'Clinical', 'Native Sync'],
        features: [
            { icon: 'Thermometer', label: 'Temperatura 24/7', description: 'Detección de zonas de calor (enfermedad, ovulación)' },
            { icon: 'Heart', label: 'ECG On-demand', description: 'Registro médico de 30 segundos, detección de FA' },
            { icon: 'Moon', label: 'Sueño Hi-Fi', description: 'Frecuencia respiratoria, interrupciones, calidad' },
            { icon: 'Activity', label: 'Actividad', description: 'Pasos, calorías, 30+ deportes reconocidos' }
        ],
        specs: {
            'Cristal': 'Zafiro resistente a rayones',
            'Batería': 'Hasta 30 días (modo reloj), 7 días (HR continuo)',
            'Caja': 'Acero inoxidable 316L',
            'Correa': 'Silicona FKM premium (intercambiable 20mm)',
            'Resistencia': '5ATM + IP68',
            'App': 'Withings Health Mate + Curie AI'
        },
        isRecommended: false,
        stockStatus: 'in-stock',
        connectivity: ['bluetooth'],
        rating: 4.6,
        reviewCount: 634,
        clipPaymentUrl: 'https://pay.clip.mx/scanwatch-2',
        affiliateUrl: 'https://www.withings.com/mx/es/scanwatch-2',

        // INTEGRACIÓN CURIE: Nivel nativo, misma familia Body Scan
        curieIntegration: {
            level: 'native',
            syncFields: ['heartRate', 'ecg', 'temperature', 'sleep', 'activity', 'spo2', 'breathingDisturbances'],
            syncFrequency: 'real-time',
            requiresAuth: true, // OAuth Withings (misma cuenta que Body Scan)
            curieScore: 92 // Excelente, cubre salud cardiovascular completa
        },

        // MERCADO LATAM
        marketLatam: {
            availableIn: ['MX', 'CO', 'AR', 'CL'],
            shippingDays: 3,
            warrantyMonths: 24,
            supportUrl: 'https://support.withings.com/mx',
            localDistributor: 'Withings México Oficial'
        },

        releaseDate: '2023-09-20',
        isNew: true // Lanzado hace poco, factor sorpresa potencial
    }
];

// Helper para calcular isNew dinámicamente
export const getProductsWithNewFlag = (): Product[] => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return MOCK_PRODUCTS.map(product => ({
        ...product,
        isNew: product.releaseDate ? new Date(product.releaseDate) > thirtyDaysAgo : false
    }));
};