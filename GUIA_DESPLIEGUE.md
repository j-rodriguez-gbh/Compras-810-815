# Guía Completa de Despliegue

Esta guía te ayudará a desplegar el Sistema de Compras en producción.

## 📋 Checklist Pre-Despliegue

- [ ] Repositorio en GitHub conectado
- [ ] Cuenta en Vercel creada
- [ ] Cuenta en Railway creada
- [ ] Base de datos configurada (SQL Server o PostgreSQL)

---

## 🎨 PARTE 1: Frontend en Vercel

### Paso 1: Verificar Configuración del Proyecto

1. Ve a tu proyecto en Vercel: https://vercel.com/j-rodriguez-gbhs-projects/sistema-compras-810-815
2. Ve a **Settings** > **General**
3. Verifica que **Root Directory** esté configurado como: `src/frontend`
   - Si no está configurado, haz clic en "Edit" y cambia a `src/frontend`
   - Guarda los cambios

### Paso 2: Configurar Variables de Entorno

1. Ve a **Settings** > **Environment Variables**
2. Agrega la siguiente variable:

   **Variable 1: URL del Backend**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://TU-BACKEND-URL.railway.app` (la obtendrás después de desplegar el backend)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Haz clic en **Save**

   > ⚠️ **IMPORTANTE**: Si aún no tienes el backend desplegado, puedes agregar esta variable después. Por ahora, déjala vacía o usa una URL temporal.

### Paso 3: Verificar Build Settings

1. Ve a **Settings** > **General**
2. Verifica que:
   - **Framework Preset**: Vite (o detectado automáticamente)
   - **Build Command**: `npm run build` (o vacío, Vercel lo detecta)
   - **Output Directory**: `dist` (o vacío, Vercel lo detecta)
   - **Install Command**: `npm install` (o vacío)

### Paso 4: Desplegar

1. Ve a la pestaña **Deployments**
2. Si hay un deployment fallido, haz clic en los tres puntos (...) y selecciona **Redeploy**
3. O haz un push a tu repositorio para activar un nuevo deployment automático

### Paso 5: Verificar Deployment

1. Una vez completado el build, haz clic en el deployment
2. Verifica que no haya errores en los logs
3. Copia la URL de tu aplicación (ej: `https://sistema-compras-810-815.vercel.app`)

---

## 🚂 PARTE 2: Backend en Railway

### Paso 1: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Inicia sesión con GitHub
3. Haz clic en **"New Project"**
4. Selecciona **"Deploy from GitHub repo"**
5. Selecciona tu repositorio: `sistema-compras-810-815`

### Paso 2: Configurar el Servicio

Railway detectará automáticamente que es un proyecto Node.js y usará el archivo `railway.json`.

1. Railway creará un servicio automáticamente
2. Espera a que se complete el build inicial

### Paso 3: Configurar Variables de Entorno

1. En tu servicio de Railway, ve a la pestaña **Variables**
2. Haz clic en **"New Variable"** y agrega las siguientes variables:

   **Variables de Base de Datos (Azure SQL):**
   ```
   DB_HOST=tu-servidor.database.windows.net
   DB_PORT=1433
   DB_NAME=ComprasDB
   DB_USER=tu-usuario-admin
   DB_PASSWORD=tu-password-segura
   DB_INSTANCE=
   DB_DIALECT=mssql
   ```
   > 📖 **Para configurar Azure SQL paso a paso, consulta [GUIA_AZURE_SQL.md](./GUIA_AZURE_SQL.md)**

   **Variables del Servidor:**
   ```
   PORT=3000
   NODE_ENV=production
   ```

   **Variables de Autenticación:**
   ```
   JWT_SECRET=tu-secret-key-super-segura-aqui
   JWT_EXPIRES_IN=24h
   ```

   **Variable de CORS (URL de tu frontend en Vercel):**
   ```
   CORS_ORIGIN=https://sistema-compras-810-815.vercel.app
   ```
   > ⚠️ Reemplaza con la URL real de tu frontend en Vercel

   **Variables de Contabilidad:**
   ```
   CONTABILIDAD_API_URL=https://isofinal815-810-backend.onrender.com
   CONTABILIDAD_USERNAME=compras_user
   CONTABILIDAD_PASSWORD=ISO815810
   ```

### Paso 4: Configurar Base de Datos

**Opción A: Usar SQL Server en Azure (Recomendado para producción)**

