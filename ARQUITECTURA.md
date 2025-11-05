# Arquitectura del Sistema de Compras

## 1. Visión General

Sistema de gestión de compras desarrollado bajo patrón MVC, utilizando tecnologías open source y propietarias, con capacidad de integración con sistema de contabilidad existente mediante Web Services.

## 2. Stack Tecnológico

### 2.1 Tecnologías Open Source

**Backend:**
- **Node.js + Express.js**: Servidor de aplicaciones y API REST (Open Source)
- **Sequelize ORM**: Manejo de modelos y migraciones (Open Source)
- **Zod**: Validación de esquemas (Open Source)
- **Express-validator**: Validación de requests HTTP (Open Source)
- **jsonwebtoken**: Autenticación JWT (Open Source)
- **Passport.js**: Estrategias de autenticación flexibles (Open Source)
- **Axios**: Cliente HTTP para consumir Web Services (Open Source)

**Frontend:**
- **React + TypeScript**: Framework UI y tipado estático (Open Source)
- **React Query (TanStack Query)**: Gestión de estado del servidor y caché (Open Source)
- **Tailwind CSS**: Framework de estilos utilitarios (Open Source)
- **React Router**: Navegación y routing (Open Source)
- **React Hook Form**: Manejo de formularios (Open Source)
- **Zod (client-side)**: Validación de formularios (Open Source)

**DevOps:**
- **Jest**: Framework de testing (Open Source)
- **ESLint + Prettier**: Linting y formateo de código (Open Source)
- **Docker**: Containerización (Open Source)

### 2.2 Tecnologías Propietarias

**Base de Datos (Principal - Propietaria):**
- **Microsoft SQL Server Express Edition**: Motor de base de datos relacional propietario de Microsoft
  - **Gratis para desarrollo local** en Windows y Mac
  - **Límites**: Hasta 10GB por base de datos, 1GB de RAM, 4 cores
  - **Suficiente para desarrollo y proyecto académico**
  - **Driver**: `tedious` o `mssql` para Node.js
  - **Herramientas**: SQL Server Management Studio (SSMS) - gratis

**Herramientas de Desarrollo Propietarias:**
- **SQL Server Management Studio (SSMS)**: Herramienta de administración de BD (Microsoft, gratis)
- **Visual Studio Code** (aunque técnicamente open source, es producto de Microsoft)
- **SQL Server Data Tools (SSDT)**: Herramientas de desarrollo (opcional, gratis)

**Componentes de UI (Opcional - Propietario):**
- **Syncfusion Community Edition**: Librería de componentes React (gratis para uso académico, propietaria)
- **DevExtreme React**: Componentes avanzados (versión de prueba, propietaria)
- **Telerik Kendo React**: UI components (versión de prueba, propietaria)

**Nota sobre Balance Open Source vs Propietario:**
- **Open Source**: Backend (Node.js/Express), Frontend (React), Herramientas de desarrollo
- **Propietario**: Base de datos (SQL Server Express), Herramientas de administración (SSMS), Potencialmente componentes UI propietarios
- Esta distribución asegura partes significativas de ambas categorías

## 3. Arquitectura de Capas (MVC + Repository + Service)

### 3.1 Estructura de Directorios

