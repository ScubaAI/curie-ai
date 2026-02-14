// src/app/(patient)/shop/[productSlug]/page.tsx
import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/shop/getProductBySlug';
import ProductGallery from '@/components/patient/shop/ProductGallery';
import ProductSpecsAccordion from '@/components/patient/shop/ProductSpecsAccordion';
import ProductIntegrationBenefits from '@/components/patient/shop/ProductIntegrationBenefits';
import RelatedProducts from '@/components/patient/shop/RelatedProducts';
import ProductTrustAndCta from '@/components/patient/shop/ProductTrustAndCta';
import { HeartPulse } from 'lucide-react';

interface ProductDetailPageProps {
    params: { productSlug: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const product = await getProductBySlug(params.productSlug);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-black/95 pb-24">
            <div className="max-w-7xl mx-auto px-6 pt-12 lg:pt-20 space-y-16 lg:space-y-24">
                {/* Hero Section: imagen grande + título + precio + CTA primario */}
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <ProductGallery images={product.images} name={product.name} />

                    <div className="space-y-10">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-sm font-medium">
                                <HeartPulse className="w-5 h-5 animate-pulse" />
                                Recomendado por Curie
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                                {product.name}
                            </h1>
                            <p className="text-3xl font-light text-emerald-400">
                                ${product.priceMXN.toLocaleString('es-MX')} MXN
                                {product.originalPriceMXN && (
                                    <span className="ml-5 text-2xl text-slate-500 line-through">
                                        ${product.originalPriceMXN.toLocaleString('es-MX')}
                                    </span>
                                )}
                            </p>
                        </div>

                        <ProductTrustAndCta
                            clipPaymentUrl={product.clipPaymentUrl}
                            affiliateUrl={product.affiliateUrl}
                        />
                    </div>
                </div>

                {/* Beneficios Curie-specific */}
                <ProductIntegrationBenefits product={product} />

                {/* Especificaciones técnicas en acordeón elegante */}
                <ProductSpecsAccordion specs={product.specs} features={product.features} />

                {/* Productos relacionados / cross-sell */}
                <RelatedProducts currentProductId={product.id} />

                {/* FAQ o trust extra */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 backdrop-blur-xl">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">Envío y entrega</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Realizamos envíos a todo México mediante DHL y FedEx. Tu dispositivo llegará configurado y listo para vincularse en 2 a 4 días hábiles.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">Soporte técnico Curie</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Si tienes problemas vinculando tu wearable, nuestro equipo de soporte está disponible 24/7 para ayudarte a través del chat de la plataforma.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
