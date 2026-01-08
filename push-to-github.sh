#!/bin/bash

# Script para subir Alpina House a GitHub
# Uso: ./push-to-github.sh TU_USUARIO_GITHUB

if [ -z "$1" ]; then
    echo "❌ Error: Necesitas proporcionar tu usuario de GitHub"
    echo ""
    echo "Uso: ./push-to-github.sh TU_USUARIO_GITHUB"
    echo ""
    echo "Ejemplo: ./push-to-github.sh amparodonoso"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME="alpina-house"

echo "🚀 Subiendo Alpina House a GitHub..."
echo ""

# Verificar si ya existe el remote
if git remote get-url origin &>/dev/null; then
    echo "⚠️  Ya existe un remote 'origin'"
    echo "¿Deseas reemplazarlo? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git remote remove origin
    else
        echo "❌ Operación cancelada"
        exit 1
    fi
fi

# Agregar remote
echo "📡 Agregando remote origin..."
git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Verificar si el repositorio existe
echo "🔍 Verificando repositorio..."
if ! gh repo view "${GITHUB_USER}/${REPO_NAME}" &>/dev/null; then
    echo ""
    echo "⚠️  El repositorio no existe en GitHub"
    echo ""
    echo "Por favor crea el repositorio primero:"
    echo "1. Ve a: https://github.com/new"
    echo "2. Nombre: ${REPO_NAME}"
    echo "3. NO marques 'Initialize with README'"
    echo "4. Click en 'Create repository'"
    echo ""
    echo "Luego ejecuta este script nuevamente."
    exit 1
fi

# Push
echo "📤 Subiendo código..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Éxito! El código ha sido subido a GitHub"
    echo ""
    echo "🔗 Repositorio: https://github.com/${GITHUB_USER}/${REPO_NAME}"
else
    echo ""
    echo "❌ Error al subir. Verifica:"
    echo "   - Que el repositorio exista en GitHub"
    echo "   - Que tengas permisos de escritura"
    echo "   - Tu conexión a internet"
fi
