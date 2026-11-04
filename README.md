# SENATI · Sistema de Inventario

Panel administrativo construido con React, Vite y CSS puro. Consume una API REST en Express.

## Requisitos

- Node.js y npm
- API Express accesible desde el navegador

## Instalación y ejecución

```bash
npm install
copy .env.example .env
npm run dev
```

Configura `VITE_API_URL` en `.env` con el origen del backend (por defecto `http://localhost:3006`). Reinicia Vite cuando cambies variables de entorno.

Comprobaciones disponibles:

```bash
npm run lint
npm run build
```

## Rutas

- `/` (inicio de sesión)
- `/dashboard`
- `/productos`
- `/categorias`
- `/proveedores`
- `/kardex`
- `/usuarios`

Las rutas del sistema requieren un token de sesión. Sin token, la aplicación redirige al inicio de sesión.

## Endpoints esperados

- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET|POST /api/productos`, `PUT|DELETE /api/productos/:id`
- `GET|POST /api/categorias`, `PUT|DELETE /api/categorias/:id`
- `GET|POST /api/proveedores`, `PUT|DELETE /api/proveedores/:id`
- `GET|POST /api/movimientos`, `PUT|DELETE /api/movimientos/:id`
- `GET|POST /api/usuarios`, `PUT|DELETE /api/usuarios/:id`

Las listas reciben `page`, `limit` y `search`. Se admiten respuestas de lista como un arreglo, `{ data: [...] }`, `{ items: [...] }` o `{ results: [...] }`, con total opcional (`total`, `totalItems` o `count`).

Si un endpoint responde `404`, su service usa temporalmente datos mock en memoria; los `TODO` identifican cada fallback. Otros errores de red o del servidor se muestran al usuario.
