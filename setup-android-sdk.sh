#!/bin/bash
# Setup script para GitHub Actions - instala Android SDK

set -e

ANDROID_SDK_ROOT="$HOME/Android/Sdk"
CMDLINE_TOOLS_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

# Crear directorio SDK
mkdir -p "$ANDROID_SDK_ROOT/cmdline-tools"

# Descargar command line tools
curl -sL "$CMDLINE_TOOLS_URL" -o /tmp/cmdline-tools.zip
unzip -q /tmp/cmdline-tools.zip -d "$ANDROID_SDK_ROOT/cmdline-tools/"
mv "$ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools" "$ANDROID_SDK_ROOT/cmdline-tools/latest"

# Configurar variables de entorno
echo "ANDROID_HOME=$ANDROID_SDK_ROOT" >> "$GITHUB_ENV"
echo "ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT" >> "$GITHUB_ENV"
echo "$ANDROID_SDK_ROOT/cmdline-tools/latest/bin" >> "$GITHUB_PATH"
echo "$ANDROID_SDK_ROOT/platform-tools" >> "$GITHUB_PATH"

# Aceptar licencias
yes | sdkmanager --licenses >/dev/null 2>&1 || true

# Instalar componentes necesarios
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

echo "✅ Android SDK instalado en $ANDROID_SDK_ROOT"