1. Sigue la guía completa en **[GUIA_AZURE_SQL.md](./GUIA_AZURE_SQL.md)**
2. Crea una instancia de SQL Server en Azure
3. Obtén la cadena de conexión
4. Configura las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`

**Opción B: Usar PostgreSQL en Railway (Gratis)**

1. En Railway, haz clic en **"New"** > **"Database"** > **"Add PostgreSQL"**
2. Railway creará una base de datos PostgreSQL automáticamente
3. Railway agregará automáticamente las variables:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

4. **IMPORTANTE**: Si usas PostgreSQL, necesitarás cambiar `DB_DIALECT` a `postgres`:
   ```
   DB_DIALECT=postgres
   ```

### Paso 5: Ejecutar Migraciones

1. En Railway, ve a tu servicio
2. Haz clic en la pestaña **"Deployments"**
3. Haz clic en los tres puntos (...) del deployment más reciente
4. Selecciona **"Open in Shell"** o **"View Logs"**
5. Ejecuta las migraciones manualmente desde la terminal de Railway:
   ```bash
   npm run migrate
   ```

   O agrega un script en `package.json` para ejecutar migraciones automáticamente antes del start.

### Paso 6: Obtener URL del Backend

1. En Railway, ve a tu servicio
2. Haz clic en la pestaña **"Settings"**
3. En **"Networking"**, verás la URL pública (ej: `https://tu-proyecto.railway.app`)
4. **Copia esta URL** - la necesitarás para el frontend

### Paso 7: Verificar que el Backend Funciona

1. Abre la URL de tu backend en el navegador
2. Deberías ver un mensaje o la documentación de la API
3. Prueba el endpoint: `https://tu-backend.railway.app/api/health` (si existe)

---

## 🔗 PARTE 3: Conectar Frontend y Backend

### Paso 1: Actualizar Variable de Entorno en Vercel

1. Ve a Vercel: https://vercel.com/j-rodriguez-gbhs-projects/sistema-compras-810-815/settings/environment-variables
2. Edita la variable `VITE_API_URL`
3. Cambia el valor a la URL de tu backend en Railway:
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```
4. Guarda los cambios

### Paso 2: Redesplegar Frontend

1. En Vercel, ve a **Deployments**
2. Haz clic en los tres puntos (...) del último deployment
3. Selecciona **"Redeploy"**
4. Espera a que se complete el nuevo deployment

### Paso 3: Actualizar CORS en Backend

1. En Railway, ve a las **Variables** de tu servicio
2. Actualiza `CORS_ORIGIN` con la URL exacta de tu frontend en Vercel:
   ```
   CORS_ORIGIN=https://sistema-compras-810-815.vercel.app
   ```
3. Railway reiniciará automáticamente el servicio

---

## ✅ PARTE 4: Verificación Final

### Verificar Frontend

1. Abre tu aplicación en Vercel: `https://sistema-compras-810-815.vercel.app`
2. Deberías ver la página de login
3. Intenta iniciar sesión (necesitarás crear un usuario primero o usar el seeder)

### Verificar Backend

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Verifica que las peticiones vayan a tu backend en Railway (no a localhost)

### Verificar Integración

1. Crea una orden de compra
2. Aprueba la orden
3. Ve a la página de Contabilidad
4. Verifica que se generen los asientos contables

---

## 🐛 Solución de Problemas

### Error 404 en Vercel

- Verifica que **Root Directory** esté configurado como `src/frontend`
- Verifica que `vercel.json` exista en `src/frontend/`
- Limpia el caché: Settings > Clear Build Cache

### Error CORS

- Verifica que `CORS_ORIGIN` en Railway tenga la URL exacta de tu frontend (sin trailing slash)
- Verifica que el frontend use `VITE_API_URL` correctamente

### Error de Conexión a Base de Datos

- Verifica todas las variables de base de datos en Railway
- Verifica que la base de datos esté accesible desde internet (no solo localhost)
- Si usas SQL Server, verifica que el firewall permita conexiones externas

### Error 401 (No autorizado)

- Verifica que `JWT_SECRET` esté configurado en Railway
- Verifica que el frontend esté enviando el token en las peticiones

---

## 📝 Notas Importantes

1. **Base de Datos**: Si usas SQL Server en producción, asegúrate de que esté accesible desde internet. Azure SQL Database es una buena opción.

2. **Variables Sensibles**: Nunca commitees archivos `.env` con valores reales. Usa siempre variables de entorno en los servicios de hosting.

3. **Migraciones**: Las migraciones deben ejecutarse manualmente en producción o configurarse para ejecutarse automáticamente en el despliegue.

4. **Seeders**: Los seeders (datos iniciales) también deben ejecutarse manualmente en producción si es necesario.

5. **Logs**: Revisa los logs en Railway y Vercel para diagnosticar problemas.

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará desplegada y funcionando en producción.

**URLs importantes:**
- Frontend: `https://sistema-compras-810-815.vercel.app`
- Backend: `https://tu-backend.railway.app`

