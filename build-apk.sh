#!/bin/bash
# ============================================================
# MIYAGUI OFFLINE v2.0 - SCRIPT DE CONSTRUCCION APK
# ============================================================
# Este script automatiza todo el proceso de construccion del APK
# Requiere: Node.js, npm, Java 17, Android SDK

set -e  # Detenerse en cualquier error

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     MIYAGUI OFFLINE v2.0 - BUILD SCRIPT                     ║"
echo "║     Asistente Tactico Hibrido (Online/Offline)              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcion para verificar comandos
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============================================================
# PASO 0: VERIFICAR DEPENDENCIAS
# ============================================================
echo -e "${BLUE}[0/7] Verificando dependencias...${NC}"

MISSING_DEPS=0

if ! command_exists node; then
    echo -e "${RED}❌ Node.js no encontrado${NC}"
    echo "   Instala Node.js 18+ desde: https://nodejs.org/"
    MISSING_DEPS=1
else
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version $NODE_VERSION (requiere 18+)${NC}"
        MISSING_DEPS=1
    else
        echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    fi
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm no encontrado${NC}"
    MISSING_DEPS=1
else
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
fi

if ! command_exists java; then
    echo -e "${RED}❌ Java no encontrado${NC}"
    echo "   Instala OpenJDK 17:"
    echo "   Ubuntu/Debian: sudo apt install openjdk-17-jdk"
    echo "   macOS: brew install openjdk@17"
    echo "   Windows: Descarga desde Oracle o Adoptium"
    MISSING_DEPS=1
else
    JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
    if [ "$JAVA_VERSION" != "17" ]; then
        echo -e "${YELLOW}⚠️ Java $JAVA_VERSION (recomendado: 17)${NC}"
    else
        echo -e "${GREEN}✅ Java 17${NC}"
    fi
fi

