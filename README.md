# Sistema de Gestión de Compras

Sistema de gestión de compras desarrollado bajo patrón MVC, utilizando tecnologías open source y propietarias.

## Stack Tecnológico

### Open Source
- **Backend**: Node.js + Express.js + Sequelize ORM
- **Frontend**: React + TypeScript + Vite + React Query
- **Validación**: Zod + Express-validator
- **UI**: Tailwind CSS + React Hook Form

### Propietario
- **Base de Datos**: Microsoft SQL Server Express (gratis para desarrollo)
- **Herramientas**: SQL Server Management Studio (SSMS)

## Requisitos Previos

- **Node.js** 18+ 
- **SQL Server Express** instalado (ver sección de instalación)
- **npm** o **yarn**
- **Git**

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd Compras-810-815
```

### 2. Instalar Dependencias del Backend

```bash
npm install
```

### 3. Instalar Dependencias del Frontend

```bash
cd src/frontend
npm install
cd ../..
```

### 4. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ComprasDB
DB_USER=sa
DB_PASSWORD=tu_password_aqui
DB_INSTANCE=SQLEXPRESS
DB_DIALECT=mssql

# Servidor
PORT=3000
NODE_ENV=development

# JWT (Autenticación)
JWT_SECRET=tu_secret_key_aqui
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=http://localhost:5174

# Integración con Contabilidad
CONTABILIDAD_API_URL=https://isofinal815-810-backend.onrender.com
CONTABILIDAD_USERNAME=compras_user
CONTABILIDAD_PASSWORD=ISO815810
```

### 5. Instalar y Configurar SQL Server Express

#### Windows

1. Descarga SQL Server Express desde: https://www.microsoft.com/sql-server/sql-server-downloads
2. Ejecuta el instalador y selecciona "Basic" para instalación rápida
3. Durante la instalación:
   - Selecciona **"Mixed Mode Authentication"** (Windows + SQL Server)
   - Configura una contraseña para el usuario `sa`
   - La instancia se llamará `SQLEXPRESS` por defecto
4. Instala SQL Server Management Studio (SSMS) desde: https://aka.ms/ssmsfullsetup

#### Mac (Docker)

```bash
docker run -e "ACCEPT_EULA=Y" \
           -e "MSSQL_SA_PASSWORD=YourStrong@Passw0rd" \
           -e "MSSQL_PID=Express" \
           -p 1433:1433 \
           --name sqlserver-express \
           -d mcr.microsoft.com/mssql/server:2022-latest
```

**Nota**: Cambia `YourStrong@Passw0rd` por una contraseña segura (mínimo 8 caracteres, mayúsculas, minúsculas, números y símbolos)

### 6. Crear la Base de Datos

Abre SSMS (Windows) o Azure Data Studio (Mac) y ejecuta:

```sql
CREATE DATABASE ComprasDB;
GO
```

### 7. Ejecutar Migraciones

```bash
npm run migrate
```

### 8. Poblar Datos de Prueba (Opcional)

```bash
npm run seed
```

## Configuración

### Configuración de SQL Server

**Windows:**
- Instancia: `SQLEXPRESS` (por defecto)
- Puerto: `1433`
- Autenticación: Mixed Mode (Windows + SQL Server)

**Mac:**
- Host: `localhost`
- Puerto: `1433`
- Usuario: `sa`
- Contraseña: La configurada en Docker

### Verificar Conexión

El sistema intentará conectarse automáticamente al iniciar. Si hay problemas:

1. Verifica que SQL Server está corriendo:
   - Windows: Servicios → SQL Server (SQLEXPRESS)
   - Mac: `docker ps` para verificar contenedor

2. Verifica que el puerto 1433 está abierto:
   - Windows: `Test-NetConnection -ComputerName localhost -Port 1433`
   - Mac: `nc -zv localhost 1433`

## Uso

### Iniciar el Sistema

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

El servidor se iniciará en `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

El frontend se iniciará en `http://localhost:5174`

