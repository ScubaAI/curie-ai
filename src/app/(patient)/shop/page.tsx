// src/app/(patient)/shop/page.tsx
import { WearablesShop } from '@/components/patient/shop/WearablesShop';
import RecommendedBanner from '@/components/patient/shop/RecommendedBanner';
import ShopHero from '@/components/patient/shop/ShopHero';
import { getRecommendedProducts } from '@/lib/shop/getRecommendedProducts';

export const metadata = {
    title: 'Health Shop | Curie',
    description:
        'Dispositivos médicos premium sincronizados directamente con tu dashboard Curie. Eleva tu monitoreo, soberanía biológica y resultados reales.',
    openGraph: {
        title: 'Curie Health Shop',
        description: 'Tecnología curada para ti. Cada wearable fluye a tu perfil sin fricciones.',
        images: '/images/og/shop-hero.png',
    },
};

export default function ShopPage() {
    // En una implementación real, aquí obtendríamos los datos del paciente desde la sesión/db
    const patientData = { goals: ['sueño', 'corazón'], hasWithings: false };
    const recommendations = getRecommendedProducts(patientData);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-black/90">
            {/* Hero intro client component */}
            <ShopHero />

            {/* Banner de recomendados */}
            <div className="max-w-7xl mx-auto px-6 pb-12">
                <RecommendedBanner products={recommendations} patientGoals={patientData.goals} />
            </div>

            {/* El corazón de la tienda */}
            <div className="max-w-7xl mx-auto px-6">
                <WearablesShop />
            </div>
        </div>
    );
}