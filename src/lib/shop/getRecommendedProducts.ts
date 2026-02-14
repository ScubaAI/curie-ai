// src/lib/shop/getRecommendedProducts.ts
import { Product } from './types';
import { MOCK_PRODUCTS } from './mockProducts';

export interface PatientData {
    age?: number;
    weight?: number;
    height?: number; // Nuevo: para calcular IMC
    targetWeight?: number;
    hasWithings?: boolean;
    goals?: string[];
    lastCompositionDate?: string; // Nuevo: ¿cuándo midió última vez?
}

export interface RecommendationContext {
    reason: string;
    urgency: 'high' | 'medium' | 'low';
    category: 'weight' | 'sleep' | 'heart' | 'general';
}

export interface ScoredProduct extends Product {
    score: number;
    context: RecommendationContext;
}

/**
 * Calcula IMC básico
 */
function calculateBMI(weight?: number, height?: number): number | null {
    if (!weight || !height || height <= 0) return null;
    return weight / ((height / 100) ** 2);
}

/**
 * Determina prioridad clínica basada en datos del paciente
 */
function calculateClinicalPriority(patientData: PatientData): {
    needsScale: boolean;
    needsSleepTracking: boolean;
    needsHeartMonitoring: boolean;
    bmi: number | null;
} {
    const bmi = calculateBMI(patientData.weight, patientData.height);

    // Necesita báscula si: no tiene Withings, no tiene peso reciente, o IMC fuera de rango
    const daysSinceLastMeasure = patientData.lastCompositionDate
        ? Math.floor((Date.now() - new Date(patientData.lastCompositionDate).getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

    const needsScale = !patientData.hasWithings ||
        daysSinceLastMeasure > 30 ||
        (bmi !== null && (bmi < 18.5 || bmi > 25));

    // Necesita sueño si: metas mencionan sueño, o edad > 40 (recuperación importante)
    const needsSleepTracking = patientData.goals?.some(g =>
        g.toLowerCase().includes('sueño') ||
        g.toLowerCase().includes('sleep') ||
        g.toLowerCase().includes('recovery') ||
        g.toLowerCase().includes('descanso')
    ) || (patientData.age && patientData.age > 40) || false;

    // Necesita cardio si: edad > 50, o metas de corazón/presión
    const needsHeartMonitoring = patientData.goals?.some(g =>
        g.toLowerCase().includes('corazón') ||
        g.toLowerCase().includes('heart') ||
        g.toLowerCase().includes('presión') ||
        g.toLowerCase().includes('hipertensión')
    ) || (patientData.age && patientData.age > 50) || false;

    return { needsScale, needsSleepTracking, needsHeartMonitoring, bmi };
}

/**
 * Genera semilla aleatoria consistente por sesión (basada en fecha)
 * Para el "factor sorpresa" que no cambia cada render
 */
function getDailySeed(): number {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

/**
 * Baraja array con semilla (Fisher-Yates determinista)
 */
function seededShuffle<T>(array: T[], seed: number): T[] {
    const result = [...array];
    let currentSeed = seed;

    for (let i = result.length - 1; i > 0; i--) {
        currentSeed = (currentSeed * 9301 + 49297) % 233280;
        const j = Math.floor((currentSeed / 233280) * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

/**
 * Lógica enriquecida de recomendación para mercado latino
 * - Contexto clínico inteligente
 * - Factor sorpresa controlado
 * - Mensajes personalizados por caso de uso
 */
export function getRecommendedProducts(
    patientData: PatientData,
    options?: {
        limit?: number;
        includeSurprise?: boolean;
        shuffle?: boolean;
    }
): ScoredProduct[] {
    const { limit = 3, includeSurprise = true, shuffle = true } = options || {};
    const { needsScale, needsSleepTracking, needsHeartMonitoring, bmi } = calculateClinicalPriority(patientData);

    const scoredProducts: ScoredProduct[] = [];

    // 1. PRIORIDAD ALTA: Báscula si no tiene datos recientes
    if (needsScale) {
        const bodyScan = MOCK_PRODUCTS.find(p => p.id === 'withings-body-scan');
        if (bodyScan) {
            scoredProducts.push({
                ...bodyScan,
                score: 100,
                context: {
                    reason: patientData.hasWithings
                        ? 'Actualiza tu Body Scan para mediciones más precisas'
                        : 'El fundamento de tu seguimiento en Curie: datos reales, todos los días',
                    urgency: 'high',
                    category: 'weight'
                }
            });
        }
    }

    // 2. PRIORIDAD MEDIA-ALTA: Sueño si metas o edad lo indican
    if (needsSleepTracking) {
        const oura = MOCK_PRODUCTS.find(p => p.id === 'oura-ring-gen3');
        if (oura && !scoredProducts.find(p => p.id === oura.id)) {
            scoredProducts.push({
                ...oura,
                score: 85,
                context: {
                    reason: 'La recuperación es donde ocurre la magia. Tu anillo de sueño te lo revela',
                    urgency: 'medium',
                    category: 'sleep'
                }
            });
        }
    }

    // 3. PRIORIDAD MEDIA: Cardio si riesgo o edad
    if (needsHeartMonitoring) {
        const scanWatch = MOCK_PRODUCTS.find(p => p.id === 'withings-scanwatch-2');
        if (scanWatch && !scoredProducts.find(p => p.id === scanWatch.id)) {
            scoredProducts.push({
                ...scanWatch,
                score: 75,
                context: {
                    reason: 'Prevención elegante: ECG en tu muñeca, alertas inteligentes',
                    urgency: 'medium',
                    category: 'heart'
                }
            });
        }
    }

    // 4. COMPLETAR CON RECOMENDADOS GENERALES (fallback)
    const existingIds = new Set(scoredProducts.map(p => p.id));
    const generalRecs = MOCK_PRODUCTS
        .filter(p => p.isRecommended && !existingIds.has(p.id))
        .map(p => ({
            ...p,
            score: 50,
            context: {
                reason: 'Compatible perfectamente con tu sistema Curie',
                urgency: 'low' as const,
                category: 'general' as const
            }
        }));

    let finalProducts: ScoredProduct[] = [...scoredProducts, ...generalRecs as ScoredProduct[]];

    // 5. FACTOR SORPRESA: Si hay espacio, añadir producto aleatorio no recomendado
    if (includeSurprise && finalProducts.length < limit) {
        const surpriseCandidates = MOCK_PRODUCTS.filter(p =>
            !existingIds.has(p.id) &&
            !finalProducts.find(fp => fp.id === p.id)
        );

        if (surpriseCandidates.length > 0) {
            const seed = getDailySeed();
            const shuffledSurprises = seededShuffle(surpriseCandidates, seed);
            const surprise = shuffledSurprises[0];

            finalProducts.push({
                ...surprise,
                score: 30,
                context: {
                    reason: '✨ Nuevo en Curie: Descubre lo que tu cuerpo puede revelarte',
                    urgency: 'low' as const,
                    category: 'general' as const
                }
            });
        }
    }

    // 6. ORDENAMIENTO FINAL
    if (shuffle) {
        // Prioridad por score, pero con variación aleatoria diaria para "sorpresa"
        const seed = getDailySeed();
        finalProducts = seededShuffle(finalProducts, seed);
    } else {
        // Orden estricto por relevancia clínica
        finalProducts.sort((a, b) => b.score - a.score);
    }

    return finalProducts.slice(0, limit);
}

/**
 * Versión simple para compatibilidad con código existente
 */
export function getRecommendedProductsLegacy(patientData: PatientData): Product[] {
    return getRecommendedProducts(patientData, { limit: 3, includeSurprise: false, shuffle: false })
        .map(({ score, context, ...product }) => product);
}