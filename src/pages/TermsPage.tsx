import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import CinematicHeader from "@/components/layout/CinematicHeader";
import Footer from "@/components/layout/Footer";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const TermsPage = () => {
  const { getConfig } = useSiteConfigContext();
  const contactEmail = getConfig('contact_email', 'contacto@alpinahouse.com');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-background text-foreground"
    >
      <SEOHead
        title="Términos y Condiciones | Alpina House"
        description="Lee nuestros términos y condiciones de uso y servicio."
      />
      
      <CinematicHeader />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl mb-8">Términos y Condiciones</h1>
          
          <div className="prose prose-invert prose-stone max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="font-serif text-2xl mb-4">1. Aceptación de los Términos</h2>
              <p className="text-muted-foreground">
                Al acceder y utilizar este sitio web, aceptas estos términos y condiciones en su totalidad. 
                Si no estás de acuerdo con alguna parte de estos términos, te rogamos no utilices nuestro sitio web.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">2. Uso del Sitio</h2>
              <p className="text-muted-foreground">
                Este sitio web es para uso informativo sobre nuestros servicios de construcción de casas prefabricadas. 
                No debes utilizar este sitio de manera que cause daño al sitio o afecte su disponibilidad.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">3. Cotizaciones y Precios</h2>
              <p className="text-muted-foreground">
                Los precios mostrados en el sitio son referenciales y pueden variar según las especificaciones 
                del proyecto, ubicación y condiciones del terreno. Las cotizaciones formales serán proporcionadas 
                después de una evaluación detallada de cada proyecto.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">4. Propiedad Intelectual</h2>
              <p className="text-muted-foreground">
                Todo el contenido de este sitio, incluyendo textos, imágenes, diseños y logotipos, 
                son propiedad de Alpina House o sus licenciantes y están protegidos por leyes de propiedad intelectual.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">5. Limitación de Responsabilidad</h2>
              <p className="text-muted-foreground">
                No garantizamos que el sitio web esté libre de errores o interrupciones. 
                No seremos responsables por daños indirectos, incidentales o consecuentes 
                que puedan surgir del uso de este sitio.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">6. Enlaces Externos</h2>
              <p className="text-muted-foreground">
                Este sitio puede contener enlaces a sitios web de terceros. No tenemos control sobre 
                el contenido de estos sitios y no asumimos responsabilidad por ellos.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">7. Modificaciones</h2>
              <p className="text-muted-foreground">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Las modificaciones serán efectivas inmediatamente después de su publicación en el sitio.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">8. Ley Aplicable</h2>
              <p className="text-muted-foreground">
                Estos términos se rigen por las leyes de la República de Chile. 
                Cualquier disputa será resuelta por los tribunales competentes de Santiago de Chile.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">9. Contacto</h2>
              <p className="text-muted-foreground">
                Para cualquier consulta sobre estos términos, contáctanos en:{' '}
                <a href={`mailto:${contactEmail}`} className="text-primary underline">
                  {contactEmail}
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </motion.div>
  );
};

export default TermsPage;