### Acceder a la Aplicación

Abre tu navegador en: `http://localhost:5174`

**Credenciales de Prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

## Scripts Disponibles

- `npm run dev:backend` - Inicia el servidor backend en modo desarrollo
- `npm run dev:frontend` - Inicia el frontend en modo desarrollo
- `npm run start:backend` - Inicia el servidor backend en modo producción
- `npm run migrate` - Ejecuta las migraciones de base de datos
- `npm run migrate:undo` - Revierte la última migración
- `npm run seed` - Pobla la base de datos con datos de prueba
- `npm test` - Ejecuta los tests

## Estructura del Proyecto

```
src/
├── backend/          # API REST (Express + Sequelize)
│   ├── config/       # Configuración (database, environment)
│   ├── models/        # Modelos de Sequelize
│   │   ├── Usuario.js
│   │   ├── AsientoContable.js
│   │   └── ...
│   ├── repositories/  # Capa de repositorios
│   │   ├── AsientoContableRepository.js
│   │   └── ...
│   ├── services/      # Lógica de negocio
│   │   ├── AuthService.js
│   │   ├── ContabilidadService.js
│   │   └── ...
│   ├── controllers/   # Controladores MVC
│   │   ├── AuthController.js
│   │   ├── AsientoContableController.js
│   │   └── ...
│   ├── routes/        # Rutas de Express
│   │   ├── auth.js
│   │   ├── asientosContables.js
│   │   └── ...
│   ├── middleware/    # Middleware (auth, validation, errors)
│   │   ├── auth.js
│   │   └── ...
│   ├── migrations/    # Migraciones de base de datos
│   ├── seeders/       # Datos iniciales
│   └── stateMachines/ # Máquinas de estado
│
└── frontend/         # Aplicación React
    ├── src/
    │   ├── components/  # Componentes reutilizables
    │   │   └── common/
    │   │       └── ProtectedRoute.tsx
    │   ├── pages/       # Páginas/Vistas
    │   │   ├── Login/
    │   │   ├── Contabilidad/
    │   │   └── ...
    │   ├── hooks/       # Custom React Hooks
    │   │   ├── useAuth.ts
    │   │   ├── useAsientosContables.ts
    │   │   └── ...
    │   ├── services/    # Servicios de API
    │   └── types/       # TypeScript types
    └── public/
```

## API Endpoints

### CRUD Básico

**Departamentos**
- `GET /api/departamentos` - Listar todos
- `GET /api/departamentos/:id` - Obtener uno
- `POST /api/departamentos` - Crear
- `PUT /api/departamentos/:id` - Actualizar
- `DELETE /api/departamentos/:id` - Eliminar (soft delete)

**Unidades de Medida**
- `GET /api/unidades-medida`
- `GET /api/unidades-medida/:id`
- `POST /api/unidades-medida`
- `PUT /api/unidades-medida/:id`
- `DELETE /api/unidades-medida/:id`

**Proveedores**
- `GET /api/proveedores`
- `GET /api/proveedores/:id`
- `POST /api/proveedores`
- `PUT /api/proveedores/:id`
- `DELETE /api/proveedores/:id`

**Artículos**
- `GET /api/articulos`
- `GET /api/articulos/:id`
- `POST /api/articulos`
- `PUT /api/articulos/:id`
- `DELETE /api/articulos/:id`

**Órdenes de Compra**
- `GET /api/ordenes-compra` - Listar todas
- `GET /api/ordenes-compra/:id` - Obtener una
- `POST /api/ordenes-compra` - Crear
- `PUT /api/ordenes-compra/:id` - Actualizar
- `PATCH /api/ordenes-compra/:id/estado` - Cambiar estado
- `DELETE /api/ordenes-compra/:id` - Eliminar

**Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/me` - Obtener usuario actual

**Asientos Contables**
- `GET /api/asientos-contables` - Listar asientos (con filtros opcionales)
- `GET /api/asientos-contables/pendientes` - Transacciones pendientes
- `GET /api/asientos-contables/:id` - Obtener un asiento
- `POST /api/asientos-contables/generar/:ordenCompraId` - Generar asientos desde orden
- `POST /api/asientos-contables/:id/contabilizar` - Contabilizar un asiento
- `POST /api/asientos-contables/orden/:ordenCompraId/contabilizar` - Contabilizar todos los asientos de una orden

## Integración con Contabilidad

El sistema incluye integración automática con un sistema de contabilidad mediante Web Service.

### Funcionalidades

1. **Generación Automática de Asientos**: Al aprobar una orden de compra, se generan automáticamente los asientos contables:
   - Cuenta 80: Compra de Mercancías (DB)
   - Cuenta 82: Cuentas x Pagar Proveedor X (CR)
   - Id. Auxiliar: 7 (Compras)

2. **Página de Contabilidad**: Interfaz para visualizar y contabilizar transacciones pendientes:
   - Filtros por fecha (Desde/Hasta)
   - Selección múltiple de transacciones
   - Contabilización individual o masiva

3. **Estados de Asientos**:
   - **Pendiente**: Asiento generado, esperando contabilización
   - **Enviado**: Asiento enviado al Web Service
   - **Confirmado**: Asiento confirmado por el sistema de contabilidad
   - **Error**: Error al comunicarse con el Web Service

### Configuración del Sistema de Contabilidad

El sistema está configurado para integrarse con el API de contabilidad en:
- **URL**: `https://isofinal815-810-backend.onrender.com`
- **Usuario**: `compras_user`
- **Contraseña**: `ISO815810`

Las credenciales se configuran automáticamente, pero puedes personalizarlas en tu archivo `.env`:

```env
CONTABILIDAD_API_URL=https://isofinal815-810-backend.onrender.com
CONTABILIDAD_USERNAME=compras_user
CONTABILIDAD_PASSWORD=ISO815810
```

### Formato de Datos Enviados

El sistema envía cada línea del asiento por separado al API `/api/v1/accounting-entries`:

**Línea DB (Débito):**
```json
{
  "description": "Compra de Mercancías - Orden OC-202401-0001",
  "accountId": 80,
  "movementType": "DB",
  "amount": 1200000,
  "entryDate": "2024-01-15"
}
```

**Línea CR (Crédito):**
```json
{
  "description": "Cuentas x Pagar Proveedor X - Orden OC-202401-0001",
  "accountId": 82,
  "movementType": "CR",
  "amount": 1200000,
  "entryDate": "2024-01-15"
}
```

**Nota importante**: El sistema NO envía `auxiliaryId` - el API lo asigna automáticamente según el token de autenticación.

### Flujo de Trabajo

1. Usuario crea una orden de compra
2. Usuario aprueba la orden (cambia estado a "Aprobada")
3. Sistema genera automáticamente 2 asientos contables (DB y CR)
4. Usuario va a la página de Contabilidad
5. Usuario selecciona transacciones y hace clic en "Contabilizar"
6. Sistema envía los asientos al Web Service de contabilidad
7. Sistema actualiza el estado según la respuesta del Web Service

Para más detalles sobre cómo probar la integración, consulta **[GUIA_PRUEBAS_CONTABILIDAD.md](./GUIA_PRUEBAS_CONTABILIDAD.md)**

## Despliegue

### Frontend en Vercel

1. **Instalar Vercel CLI** (opcional):
   ```bash
   npm i -g vercel
   ```

2. **Desplegar desde la carpeta del frontend**:
   ```bash
   cd src/frontend
   vercel
   ```

3. **O desde el dashboard de Vercel**:
   - Conecta tu repositorio de GitHub
   - Selecciona el directorio `src/frontend`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Configurar Variable de Entorno**:
   - En el dashboard de Vercel, agrega:
     - `VITE_API_URL`: URL de tu backend desplegado (ej: `https://tu-backend.railway.app`)

