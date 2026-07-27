# Introducción

Este proyecto forma parte de DualEat, una plataforma gastronómica multiplataforma (web y móvil) que busca integrar la experiencia de comer fuera y cocinar en casa. La aplicación móvil, desarrollada con React Native bajo el ecosistema de Expo, actúa como el canal principal para que los usuarios interactúen con el sistema, permitiéndoles descubrir locales, realizar pedidos, explorar recetas y participar en la comunidad desde sus dispositivos.

Entre sus funcionalidades principales, se incluyen:

- Autenticación segura e integración fluida con el ecosistema de la plataforma (incluyendo OAuth y validación biométrica).
- Exploración de locales gastronómicos mediante mapas interactivos y servicios de geolocalización.
- Proceso de pedido completo con seguimiento en tiempo real de los estados de la orden.
- Interfaz gráfica moderna, responsiva y adaptable a modos claro/oscuro gracias a la potencia de NativeWind y TailwindCSS.
- Carga de imágenes o reconocimiento OCR (accediendo a la cámara nativa del dispositivo).
- Acceso a funcionalidades sociales como foros, recomendaciones y mensajería móvil instantánea.
- Notificaciones push para mantener al usuario informado sobre el estado de sus pedidos, comunidades y promociones.

El objetivo principal de esta aplicación móvil es ofrecer una interfaz intuitiva, moderna y escalable, garantizando una excelente "Developer Experience" e integrando de forma fluida el hardware del dispositivo con los potentes servicios ofrecidos por nuestra API de DualEat.

## Tecnologías aplicadas

### Mobile App (Frontend Nativo)

- **Framework**: React Native 0.81 + React 19
- **Core Platform**: Expo SDK 54
- **Routing**: Expo Router 6 (Enrutamiento basado en archivos)
- **Styling**: Tailwind CSS 3 + NativeWind 4
- **Gestos y Animaciones**: React Native Reanimated + Gesture Handler
- **Mapas y Geolocalización**: React Native Maps + Expo Location
- **Integraciones Nativas**: Expo Camera, Expo Image Picker, Expo Notifications
- **HTTP Client**: Axios
- **Almacenamiento Local**: Async Storage + Expo Secure Store
- **WebSockets**: Socket.IO Client
- **Auth**: Expo Auth Session + Local Authentication
- **Gestión de UI Avanzada**: Gorhom Bottom Sheet + React Native Toast Message
- **Date Utils**: date-fns

## Scripts para levantar

El sistema se logra ejecutar funcionalmente en el entorno de desarrollo usando Expo CLI. Debes posicionarte dentro de la carpeta **(cd .\client\)**, habiendo ejecutado `pnpm install` para instalar las dependencias previas. Para arrancar de manera directa en el emulador de Android (si está corriendo), utiliza `npx run dev:android`.

## Instalación

### Prerrequisitos

- Node.js 18+
- Gestor de paquetes `pnpm` (`npm install -g pnpm`)
- Entorno de desarrollo para React Native (Android Studio / emulador, o dispositivo físico con modo depuración)
- Git

1. Clonación

- `https://github.com/Galoniax/DualEat-Mobile.git`

2. Posicionamiento

