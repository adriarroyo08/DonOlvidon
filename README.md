<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_56-blue?logo=expo" alt="Expo">
  <img src="https://img.shields.io/badge/Backend-Supabase-3ECF8E?logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/OCR-ML_Kit-4285F4?logo=google" alt="ML Kit">
  <img src="https://img.shields.io/badge/Platform-Android_%7C_iOS-orange" alt="Platform">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

<h1 align="center">Don Olvidon</h1>

<p align="center">
  <strong>Nunca mas olvides tus garantias</strong><br>
  App de gestion de garantias de productos para consumidores en Espana
</p>

---

## Que es Don Olvidon?

Don Olvidon es una app movil que te ayuda a llevar el control de las garantias de todos tus productos. Escanea el ticket de compra, y la app se encarga del resto: te avisa antes de que expire la garantia y te informa de tus derechos como consumidor.

### Funcionalidades principales

- **Registro de productos** — Anade productos manualmente o escaneando el ticket
- **OCR inteligente** — Escanea tickets de compra y extrae automaticamente tienda, fecha y productos
- **Notificaciones push** — Avisos a 30, 7 y 1 dia antes de la expiracion
- **Legislacion integrada** — Garantia legal espanola (3 anos nuevos, 1 ano segunda mano)
- **Modo offline** — Funciona sin conexion, sincroniza al recuperar internet
- **Diseno premium** — Glassmorphism, animaciones fluidas y dark mode automatico

---

## Screenshots

> *Proximamente — la app esta en desarrollo activo*

---

## Arquitectura

```
┌─────────────────────────────────────┐
│         React Native / Expo         │
│                                     │
│  UI Layer ←→ SQLite (offline cache) │
│       ↕                             │
│  Supabase SDK ←→ ML Kit (OCR)      │
└──────────────┬──────────────────────┘
               │
    ┌──────────┴──────────────┐
    │       Supabase          │
    │                         │
    │  Auth (Google/Apple)    │
    │  PostgreSQL (datos)     │
    │  Storage (recibos)      │
    │  Edge Functions (push)  │
    └─────────────────────────┘
```

## Tech Stack

| Capa | Tecnologia |
|------|-----------|
| App | React Native, Expo SDK 56, TypeScript |
| UI | react-native-reanimated, expo-blur, expo-haptics |
| Auth | Supabase Auth (Google, Apple) |
| Base de datos | Supabase PostgreSQL + expo-sqlite (offline) |
| Storage | Supabase Storage (fotos de recibos) |
| OCR | react-native-mlkit-ocr (on-device) |
| Push | Expo Push API + Supabase Edge Functions |
| Ads | react-native-google-mobile-ads (AdMob) |

---

## Empezar

### Prerrequisitos

- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- Cuenta en [Supabase](https://supabase.com) (tier gratuito)

### Instalacion

```bash
# Clonar el repositorio
git clone https://github.com/adriarroyo08/DonOlvidon.git
cd DonOlvidon

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves de Supabase
```

### Configurar Supabase

1. Crea un nuevo proyecto en [supabase.com](https://supabase.com)
2. Ejecuta el archivo `supabase/migrations/001_initial_schema.sql` en el SQL Editor
3. Configura Google y/o Apple como proveedores OAuth en Authentication > Providers
4. Copia la URL y anon key a tu `.env`

### Ejecutar

```bash
# Desarrollo
npx expo start

# Android
npx expo run:android

# iOS
npx expo run:ios
```

### Tests

```bash
npx jest
```

---

## Estructura del proyecto

```
src/
├── components/       # 8 componentes reutilizables (GlassCard, ProductCard, etc.)
├── config/           # Cliente Supabase
├── constants/        # Categorias, tiendas espanolas, legislacion
├── hooks/            # useAuth, useProducts, useTheme
├── navigation/       # Tab + Stack navigator
├── screens/          # 8 pantallas (Auth, Home, Products, OCR, etc.)
├── services/         # SQLite, OCR parser, notificaciones
├── theme/            # Colores, tipografia, spacing (light/dark)
└── types/            # TypeScript interfaces
supabase/
├── functions/        # Edge Function para push notifications (cron diario)
└── migrations/       # Schema SQL con RLS
```

---

## Legislacion de garantias en Espana

Don Olvidon incluye informacion legal actualizada:

| Tipo | Garantia | Carga de prueba |
|------|----------|-----------------|
| Producto nuevo | **3 anos** (desde 01/01/2022) | Vendedor (primeros 2 anos), consumidor (ano 3) |
| Segunda mano | **1 ano** | Vendedor (primeros 6 meses) |

**Derechos del consumidor:** reparacion, sustitucion, rebaja del precio o resolucion del contrato.

> Fuente: [Real Decreto-ley 7/2021](https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555) | [OCU - Garantias](https://www.ocu.org/consumo-familia/derechos-consumidor/consejos/garantias)

---

## Roadmap

- [x] **Fase 1 (MVP)** — Auth, productos, OCR, push, UI premium, ads
- [ ] **Fase 2** — Codigo de barras, grupos familiares, email mensual, exportar datos
- [ ] **Fase 3** — Comunidad (valoraciones de tiendas), historial de reclamaciones

---

## Diccionario de tiendas

El OCR reconoce automaticamente estas tiendas espanolas por nombre, alias o CIF:

> El Corte Ingles, MediaMarkt, FNAC, PCComponentes, Amazon, Carrefour, Leroy Merlin, IKEA, Decathlon, Zara, Worten, Alcampo, Lidl, Mercadona, Conforama, Apple Store, Samsung Store, Xiaomi Store

---

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## Licencia

MIT License. Ver [LICENSE](LICENSE) para mas detalles.

---

<p align="center">
  <sub>Hecho con mucho cafe y Claude Code</sub>
</p>
