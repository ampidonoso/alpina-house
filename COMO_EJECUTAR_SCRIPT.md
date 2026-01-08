# 📝 Cómo Ejecutar el Script para Subir a GitHub

## 🖥️ Pasos Detallados

### 1. Abrir la Terminal

**En macOS:**
- Presiona `Cmd + Espacio` para abrir Spotlight
- Escribe "Terminal" y presiona Enter
- O ve a: Aplicaciones > Utilidades > Terminal

### 2. Navegar al Directorio del Proyecto

En la terminal, escribe:

```bash
cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"
```

Presiona Enter.

### 3. Verificar que Estás en el Lugar Correcto

Verifica que estás en el directorio correcto:

```bash
pwd
```

Debería mostrar: `/Users/amparodonoso/Downloads/ALPINA HOUSE`

### 4. Verificar que el Script Existe

```bash
ls -la push-to-github.sh
```

Deberías ver el archivo listado.

### 5. Crear el Repositorio en GitHub PRIMERO

**IMPORTANTE:** Antes de ejecutar el script, debes crear el repositorio en GitHub:

1. Ve a: https://github.com/new
2. **Nombre del repositorio:** `alpina-house` (o el que prefieras)
3. **Descripción:** "Alpina House - Prefabricated houses website"
4. Elige: **Público** o **Privado**
5. **⚠️ NO marques** "Add a README file"
6. **⚠️ NO marques** "Add .gitignore"
7. **⚠️ NO marques** "Choose a license"
8. Click en el botón verde **"Create repository"**

### 6. Ejecutar el Script

Una vez creado el repositorio en GitHub, ejecuta:

```bash
./push-to-github.sh TU_USUARIO_GITHUB
```

**Reemplaza `TU_USUARIO_GITHUB` con tu nombre de usuario de GitHub.**

**Ejemplo:**
```bash
./push-to-github.sh amparodonoso
```

### 7. Si el Script No Funciona

Si aparece un error de permisos, ejecuta:

```bash
chmod +x push-to-github.sh
./push-to-github.sh TU_USUARIO_GITHUB
```

---

## 🔄 Alternativa: Comandos Manuales

Si prefieres hacerlo manualmente (sin script):

```bash
# 1. Navegar al proyecto
cd "/Users/amparodonoso/Downloads/ALPINA HOUSE"

# 2. Agregar el remote (reemplaza TU_USUARIO con tu usuario)
git remote add origin https://github.com/TU_USUARIO/alpina-house.git

# 3. Subir el código
git push -u origin main
```

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde veo mi usuario de GitHub?**
R: En la esquina superior derecha de GitHub.com, haz click en tu avatar. Tu usuario aparece en la URL: `github.com/TU_USUARIO`

**P: ¿Qué pasa si ya tengo un remote?**
R: El script te preguntará si quieres reemplazarlo. O puedes eliminarlo manualmente:
```bash
git remote remove origin
```

**P: ¿Cómo sé si funcionó?**
R: Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/alpina-house`
Deberías ver todos los archivos del proyecto.

---

## 📞 Si Tienes Problemas

1. Verifica que creaste el repositorio en GitHub
2. Verifica que usaste el nombre de usuario correcto
3. Verifica tu conexión a internet
4. Si usas autenticación de dos factores, necesitarás un token personal
