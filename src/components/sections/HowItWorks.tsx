import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Step {
  number: string;
  title: string;
  description: string;
  duration?: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Diseño',
    description: 'Selecciona tu modelo prediseñado o personaliza acabados y distribución.',
    duration: '1 semana',
  },
  {
    number: '02',
    title: 'Permisos',
    description: 'Gestionamos todos los trámites municipales y permisos de construcción.',
    duration: '2-4 semanas',
  },
  {
    number: '03',
    title: 'Construcción',
    description: 'Fabricación industrializada en taller y montaje en tu terreno.',
    duration: '8-12 semanas',
  },
  {
    number: '04',
    title: 'Entrega',
    description: 'Llave en mano. Tu casa lista para habitar con garantía completa.',
    duration: '1 semana',
  },
];

/**
 * How It Works Section
 * Inspired by Samara.com - Clean linear 4-step process
 */
export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-white border-y border-zinc-100/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16 md:mb-24 text-center"
        >
          <span className="text-[10px] sm:text-xs tracking-[0.2em] uppercase text-zinc-400 mb-3 sm:mb-4 block">
            Proceso
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-zinc-900 mb-4 sm:mb-6">
            Cómo Funciona
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto">
            Un proceso simple y transparente desde el diseño hasta la entrega
          </p>
        </motion.div>

        {/* Linear Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector Line (Desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-px bg-zinc-200 -z-10">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-zinc-400 rounded-full" />
                  </div>
                )}

                {/* Step Number */}
                <div className="mb-5 sm:mb-7">
                  <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight text-zinc-200/80 leading-none">
                    {step.number}
                  </span>
                </div>

                {/* Step Content */}
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-900 flex-shrink-0" />
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-zinc-900 tracking-wide uppercase">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base lg:text-lg text-zinc-600 leading-relaxed">
                    {step.description}
                  </p>

                  {step.duration && (
                    <div className="pt-3 border-t border-zinc-200/60">
                      <span className="text-xs sm:text-sm text-zinc-500 font-semibold">
                        {step.duration}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 sm:mt-16 text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/configurador"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-zinc-900 hover:text-zinc-700 transition-colors group px-6 py-3 border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white rounded-none transition-all duration-200"
              >
                Iniciar tu proyecto
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
