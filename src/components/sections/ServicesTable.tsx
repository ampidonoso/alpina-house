import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { FadeUp } from "@/components/animations/PageTransition";

const services = [
  {
    name: "Diseño Arquitectónico",
    alpina: true,
    traditional: true,
    highlight: false,
  },
  {
    name: "Cálculo Estructural",
    alpina: true,
    traditional: true,
    highlight: false,
  },
  {
    name: "Planos de Instalaciones",
    alpina: true,
    traditional: true,
    highlight: false,
  },
  {
    name: "Presupuesto Detallado",
    alpina: true,
    traditional: false,
    highlight: false,
  },
  {
    name: "Cronograma de Obra",
    alpina: true,
    traditional: false,
    highlight: false,
  },
  {
    name: "Inspección Técnica (ITO)",
    alpina: true,
    traditional: false,
    highlight: true,
    description: "Supervisión profesional durante toda la construcción",
  },
  {
    name: "Entrega en 6 Meses",
    alpina: true,
    traditional: false,
    highlight: false,
  },
];

const ServicesTable = () => {
  return (
    <section className="py-16 sm:py-24 lg:py-32 xl:py-44 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12">
        <FadeUp className="text-center mb-12 sm:mb-16">
          <span className="section-label">TRANSPARENCIA RADICAL</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground mt-4 sm:mt-6 tracking-[-0.02em]">
            Qué <span className="italic">incluimos</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="max-w-3xl mx-auto">
            {/* Header - Hidden on mobile */}
            <div className="hidden sm:grid grid-cols-3 gap-4 pb-4 border-b border-border mb-2">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Servicio
              </div>
              <div className="text-center text-sm font-medium text-primary uppercase tracking-wider">
                Alpina
              </div>
              <div className="text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Tradicional
              </div>
            </div>

            {/* Rows */}
            {services.map((service, idx) => (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`flex flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4 py-4 sm:py-5 border-b border-border/50 ${
                  service.highlight ? "bg-sage-50 -mx-4 px-4 border-sage-100 rounded-lg sm:rounded-none" : ""
                }`}
              >
                {/* Service Name */}
                <div>
                  <span
                    className={`text-sm sm:text-sm ${
                      service.highlight
                        ? "text-foreground font-medium"
                        : "text-foreground/80"
                    }`}
                  >
                    {service.name}
                  </span>
                  {service.description && (
                    <p className="text-xs text-sage-500 mt-1">
                      {service.description}
                    </p>
                  )}
                </div>
                
                {/* Mobile: Inline badges | Desktop: Centered icons */}
                <div className="flex items-center gap-4 sm:hidden">
                  <div className="flex items-center gap-2">
                    {service.alpina ? (
                      <div
                        className={`w-5 h-5 flex items-center justify-center ${
                          service.highlight ? "bg-primary" : "bg-sage-400"
                        }`}
                      >
                        <Check size={12} className="text-primary-foreground" />
                      </div>
                    ) : (
                      <X size={16} className="text-muted-foreground/40" />
                    )}
                    <span className="text-xs text-primary font-medium">Alpina</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.traditional ? (
                      <div className="w-5 h-5 bg-muted flex items-center justify-center">
                        <Check size={12} className="text-muted-foreground" />
                      </div>
                    ) : (
                      <X size={16} className="text-muted-foreground/40" />
                    )}
                    <span className="text-xs text-muted-foreground">Tradicional</span>
                  </div>
                </div>
                
                {/* Desktop: Centered check/X icons */}
                <div className="hidden sm:flex justify-center items-center">
                  {service.alpina ? (
                    <div
                      className={`w-6 h-6 flex items-center justify-center ${
                        service.highlight ? "bg-primary" : "bg-sage-400"
                      }`}
                    >
                      <Check size={14} className="text-primary-foreground" />
                    </div>
                  ) : (
                    <X size={18} className="text-muted-foreground/40" />
                  )}
                </div>
                <div className="hidden sm:flex justify-center items-center">
                  {service.traditional ? (
                    <div className="w-6 h-6 bg-muted flex items-center justify-center">
                      <Check size={14} className="text-muted-foreground" />
                    </div>
                  ) : (
                    <X size={18} className="text-muted-foreground/40" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        {/* Note */}
        <FadeUp delay={0.4} className="text-center mt-12">
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Nuestro servicio de{" "}
            <span className="text-primary font-medium">
              Inspección Técnica (ITO)
            </span>{" "}
            garantiza que cada etapa de la construcción cumpla con los estándares
            de calidad Alpina.
          </p>
        </FadeUp>
      </div>
    </section>
  );
};

export default ServicesTable;