// Image Slots Configuration
// Defines all image locations across the site with descriptions

import heroPoster from "@/assets/hero-refugio.jpg";
import alpinaHouseLogo from "@/assets/alpina-house-logo.png";
import alpinaLogo from "@/assets/alpina-logo.png";
import livingRoomSofa from "@/assets/living-room-sofa.png";
import puertaEnredaderas from "@/assets/puerta-enredaderas.png";
import casaModernaBosque from "@/assets/casa-moderna-bosque.png";
import casaCanelo from "@/assets/casa-canelo-new.jpg";
import heroAlpina from "@/assets/hero-alpina.jpg";
import livingRoom from "@/assets/living-room.png";
import refugioNievePanorama from "@/assets/refugio-nieve-panorama.jpg";
import fichaRefugio from "@/assets/ficha-refugio.png";
import galeriaRefugio1 from "@/assets/galeria-refugio-1.png";
import galeriaRefugio2 from "@/assets/galeria-refugio-2.png";
import galeriaRefugio3 from "@/assets/galeria-refugio-3.jpg";
import galeriaRefugio4 from "@/assets/galeria-refugio-4.jpg";
import galeriaRefugio5 from "@/assets/galeria-refugio-5.jpg";
import galeriaRefugio6 from "@/assets/galeria-refugio-6.jpg";
import galeriaRefugio7 from "@/assets/galeria-refugio-7.jpg";
import galeriaRefugio8 from "@/assets/galeria-refugio-8.jpg";

export type AssetCategory = 'logo' | 'hero' | 'section' | 'gallery' | 'background';
export type AssetPage = 'global' | 'home' | 'about' | 'models' | 'services' | 'configurator';

export interface ImageSlot {
  key: string;
  name: string;
  description: string;
  page: AssetPage;
  category: AssetCategory;
  defaultImage: string;
  aspectRatio?: string;
}

