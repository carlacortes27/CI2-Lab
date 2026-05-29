# Despliegue frontend/backend

## Frontend en Vercel

Configura el proyecto de Vercel para construir el frontend desde la raiz:

- Build command: `npm install --prefix client && npm run build --prefix client`
- Output directory: `client/dist`

Variable obligatoria en Vercel:

```env
VITE_API_BASE_URL=https://tu-backend-publico.com
```

Usa la URL publica del backend, sin barra final. El frontend construye las llamadas como
`VITE_API_BASE_URL + /api/...`.

## Backend publico

El backend debe estar desplegado en un host publico, por ejemplo Render, Railway o Fly.io.
Configura CORS para aceptar el dominio de Vercel:

```env
CORS_ORIGIN=https://tu-frontend.vercel.app
AUTH_TOKEN_SECRET=un-secreto-largo
NODE_ENV=production
```

Si tienes varios frontends permitidos, separalos por coma:

```env
CORS_ORIGIN=http://localhost:3000,https://tu-frontend.vercel.app
```

En local puedes omitir `VITE_API_BASE_URL` y Vite enviara `/api` al proxy de desarrollo.
