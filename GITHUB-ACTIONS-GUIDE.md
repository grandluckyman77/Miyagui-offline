# 🚀 COMPILAR APK EN GITHUB ACTIONS

Este proyecto incluye un workflow de GitHub Actions que compila el APK automáticamente.

## 📋 PASOS PARA USAR

### 1. Subir a GitHub

```bash
# Inicializar repo (si no lo has hecho)
git init
git add .
git commit -m "Miyagui Offline v2.0"

# Crear repo en GitHub y subir
git remote add origin https://github.com/TU_USUARIO/miyagui-offline.git
git branch -M main
git push -u origin main
```

### 2. Ejecutar Workflow

Una vez subido a GitHub, el workflow se ejecuta automáticamente en cada push a `main`.

Para ejecutar manualmente:
1. Ve a tu repo en GitHub
2. Click en **Actions** tab
3. Selecciona **Build Miyagui APK**
4. Click en **Run workflow** → **Run workflow**

### 3. Descargar APK

Después de que el workflow termine (toma ~5-10 minutos):
1. Ve a **Actions** tab
2. Click en el workflow más reciente
3. Desplázate hasta **Artifacts**
4. Descarga `miyagui-debug-apk`

El APK estará en: `miyagui-debug-apk/app-debug.apk`

## 🏗️ ESTRUCTURA DEL WORKFLOW

```
Build Miyagui APK
├── build-web (Job 1)
│   ├── Checkout code
│   ├── Setup Node.js 20
│   ├── npm ci
│   ├── npm run build (Vite)
│   └── Upload dist/ artifact
│
├── build-apk (Job 2 - depende de build-web)
│   ├── Checkout code
│   ├── Setup Node.js 20
│   ├── Setup Java 17 (Temurin)
│   ├── Setup Android SDK
│   ├── Install SDK components
│   ├── Download web artifact
│   ├── Install Capacitor
│   ├── Init Android project
│   ├── Sync Capacitor
│   ├── Configure permissions
│   ├── Build Debug APK (gradlew assembleDebug)
│   ├── Upload Debug APK artifact
│   ├── Build Release APK (gradlew assembleRelease)
│   └── Upload Release APK artifact
│
└── create-release (Job 3 - solo en tags)
    ├── Download APKs
    └── Create GitHub Release con APKs adjuntos
```

## ⚙️ CONFIGURACIÓN AVANZADA

### Variables de entorno (opcional)

Puedes configurar estas variables en GitHub:
- `Settings` → `Secrets and variables` → `Actions` → `Variables`

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_VERSION` | Versión de Node.js | 20 |
| `JAVA_VERSION` | Versión de Java | 17 |

### Secrets (para firma de APK)

Para firmar el APK release:
- `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

| Secret | Descripción |
|--------|-------------|
| `KEYSTORE_BASE64` | Keystore en base64 |
| `KEYSTORE_PASSWORD` | Password del keystore |
| `KEY_ALIAS` | Alias de la key |
| `KEY_PASSWORD` | Password de la key |

### Crear keystore:

```bash
keytool -genkey -v -keystore miyagui.keystore -alias miyagui -keyalg RSA -keysize 2048 -validity 10000
# Convertir a base64:
base64 miyagui.keystore | pbcopy  # macOS
base64 miyagui.keystore | xclip -selection clipboard  # Linux
```

## 🐛 TROUBLESHOOTING EN GITHUB ACTIONS

### Error: "sdkmanager: command not found"
El workflow usa `android-actions/setup-android@v3` que instala automáticamente el SDK.

### Error: "Could not resolve all dependencies"
Añade al workflow:
```yaml
- name: Clean Gradle
  run: cd android && ./gradlew clean
```

### Error: "Out of memory"
Añade:
```yaml
env:
  GRADLE_OPTS: -Dorg.gradle.jvmargs="-Xmx4g"
```

## 📦 ARTEFACTOS GENERADOS

Cada ejecución del workflow genera:

| Artefacto | Descripción | Retención |
|-----------|-------------|-----------|
| `web-dist` | Build web Vite | 5 días |
| `miyagui-debug-apk` | APK debug (sin firmar) | 30 días |
| `miyagui-release-apk` | APK release (sin firmar) | 30 días |

## 🎯 RELEASES AUTOMÁTICOS

Cuando creas un tag (`v1.0.0`), el workflow crea automáticamente un GitHub Release con los APKs:

```bash
git tag -a v1.0.0 -m "Primera versión estable"
git push origin v1.0.0
```

El release aparecerá en:
`https://github.com/TU_USUARIO/miyagui-offline/releases`