export const imageSlots: ImageSlot[] = [
  // ===== GLOBAL =====
  {
    key: 'logo_main',
    name: 'Logo Principal',
    description: 'Logo de Alpina House en el header y navegación',
    page: 'global',
    category: 'logo',
    defaultImage: alpinaLogo,
  },
  {
    key: 'logo_hero',
    name: 'Logo Hero',
    description: 'Logo grande blanco que aparece en el hero de inicio',
    page: 'global',
    category: 'logo',
    defaultImage: alpinaHouseLogo,
  },

  // ===== HOME - HERO =====
  {
    key: 'hero_home_bg',
    name: 'Hero Inicio - Fondo',
    description: 'Imagen de fondo del hero principal (cuando no hay videos)',
    page: 'home',
    category: 'hero',
    defaultImage: heroPoster,
    aspectRatio: '16/9',
  },

  // ===== HOME - MANIFESTO =====
  {
    key: 'section_manifesto',
    name: 'Sección Manifiesto',
    description: 'Imagen del sofá con vista al bosque junto al texto "El verdadero lujo"',
    page: 'home',
    category: 'section',
    defaultImage: livingRoomSofa,
    aspectRatio: '4/5',
  },

  // ===== HOME - FILOSOFÍA (DUAL COLUMN) =====
  {
    key: 'section_philosophy_1',
    name: 'Filosofía - Izquierda',
    description: 'Imagen izquierda en la sección "El verdadero lujo es" (puerta con plantas)',
    page: 'home',
    category: 'section',
    defaultImage: puertaEnredaderas,
    aspectRatio: '1/1',
  },
  {
    key: 'section_philosophy_2',
    name: 'Filosofía - Derecha',
    description: 'Imagen derecha en la sección "El verdadero lujo es" (casa en bosque)',
    page: 'home',
    category: 'section',
    defaultImage: casaModernaBosque,
    aspectRatio: '1/1',
  },

  // ===== HOME - ADAPTABILIDAD =====
  {
    key: 'section_adaptability',
    name: 'Adaptabilidad Topográfica',
    description: 'Imagen grande junto al texto de adaptabilidad de terreno',
    page: 'home',
    category: 'section',
    defaultImage: casaCanelo,
    aspectRatio: '1/1',
  },

  // ===== HOME - CASOS DE ÉXITO =====
  {
    key: 'success_hero',
    name: 'Casos de Éxito - Panorámica',
    description: 'Imagen panorámica principal de Casa Refugio en la nieve',
    page: 'home',
    category: 'hero',
    defaultImage: refugioNievePanorama,
    aspectRatio: '21/9',
  },

  // ===== HOME - GALERÍA REFUGIO =====
  {
    key: 'gallery_refugio_1',
    name: 'Galería Refugio 1 - Ficha Técnica',
    description: 'Primera imagen de la galería: ficha técnica del modelo',
    page: 'home',
    category: 'gallery',
    defaultImage: fichaRefugio,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_2',
    name: 'Galería Refugio 2 - Exterior Nieve',
    description: 'Segunda imagen de la galería: casa en exterior nevado',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio1,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_3',
    name: 'Galería Refugio 3 - Exterior Bosque',
    description: 'Tercera imagen de la galería: exterior con árboles',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio2,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_4',
    name: 'Galería Refugio 4 - Atardecer',
    description: 'Cuarta imagen de la galería: vista al atardecer',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio3,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_5',
    name: 'Galería Refugio 5 - Vista Montaña',
    description: 'Quinta imagen de la galería: interior con vista a la montaña',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio4,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_6',
    name: 'Galería Refugio 6 - Cocina',
    description: 'Sexta imagen de la galería: cocina moderna',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio5,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_7',
    name: 'Galería Refugio 7 - Pasillo',
    description: 'Séptima imagen de la galería: pasillo interior',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio6,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_8',
    name: 'Galería Refugio 8 - Atardecer 2',
    description: 'Octava imagen de la galería: otro ángulo al atardecer',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio7,
    aspectRatio: '1/1',
  },
  {
    key: 'gallery_refugio_9',
    name: 'Galería Refugio 9 - Cocina Escalera',
    description: 'Novena imagen de la galería: cocina con escalera',
    page: 'home',
    category: 'gallery',
    defaultImage: galeriaRefugio8,
    aspectRatio: '1/1',
  },

  // ===== ABOUT PAGE =====
  {
    key: 'hero_about',
    name: 'Hero Quiénes Somos',
    description: 'Imagen principal en la sección de historia',
    page: 'about',
    category: 'hero',
    defaultImage: heroAlpina,
    aspectRatio: '4/5',
  },
  {
    key: 'section_about_grid_1',
    name: 'About - Grid Winteri 1',
    description: 'Primera imagen en el grid de Winteri Arquitectura (interior)',
    page: 'about',
    category: 'section',
    defaultImage: livingRoom,
  },
  {
    key: 'section_about_grid_2',
    name: 'About - Grid Winteri 2',
    description: 'Segunda imagen en el grid de Winteri Arquitectura (exterior)',
    page: 'about',
    category: 'section',
    defaultImage: casaCanelo,
  },
  {
    key: 'section_about_grid_3',
    name: 'About - Grid Winteri 3',
    description: 'Tercera imagen en el grid de Winteri Arquitectura (casa completa)',
    page: 'about',
    category: 'section',
    defaultImage: heroAlpina,
  },
];

// Helper to get slot by key
export const getSlotByKey = (key: string): ImageSlot | undefined => {
  return imageSlots.find(slot => slot.key === key);
};

// Group slots by page
export const getSlotsByPage = (page: AssetPage): ImageSlot[] => {
  return imageSlots.filter(slot => slot.page === page);
};

// Group slots by category
export const getSlotsByCategory = (category: AssetCategory): ImageSlot[] => {
  return imageSlots.filter(slot => slot.category === category);
};

// Category labels for UI
export const categoryLabels: Record<AssetCategory, string> = {
  logo: 'Logos',
  hero: 'Heroes',
  section: 'Secciones',
  gallery: 'Galería',
  background: 'Fondos',
};

// Page labels for UI
export const pageLabels: Record<AssetPage, string> = {
  global: 'Global',
  home: 'Inicio',
  about: 'Quiénes Somos',
  models: 'Modelos',
  services: 'Servicios',
  configurator: 'Configurador',
};
