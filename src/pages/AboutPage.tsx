import { useState } from "react";
import { ArrowRight, Users, Award, Building2, Shield } from "lucide-react";
import CinematicHeader from "@/components/layout/CinematicHeader";
import DockNav from "@/components/layout/DockNav";
import Footer from "@/components/layout/Footer";
import QuoteWizard from "@/components/QuoteWizard";
import HubSpotForm from "@/components/HubSpotForm";
import { FadeUp, SlideLeft, SlideRight, StaggerContainer, StaggerItem, ScaleIn } from "@/components/animations/PageTransition";
import heroImage from "@/assets/hero-alpina.jpg";
import casaCanelo from "@/assets/casa-canelo-new.jpg";
import livingRoom from "@/assets/living-room.png";

const partners = [
  { name: "Constructora Sur", logo: "CS" },
  { name: "Maderas Patagonia", logo: "MP" },
  { name: "Ingeniería Volcán", logo: "IV" },
  { name: "Arquitectura Verde", logo: "AV" },
  { name: "Steel Frame Chile", logo: "SF" },
  { name: "Eco Construcción", logo: "EC" },
];

const AboutPage = () => {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <CinematicHeader />
      <DockNav />
      <main className="pt-20 sm:pt-24 lg:pt-32">
        {/* Hero Section */}
        <section className="py-12 sm:py-16 lg:py-24 xl:py-36">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <FadeUp className="max-w-3xl">
              <span className="section-label mb-3 sm:mb-4 lg:mb-6 block text-xs sm:text-sm">NUESTRA HISTORIA</span>
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-foreground mb-4 sm:mb-6 lg:mb-8 leading-[1.1]">
                De donde nace <span className="italic">Alpina House</span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                Alpina House surge de la pasión por el sur de Chile y la arquitectura nórdica. Fundada por Winteri Arquitectura, nacimos con el objetivo de hacer accesible el buen diseño.
              </p>
            </FadeUp>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-sage-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center">
            <SlideLeft className="space-y-4 sm:space-y-6 lg:space-y-8 order-2 lg:order-1">
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                Todo comenzó en los bosques del sur, donde la arquitectura escandinava encontró su lugar perfecto entre lagos, volcanes y bosques nativos.
              </p>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed">
                Nuestros modelos pre-diseñados nacen de años de experiencia construyendo en terrenos complejos. Cada diseño está optimizado para reducir costos sin sacrificar calidad.
              </p>
            </SlideLeft>
            <SlideRight delay={0.2} className="order-1 lg:order-2">
              <div className="relative">
                <div className="image-reveal">
                  <img src={heroImage} alt="Casa en construcción" className="w-full aspect-[4/5] sm:aspect-[4/5] object-cover" />
                </div>
                <div className="absolute -bottom-4 sm:-bottom-6 lg:-bottom-8 -left-2 sm:-left-4 lg:-left-8 glass p-4 sm:p-6 lg:p-8 max-w-[280px] sm:max-w-xs">
                  <p className="font-serif text-base sm:text-lg lg:text-2xl text-foreground italic">
                    "Creemos que todos merecen vivir en un espacio bien diseñado"
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-4">— Equipo Winteri</p>
                </div>
              </div>
            </SlideRight>
          </div>
        </section>

        {/* Winteri Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-foreground text-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <SlideLeft>
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-background/20 mb-4 sm:mb-6 lg:mb-8">
                <Shield size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm tracking-wide">Respaldo Profesional</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-6 lg:mb-8">
                Un producto de <span className="italic">Winteri Arquitectura</span>
              </h2>
              <p className="opacity-70 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 lg:mb-10">
                Alpina House es desarrollada por Winteri Arquitectura, estudio con más de 10 años de experiencia en proyectos residenciales en el sur de Chile.
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {[
                  { value: "+50", label: "Proyectos" },
                  { value: "10+", label: "Años" },
                  { value: "100%", label: "Satisfacción" },
                  { value: "5", label: "Regiones" }
                ].map((s, i) => (
                  <div key={i}>
                    <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-primary">{s.value}</p>
                    <p className="text-xs sm:text-sm opacity-60 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </SlideLeft>
            <SlideRight delay={0.2}>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                <img src={livingRoom} alt="Interior" className="w-full h-32 sm:h-40 lg:h-52 object-cover" />
                <img src={casaCanelo} alt="Exterior" className="w-full h-32 sm:h-40 lg:h-52 object-cover" />
                <img src={heroImage} alt="Casa" className="w-full h-32 sm:h-40 lg:h-52 object-cover col-span-2" />
              </div>
            </SlideRight>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <FadeUp className="text-center mb-8 sm:mb-12 lg:mb-16">
              <span className="section-label text-xs sm:text-sm">NUESTROS VALORES</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mt-3 sm:mt-4">Lo que nos define</h2>
            </FadeUp>
            <StaggerContainer className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-4xl mx-auto" staggerDelay={0.15}>
              {[
                { icon: Award, title: "Calidad", desc: "Materiales de primer nivel." },
                { icon: Users, title: "Transparencia", desc: "Presupuestos claros." },
                { icon: Building2, title: "Eficiencia", desc: "Procesos optimizados." }
              ].map((v, i) => (
                <StaggerItem key={i} className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-5 lg:mb-6">
                    <v.icon size={22} className="text-primary sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-foreground mb-2 sm:mb-3">{v.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{v.desc}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-olive-subtle">
          <div className="container mx-auto px-4 sm:px-6 lg:px-12">
            <FadeUp className="text-center mb-8 sm:mb-12 lg:mb-16">
              <span className="section-label text-xs sm:text-sm">RED DE ALIADOS</span>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-foreground mt-3 sm:mt-4">Constructoras Certificadas</h2>
            </FadeUp>
            <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6" staggerDelay={0.08}>
              {partners.map((p, i) => (
                <StaggerItem key={i}>
                  <div className="bg-card p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center border border-border aspect-square hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-muted flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
                      <span className="font-display text-xs sm:text-sm text-muted-foreground">{p.logo}</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground text-center">{p.name}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
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

        {/* CTA Section */}
        <section className="py-12 sm:py-16 lg:py-24 bg-background text-center">
          <ScaleIn className="container mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 sm:mb-6">¿Quieres conocernos mejor?</h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-10 max-w-md mx-auto">Agenda una reunión sin compromiso.</p>
            <button onClick={() => setIsQuoteOpen(true)} className="btn-cta text-sm sm:text-base">
              Contactar
              <ArrowRight size={14} className="ml-2 sm:ml-3 sm:w-4 sm:h-4" />
            </button>
          </ScaleIn>
        </section>
      </main>
      <Footer />
      <QuoteWizard isOpen={isQuoteOpen} onClose={() => setIsQuoteOpen(false)} />
    </div>
  );
};

export default AboutPage;