```
src/
├── backend/
│   ├── config/
│   │   ├── database.js          # Configuración de Sequelize (SQL Server)
│   │   ├── passport.js          # Configuración de Passport
│   │   └── environment.js       # Variables de entorno
│   ├── models/                  # Capa de Modelos (Sequelize)
│   │   ├── Departamento.js
│   │   ├── UnidadMedida.js
│   │   ├── Proveedor.js
│   │   ├── Articulo.js
│   │   └── OrdenCompra.js
│   ├── repositories/            # Patrón Repository
│   │   ├── DepartamentoRepository.js
│   │   ├── UnidadMedidaRepository.js
│   │   ├── ProveedorRepository.js
│   │   ├── ArticuloRepository.js
│   │   └── OrdenCompraRepository.js
│   ├── services/                # Capa de Servicios (Lógica de Negocio)
│   │   ├── DepartamentoService.js
│   │   ├── UnidadMedidaService.js
│   │   ├── ProveedorService.js
│   │   ├── ArticuloService.js
│   │   ├── OrdenCompraService.js
│   │   └── ContabilidadService.js  # Integración con WS Contabilidad
│   ├── controllers/             # Capa de Controladores (MVC)
│   │   ├── DepartamentoController.js
│   │   ├── UnidadMedidaController.js
│   │   ├── ProveedorController.js
│   │   ├── ArticuloController.js
│   │   └── OrdenCompraController.js
│   ├── routes/                  # Rutas de Express
│   │   ├── departamentos.js
│   │   ├── unidadesMedida.js
│   │   ├── proveedores.js
│   │   ├── articulos.js
│   │   └── ordenesCompra.js
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticación
│   │   ├── validation.js        # Middleware de validación
│   │   └── errorHandler.js      # Manejo centralizado de errores
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js        # Validadores personalizados (RNC/Cédula)
│   │   └── constants.js
│   ├── stateMachines/           # Máquinas de estado
│   │   └── ordenCompraStateMachine.js
│   ├── migrations/              # Migraciones de Sequelize
│   ├── seeders/                 # Datos iniciales
│   └── app.js                   # Configuración principal de Express
│
└── frontend/
    ├── src/
    │   ├── components/          # Componentes reutilizables
    │   │   ├── common/          # Componentes comunes (Button, Input, Modal, etc.)
    │   │   │   ├── Modal.tsx
    │   │   │   ├── ConfirmModal.tsx
    │   │   │   └── OrdenDetallesModal.tsx
    │   │   └── forms/           # Componentes de formularios
    │   ├── stateMachines/       # Máquinas de estado (frontend)
    │   │   └── ordenCompraStateMachine.ts
    │   ├── pages/               # Páginas/Vistas (MVC View Layer)
    │   │   ├── Departamentos/
    │   │   ├── UnidadesMedida/
    │   │   ├── Proveedores/
    │   │   ├── Articulos/
    │   │   ├── OrdenesCompra/
    │   │   └── Consultas/
    │   ├── hooks/               # Custom React Hooks
    │   │   ├── useDepartamentos.js
    │   │   ├── useArticulos.js
    │   │   └── useOrdenesCompra.js
    │   ├── services/            # Servicios de API (cliente HTTP)
    │   │   └── api.js
    │   ├── store/               # Estado global (si se requiere)
    │   ├── utils/
    │   │   ├── validators.js
    │   │   └── formatters.js
    │   ├── types/               # TypeScript types/interfaces
    │   ├── App.tsx
    │   └── main.tsx
    │
    └── public/
```

## 4. Modelo de Datos

### 4.1 Entidades Principales

**Departamento**
- id (PK, INT IDENTITY(1,1)) - Auto-incremento en SQL Server
- nombre (NVARCHAR(255), NOT NULL, UNIQUE)
- estado (NVARCHAR(20), CHECK: 'Activo' o 'Inactivo', default: 'Activo')
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**UnidadMedida**
- id (PK, INT IDENTITY(1,1))
- descripcion (NVARCHAR(255), NOT NULL, UNIQUE)
- estado (NVARCHAR(20), CHECK: 'Activo' o 'Inactivo', default: 'Activo')
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**Proveedor**
- id (PK, INT IDENTITY(1,1))
- cedulaRNC (NVARCHAR(50), NOT NULL, UNIQUE) - Validado con algoritmo de RNC/Cédula dominicano
- nombreComercial (NVARCHAR(255), NOT NULL)
- estado (NVARCHAR(20), CHECK: 'Activo' o 'Inactivo', default: 'Activo')
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**Articulo**
- id (PK, INT IDENTITY(1,1))
- descripcion (NVARCHAR(255), NOT NULL)
- marca (NVARCHAR(100))
- unidadMedidaId (FK -> UnidadMedida.id, INT)
- existencia (DECIMAL(18,2), default: 0)
- estado (NVARCHAR(20), CHECK: 'Activo' o 'Inactivo', default: 'Activo')
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**OrdenCompra**
- id (PK, INT IDENTITY(1,1))
- numeroOrden (NVARCHAR(50), NOT NULL, UNIQUE)  # Generado automáticamente
- fechaOrden (DATE, NOT NULL, default: GETDATE())
- estado (NVARCHAR(20), CHECK: 'Pendiente', 'Aprobada', 'Rechazada', 'Enviada', default: 'Pendiente')
- departamentoId (FK -> Departamento.id, INT)
- proveedorId (FK -> Proveedor.id, INT)
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**OrdenCompraDetalle**
- id (PK, INT IDENTITY(1,1))
- ordenCompraId (FK -> OrdenCompra.id, INT)
- articuloId (FK -> Articulo.id, INT)
- cantidad (DECIMAL(18,2), NOT NULL)
- unidadMedidaId (FK -> UnidadMedida.id, INT)
- costoUnitario (DECIMAL(18,2), NOT NULL)
- subtotal (DECIMAL(18,2), calculado: cantidad * costoUnitario)
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

