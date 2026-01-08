import React from 'react';
import { motion } from 'framer-motion';
import { Maximize2, Thermometer, Clock, Zap, Shield, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

interface FeatureCard {
  title: string;
  value: string;
  unit?: string;
  description: string;
  icon: React.ReactNode;
  size: 'small' | 'medium' | 'large';
  glassmorphism?: boolean;
}

const features: FeatureCard[] = [
  {
    title: 'Área Construida',
    value: '120',
    unit: 'm²',
    description: 'Diseño funcional con distribución eficiente de espacios',
    icon: <Maximize2 className="w-7 h-7 sm:w-8 sm:h-8" />,
    size: 'large',
    glassmorphism: true,
  },
  {
    title: 'Eficiencia Térmica',
    value: 'R-30',
    unit: '',
    description: 'Aislación superior para climas extremos',
    icon: <Thermometer className="w-6 h-6" />,
    size: 'medium',
    glassmorphism: true,
  },
  {
    title: 'Tiempo de Entrega',
    value: '4',
    unit: 'meses',
    description: 'Proceso industrializado acelerado',
    icon: <Clock className="w-6 h-6" />,
    size: 'medium',
    glassmorphism: true,
  },
  {
    title: 'Energía',
    value: 'A+',
    unit: '',
    description: 'Certificación energética máxima',
    icon: <Zap className="w-6 h-6" />,
    size: 'small',
    glassmorphism: true,
  },
  {
    title: 'Garantía',
    value: '10',
    unit: 'años',
    description: 'Estructura y materiales',
    icon: <Shield className="w-6 h-6" />,
    size: 'small',
    glassmorphism: true,
  },
  {
    title: 'Sustentable',
    value: '100%',
    unit: '',
    description: 'Materiales certificados y reciclables',
    icon: <Leaf className="w-6 h-6" />,
    size: 'small',
    glassmorphism: true,
  },
];

/**
 * Bento Grid Features Section
 * Inspired by Jupe.com - Technical dashboard style with glassmorphism
 */
export default function BentoGridFeatures() {
  return (
    <section className="py-20 sm:py-28 md:py-36 lg:py-44 bg-gradient-to-b from-white via-[hsl(140_15%_98%)] to-white relative overflow-hidden">
      {/* Subtle forest-inspired texture - Raulí bark pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23140' stroke-width='0.5' opacity='0.3'%3E%3Cpath d='M0 20 Q30 10 60 20 T120 20'/%3E%3Cpath d='M0 40 Q30 30 60 40 T120 40'/%3E%3Cpath d='M0 60 Q30 50 60 60 T120 60'/%3E%3Cpath d='M0 80 Q30 70 60 80 T120 80'/%3E%3Cpath d='M0 100 Q30 90 60 100 T120 100'/%3E%3C/g%3E%3Cg fill='%23140' fill-opacity='0.02'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3Ccircle cx='100' cy='40' r='1.5'/%3E%3Ccircle cx='40' cy='80' r='1'/%3E%3Ccircle cx='80' cy='100' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,}} />
      
      {/* Canelo-inspired subtle green tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(120_10%_99%)] via-transparent to-[hsl(140_8%_98%)] pointer-events-none opacity-40" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-16 sm:mb-20 md:mb-24 text-center"
        >
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-zinc-400/80 mb-4 sm:mb-6 block font-medium"
          >
            Especificaciones Técnicas
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extralight tracking-[-0.02em] text-zinc-900 leading-[0.95]"
          >
            Arquitectura de<br className="hidden sm:block" /> Precisión
          </motion.h2>
        </motion.div>

        {/* Bento Grid - Ultra refined layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 max-w-7xl mx-auto md:auto-rows-[minmax(280px,auto)]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ 
                delay: index * 0.08, 
                duration: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ y: -2 }}
              className={cn(
                'relative overflow-hidden',
                feature.size === 'large' && 'md:col-span-2 md:row-span-2',
                feature.size === 'medium' && 'md:col-span-1',
                feature.size === 'small' && 'md:col-span-1'
              )}
            >
              <div
                className={cn(
                  'h-full min-h-[280px] p-8 sm:p-10 lg:p-12 xl:p-14',
                  'border border-zinc-200/50 flex flex-col',
                  'bg-white/80 backdrop-blur-xl',
                  'hover:border-zinc-300/70 transition-all duration-500 ease-out',
                  'group hover:shadow-2xl hover:shadow-zinc-900/5',
                  'relative overflow-hidden',
                  // Large cards get extra height
                  feature.size === 'large' && 'md:min-h-[560px]'
                )}
              >
                {/* Ultra-refined overlay system */}
                {/* Base gradient overlay - more subtle */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-zinc-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  initial={false}
                />
                {/* Radial glow overlay */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse 80% 50% at top right, rgba(255, 255, 255, 0.15) 0%, transparent 70%)"
                  }}
                  initial={false}
                />
                {/* Subtle border glow */}
                <motion.div 
                  className="absolute inset-0 border-2 border-transparent group-hover:border-zinc-200/30 transition-all duration-500 pointer-events-none"
                  initial={false}
                />
                {/* Shine effect on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
                
                {/* Icon - More refined */}
                <motion.div 
                  className="mb-6 sm:mb-8 text-zinc-900/90 group-hover:text-zinc-900 transition-colors duration-500 relative z-10"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                    {feature.icon}
                  </div>
                </motion.div>

                {/* Value Display - Ultra refined typography */}
                <div className="mb-6 sm:mb-8 relative z-10">
                  <div className="flex items-baseline gap-3">
                    {/^\d+$/.test(feature.value) ? (
                      <AnimatedNumber
                        value={parseInt(feature.value)}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-[-0.04em] text-zinc-900 leading-none"
                      />
                    ) : (
                      <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight tracking-[-0.04em] text-zinc-900 leading-none">
                        {feature.value}
                      </span>
                    )}
                    {feature.unit && (
                      <span className="text-base sm:text-lg md:text-xl font-light text-zinc-500/80 uppercase tracking-[0.15em] ml-1">
                        {feature.unit}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider - Inspired by Raulí bark texture */}
                <motion.div 
                  className="w-16 sm:w-20 h-[2px] bg-gradient-to-r from-[hsl(140_25%_60%)]/40 via-[hsl(30_20%_50%)]/30 to-transparent mb-6 sm:mb-8 relative z-10"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 + 0.3, duration: 0.6 }}
                />

                {/* Title & Description - Refined typography */}
                <div className="mt-auto relative z-10 space-y-3">
                  <motion.h3 
                    className="text-sm sm:text-base md:text-lg font-light text-zinc-900 tracking-[0.12em] uppercase"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + 0.4 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-xs sm:text-sm md:text-base text-zinc-600/80 leading-relaxed font-light max-w-md"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 + 0.5 }}
                  >
                    {feature.description}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

