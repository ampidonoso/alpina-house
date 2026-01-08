# 🤝 Cómo Trabajar en el Proyecto desde GitHub

## 📋 Opciones de Colaboración

### 1. **Trabajar Solo (Tú misma)**

#### Hacer Cambios Locales y Subirlos:

```bash
# 1. Hacer cambios en tu código
# (editar archivos en tu editor)

# 2. Ver qué archivos cambiaron
git status

# 3. Agregar los archivos modificados
git add .

# 4. Hacer commit con un mensaje descriptivo
git commit -m "Descripción de los cambios"

# 5. Subir los cambios a GitHub
git push
```

#### Ejemplo Completo:
```bash
# Editas algún archivo, por ejemplo src/pages/Index.tsx
# Luego:

git add .
git commit -m "Mejora en el hero section"
git push
```

---

### 2. **Trabajar con Colaboradores**

#### Invitar Colaboradores:

1. Ve a: https://github.com/ampidonoso/alpina-house
2. Click en **"Settings"** (Configuración)
3. En el menú lateral, click en **"Collaborators"**
4. Click en **"Add people"**
5. Ingresa el nombre de usuario o email del colaborador
6. Elige el nivel de acceso:
   - **Read**: Solo lectura
   - **Write**: Puede hacer cambios
   - **Admin**: Control total

#### El Colaborador Clona el Proyecto:

```bash
# El colaborador ejecuta:
git clone https://github.com/ampidonoso/alpina-house.git
cd alpina-house
npm install
```

---

### 3. **Trabajar desde Diferentes Computadoras**

#### En una Nueva Computadora:

```bash
# 1. Clonar el repositorio
git clone https://github.com/ampidonoso/alpina-house.git

# 2. Entrar al directorio
cd alpina-house

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno (si es necesario)
# Copiar .env.example a .env y llenar los valores

# 5. Iniciar el proyecto
npm run dev
```

#### Sincronizar Cambios:

```bash
# Traer los últimos cambios de GitHub
git pull

# O si hay cambios locales y remotos:
git pull origin main
```

---

### 4. **Usar GitHub Desktop (Interfaz Gráfica)**

Si prefieres una interfaz visual en lugar de comandos:

1. **Descargar GitHub Desktop**: https://desktop.github.com/
2. **Instalar y abrir**
3. **Agregar tu cuenta de GitHub**
4. **Clonar el repositorio** desde GitHub Desktop
5. **Hacer cambios** y usar los botones para commit y push

---

### 5. **Usar VS Code con GitHub**

#### Extensión GitHub en VS Code:

1. Abre VS Code
2. Instala la extensión "GitHub" o "GitLens"
3. Abre el proyecto: `File > Open Folder > ALPINA HOUSE`
4. Usa la interfaz de Git integrada para:
   - Ver cambios
   - Hacer commit
   - Push/Pull

---

## 🔄 Flujo de Trabajo Diario

### Trabajo Individual:

```bash
# 1. Verificar estado
git status

# 2. Ver cambios específicos
git diff

# 3. Agregar cambios
git add .

# 4. Commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad X"

# 5. Subir a GitHub
git push
```

### Trabajo en Equipo:

```bash
# 1. Antes de empezar, traer últimos cambios
git pull

# 2. Hacer tus cambios
# (editar archivos)

# 3. Agregar y commitear
git add .
git commit -m "fix: corregir bug en componente Y"

# 4. Subir cambios
git push

# 5. Si hay conflictos, resolverlos primero
```

---

## 📝 Convenciones de Mensajes de Commit

Usa mensajes descriptivos:

```bash
# Buenas prácticas:
git commit -m "feat: agregar configurador de modelos"
git commit -m "fix: corregir layout del hero section"
git commit -m "style: mejorar estética del BentoGrid"
git commit -m "docs: actualizar README con instrucciones"
git commit -m "refactor: optimizar componentes del configurador"
```

Prefijos comunes:
- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `style:` - Cambios de estilo/estética
- `docs:` - Documentación
- `refactor:` - Refactorización de código
- `test:` - Tests

---

## 🚨 Resolver Conflictos

Si trabajas en equipo y hay conflictos:

```bash
# 1. Traer cambios remotos
git pull

# 2. Si hay conflictos, Git te mostrará los archivos
# 3. Abre los archivos con conflictos
# 4. Busca las marcas <<<<<<< HEAD
# 5. Resuelve manualmente qué código mantener
# 6. Guarda los archivos
# 7. Agregar archivos resueltos
git add .
git commit -m "resolve: resolver conflictos en archivo X"
git push
```

---

## 🔐 Autenticación

### Si te pide usuario/contraseña:

GitHub ya no acepta contraseñas. Necesitas un **Personal Access Token**:

1. Ve a: https://github.com/settings/tokens
2. Click en **"Generate new token"** > **"Generate new token (classic)"**
3. Dale un nombre: "Alpina House Local"
4. Selecciona permisos: `repo` (todos los permisos de repositorio)
5. Click en **"Generate token"**
6. **Copia el token** (solo se muestra una vez)
7. Úsalo como contraseña cuando Git te la pida

### O usar SSH (más seguro):

```bash
# 1. Generar clave SSH (si no tienes)
ssh-keygen -t ed25519 -C "tu-email@ejemplo.com"

# 2. Copiar la clave pública
cat ~/.ssh/id_ed25519.pub

# 3. Agregar en GitHub:
# Settings > SSH and GPG keys > New SSH key

# 4. Cambiar remote a SSH
git remote set-url origin git@github.com:ampidonoso/alpina-house.git
```

---

## 📦 Comandos Útiles

```bash
# Ver historial de commits
git log --oneline

# Ver cambios antes de commitear
git diff

# Deshacer cambios en un archivo
git checkout -- nombre-archivo.tsx

# Ver qué branch estás usando
git branch

# Crear nueva rama
git checkout -b nombre-nueva-rama

# Cambiar de rama
git checkout main

# Ver remotes configurados
git remote -v
```

---

## ✅ Checklist de Trabajo Diario

- [ ] `git pull` - Traer últimos cambios
- [ ] Hacer tus cambios
- [ ] `git status` - Ver qué cambió
- [ ] `git add .` - Agregar cambios
- [ ] `git commit -m "mensaje"` - Commitear
- [ ] `git push` - Subir a GitHub

---

## 🆘 Si Algo Sale Mal

### Deshacer último commit (mantener cambios):
```bash
git reset --soft HEAD~1
```

### Deshacer cambios en archivos específicos:
```bash
git checkout -- nombre-archivo.tsx
```

### Ver ayuda de Git:
```bash
git help
git help push
```

---

**¡Ahora puedes trabajar en el proyecto desde cualquier lugar!** 🚀