**AsientoContable** (Tabla para tracking de envíos a Contabilidad)
- id (PK, INT IDENTITY(1,1))
- identificadorAsiento (NVARCHAR(100), NOT NULL)  # Recibido del WS
- descripcion (NVARCHAR(MAX))
- tipoInventarioId (NVARCHAR(50))
- cuentaContable (NVARCHAR(50))
- tipoMovimiento (NVARCHAR(2), CHECK: 'DB' o 'CR')
- fechaAsiento (DATE)
- montoAsiento (DECIMAL(18,2))
- estado (NVARCHAR(20), CHECK: 'Pendiente', 'Enviado', 'Confirmado', 'Error')
- ordenCompraId (FK -> OrdenCompra.id, INT, nullable)
- createdAt (DATETIME2, default: GETDATE())
- updatedAt (DATETIME2, default: GETDATE())

### 4.2 Relaciones

- **Articulo** → **UnidadMedida** (Many-to-One)
- **OrdenCompra** → **Departamento** (Many-to-One)
- **OrdenCompra** → **Proveedor** (Many-to-One)
- **OrdenCompra** → **OrdenCompraDetalle** (One-to-Many)
- **OrdenCompraDetalle** → **Articulo** (Many-to-One)
- **OrdenCompraDetalle** → **UnidadMedida** (Many-to-One)
- **AsientoContable** → **OrdenCompra** (Many-to-One, nullable)

## 5. Flujo de Datos (MVC)

### 5.1 Request Flow

```
Cliente (Frontend)
    ↓
Routes (Express Router)
    ↓
Middleware (Auth, Validation)
    ↓
Controller (MVC Controller)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
Model (Sequelize ORM)
    ↓
Database (Microsoft SQL Server Express)
```

### 5.2 Ejemplo: Crear Orden de Compra

1. **Frontend (View)**: Usuario completa formulario → `OrdenCompraForm.tsx`
2. **API Service**: `POST /api/ordenes-compra` → `api.js`
3. **Route**: `routes/ordenesCompra.js` → valida ruta y método
4. **Middleware**: `auth.js` verifica JWT, `validation.js` valida payload
5. **Controller**: `OrdenCompraController.create()` → recibe request validado
6. **Service**: `OrdenCompraService.crearOrdenCompra()` → lógica de negocio:
   - Genera número de orden único
   - Valida existencia de artículos
   - Calcula totales
   - Persiste orden y detalles
7. **Repository**: `OrdenCompraRepository.create()` → abstracción de base de datos
8. **Model**: `OrdenCompra.create()` → Sequelize persiste en BD
9. **Response**: Retorna orden creada → Frontend actualiza UI

## 6. API REST Endpoints

### 6.1 CRUD Básico

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

**Ordenes de Compra**
- `GET /api/ordenes-compra` - Listar todas (incluye detalles con relaciones)
- `GET /api/ordenes-compra/:id` - Obtener una orden
- `GET /api/ordenes-compra/:id/estados-posibles` - Obtener estados posibles según state machine
- `POST /api/ordenes-compra` - Crear
- `PUT /api/ordenes-compra/:id` - Actualizar (validación de transiciones de estado)
- `PATCH /api/ordenes-compra/:id/estado` - Cambiar estado (validado por state machine)
- `DELETE /api/ordenes-compra/:id` - Eliminar (solo si no está en estado final)

### 6.2 Consultas Especiales

**Consulta por Criterios**
- `GET /api/ordenes-compra/consulta?departamentoId=1&estado=Pendiente&fechaDesde=2024-01-01&fechaHasta=2024-12-31`

## 7. Integración con Sistema de Contabilidad

### 7.1 Servicio de Integración

**ContabilidadService** (`services/ContabilidadService.js`)
- Método: `enviarAsientoContable(asientoData)`
- Utiliza Axios para consumir Web Service del sistema de contabilidad
- Maneja errores y reintentos
- Registra estado de envío en tabla `AsientoContable`

### 7.2 Flujo de Integración

1. Orden de Compra se aprueba (estado cambia a 'Aprobada')
2. Service genera datos de asiento contable según reglas de negocio
3. `ContabilidadService.enviarAsientoContable()` envía datos al WS
4. Se registra respuesta en tabla `AsientoContable`
5. Si hay error, se marca en tabla para reintento posterior

