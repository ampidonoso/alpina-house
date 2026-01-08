import { useState } from "react";
import { ArrowRight, Check, X, Shield, Wrench, HardHat, Wallet } from "lucide-react";
import CinematicHeader from "@/components/layout/CinematicHeader";
import DockNav from "@/components/layout/DockNav";
import Footer from "@/components/layout/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import HubSpotForm from "@/components/HubSpotForm";
import { FadeUp, SlideLeft, SlideRight, StaggerContainer, StaggerItem, ScaleIn } from "@/components/animations/PageTransition";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const included = ["Proyecto de arquitectura completo", "Cálculo estructural certificado", "Planos de instalaciones", "Especificaciones técnicas", "Presupuesto itemizado", "Acompañamiento en permisos", "Modelo 3D"];
const notIncluded = ["Terreno", "Empalmes", "Movimiento de tierras", "Permisos municipales", "Costo de construcción", "Mobiliario"];

const ServicesPage = () => {
  const { getConfig } = useSiteConfigContext();
  const constructionPrice = getConfig('construction_price_per_m2', '30 UF/m²');
  const constructionTime = getConfig('construction_time', '~6 meses');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <CinematicHeader />
      <DockNav />
      <main className="pt-20 sm:pt-24 lg:pt-32">
        {/* Hero */}
        <FadeUp>
          <section className="py-12 sm:py-16 lg:py-20 xl:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-12 text-center">
              <span className="section-label text-xs sm:text-sm">NUESTROS SERVICIOS</span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mt-3 sm:mt-4">¿Qué vendemos?</h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-4 sm:mt-6 max-w-2xl mx-auto">
                Proyectos de arquitectura pre-diseñados listos para construir, con opción de supervisión técnica.
              </p>
            </div>
          </section>
        </FadeUp>

        {/* What's Included / Not Included */}
        <section className="py-12 sm:py-16 lg:py-20 bg-sage-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <SlideLeft>
              <div className="bg-card p-6 sm:p-8 lg:p-10 border border-border h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 flex items-center justify-center">
                    <Check size={18} className="text-accent sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground">Qué Incluye</h2>
                </div>
                <ul className="space-y-3 sm:space-y-4 lg:space-y-5">
                  {included.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
                      <Check size={16} className="text-accent flex-shrink-0" />
                      <span className="text-foreground">{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong className="text-foreground">Valor:</strong> 1 UF/m²
                  </p>
                </div>
              </div>
            </SlideLeft>
            <SlideRight delay={0.15}>
              <div className="bg-secondary/60 p-6 sm:p-8 lg:p-10 border border-border h-full">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted flex items-center justify-center">
                    <X size={18} className="text-muted-foreground sm:w-[22px] sm:h-[22px]" />
                  </div>
                  <h2 className="font-serif text-xl sm:text-2xl text-foreground">Qué NO Incluye</h2>
                </div>
                <ul className="space-y-3 sm:space-y-4 lg:space-y-5">
                  {notIncluded.map((i, idx) => (
                    <li key={idx} className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
                      <X size={16} className="text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{i}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                  <p className="text-xs sm:text-sm text-muted-foreground">Se cotizan según condiciones del terreno.</p>
                </div>
              </div>
            </SlideRight>
          </div>
        </section>

        {/* ITO Service */}
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <ScaleIn className="max-w-4xl mx-auto">
              <div className="bg-card p-6 sm:p-8 lg:p-12 border-2 border-primary/20 relative">
                <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                  <span className="tag-sage px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-sm">Servicio Destacado</span>
                </div>
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5 mb-6 sm:mb-8 mt-6 sm:mt-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <HardHat size={24} className="text-primary sm:w-[26px] sm:h-[26px] lg:w-[30px] lg:h-[30px]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground">Supervisión de Obra (ITO)</h2>
                    <p className="text-muted-foreground text-sm sm:text-base mt-1 sm:mt-2">Inspección Técnica de Obra profesional</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 lg:mb-10">
                  Servicio de ITO para asegurar que la construcción se ejecute según planos y especificaciones. Visitas en hitos críticos con informes detallados.
                </p>
                <button onClick={() => setIsQuoteOpen(true)} className="btn-cta text-sm sm:text-base">
                  Consultar servicio
                  <ArrowRight size={14} className="ml-2 sm:ml-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </ScaleIn>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-12 sm:py-16 lg:py-20 bg-olive-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8" staggerDelay={0.15}>
              {[
                { icon: Shield, title: "Calidad de Materiales", desc: "Proveedores certificados y marcas reconocidas." },
                { icon: Wrench, title: "Personalización", desc: "Colores, revestimientos, griferías." },
                { icon: Wallet, title: "Presupuesto", desc: `${constructionPrice} promedio. Cotización válida 30 días.` }
              ].map((c, i) => (
                <StaggerItem key={i}>
                  <div className="bg-card p-5 sm:p-6 lg:p-8 border border-border">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-primary/10 flex items-center justify-center mb-4 sm:mb-5 lg:mb-6">
                      <c.icon size={20} className="text-primary sm:w-[22px] sm:h-[22px] lg:w-[26px] lg:h-[26px]" />
                    </div>
                    <h3 className="font-serif text-base sm:text-lg lg:text-xl text-foreground mb-2 sm:mb-3 lg:mb-4">{c.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">{c.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-12 sm:py-16 lg:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <FadeUp className="text-center mb-8 sm:mb-10 lg:mb-12">
              <span className="section-label text-xs sm:text-sm">COMPARATIVA</span>
              <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl text-foreground mt-3 sm:mt-4">Alpina vs. Tradicional</h2>
            </FadeUp>
            <FadeUp delay={0.2} className="max-w-3xl mx-auto overflow-x-auto">
              <div className="bg-card border border-border overflow-hidden min-w-[320px]">
                <div className="grid grid-cols-3 bg-secondary/60 p-3 sm:p-4 lg:p-5 border-b border-border font-medium text-xs sm:text-sm lg:text-base">
                  <span>Aspecto</span>
                  <span className="text-center">Alpina</span>
                  <span className="text-center text-muted-foreground">Tradicional</span>
                </div>
                {[
                  { a: "Costo proyecto", b: "1 UF/m²", c: "3-5 UF/m²" },
                  { a: "Tiempo diseño", b: "Inmediato", c: "3-6 meses" },
                  { a: "Construcción", b: `~${constructionPrice}`, c: "35-45 UF/m²" },
                  { a: "Tiempo total", b: constructionTime, c: "12-18 meses" }
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-3 p-3 sm:p-4 lg:p-5 border-b border-border last:border-b-0 text-xs sm:text-sm lg:text-base">
                    <span className="text-muted-foreground">{r.a}</span>
                    <span className="text-primary font-medium text-center">{r.b}</span>
                    <span className="text-muted-foreground text-center">{r.c}</span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* HubSpot Contact Form */}
        <section className="py-12 sm:py-16 lg:py-24 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <FadeUp className="text-center mb-8 sm:mb-10 lg:mb-12">
              <span className="section-label text-xs sm:text-sm">CONTACTO</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mt-3 sm:mt-4">
                ¿Tienes <span className="italic">preguntas</span>?
              </h2>
              <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
                Déjanos tus datos y te contactaremos a la brevedad
              </p>
            </FadeUp>
            <FadeUp delay={0.2} className="max-w-xl mx-auto">
              <HubSpotForm className="hubspot-form-container" />
            </FadeUp>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 lg:py-24 bg-foreground text-background text-center">
          <ScaleIn className="container mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6">¿Tienes dudas?</h2>
            <p className="opacity-70 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-10 max-w-md mx-auto">Conversemos sobre tu proyecto.</p>
            <button 
              onClick={() => setIsQuoteOpen(true)} 
              className="bg-cta text-cta-foreground px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-xs sm:text-sm uppercase tracking-[0.1em] sm:tracking-[0.15em] hover:bg-cta/90 transition-colors"
            >
              Solicitar información
            </button>
          </ScaleIn>
        </section>
      </main>
      <Footer />
      <QuoteWizard isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
};

export default ServicesPage;