- `cd .\client\`

3. Dependencias

- `pnpm install`

4. Variables de entorno

- Configurar el archivo `.env` en base a las API keys y URLs del backend (ver documentación interna).

5. Ejecución en Android (Emulador)

- `npx expo run:android`

Se puede correr el proyecto e interactuar con el menú de Expo directamente usando:
- `npx expo start`

---

## Despliegue a Producción

La construcción y publicación de la aplicación están simplificadas con las herramientas (EAS) de Expo.

### Configurando EAS (Expo Application Services)

Para generar los ejecutables (APK/AAB) o publicar directamente en las tiendas, necesitas tener instalada la CLI de EAS:
```bash
npm install -g eas-cli
```

### Build para Android

```bash
# Generalmente requerirá inicio de sesión en tu cuenta de Expo
eas build -p android --profile production
```

El proyecto ya cuenta con su archivo `eas.json` interno con las configuraciones básicas preestablecidas.

---

## Dependencias

### Mobile (Client)

- **@expo/vector-icons** (^15.0.3) / **react-native-vector-icons** (^10.3.0): Paquetes para la importación y renderizado de iconografía estándar.
- **@gorhom/bottom-sheet** (^5.2.7): Componente de hojas de diálogo inferiores avanzado, optimizado y con soporte a gestos reanimated.
- **@react-native-async-storage/async-storage** (2.2.0): Base de datos de valor-clave en texto simple y local para el almacenamiento persistente asíncrono.
- **@react-navigation/bottom-tabs** (^7.4.0) / **@react-navigation/elements** (^2.6.3): Elementos y barras de navegación fundamentales de React Navigation.
- **axios** (^1.13.1): Cliente HTTP asíncrono y basado en promesas de fácil configuración e interceptores.
- **date-fns** (^4.1.0): Funciones ligeras y completas para manipular y formatear fechas y horas en el dispositivo.
- **expo-auth-session** (~7.0.8): Autenticación vía navegador web para soportar protocolos seguros OAuth.
- **expo-av** (~16.0.7): Reproducción y grabación de contenido de audio y video universalmente.
- **expo-camera** (~17.0.9): Proporciona un componente React para previsualizar y capturar fotos/vídeos.
- **expo-dev-client** (~6.0.17): Permite la compilación y ejecución personalizada del cliente de desarrollo con módulos nativos.
- **expo-image-picker** (~17.0.8) / **expo-document-picker** (~14.0.7): Proveen acceso nativo a la galería del dispositivo para escoger imágenes, vídeos o documentos.
- **expo-local-authentication** (~17.0.7): Métodos de autenticación propios del hardware del dispositivo (ej. Huella / FaceID).
- **expo-location** (~19.0.7): Acceso al GPS del dispositivo Android/iOS para registrar posiciones, rastreo y alertas georreferenciadas.
- **expo-notifications** (^0.32.12): API central para configurar y orquestar todas las notificaciones provenientes del sistema operativo.
- **expo-router** (~6.0.14): Solución nativa de routing anidado basado en sistema de archivos ("File-based routing").
- **expo-secure-store** (~15.0.7): Mecanismos seguros y encriptados nativos para almacenar cadenas de texto sensibles como JWT.
- **nativewind** (^4.2.1) / **tailwindcss** (^3.4.18): Interpreta e inyecta clases de Tailwind directas a los componentes de vistas nativos de React Native.
- **react-native-gesture-handler** (~2.28.0): Expone abstracciones declarativas hacia el sistema nativo para el manejo de toques y gestos táctiles.
- **react-native-linear-gradient** (^2.8.3): Dibuja vistas con gradientes de color progresivos y customizables.
- **react-native-maps** (1.20.1): Facilita interacciones avanzadas de mapas vectoriales personalizables con pines, trazos o visualización 3D.
- **react-native-qrcode-svg** (^6.3.21): Renderiza códigos QR en tiempo real mediante formato en pantalla `Svg`.
- **react-native-reanimated** (~4.1.1): Librería potente que corre animaciones y lógica asíncrona dedicada en el UI-thread a 60 FPS ininterrumpidos.
- **react-native-recaptcha-that-works** (^2.0.0): Módulo e integración simplificada de validaciones manuales/invisibles de Google reCAPTCHA en Webviews integrados.
- **react-native-safe-area-context** (~5.6.0): Proveedor global que calcula e interviene márgenes automáticos previniendo renderizado detrás de zonas "notch" en los móviles.
- **react-native-toast-message** (^2.3.3): Sistema de notificaciones efímeras superiores o "Toast" altamente personalizables y fluidas.
- **socket.io-client** (^4.8.1): Módulo encargado de mantener el canal de persistencia para comunicaciones full-duplex de red en tiempo con el servidor.

#### Comandos Mobile

```bash
# Inicializar nuevo proyecto usando la CLI de expo
npx create-expo-app@latest mi-app

# Dependencias fundamentales del proyecto DualEat
pnpm install @expo/vector-icons @gorhom/bottom-sheet @react-native-async-storage/async-storage @react-navigation/bottom-tabs @react-navigation/elements axios date-fns expo-auth-session expo-av expo-camera expo-constants expo-crypto expo-dev-client expo-document-picker expo-font expo-haptics expo-image expo-image-picker expo-linking expo-local-authentication expo-location expo-media-library expo-notifications expo-secure-store expo-sensors expo-splash-screen expo-status-bar expo-symbols expo-system-ui expo-task-manager expo-web-browser nativewind react react-dom react-native react-native-gesture-handler react-native-linear-gradient react-native-maps react-native-qrcode-svg react-native-reanimated react-native-recaptcha-that-works react-native-safe-area-context react-native-screens react-native-svg react-native-toast-message react-native-vector-icons react-native-web react-native-webview socket.io-client tailwindcss uuid

# Dependencias con control de versión estricto instaladas vía Expo
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar

# Dependencias de desarrollo (DevDependencies)
pnpm install -D @types/react baseline-browser-mapping eslint eslint-config-expo prettier-plugin-tailwindcss typescript
```
