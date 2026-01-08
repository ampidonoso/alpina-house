import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Instagram, Linkedin, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import AlpinaLogo from "@/components/AlpinaLogo";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";
import { useProjects } from "@/hooks/useProjects";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  const { getConfig } = useSiteConfigContext();
  const { data: projects = [] } = useProjects();
  
  const footerDescription = getConfig('footer_description', 'Casas pre-diseñadas de arquitectura nórdica adaptadas al sur de Chile. El verdadero lujo está en lo simple.');
  const footerText = getConfig('footer_text', '© 2025 Alpina House. Todos los derechos reservados.');
  const instagramUrl = getConfig('instagram_url', 'https://www.instagram.com/alpinahouse.cl');
  const linkedinUrl = getConfig('linkedin_url', 'https://www.linkedin.com/company/alpinahouse');
  const contactEmail = getConfig('contact_email', 'contacto@alpinahouse.com');
  const contactPhone = getConfig('contact_phone', '+56 9 8977 6227');
  const contactAddress = getConfig('contact_address', 'Av. Alonso de Córdova 5670, Las Condes');

  return (
    <footer ref={ref} className="bg-stone-900 text-stone-100 relative overflow-hidden">
    
      {/* Watermark Logo - Very subtle */}
      <div className="absolute -bottom-24 -right-24 pointer-events-none">
        <AlpinaLogo className="h-[400px] w-auto opacity-[0.02]" color="white" />
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 mb-12 sm:mb-16 lg:mb-20">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4 sm:mb-6">
              <AlpinaLogo className="h-8 sm:h-10 w-auto" color="hsl(40 15% 96%)" />
            </Link>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed mb-6 sm:mb-8 max-w-xs">
              {footerDescription}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <a 
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-all"
                data-cursor
              >
                <Instagram size={16} strokeWidth={1.5} />
              </a>
              <a 
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-100 transition-all"
                data-cursor
              >
                <Linkedin size={16} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-stone-500 mb-4 sm:mb-6">NAVEGACIÓN</h4>
            <nav className="flex flex-col gap-3 sm:gap-4">
              <Link to="/" className="text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors" data-cursor>
                Inicio
              </Link>
              <Link to="/modelos" className="text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors" data-cursor>
                Modelos
              </Link>
              <Link to="/quienes-somos" className="text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors" data-cursor>
                Quiénes Somos
              </Link>
              <Link to="/servicios" className="text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors" data-cursor>
                Qué Vendemos
              </Link>
            </nav>
          </div>

          {/* Models - Dynamic from DB */}
          <div>
            <h4 className="font-display text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-stone-500 mb-4 sm:mb-6">MODELOS</h4>
            <nav className="flex flex-col gap-3 sm:gap-4">
              {projects.slice(0, 5).map((project) => (
                <Link 
                  key={project.id}
                  to={`/modelos#${project.slug || project.name.toLowerCase().replace(/\s+/g, '-')}`} 
                  className="text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors" 
                  data-cursor
                >
                  {project.name} — {project.area_m2} m²
                </Link>
              ))}
              {projects.length === 0 && (
                <span className="text-xs sm:text-sm text-stone-500">Cargando modelos...</span>
              )}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.2em] text-stone-500 mb-4 sm:mb-6">CONTACTO</h4>
            <div className="flex flex-col gap-4 sm:gap-5">
            <a 
                href={`mailto:${contactEmail}`} 
                className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors"
                data-cursor
              >
                <Mail size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                <span>{contactEmail}</span>
              </a>
              <a 
                href={`tel:${contactPhone.replace(/\s/g, '')}`} 
                className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-stone-400 hover:text-stone-100 transition-colors"
                data-cursor
              >
                <Phone size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                <span>{contactPhone}</span>
              </a>
              <span className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-stone-500">
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 flex-shrink-0" />
                <span>{contactAddress}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Engineering Credit */}
        <div className="border-t border-stone-800 pt-6 sm:pt-8 lg:pt-10 mb-6 sm:mb-8 lg:mb-10">
          <a 
            href="https://www.winteri.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-stone-500 hover:text-stone-300 transition-colors group"
            data-cursor
          >
            <span className="text-stone-600">Engineering by</span>
            <span className="text-stone-400">Winteri Arquitectura</span>
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-stone-600">
          <p className="text-[10px] sm:text-xs">
            {footerText}
          </p>
          <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-xs">
            <Link to="/privacidad" className="hover:text-stone-400 transition-colors" data-cursor>Política de Privacidad</Link>
            <Link to="/terminos" className="hover:text-stone-400 transition-colors" data-cursor>Términos y Condiciones</Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;