### 7.3 Estructura de Datos para WS

```javascript
{
  identificadorAsiento: string,
  descripcion: string,
  tipoInventarioId: string,
  cuentaContable: string,
  tipoMovimiento: 'DB' | 'CR',
  fechaAsiento: Date,
  montoAsiento: number,
  estado: string
}
```

## 8. Validaciones y Reglas de Negocio

### 8.1 Validaciones por Entidad

**Departamento**
- Nombre único, no vacío
- Estado debe ser 'Activo' o 'Inactivo'

**UnidadMedida**
- Descripción única, no vacía
- Estado debe ser 'Activo' o 'Inactivo'

**Proveedor**
- Cédula/RNC único, formato válido según algoritmo de validación dominicano
  - Cédula: 11 dígitos con dígito verificador válido
  - RNC: 9 u 11 dígitos con dígito verificador válido
- Validación en tres capas: Frontend (UX), Backend middleware (seguridad), Modelo Sequelize (integridad)
- Nombre comercial no vacío
- Estado debe ser 'Activo' o 'Inactivo'

**Articulo**
- Descripción no vacía
- UnidadMedidaId debe existir
- Existencia >= 0
- Estado debe ser 'Activo' o 'Inactivo'

**OrdenCompra**
- Número de orden único (generado automáticamente)
- Fecha orden requerida
- DepartamentoId debe existir y estar activo
- ProveedorId debe existir y estar activo
- Estado validado por State Machine (Pendiente → Aprobada → Enviada o Rechazada)
- Transiciones de estado validadas: solo transiciones permitidas por state machine
- No se puede editar/eliminar en estados finales (Enviada, Rechazada)
- Debe tener al menos un detalle
- En detalles: ArticuloId debe existir, Cantidad > 0, CostoUnitario > 0

### 8.2 Reglas de Negocio

- No se puede eliminar un Departamento si tiene Ordenes de Compra asociadas
- No se puede eliminar una UnidadMedida si está en uso en Artículos o Ordenes
- No se puede eliminar un Proveedor si tiene Ordenes de Compra asociadas
- No se puede eliminar un Artículo si está en Ordenes de Compra
- Al crear Orden de Compra, se calcula subtotal automáticamente
- Solo Ordenes con estado 'Aprobada' pueden enviarse a contabilidad
- **State Machine para Ordenes de Compra**: Transiciones de estado controladas por máquina de estados
  - Pendiente → Aprobada o Rechazada
  - Aprobada → Enviada
  - Rechazada y Enviada son estados finales (no se pueden editar)
  - Solo se pueden eliminar órdenes que no estén en estado 'Enviada'
- **Validación de RNC/Cédula**: Algoritmo de validación dominicano implementado en múltiples capas
- **Dropdowns filtrados**: Solo se muestran registros activos en formularios de selección
- **Limpieza de formularios**: Los formularios de creación se limpian automáticamente al cerrar

## 9. Seguridad

- Autenticación mediante JWT
- Passport.js para estrategias de autenticación
- Validación de entrada en todas las rutas
- Sanitización de datos
- Manejo seguro de errores (no exponer detalles internos)
- Rate limiting en endpoints públicos (opcional)

## 10. State Management y UX

### 10.1 State Machine para Órdenes de Compra

**Implementación:**
- **Backend**: XState para validar transiciones de estado
- **Frontend**: Lógica de state machine para habilitar/deshabilitar botones y opciones
- **Estados posibles**: Pendiente, Aprobada, Rechazada, Enviada
- **Transiciones permitidas**:
  - Pendiente → Aprobada
  - Pendiente → Rechazada
  - Aprobada → Enviada
  - Rechazada y Enviada son estados finales

**Beneficios:**
- Prevención de transiciones inválidas
- UI consistente con reglas de negocio
- Validación centralizada en backend
- Mejor experiencia de usuario (botones deshabilitados según estado)

### 10.2 Validación de RNC/Cédula Dominicano

**Implementación:**
- Algoritmo de validación dominicano para cédulas (11 dígitos) y RNCs (9 u 11 dígitos)
- Validación en tres capas:
  1. **Frontend**: Validación inmediata para mejor UX
  2. **Backend Middleware**: Validación con express-validator
  3. **Modelo Sequelize**: Validación a nivel de base de datos

**Archivos:**
- `src/backend/utils/validators.js`: Funciones de validación y generación
- `src/backend/middleware/validation.js`: Middleware de validación
- `src/backend/models/Proveedor.js`: Validación en modelo

