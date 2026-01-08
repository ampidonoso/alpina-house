# 🚀 Deploy Directo - Sin Lovable ni Bolt

Guía para hacer deploy directo en diferentes plataformas sin pasar por Lovable o Bolt.new.

---

## 🎯 Opciones de Deploy Directo

### 1. **Vercel** (Recomendado - Más Fácil) ⭐

#### Pasos:

1. **Instalar Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login en Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"
   vercel
   ```

4. **Seguir las instrucciones**:
   - ¿Quieres sobrescribir? → `Y`
   - ¿Cuál es el nombre del proyecto? → `alpina-house` (o el que prefieras)
   - ¿Cuál es el directorio? → `./` (raíz)

5. **Variables de entorno**:
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_HUBSPOT_PORTAL_ID
   ```

6. **Deploy de producción**:
   ```bash
   vercel --prod
   ```

#### O desde la Web:

1. Ve a: https://vercel.com
2. Click en "Add New Project"
3. Importa desde GitHub: `ampidonoso/alpina-house`
4. Vercel detectará automáticamente:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Agrega variables de entorno
6. Click en "Deploy"

**✅ Ya está configurado**: El archivo `vercel.json` está listo.

---

### 2. **Netlify** (Muy Fácil) ⭐

#### Desde la Web:

1. Ve a: https://app.netlify.com
2. Click en "Add new site" > "Import an existing project"
3. Conecta con GitHub
4. Selecciona: `ampidonoso/alpina-house`
5. Netlify detectará automáticamente:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Agrega variables de entorno en "Site settings" > "Environment variables"
7. Click en "Deploy site"

**✅ Ya está configurado**: El archivo `netlify.toml` está listo.

#### Desde CLI:

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"
netlify deploy --prod
```

---

### 3. **GitHub Pages** (Gratis)

#### Configuración Automática:

Ya está configurado el workflow en `.github/workflows/deploy.yml`

#### Pasos:

1. **Ve a tu repositorio en GitHub**: https://github.com/ampidonoso/alpina-house
2. **Settings** > **Pages**
3. **Source**: Selecciona "GitHub Actions"
4. **Agrega Secrets** (Settings > Secrets and variables > Actions):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_HUBSPOT_PORTAL_ID`
5. **Haz un push** o ejecuta el workflow manualmente

Tu sitio estará en: `https://ampidonoso.github.io/alpina-house`

---

### 4. **Cloudflare Pages** (Gratis y Rápido)

#### Pasos:

1. Ve a: https://dash.cloudflare.com
2. **Pages** > **Create a project**
3. **Connect to Git** > Selecciona GitHub
4. Selecciona: `ampidonoso/alpina-house`
5. Configura:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
6. Agrega variables de entorno
7. Click en "Save and Deploy"

---

### 5. **Render** (Gratis)

#### Pasos:

1. Ve a: https://render.com
2. **New** > **Static Site**
3. Conecta con GitHub
4. Selecciona: `ampidonoso/alpina-house`
5. Configura:
   - **Name**: `alpina-house`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
6. Agrega variables de entorno
7. Click en "Create Static Site"

---

## 🚀 Deploy Rápido (Recomendado)

### Opción Más Rápida: Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Ir al proyecto
cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"

# 3. Login
vercel login

# 4. Deploy (primera vez)
vercel

# 5. Agregar variables de entorno
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_HUBSPOT_PORTAL_ID production

# 6. Deploy de producción
vercel --prod
```

**¡Listo!** Tendrás una URL como: `https://alpina-house.vercel.app`

---

## 📋 Variables de Entorno Necesarias

Todas las plataformas necesitan estas variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_HUBSPOT_PORTAL_ID=tu_portal_id
```

**Importante**: Deben empezar con `VITE_` para que Vite las incluya en el build.

---

## ✅ Archivos de Configuración Creados

- ✅ `vercel.json` - Para Vercel
- ✅ `netlify.toml` - Para Netlify
- ✅ `public/_redirects` - Para rutas SPA
- ✅ `.github/workflows/deploy.yml` - Para GitHub Pages

---

## 🎯 Recomendación

**Para empezar rápido**: Usa **Vercel** desde la web:
1. https://vercel.com
2. Import from GitHub
3. Selecciona tu repo
4. Deploy

**Es gratis y automático** 🚀

---

## 🔧 Troubleshooting

### Error: "Cannot find module"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` antes del build

### Rutas 404 en producción
- El archivo `public/_redirects` y `vercel.json` ya están configurados
- Asegúrate de que el hosting soporte SPA routing

### Variables de entorno no funcionan
- Verifica que empiecen con `VITE_`
- Reinicia el deployment después de agregarlas

---

**¡Elige la plataforma que prefieras y deploya!** 🎉
