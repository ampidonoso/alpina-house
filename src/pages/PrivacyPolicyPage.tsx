import { motion } from "framer-motion";
import SEOHead from "@/components/SEOHead";
import CinematicHeader from "@/components/layout/CinematicHeader";
import Footer from "@/components/layout/Footer";
import { useSiteConfigContext } from "@/contexts/SiteConfigContext";

const PrivacyPolicyPage = () => {
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
        title="Política de Privacidad | Alpina House"
        description="Conoce nuestra política de privacidad y cómo protegemos tus datos personales."
      />
      
      <CinematicHeader />
      
      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="font-serif text-4xl md:text-5xl mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-invert prose-stone max-w-none space-y-8">
            <p className="text-lg text-muted-foreground">
              Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="font-serif text-2xl mb-4">1. Información que Recopilamos</h2>
              <p className="text-muted-foreground">
                Recopilamos información que nos proporcionas directamente, como tu nombre, correo electrónico, 
                número de teléfono y cualquier otra información que decidas compartir cuando te contactas con nosotros 
                o utilizas nuestros servicios de cotización.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">2. Uso de la Información</h2>
              <p className="text-muted-foreground">
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
                <li>Responder a tus consultas y solicitudes de cotización</li>
                <li>Enviarte información sobre nuestros productos y servicios</li>
                <li>Mejorar nuestro sitio web y experiencia de usuario</li>
                <li>Cumplir con obligaciones legales</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">3. Compartir Información</h2>
              <p className="text-muted-foreground">
                No vendemos ni compartimos tu información personal con terceros para fines de marketing. 
                Podemos compartir información con proveedores de servicios que nos ayudan a operar nuestro negocio, 
                siempre bajo estrictas condiciones de confidencialidad.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">4. Seguridad de los Datos</h2>
              <p className="text-muted-foreground">
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal 
                contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">5. Tus Derechos</h2>
              <p className="text-muted-foreground">
                Tienes derecho a acceder, rectificar o eliminar tus datos personales. Para ejercer estos derechos, 
                contáctanos a través de nuestros canales oficiales.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">6. Cookies</h2>
              <p className="text-muted-foreground">
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en nuestro sitio web. 
                Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl mb-4">7. Contacto</h2>
              <p className="text-muted-foreground">
                Si tienes preguntas sobre esta política de privacidad, contáctanos en:{' '}
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

export default PrivacyPolicyPage;
