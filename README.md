# 💛 Catálogo Creaciones Lolita V2

Sistema de catálogo y comercio electrónico especializado en productos de corte y grabado láser en MDF. Arquitectura moderna, rápida y segura diseñada para alto rendimiento SEO y administración ágil.

## 🚀 Stack Tecnológico

- **Framework:** [Astro](https://astro.build) (Server-Side Rendering)
- **UI & Componentes:** React 19 + Tailwind CSS v4
- **Base de Datos & Auth:** Supabase (PostgreSQL)
- **Despliegue:** Cloudflare Pages & Workers

## 🛡️ Características de Seguridad y Rendimiento
- Autenticación segura mediante SSR y políticas HTTP (CSP, XSS, HSTS).
- Rate Limiting implementado contra ataques de fuerza bruta.
- Saneamiento y validación estricta de subidas de archivos (MIME/Weight checks).
- Pre-carga (Prefetching) optimizado en estrategia `hover`.
- Open Graph y JSON-LD dinámicos para SEO perfecto en Redes Sociales.

## 🛠️ Comandos de Desarrollo

Clona el proyecto, instala dependencias e inicia el servidor de desarrollo:

\`\`\`bash
npm install
npm run dev
\`\`\`

Requiere configuración previa del archivo `.env` con las credenciales de Supabase (`PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_ANON_KEY`).