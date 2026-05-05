# MIYAGUI OFFLINE v2.0

Asistente táctico híbrido 100% funcional - Online y Offline.

## 🚀 CONSTRUIR APK - INSTRUCCIONES RÁPIDAS

### Opción 1: Script Automático (Recomendado)

```bash
chmod +x build-apk.sh
./build-apk.sh
```

El script hace TODO automáticamente:
- Verifica dependencias
- Instala npm packages
- Construye con Vite
- Configura Capacitor
- Instala Android SDK (si falta)
- Construye el APK

### Opción 2: Manual Paso a Paso

#### Requisitos Previos
- **Node.js 18+** → https://nodejs.org/
- **Java 17 (OpenJDK)** → `sudo apt install openjdk-17-jdk`
- **Android SDK** → Se instala automático o manual desde https://developer.android.com/studio#command-tools

#### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Construir proyecto web
npm run build

# 3. Instalar Capacitor
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android

# 4. Inicializar Android
npx cap init miyagui-offline com.miyagui.app --web-dir dist
npx cap add android

# 5. Sincronizar
npx cap sync

# 6. Configurar SDK (si no tienes Android Studio)
# Descargar: https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
# Extraer en ~/Android/Sdk/cmdline-tools/latest/
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools
yes | sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"

# 7. Construir APK
cd android
./gradlew assembleDebug

# APK generado en:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📱 FUNCIONES IMPLEMENTADAS

### Modo Offline 100% Real
- ✅ Motor heurístico embebido con base de conocimiento táctica
- ✅ Persistencia local con IndexedDB (perfiles, proyectos, chat)
- ✅ Terminal funcional (encrypt, decrypt, hash, calc, battery, network)
- ✅ Telemetría real (acelerómetro, giroscopio, batería, red)
- ✅ Export/Import JSON de datos
- ✅ Service Worker para cacheo completo (PWA)

### Modo Online
- ✅ Integración Gemini API
- ✅ Integración Groq API (Llama, Mixtral)
- ✅ Auto-detección de conexión
- ✅ 3 modos: Auto, Solo Local, Solo API

### UI/UX
- ✅ Interfaz responsive (mobile/desktop)
- ✅ Tema oscuro táctico
- ✅ Animaciones con Framer Motion
- ✅ Markdown rendering
- ✅ Gestión de sesiones de chat
- ✅ Perfiles tácticos con análisis psicológico
- ✅ Gestor de proyectos

## 🏗️ STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 4 |
| Animations | Motion (Framer Motion) |
| Icons | Lucide React |
| Markdown | React Markdown |
| Database | IndexedDB (idb) |
| Mobile | Capacitor 7 |
| PWA | Vite PWA Plugin + Workbox |

## 📁 ESTRUCTURA DEL PROYECTO

```
miyagui-offline/
├── src/
│   ├── App.tsx              # Interfaz principal (7 tabs)
│   ├── MiyaguiEngine.ts     # Motor híbrido IA
│   ├── MiyaguiPrompts.ts    # Prompts del sistema
│   ├── MiyaguiTypes.ts      # Tipos TypeScript
│   ├── Database.ts          # Wrapper IndexedDB
│   ├── main.tsx             # Entry point + SW
│   └── index.css            # Estilos Tailwind
├── build-apk.sh             # Script automatizado
├── capacitor.config.json    # Config Android
├── vite.config.ts           # Config Vite + PWA
├── package.json             # Dependencias
└── index.html               # App shell
```

## 🔧 CONFIGURACIÓN DE APIs (Opcional)

Para usar modo online con APIs:

1. Obtén API Key de [Google AI Studio](https://aistudio.google.com/)
2. Obtén API Key de [Groq Cloud](https://console.groq.com/)
3. En la app: Configuración → Credenciales API → Ingresa las keys
4. Selecciona modo "Auto" o "Solo API"

## 🐛 TROUBLESHOOTING

### Error: "SDK location not found"
```bash
export ANDROID_HOME=$HOME/Android/Sdk
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### Error: "Permission denied" (gradlew)
```bash
chmod +x android/gradlew
```

### Error: "Unsupported class file major version"
```bash
# Java incorrecto. Instalar Java 17:
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Error: "Could not resolve all dependencies"
```bash
cd android
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
```

## 📄 LICENCIA

MIT - Uso libre para fines educativos y personales.

## 🤝 CONTRIBUCIONES

Pull requests bienvenidos. Para cambios mayores, abre un issue primero.
