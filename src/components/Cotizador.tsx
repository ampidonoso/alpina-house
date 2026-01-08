import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Check, Info } from "lucide-react"
import { motion } from "framer-motion"

const MODELS = [
  { id: "nomada", name: "MODELO NÓMADA", area: "18m²", price: 450 },
  { id: "canelo", name: "MODELO CANELO", area: "112m²", price: 2500 },
  { id: "refugio", name: "MODELO REFUGIO", area: "120m²", price: 2800 },
  { id: "bosque", name: "MODELO BOSQUE", area: "130m²", price: 3100 },
]

const ZONES = [
  { id: "central", name: "Zona Central", surcharge: 0 },
  { id: "sur", name: "Zona Sur (+5%)", surcharge: 0.05 },
  { id: "austral", name: "Zona Austral (+15%)", surcharge: 0.15 },
]

/**
 * Cotizador Component
 * Inspired by Samara.com - Product-focused pricing with transparency
 * Features glassmorphism for modern aesthetic
 */
export function Cotizador() {
  const [model, setModel] = useState(MODELS[0])
  const [zone, setZone] = useState(ZONES[0])

  const basePrice = model.price
  const surcharge = Math.round(basePrice * zone.surcharge)
  const total = basePrice + surcharge

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card className="w-full max-w-sm mx-auto bg-white/90 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 border border-white/50 rounded-none mb-8 lg:mb-0 hover:shadow-3xl hover:shadow-zinc-900/15 transition-all duration-500 group relative overflow-hidden flex flex-col">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,}} />
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
        <CardHeader className="pb-5 sm:pb-6 px-6 sm:px-8 pt-6 sm:pt-7 relative z-10">
          <div className="text-[10px] sm:text-xs font-medium tracking-[0.25em] text-zinc-400/80 mb-3 uppercase">CONFIGURADOR</div>
          <CardTitle className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-zinc-900 tracking-[-0.02em]">Tu Proyecto</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-5 sm:space-y-6 px-5 sm:px-7 flex-1">
          {/* Model Selection */}
          <div className="space-y-2.5">
            <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 uppercase tracking-wide">Modelo Base</label>
            <Select value={model.id} onValueChange={(v) => setModel(MODELS.find(m => m.id === v) || MODELS[0])}>
              <SelectTrigger className="rounded-none border-zinc-300 bg-white/70 backdrop-blur-sm h-12 sm:h-13 focus:ring-2 focus:ring-zinc-400 font-medium text-sm sm:text-base transition-all hover:border-zinc-400">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(m => (
                  <SelectItem key={m.id} value={m.id} className="text-sm sm:text-base">
                    {m.name} <span className="text-zinc-400 text-xs ml-2">({m.area})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone Selection */}
          <div className="space-y-2.5">
            <label className="text-[10px] sm:text-xs font-semibold text-zinc-600 uppercase tracking-wide">Emplazamiento</label>
            <Select value={zone.id} onValueChange={(v) => setZone(ZONES.find(z => z.id === v) || ZONES[0])}>
              <SelectTrigger className="rounded-none border-zinc-300 bg-white/70 backdrop-blur-sm h-12 sm:h-13 focus:ring-2 focus:ring-zinc-400 font-medium text-sm sm:text-base transition-all hover:border-zinc-400">
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map(z => (
                  <SelectItem key={z.id} value={z.id} className="text-sm sm:text-base">{z.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className="bg-zinc-300/60 my-5 sm:my-6" />

          {/* Price Breakdown - Samara Style Transparency */}
          <div className="space-y-4 sm:space-y-5">
            {/* Base Price - Prominent */}
            <div className="flex justify-between items-baseline pb-2">
              <span className="text-xs sm:text-sm text-zinc-600 font-semibold">Precio Base</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-light tracking-tight text-zinc-900">{basePrice}</span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-500">UF</span>
              </div>
            </div>

            {/* Surcharge (if applicable) */}
            {surcharge > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-baseline text-xs sm:text-sm text-zinc-500"
              >
                <span>{zone.name}</span>
                <span className="font-medium">+{surcharge} UF</span>
              </motion.div>
            )}

            <Separator className="bg-zinc-400/40 my-3" />

            {/* Total - Very Prominent */}
            <div className="flex justify-between items-baseline pt-1 pb-2">
              <span className="text-sm sm:text-base font-semibold text-zinc-900 uppercase tracking-wide">Total</span>
              <div className="flex items-baseline gap-1.5">
                <motion.span 
                  key={total}
                  initial={{ scale: 1.2, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-zinc-900"
                >
                  {total}
                </motion.span>
                <span className="text-base sm:text-lg font-semibold text-zinc-500">UF</span>
              </div>
            </div>

            {/* Included Features */}
            <div className="pt-5 space-y-2.5 border-t border-zinc-200/60">
              <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-zinc-700">
                <Check size={14} className="text-green-600 flex-shrink-0"/>
                <span className="font-medium">Llave en mano</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-zinc-700">
                <Check size={14} className="text-green-600 flex-shrink-0"/>
                <span className="font-medium">Arquitectura incluida</span>
              </div>
              <div className="flex items-center gap-2.5 text-[11px] sm:text-xs text-zinc-700">
                <Check size={14} className="text-green-600 flex-shrink-0"/>
                <span className="font-medium">Permisos gestionados</span>
              </div>
            </div>

            {/* Transparency Note */}
            <div className="flex items-start gap-2.5 pt-3 text-[10px] sm:text-xs text-zinc-500 bg-zinc-50/70 p-3.5 rounded-sm border border-zinc-200/50">
              <Info size={13} className="flex-shrink-0 mt-0.5 text-zinc-400" />
              <span className="leading-relaxed">Precio estimado. La cotización final puede variar según personalizaciones y terreno específico.</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 sm:px-7 pb-5 sm:pb-7 pt-4 border-t border-zinc-200/30 mt-auto">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Button 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white rounded-none h-13 sm:h-14 text-[11px] sm:text-xs font-bold tracking-widest uppercase transition-all shadow-xl hover:shadow-2xl relative overflow-hidden group"
              onClick={() => {
                // Trigger quote wizard
                window.dispatchEvent(new CustomEvent('openQuoteWizard'));
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                Iniciar Cotización Formal 
                <ArrowRight size={15} className="sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