# Verificar ANDROID_HOME
if [ -z "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠️ ANDROID_HOME no definido${NC}"
    echo "   Si no tienes Android SDK instalado, el script lo instalara automaticamente."
else
    echo -e "${GREEN}✅ ANDROID_HOME=$ANDROID_HOME${NC}"
fi

if [ $MISSING_DEPS -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Dependencias faltantes. Instalalas y vuelve a ejecutar.${NC}"
    exit 1
fi

echo ""

# ============================================================
# PASO 1: INSTALAR DEPENDENCIAS NPM
# ============================================================
echo -e "${BLUE}[1/7] Instalando dependencias npm...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️ node_modules ya existe. Saltando...${NC}"
else
    npm install --no-audit --progress=false
    echo -e "${GREEN}✅ Dependencias instaladas${NC}"
fi

# ============================================================
# PASO 2: CONSTRUIR PROYECTO VITE
# ============================================================
echo -e "${BLUE}[2/7] Construyendo proyecto con Vite...${NC}"
npm run build
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: carpeta dist no generada${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado (dist/)${NC}"

# ============================================================
# PASO 3: INSTALAR CAPACITOR CLI Y ANDROID
# ============================================================
echo -e "${BLUE}[3/7] Configurando Capacitor...${NC}"

# Instalar Capacitor CLI global si no existe
if ! command_exists cap; then
    echo "Instalando @capacitor/cli globalmente..."
    npm install -g @capacitor/cli
fi

# Instalar dependencias de Capacitor localmente
npm install --save @capacitor/core @capacitor/android @capacitor/preferences @capacitor/filesystem @capacitor/device @capacitor/motion @capacitor/geolocation @capacitor/network @capacitor/clipboard

# ============================================================
# PASO 4: INICIALIZAR Y AGREGAR ANDROID
# ============================================================
echo -e "${BLUE}[4/7] Configurando proyecto Android...${NC}"

if [ ! -d "android" ]; then
    echo "Inicializando Capacitor..."
    npx cap init miyagui-offline com.miyagui.app --web-dir dist
    echo "Agregando plataforma Android..."
    npx cap add android
else
    echo -e "${YELLOW}⚠️ Proyecto Android ya existe. Sincronizando...${NC}"
fi

# Sincronizar cambios
npx cap sync

# ============================================================
# PASO 5: CONFIGURAR ANDROID SDK (si es necesario)
# ============================================================
echo -e "${BLUE}[5/7] Verificando Android SDK...${NC}"

if [ -z "$ANDROID_HOME" ] || [ ! -d "$ANDROID_HOME" ]; then
    echo -e "${YELLOW}⚠️ Android SDK no encontrado. Instalando...${NC}"

    # Crear directorio para SDK
    export ANDROID_HOME="$HOME/Android/Sdk"
    mkdir -p "$ANDROID_HOME"

    # Descargar command line tools
    CMD_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
    CMD_TOOLS_ZIP="/tmp/cmdline-tools.zip"

    echo "Descargando Android Command Line Tools..."
    wget -q "$CMD_TOOLS_URL" -O "$CMD_TOOLS_ZIP"

    # Extraer
    unzip -q "$CMD_TOOLS_ZIP" -d "$ANDROID_HOME/"
    mv "$ANDROID_HOME/cmdline-tools" "$ANDROID_HOME/latest"
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    mv "$ANDROID_HOME/latest" "$ANDROID_HOME/cmdline-tools/"

    # Configurar PATH
    export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools"

    # Aceptar licencias e instalar componentes
    echo "Aceptando licencias..."
    yes | sdkmanager --licenses >/dev/null 2>&1 || true

    echo "Instalando componentes Android..."
    sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0" >/dev/null 2>&1

    echo -e "${GREEN}✅ Android SDK instalado en $ANDROID_HOME${NC}"

    # Guardar en local.properties
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
else
    echo -e "${GREEN}✅ Android SDK encontrado en $ANDROID_HOME${NC}"
    # Asegurar que local.properties existe
    if [ ! -f "android/local.properties" ]; then
        echo "sdk.dir=$ANDROID_HOME" > android/local.properties
    fi
fi

# ============================================================
# PASO 6: CONFIGURAR PERMISOS ANDROID
# ============================================================
echo -e "${BLUE}[6/7] Configurando permisos Android...${NC}"

MANIFEST="android/app/src/main/AndroidManifest.xml"
if [ -f "$MANIFEST" ]; then
    # Verificar si ya tiene los permisos
    if ! grep -q "ACCESS_FINE_LOCATION" "$MANIFEST"; then
        echo "Agregando permisos necesarios..."

        # Crear backup
        cp "$MANIFEST" "$MANIFEST.bak"

        # Insertar permisos antes del cierre de </manifest>
        sed -i '/<\/manifest>/i     <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.BATTERY_STATS" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />' "$MANIFEST"

        echo -e "${GREEN}✅ Permisos agregados${NC}"
    else
        echo -e "${YELLOW}⚠️ Permisos ya configurados${NC}"
    fi
else
    echo -e "${RED}❌ AndroidManifest.xml no encontrado${NC}"
fi

# ============================================================
# PASO 7: CONSTRUIR APK
# ============================================================
echo -e "${BLUE}[7/7] Construyendo APK...${NC}"
echo ""

cd android

# Limpiar build anterior
./gradlew clean 2>/dev/null || true

# Construir APK debug
echo "Ejecutando Gradle assembleDebug..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║              ✅ APK CONSTRUIDO EXITOSAMENTE               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo -e "${GREEN}📱 APK: $APK_PATH${NC}"
        echo -e "${GREEN}📦 Tamaño: $APK_SIZE${NC}"
        echo ""
        echo "Para instalar en dispositivo conectado:"
        echo "  adb install $APK_PATH"
        echo ""
        echo "Para construir APK release (firmado):"
        echo "  cd android && ./gradlew assembleRelease"
        echo ""
    fi
else
    echo ""
    echo -e "${RED}❌ Error al construir APK${NC}"
    echo "Revisa los errores arriba. Comunes:"
    echo "  - JAVA_HOME no configurado"
    echo "  - Android SDK incompleto"
    echo "  - Gradle sin permisos de ejecucion: chmod +x android/gradlew"
    exit 1
fi

cd ..

echo ""
echo -e "${BLUE}🎉 Proceso completado!${NC}"
echo ""