### 10.3 Mejoras de UX Implementadas

**Diseño Unificado de Botones:**
- Estilo consistente en todas las páginas
- Botones con bordes y fondos definidos
- Colores semánticos: Azul (Editar), Rojo (Desactivar/Eliminar), Verde (Activar)
- Transiciones suaves y estados hover claros
- Tooltips informativos

**Visualización de Detalles:**
- Modal de detalles de órdenes de compra implementado
- Tabla completa con artículos, cantidades, costos y subtotales
- Cálculo automático de totales
- Modal de tamaño ampliado (max-w-4xl) para evitar scroll horizontal
- Disponible en páginas de Ordenes de Compra y Consultas

**Filtrado Inteligente:**
- Dropdowns muestran solo registros activos
- Mejora la experiencia evitando selección de registros inactivos
- Aplicado en formularios de creación/edición de órdenes de compra

**Limpieza de Formularios:**
- Formularios de creación se limpian automáticamente al cerrar
- Reset de campos al abrir modal de creación
- Mejor experiencia al crear múltiples registros consecutivos

## 11. Testing

- **Unit Tests**: Services, Repositories, Utils, State Machines, Validators
- **Integration Tests**: Controllers, Routes, Database
- **E2E Tests**: Flujos completos de usuario (opcional)

## 12. Consideraciones de Despliegue

- Variables de entorno para configuración
- Migraciones de base de datos antes de iniciar (Sequelize CLI)
- Logging estructurado
- Manejo de errores centralizado
- Health check endpoint (`/api/health`)
- Conexión a SQL Server Express usando `tedious` o `mssql` driver

### 12.1 Configuración de SQL Server Express

**Para Windows:**
- Instalar SQL Server Express desde Microsoft
- Instancia por defecto: `SQLEXPRESS`
- Puerto: `1433` (default)
- Autenticación: Mixed Mode (Windows + SQL Server)
- Usuario: `sa` con contraseña configurada

**Para Mac:**
- Ejecutar SQL Server Express en Docker
- Puerto mapeado: `1433:1433`
- Usuario: `sa` con contraseña segura

**Conexión desde Node.js:**
```javascript
// Sequelize config para SQL Server
dialect: 'mssql',
dialectOptions: {
  options: {
    instanceName: 'SQLEXPRESS',  // Solo Windows
    encrypt: false,  // Desarrollo local
    trustServerCertificate: true
  }
}
```

Para más detalles sobre instalación y configuración, ver `README.md`

## 13. Componentes y Utilidades Adicionales

### 13.1 Componentes Frontend Reutilizables

**Modal Component** (`components/common/Modal.tsx`):
- Componente base para modales
- Tamaño configurable (max-w-lg por defecto, max-w-2xl para formularios, max-w-4xl para detalles)
- Overlay con backdrop click para cerrar
- Animaciones suaves

**ConfirmModal Component** (`components/common/ConfirmModal.tsx`):
- Modal de confirmación para acciones destructivas
- Variantes: danger, warning, info
- Botones de confirmación y cancelación personalizables

**OrdenDetallesModal Component** (`components/common/OrdenDetallesModal.tsx`):
- Modal especializado para mostrar detalles completos de órdenes de compra
- Tabla con información de artículos
- Cálculo automático de subtotales y totales
- Formato de moneda dominicana

### 13.2 Utilidades Backend

**Validadores Personalizados** (`utils/validators.js`):
- `validateCedula()`: Valida cédula dominicana (11 dígitos)
- `validateRNC()`: Valida RNC dominicano (9 u 11 dígitos)
- `validateCedulaRNC()`: Valida cualquiera de los dos formatos
- `generateCedula()`: Genera cédula válida con dígito verificador
- `generateRNC()`: Genera RNC válido con dígito verificador

**State Machine** (`stateMachines/ordenCompraStateMachine.js`):
- Define estados y transiciones válidas
- Funciones helper: `isValidTransition()`, `getNextStates()`, `getEventForTransition()`
- Validación centralizada de reglas de negocio

## 14. Próximos Pasos (Futuro)

- Implementar autenticación de usuarios
- Dashboard con estadísticas
- Reportes de compras
- Notificaciones por email
- Historial de cambios (auditoría)

## 15. Referencias

Para información sobre instalación, configuración y uso del sistema, consulta:
- **[README.md](./README.md)** - Guía completa de instalación y uso
- **[DIAGRAMA_ENTIDADES.md](./DIAGRAMA_ENTIDADES.md)** - Modelo de datos detallado

