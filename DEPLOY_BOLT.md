# 🚀 Cómo Desplegar en Bolt.new

## 📋 Pasos para Deploy en Bolt.new

### 1. Preparar el Proyecto

Asegúrate de que el proyecto esté listo:

```bash
# Verificar que el build funciona
npm run build
```

Esto creará la carpeta `dist/` con los archivos de producción.

---

### 2. Conectar con Bolt.new

#### Opción A: Desde GitHub (Recomendado)

1. **Ve a Bolt.new**: https://bolt.new
2. **Crea una cuenta** o inicia sesión
3. **Click en "New Project"** o "Import from GitHub"
4. **Conecta tu repositorio**:
   - Selecciona: `ampidonoso/alpina-house`
   - Branch: `main`
5. **Bolt.new detectará automáticamente**:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### Opción B: Deploy Manual

1. Ve a https://bolt.new
2. Click en "New Project"
3. Selecciona "Static Site"
4. Configura:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Node Version**: `20`

---

### 3. Configurar Variables de Entorno

En Bolt.new, ve a **Settings > Environment Variables** y agrega:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_HUBSPOT_PORTAL_ID=tu_hubspot_portal_id
```

**⚠️ Importante**: Las variables deben empezar con `VITE_` para que Vite las incluya en el build.

---

### 4. Configuración Adicional

#### Archivo `bolt.json` (Opcional)

Ya está creado en la raíz del proyecto con:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "nodeVersion": "20"
}
```

Bolt.new debería detectar esto automáticamente.

---

### 5. Deploy

1. **Click en "Deploy"** en Bolt.new
2. Espera a que:
   - Instale dependencias (`npm install`)
   - Ejecute el build (`npm run build`)
   - Despliegue los archivos de `dist/`

3. **Obtén tu URL**: Bolt.new te dará una URL como:
   ```
   https://tu-proyecto.bolt.new
   ```

---

## 🔧 Configuración del Build

### Verificar que el Build Funciona

```bash
# En tu terminal local
npm run build

# Verificar que se creó la carpeta dist/
ls -la dist/
```

### Problemas Comunes

#### Error: "Cannot find module"
```bash
# Asegúrate de que todas las dependencias estén en package.json
npm install
```

#### Error: Variables de entorno no funcionan
- Verifica que las variables empiecen con `VITE_`
- Reinicia el build después de agregar variables

#### Error: Rutas no funcionan (404)
- Vite ya está configurado para SPA
- Bolt.new debería manejar esto automáticamente

---

## 📝 Checklist Pre-Deploy

- [ ] ✅ Build funciona localmente (`npm run build`)
- [ ] ✅ Variables de entorno configuradas en Bolt.new
- [ ] ✅ Repositorio conectado a Bolt.new
- [ ] ✅ Branch correcto seleccionado (`main`)
- [ ] ✅ Archivo `bolt.json` presente (opcional)

---

## 🔄 Continuous Deployment

Bolt.new soporta **deploy automático**:

- Cada vez que hagas `git push` a `main`
- Bolt.new detectará los cambios
- Ejecutará el build automáticamente
- Desplegará la nueva versión

---

## 🌐 Custom Domain

Para usar tu propio dominio:

1. Ve a **Settings > Domains** en Bolt.new
2. Agrega tu dominio
3. Configura los DNS según las instrucciones
4. Bolt.new proporciona SSL automático

---

## 📊 Monitoreo

Bolt.new proporciona:
- Logs de build en tiempo real
- Historial de deployments
- Métricas de performance

---

## 🆘 Troubleshooting

### Build Falla

1. Revisa los logs en Bolt.new
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que Node.js 20 esté seleccionado

### Variables de Entorno No Funcionan

1. Verifica que empiecen con `VITE_`
2. Reinicia el deployment después de agregarlas
3. Revisa los logs del build

### Rutas 404 en Producción

- Vite ya está configurado para SPA
- Bolt.new debería manejar esto automáticamente
- Si persiste, verifica la configuración de routing

---

## 📚 Recursos

- [Bolt.new Docs](https://docs.bolt.new)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

**¡Listo para deploy!** 🚀
