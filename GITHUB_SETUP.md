# Instrucciones para Subir a GitHub

## ✅ Estado Actual
- ✅ Repositorio git inicializado
- ✅ Todos los archivos agregados
- ✅ Commit inicial realizado

## 📋 Pasos para Subir a GitHub

### Opción 1: Crear Repositorio Manualmente

1. **Crear el repositorio en GitHub:**
   - Ve a: https://github.com/new
   - Nombre: `alpina-house` (o el que prefieras)
   - Descripción: "Alpina House - Prefabricated houses website with native Chilean tree inspiration"
   - Elige: Público o Privado
   - **NO marques** "Initialize with README"
   - Click en "Create repository"

2. **Conectar y subir:**
   ```bash
   cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"
   git remote add origin https://github.com/TU_USUARIO/alpina-house.git
   git branch -M main
   git push -u origin main
   ```

   (Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub)

### Opción 2: Usar GitHub CLI (si está autenticado)

```bash
cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"
gh auth login
gh repo create alpina-house --public --source=. --remote=origin --push
```

## 🔐 Autenticación GitHub CLI

Si quieres usar GitHub CLI:

```bash
gh auth login
```

Sigue las instrucciones para autenticarte.

## 📝 Información del Proyecto

- **Nombre**: Alpina House
- **Descripción**: Website for prefabricated houses inspired by native Chilean trees (Raulí & Canelo)
- **Tecnologías**: React, TypeScript, Vite, Tailwind CSS, Supabase
- **Características**:
  - Glassmorphism design
  - Native tree inspiration (Nothofagus alpina & Drimys winteri)
  - Configurator with immersive UX
  - Admin panel
  - Quote system

## 🚀 Después de Subir

Una vez subido, puedes:
- Configurar GitHub Pages para deploy
- Agregar GitHub Actions para CI/CD
- Invitar colaboradores
- Configurar issues y proyectos