### Backend en Railway

1. **Crear cuenta en Railway**: https://railway.app

2. **Nuevo Proyecto**:
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

3. **Configurar Servicio**:
   - Railway detectará automáticamente que es Node.js
   - El archivo `railway.json` configurará el build y start

4. **Variables de Entorno**:
   Configura las siguientes variables en Railway:
   ```
   DB_HOST=tu-host-sql
   DB_PORT=1433
   DB_NAME=ComprasDB
   DB_USER=sa
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_secret_key_segura
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend.vercel.app
   CONTABILIDAD_API_URL=https://isofinal815-810-backend.onrender.com
   CONTABILIDAD_USERNAME=compras_user
   CONTABILIDAD_PASSWORD=ISO815810
   ```

5. **Base de Datos**:
   - Railway ofrece PostgreSQL gratis
   - O puedes usar una base de datos externa (SQL Server en Azure, etc.)

### Backend en Render (Alternativa)

1. **Crear cuenta en Render**: https://render.com

2. **Nuevo Web Service**:
   - Conecta tu repositorio de GitHub
   - Build Command: `npm install`
   - Start Command: `node src/backend/app.js`

3. **Variables de Entorno**: Igual que Railway

4. **El archivo `Procfile`** será usado automáticamente

### Notas de Despliegue

- **Frontend y Backend separados**: Se despliegan en servicios diferentes
- **CORS**: Asegúrate de configurar `CORS_ORIGIN` con la URL exacta de tu frontend
- **Base de Datos**: Puedes usar SQL Server en Azure, o migrar a PostgreSQL (Railway lo ofrece gratis)
- **Sistema de Contabilidad**: Ya está configurado para usar `https://isofinal815-810-backend.onrender.com`

## Documentación Adicional

- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Arquitectura completa del sistema, stack tecnológico y patrones de diseño
- **[DECISIONES_ARQUITECTURA.md](./DECISIONES_ARQUITECTURA.md)** - Justificaciones y decisiones de diseño arquitectónico
- **[DIAGRAMA_ENTIDADES.md](./DIAGRAMA_ENTIDADES.md)** - Modelo de datos, relaciones y estructura de base de datos
- **[GUIA_PRUEBAS_CONTABILIDAD.md](./GUIA_PRUEBAS_CONTABILIDAD.md)** - Guía completa para probar la integración con contabilidad

## Solución de Problemas Comunes

### Error: "Cannot connect to SQL Server"
**Solución:**
1. Verifica que SQL Server está corriendo
2. Verifica que el puerto 1433 no está bloqueado por firewall
3. Verifica las credenciales en `.env`

### Error: "Login failed for user 'sa'"
**Solución:**
1. Verifica que "Mixed Mode Authentication" está habilitado
2. Verifica la contraseña del usuario `sa` en `.env`
3. En SQL Server Configuration Manager, habilita "SQL Server Authentication"

### Error: "Instance name not found"
**Solución (Windows):**
- Usa `localhost\SQLEXPRESS` o `.\SQLEXPRESS` como nombre de servidor
- Verifica el nombre de instancia en SQL Server Configuration Manager

## Límites de SQL Server Express

- **Tamaño máximo de base de datos**: 10GB
- **RAM máxima**: 1GB
- **CPUs máximos**: 4 cores

Estos límites son más que suficientes para desarrollo y proyectos académicos.

## Desarrollo

### Agregar una Nueva Entidad

1. Crear modelo en `src/backend/models/`
2. Crear migración: `npx sequelize-cli model:generate --name Entidad`
3. Crear repositorio en `src/backend/repositories/`
4. Crear servicio en `src/backend/services/`
5. Crear controlador en `src/backend/controllers/`
6. Crear rutas en `src/backend/routes/`
7. Registrar rutas en `src/backend/app.js`

### Testing

```bash
npm test
```

## Licencia

Proyecto académico - Uso educativo
