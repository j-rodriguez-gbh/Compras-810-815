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

# JWT (si se implementa autenticación)
JWT_SECRET=tu_secret_key_aqui
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

El frontend se iniciará en `http://localhost:5173` (o el puerto que Vite asigne)

### Acceder a la Aplicación

Abre tu navegador en: `http://localhost:5173`

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
│   ├── repositories/  # Capa de repositorios
│   ├── services/      # Lógica de negocio
│   ├── controllers/   # Controladores MVC
│   ├── routes/        # Rutas de Express
│   ├── middleware/    # Middleware (auth, validation, errors)
│   ├── migrations/    # Migraciones de base de datos
│   └── seeders/       # Datos iniciales
│
└── frontend/         # Aplicación React
    ├── src/
    │   ├── components/  # Componentes reutilizables
    │   ├── pages/       # Páginas/Vistas
    │   ├── hooks/       # Custom React Hooks
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
- `GET /api/ordenes-compra`
- `GET /api/ordenes-compra/:id`
- `POST /api/ordenes-compra`
- `PUT /api/ordenes-compra/:id`
- `DELETE /api/ordenes-compra/:id`

## Documentación Adicional

- **[ARQUITECTURA.md](./ARQUITECTURA.md)** - Arquitectura completa del sistema, stack tecnológico y patrones de diseño
- **[DECISIONES_ARQUITECTURA.md](./DECISIONES_ARQUITECTURA.md)** - Justificaciones y decisiones de diseño arquitectónico
- **[DIAGRAMA_ENTIDADES.md](./DIAGRAMA_ENTIDADES.md)** - Modelo de datos, relaciones y estructura de base de datos

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
