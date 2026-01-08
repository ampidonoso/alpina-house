# 🌲 Alpina House

> Prefabricated houses website inspired by native Chilean trees - Raulí (Nothofagus alpina) & Canelo (Drimys winteri)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## 📖 Sobre el Proyecto

**Alpina House** es una plataforma web moderna para la visualización y cotización de casas prefabricadas de alta gama. El diseño está inspirado en los árboles nativos chilenos que dan origen a los nombres de la marca:

- **Alpina** → Nothofagus alpina (Raulí) - Árbol nativo del sur de Chile, madera noble y resistente
- **Winteri** → Drimys winteri (Canelo) - Árbol sagrado mapuche, corteza aromática y cálida

El sitio combina elegancia minimalista, glassmorphism, y una experiencia de usuario inmersiva para presentar modelos de casas prefabricadas con transparencia total en precios y procesos.

---

## ✨ Características Principales

### 🎨 Diseño & UX
- **Glassmorphism** - Efectos de vidrio esmerilado en toda la interfaz
- **Inspiración Nativa** - Paleta de colores y texturas inspiradas en bosques chilenos
- **Animaciones Suaves** - Transiciones fluidas con Framer Motion
- **Responsive Design** - Optimizado para todos los dispositivos
- **Hero Inmersivo** - Sección hero full-screen estilo Lumi-pod

### 🏗️ Funcionalidades
- **Configurador Interactivo** - Journey de 4 pasos para personalizar tu casa
- **Cotizador Transparente** - Desglose claro de precios (estilo Samara)
- **Bento Grid Features** - Especificaciones técnicas en formato dashboard (estilo Jupe)
- **Galería de Modelos** - Visualización de proyectos con detalles completos
- **Panel de Administración** - Gestión completa de proyectos, imágenes y cotizaciones
- **Sistema de Cotizaciones** - Integración con HubSpot para seguimiento

### 🔧 Tecnologías
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Animaciones**: Framer Motion
- **Backend**: Supabase (PostgreSQL + Storage)
- **State Management**: TanStack Query
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Maps**: Leaflet

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18+ ([instalar con nvm](https://github.com/nvm-sh/nvm))
- **npm** o **bun**

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/ampidonoso/alpina-house.git
cd alpina-house

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 4. Iniciar servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
alpina-house/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── journey/        # Configurador (ModelCarousel, Visualizer, etc.)
│   │   ├── layout/         # Header, Footer, Navigation
│   │   ├── sections/       # Secciones de la página principal
│   │   ├── admin/          # Componentes del panel admin
│   │   └── ui/             # Componentes UI (shadcn)
│   ├── pages/              # Páginas principales
│   │   ├── Index.tsx       # Página principal
│   │   ├── ConfiguratorPage.tsx
│   │   ├── ModelsPage.tsx
│   │   └── admin/          # Panel de administración
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utilidades y helpers
│   ├── integrations/       # Integraciones (Supabase)
│   └── contexts/           # React Context providers
├── public/                 # Archivos estáticos
├── supabase/               # Migraciones y funciones
└── .github/workflows/      # CI/CD
```

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Build
npm run build        # Build de producción
npm run build:dev    # Build de desarrollo

# Calidad de Código
npm run lint         # Ejecutar ESLint

# Preview
npm run preview      # Preview del build de producción
```

---

## 🎨 Inspiración de Diseño

El proyecto combina lo mejor de tres referencias:

### 🏡 Samara.com
- **Transparencia en precios** - Desglose claro de costos
- **Product Architecture** - Casas como productos
- **Proceso lineal** - 4 pasos claros y simples

### 📊 Jupe.com
- **Bento Grid Layout** - Tarjetas de diferentes tamaños
- **Technical Dashboard** - Métricas y números grandes
- **Glassmorphism** - Efectos de vidrio esmerilado

### 🌿 Lumi-pod.com
- **Hero Full-Screen** - Imagen ocupa 100% de la pantalla
- **Fotografía First** - La imagen hace el trabajo principal
- **Minimal Overlay** - Gradientes sutiles, no invasivos

---

## 🌳 Inspiración Nativa

### Colores y Texturas

El diseño incorpora elementos visuales inspirados en:

- **Raulí (Nothofagus alpina)**: Verdes profundos del bosque, tonos gris-marrón de la corteza
- **Canelo (Drimys winteri)**: Verdes brillantes, tonos cálidos de la corteza aromática

Paleta de colores definida en `src/index.css`:
- `--rauli-forest`: Verde bosque profundo
- `--rauli-bark`: Gris-marrón de corteza
- `--canelo-leaf`: Verde brillante
- `--canelo-bark`: Tono cálido aromático

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_HUBSPOT_PORTAL_ID=tu_hubspot_portal_id
```

---

## 📦 Características Técnicas

### Performance
- ✅ Lazy loading de imágenes
- ✅ Code splitting automático
- ✅ Optimización de assets
- ✅ Scroll listeners con `passive: true`

### SEO
- ✅ Meta tags dinámicos (OG, Twitter Card)
- ✅ Schema.org JSON-LD
- ✅ Sitemap dinámico
- ✅ Robots.txt configurado

### Accesibilidad
- ✅ Skip links
- ✅ Focus states mejorados
- ✅ Semantic HTML
- ✅ ARIA labels

### Seguridad
- ✅ Content Security Policy (CSP)
- ✅ Error Boundaries
- ✅ Validación de formularios con Zod

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Commits

Usa prefijos descriptivos:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `style:` - Cambios de estilo/estética
- `docs:` - Documentación
- `refactor:` - Refactorización
- `test:` - Tests

---

## 📄 Licencia

Este proyecto es privado y propiedad de Alpina House.

---

## 🔗 Enlaces Útiles

- **Repositorio**: https://github.com/ampidonoso/alpina-house
- **Documentación de Mejoras**: Ver archivos `MEJORAS_*.md` en la raíz
- **Inspiración Nativa**: Ver `INSPIRACION_NATIVA.md`

---

## 👥 Autores

- **Alpina House Team**

---

## 🙏 Agradecimientos

- Inspiración de diseño de [Samara.com](https://samara.com), [Jupe.com](https://jupe.com), y [Lumi-pod.com](https://lumi-pod.com)
- Comunidad de React y TypeScript
- shadcn/ui por los componentes base

---

**Hecho con ❤️ en el sur de Chile** 🌲
