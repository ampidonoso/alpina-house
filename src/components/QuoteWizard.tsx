import { useState, forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, ArrowRight, ArrowLeft, Check, Loader2, Paintbrush, TreePine, MapPin, Home, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import LocationPicker from "@/components/LocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useProjects, Project } from "@/hooks/useProjects";
import { useProjectFinishes, useProjectTerrains, ProjectFinish, ProjectTerrain } from "@/hooks/useProjectCustomizations";
import { getFormattedPrice } from "@/lib/priceUtils";
import casaRefugio from "@/assets/casa-refugio.jpg";
import { logger } from "@/lib/logger";

interface QuoteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedModel?: string;
  preselectedFinish?: string;
  preselectedTerrain?: string;
}

// Helper to get main image from project
const getMainImage = (project: Project) => {
  const coverImage = project.images?.find(img => img.is_cover || img.image_type === 'cover');
  return coverImage?.storage_path || project.images?.[0]?.storage_path || casaRefugio;
};

// Step indicator component
const StepIndicator = ({ step, totalSteps, labels }: { step: number; totalSteps: number; labels: string[] }) => {
  return (
    <div className="flex items-center gap-2 mt-6">
      {labels.map((label, i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div
            className={`h-1 w-full transition-all duration-500 ${
              i + 1 <= step ? "bg-primary" : "bg-border"
            }`}
          />
          <span className={`text-[10px] mt-1.5 transition-colors ${
            i + 1 <= step ? "text-primary" : "text-muted-foreground"
          }`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Finish selection card
const FinishCard = ({ finish, selected, onClick }: { finish: ProjectFinish; selected: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-lg group transition-all duration-300 ${
      selected
        ? "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-lg shadow-primary/20"
        : "hover:shadow-lg"
    }`}
  >
    <div className="aspect-video overflow-hidden bg-secondary/30">
      {finish.storage_path ? (
        <img
          src={finish.storage_path}
          alt={finish.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Paintbrush className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="p-3 text-left bg-card/50">
      <p className="font-medium text-foreground text-sm">{finish.name}</p>
      {finish.price_modifier > 0 && (
        <p className="text-xs text-primary">+${finish.price_modifier.toLocaleString()}</p>
      )}
    </div>
    {selected && (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
      >
        <Check size={12} className="text-primary-foreground" />
      </motion.div>
    )}
  </motion.button>
);

// Terrain selection card
const TerrainCard = ({ terrain, selected, onClick }: { terrain: ProjectTerrain; selected: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-lg group transition-all duration-300 ${
      selected
        ? "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-lg shadow-primary/20"
        : "hover:shadow-lg"
    }`}
  >
    <div className="aspect-video overflow-hidden bg-secondary/30">
      {terrain.storage_path ? (
        <img
          src={terrain.storage_path}
          alt={terrain.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <TreePine className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
    </div>
    <div className="p-3 text-left bg-card/50">
      <p className="font-medium text-foreground text-sm">{terrain.name}</p>
      {terrain.price_modifier > 0 && (
        <p className="text-xs text-primary">+${terrain.price_modifier.toLocaleString()}</p>
      )}
    </div>
    {selected && (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
      >
        <Check size={12} className="text-primary-foreground" />
      </motion.div>
    )}
  </motion.button>
);

const QuoteWizard = forwardRef<HTMLDivElement, QuoteWizardProps>(({ 
  isOpen, 
  onClose, 
  preselectedModel,
  preselectedFinish,
  preselectedTerrain 
}, ref) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const { data: projects, isLoading: isLoadingProjects } = useProjects();
  
  const [formData, setFormData] = useState({
    location: "",
    locationCoords: null as { lat: number; lng: number } | null,
    model: "",
    finish: "",
    terrain: "",
    name: "",
    email: "",
    phone: "",
  });

  // Fetch customizations for selected model
  const { data: finishes = [], isLoading: isLoadingFinishes } = useProjectFinishes(formData.model);
  const { data: terrains = [], isLoading: isLoadingTerrains } = useProjectTerrains(formData.model);

  // Show all customizations (is_visible was removed from schema)
  const visibleFinishes = finishes;
  const visibleTerrains = terrains;

  // Determine steps based on available customizations
  const hasFinishes = visibleFinishes.length > 0;
  const hasTerrains = visibleTerrains.length > 0;
  
  // Dynamic step labels
  const getStepLabels = () => {
    const labels = ["Ubicación", "Modelo"];
    if (hasFinishes) labels.push("Terminación");
    if (hasTerrains) labels.push("Terreno");
    labels.push("Contacto");
    return labels;
  };

  const stepLabels = getStepLabels();
  const totalSteps = stepLabels.length;

  // Map logical step to actual step type
  const getStepType = (currentStep: number) => {
    let stepIndex = currentStep - 1;
    const types = ["location", "model"];
    if (hasFinishes) types.push("finish");
    if (hasTerrains) types.push("terrain");
    types.push("contact");
    return types[stepIndex] || "contact";
  };

  // Get header text for current step
  const getStepHeader = () => {
    const stepType = getStepType(step);
    switch (stepType) {
      case "location": return "¿Dónde construiremos?";
      case "model": return "¿Qué modelo te enamoró?";
      case "finish": return "Elige tu terminación";
      case "terrain": return "Tipo de terreno";
      case "contact": return "Tus datos de contacto";
      default: return "";
    }
  };

  // Get icon for current step
  const getStepIcon = () => {
    const stepType = getStepType(step);
    switch (stepType) {
      case "location": return <MapPin size={18} className="text-primary" />;
      case "model": return <Home size={18} className="text-primary" />;
      case "finish": return <Paintbrush size={18} className="text-primary" />;
      case "terrain": return <TreePine size={18} className="text-primary" />;
      case "contact": return <UserCircle size={18} className="text-primary" />;
      default: return null;
    }
  };

  // Update model when preselectedModel changes or from URL params
  useEffect(() => {
    if (!projects || projects.length === 0) return;
    
    const modelFromUrl = searchParams.get('modelo');
    const modelToMatch = preselectedModel || modelFromUrl;
    
    if (modelToMatch) {
      const matchedProject = projects.find(p => 
        modelToMatch.toLowerCase().includes(p.name.toLowerCase()) ||
        modelToMatch.toLowerCase() === p.slug ||
        modelToMatch.toLowerCase() === p.id
      );
      if (matchedProject) {
        setFormData(prev => ({ ...prev, model: matchedProject.id }));
      }
    }
  }, [preselectedModel, searchParams, projects]);

  // Set preselected finish/terrain
  useEffect(() => {
    if (preselectedFinish) {
      setFormData(prev => ({ ...prev, finish: preselectedFinish }));
    }
    if (preselectedTerrain) {
      setFormData(prev => ({ ...prev, terrain: preselectedTerrain }));
    }
  }, [preselectedFinish, preselectedTerrain]);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedProject = projects?.find(p => p.id === formData.model);
      const selectedFinish = finishes.find(f => f.id === formData.finish);
      const selectedTerrain = terrains.find(t => t.id === formData.terrain);
      
      // Calculate estimated price
      let basePrice = 0;
      try {
        const priceRaw = selectedProject?.price_range;
        const prices = priceRaw ? (typeof priceRaw === 'string' ? JSON.parse(priceRaw) : priceRaw) : {};
        basePrice = parseFloat(String(prices.usd || '0').replace(/[^0-9.-]/g, '') || '0');
      } catch {}
      
      const finishModifier = selectedFinish?.price_modifier || 0;
      const terrainModifier = selectedTerrain?.price_modifier || 0;
      const estimatedPrice = basePrice + finishModifier + terrainModifier;

      // Build notes with customization details
      const notesParts: string[] = [];
      if (selectedFinish) {
        notesParts.push(`Terminación: ${selectedFinish.name}${finishModifier > 0 ? ` (+$${finishModifier.toLocaleString()})` : ''}`);
      }
      if (selectedTerrain) {
        notesParts.push(`Terreno: ${selectedTerrain.name}${terrainModifier > 0 ? ` (+$${terrainModifier.toLocaleString()})` : ''}`);
      }
      if (estimatedPrice > 0) {
        notesParts.push(`Precio estimado: $${estimatedPrice.toLocaleString()} USD`);
      }

      const { error } = await supabase
        .from('quote_requests')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          location: formData.location,
          location_lat: formData.locationCoords?.lat || null,
          location_lng: formData.locationCoords?.lng || null,
          model: selectedProject?.name || formData.model,
          notes: notesParts.length > 0 ? notesParts.join(' | ') : null,
          status: 'pending'
        });

      if (error) {
        logger.warn('Could not save to database:', error.message);
      }
      
      toast.success("Solicitud enviada a Arquitectura", {
        description: "Te contactaremos en menos de 24 horas.",
      });

      setFormData({ location: "", locationCoords: null, model: "", finish: "", terrain: "", name: "", email: "", phone: "" });
      setStep(1);
      onClose();
    } catch (err) {
      console.error('Error submitting quote:', err);
      toast.error("Error al enviar solicitud", {
        description: "Por favor intenta nuevamente o contáctanos directamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    const stepType = getStepType(step);
    switch (stepType) {
      case "location":
        return formData.location.length > 3;
      case "model":
        return formData.model !== "";
      case "finish":
        return true; // Optional step
      case "terrain":
        return true; // Optional step
      case "contact":
        return formData.name && formData.email;
      default:
        return false;
    }
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  const stepType = getStepType(step);
  const selectedProject = projects?.find(p => p.id === formData.model);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent ref={ref} className="max-w-2xl p-0 gap-0 bg-card border-border overflow-hidden [&>button]:hidden">
        {/* Header */}
        <div className="p-8 pb-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStepIcon()}
              <div>
                <span className="section-label block mb-1">COTIZACIÓN</span>
                <h2 className="font-serif text-xl md:text-2xl text-foreground">
                  {getStepHeader()}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress */}
          <StepIndicator step={step} totalSteps={totalSteps} labels={stepLabels} />
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 min-h-[350px] max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait" custom={step}>
            {/* Step: Location */}
            {stepType === "location" && (
              <motion.div
                key="step-location"
                variants={slideVariants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <LocationPicker
                  value={formData.location}
                  onChange={(location, coords) =>
                    setFormData({ ...formData, location, locationCoords: coords || null })
                  }
                />
              </motion.div>
            )}

            {/* Step: Model Selection */}
            {stepType === "model" && (
              <motion.div
                key="step-model"
                variants={slideVariants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isLoadingProjects ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : projects && projects.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {projects.map((project, index) => (
                      <motion.button
                        key={project.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        whileHover={{ 
                          scale: 1.03, 
                          y: -4,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.08,
                          ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        onClick={() =>
                          setFormData({ ...formData, model: project.id, finish: "", terrain: "" })
                        }
                        className={`relative overflow-hidden rounded-lg group transition-shadow duration-300 ${
                          formData.model === project.id
                            ? "ring-2 ring-primary ring-offset-2 ring-offset-card shadow-lg shadow-primary/20"
                            : "hover:shadow-xl hover:shadow-black/30"
                        }`}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={getMainImage(project)}
                            alt={project.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                          <p className="text-stone-100 font-serif text-sm md:text-base">
                            {project.name}
                          </p>
                          <p className="text-stone-400 text-xs">{project.area_m2} m²</p>
                        </div>
                        {formData.model === project.id && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                          >
                            <Check size={12} className="text-primary-foreground" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No hay modelos disponibles en este momento.
                  </p>
                )}
              </motion.div>
            )}

            {/* Step: Finish Selection */}
            {stepType === "finish" && (
              <motion.div
                key="step-finish"
                variants={slideVariants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isLoadingFinishes ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Selecciona una terminación para {selectedProject?.name} <span className="text-primary">(opcional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {visibleFinishes.map((finish, index) => (
                        <motion.div
                          key={finish.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <FinishCard 
                            finish={finish}
                            selected={formData.finish === finish.id}
                            onClick={() => setFormData({ 
                              ...formData, 
                              finish: formData.finish === finish.id ? "" : finish.id 
                            })}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step: Terrain Selection */}
            {stepType === "terrain" && (
              <motion.div
                key="step-terrain"
                variants={slideVariants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isLoadingTerrains ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      ¿Cómo es tu terreno? <span className="text-primary">(opcional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {visibleTerrains.map((terrain, index) => (
                        <motion.div
                          key={terrain.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.08 }}
                        >
                          <TerrainCard 
                            terrain={terrain}
                            selected={formData.terrain === terrain.id}
                            onClick={() => setFormData({ 
                              ...formData, 
                              terrain: formData.terrain === terrain.id ? "" : terrain.id 
                            })}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Step: Contact Info */}
            {stepType === "contact" && (
              <motion.div
                key="step-contact"
                variants={slideVariants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="space-y-5"
              >
                {/* Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/30 rounded-lg p-4 mb-6"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resumen</p>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Ubicación:</span> <span className="text-foreground">{formData.location}</span></p>
                    <p><span className="text-muted-foreground">Modelo:</span> <span className="text-foreground">{selectedProject?.name}</span></p>
                    {formData.finish && finishes.find(f => f.id === formData.finish) && (
                      <p><span className="text-muted-foreground">Terminación:</span> <span className="text-foreground">{finishes.find(f => f.id === formData.finish)?.name}</span></p>
                    )}
                    {formData.terrain && terrains.find(t => t.id === formData.terrain) && (
                      <p><span className="text-muted-foreground">Terreno:</span> <span className="text-foreground">{terrains.find(t => t.id === formData.terrain)?.name}</span></p>
                    )}
                    {selectedProject && (
                      <p className="text-primary font-medium mt-2">
                        Desde {getFormattedPrice(selectedProject.price_range as string | null, 'usd')}
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Tu nombre completo"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </motion.div>

                <motion.div 
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="tu@email.com"
                    className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+56 9 1234 5678"
                    className="w-full px-4 py-4 bg-secondary/50 border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 pt-6 border-t border-border flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              step === 1
                ? "text-muted-foreground/50 cursor-not-allowed"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ArrowLeft size={16} />
            Atrás
          </button>

          {step < totalSteps ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(stepType === "finish" || stepType === "terrain") ? "Continuar" : "Siguiente"}
              <ArrowRight size={16} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="btn-cta disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-cta-foreground/30 border-t-cta-foreground rounded-full"
                  />
                  Enviando...
                </span>
              ) : (
                <>
                  Enviar solicitud
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});

QuoteWizard.displayName = "QuoteWizard";

export default QuoteWizard;
