# Decisiones de Arquitectura - Justificaciones

## 1. Elección de Patrón MVC

### Justificación
- **Requerimiento del profesor**: El proyecto debe seguir el patrón MVC
- **Separación de responsabilidades**: Facilita mantenimiento y escalabilidad
- **Testabilidad**: Cada capa puede ser probada independientemente
- **Estándar de la industria**: Patrón ampliamente reconocido y documentado

### Implementación
- **Model**: Sequelize Models (representación de datos)
- **View**: React Components (presentación)
- **Controller**: Express Controllers (lógica de coordinación)

## 2. Patrón Repository Adicional

### Justificación
- **Abstracción de acceso a datos**: Permite cambiar ORM o BD sin afectar servicios
- **Testabilidad**: Facilita mock de repositorios en tests
- **Reutilización**: Lógica de acceso a datos centralizada
- **Mantenibilidad**: Cambios en estructura de BD solo afectan repositorios

### Beneficios
- Permite implementar caché en repositorio sin afectar servicios
- Facilita implementación de patrones como Unit of Work
- Preparado para futuro uso de múltiples fuentes de datos

## 3. Capa de Servicios

### Justificación
- **Lógica de negocio centralizada**: No dispersa en controllers
- **Reutilización**: Lógica compartida entre diferentes endpoints
- **Transacciones**: Manejo de transacciones de BD complejas
- **Integraciones**: Punto centralizado para integraciones externas (WS Contabilidad)

### Responsabilidades
- Validaciones de negocio complejas
- Cálculos y transformaciones de datos
- Coordinación entre múltiples repositorios
- Integración con sistemas externos

## 4. Stack Tecnológico

### Backend: Node.js + Express.js

**Ventajas:**
- **JavaScript/TypeScript**: Mismo lenguaje en frontend y backend
- **Ecosistema**: Amplia disponibilidad de paquetes npm
- **Performance**: Buena para I/O intensivo (API REST)
- **Rápido desarrollo**: Desarrollo ágil y prototipado rápido

**Desventajas mitigadas:**
- TypeScript añade tipado estático
- Sequelize proporciona abstracción de BD robusta

### Base de Datos: Microsoft SQL Server Express

**Justificación:**
- **Requerimiento del proyecto**: El sistema debe tener partes significativas tanto open source como propietarias
- **Gratis para desarrollo local**: SQL Server Express es completamente gratuito para Windows y Mac
- **Propietario significativo**: Es una tecnología propietaria de Microsoft, importante para cumplir el requisito
- **Límites adecuados**: 10GB por BD, 1GB RAM, 4 cores - suficientes para desarrollo y proyecto académico
- **Herramientas incluidas**: SSMS (SQL Server Management Studio) gratis para administración
- **Compatibilidad**: Sequelize soporta SQL Server perfectamente
- **Estándar empresarial**: Tecnología ampliamente usada en entornos empresariales

**Ventajas:**
- **Propietario**: Cumple requerimiento de tecnologías propietarias significativas
- **Gratis**: Sin costo para desarrollo local en Windows/Mac
- **Robusto**: Sistema de BD maduro y confiable de Microsoft
- **Relacional**: Ideal para datos estructurados del sistema
- **Integridad**: Soporte completo de claves foráneas y restricciones
- **Herramientas**: SSMS proporciona excelente interfaz gráfica
- **Performance**: Optimizado para Windows, pero funciona en Mac vía Docker

**Consideraciones:**
- **Límites**: Suficientes para proyecto académico, pero limitados para producción masiva
- **Driver**: Usar `tedious` o `mssql` npm package para conexión desde Node.js
- **Migraciones**: Sequelize soporta migraciones para SQL Server
- **Mac**: Instalar vía Docker o usar versión para Linux

**Alternativas consideradas:**
- **PostgreSQL**: Open source excelente, pero no cumple el requisito de parte significativa propietaria
- **MySQL**: Similar a PostgreSQL, open source
- **Oracle Express**: Propietario y gratis, pero más complejo de instalar

### ORM: Sequelize

**Ventajas:**
- **Mature**: ORM maduro y establecido
- **Migrations**: Sistema de migraciones integrado
- **Associations**: Manejo automático de relaciones
- **Validations**: Validaciones a nivel de modelo
- **Hooks**: Lifecycle hooks para lógica adicional

**Alternativas consideradas:**
- TypeORM: Buena opción, pero Sequelize tiene mejor documentación
- Prisma: Más moderno, pero requiere ajustes en arquitectura

### Frontend: React + TypeScript

**Ventajas:**
- **Componentización**: Reutilización de componentes
- **Ecosistema**: Amplia comunidad y librerías
- **TypeScript**: Tipado estático reduce errores
- **Virtual DOM**: Rendimiento optimizado
- **Hooks**: API moderna y declarativa

### XState para State Machines

**Justificación:**
- **Validación centralizada**: Reglas de negocio para transiciones de estado en un solo lugar
- **Consistencia**: Mismo comportamiento en frontend y backend
- **Mantenibilidad**: Fácil agregar nuevos estados o transiciones
- **Prevención de errores**: Imposible realizar transiciones inválidas

**Implementación:**
- Backend: Validación de transiciones en Service layer
- Frontend: Lógica de UI basada en estados posibles
- Beneficios: Botones deshabilitados según estado, validación en múltiples capas

### React Query (TanStack Query)

**Ventajas:**
- **Caché automático**: Reduce llamadas innecesarias al servidor
- **Estado del servidor**: Manejo declarativo de estado remoto
- **Optimistic updates**: Actualizaciones optimistas
- **Refetch automático**: Revalidación inteligente de datos
- **Integración**: Perfecto para REST APIs

### Tailwind CSS

**Ventajas:**
- **Rápido desarrollo**: Estilos utilitarios sin CSS custom
- **Consistencia**: Sistema de diseño integrado
- **Performance**: Solo genera CSS usado
- **Mantenibilidad**: No hay CSS global que cause conflictos

## 5. Estructura de Capas

### Separación Backend/Frontend

**Justificación:**
- **Escalabilidad**: Backend y frontend pueden escalar independientemente
- **Reutilización**: API puede ser consumida por múltiples clientes (web, móvil)
- **Desarrollo paralelo**: Equipos pueden trabajar simultáneamente
- **Tecnologías independientes**: Flexibilidad en elección de tecnologías

### Estructura de Directorios

**Principios aplicados:**
- **Feature-based**: Agrupación por funcionalidad (departamentos, artículos, etc.)
- **Layer-based**: Separación por capa (models, services, controllers)
- **Híbrido**: Combina ambos enfoques para balance óptimo

## 6. Integración con Sistema de Contabilidad

### Estrategia: Web Service (SOAP/REST)

**Justificación:**
- **Desacoplamiento**: Sistema de compras independiente del sistema de contabilidad
- **Estándar**: Web Services son estándar de la industria
- **Flexibilidad**: Puede cambiar implementación del WS sin afectar sistema de compras
- **Asíncrono**: Permite manejo de errores y reintentos

### Implementación

**ContabilidadService:**
- Abstrae detalles de comunicación con WS
- Maneja errores y reintentos
- Registra estado de envío en BD
- Permite monitoreo y auditoría

**Tabla AsientoContable:**
- Tracking de asientos enviados
- Permite reintentos en caso de fallo
- Auditoría de integración
- Historial completo

## 7. Manejo de Estados

### Estados de Entidades

**Principios:**
- **Activo/Inactivo**: Soft delete, permite recuperación
- **Estados de Orden**: Flujo de trabajo controlado por State Machine (Pendiente → Aprobada → Enviada o Rechazada)
- **Estados de Asiento**: Tracking de integración (Pendiente → Enviado → Confirmado)

**Beneficios:**
- Auditoría completa
- Historial de cambios
- Recuperación de datos eliminados
- Reportes históricos
- Prevención de transiciones inválidas mediante State Machine

### State Machine para Órdenes de Compra

**Justificación:**
- **Control de flujo**: Garantiza que solo se permitan transiciones válidas
- **Consistencia**: Mismo comportamiento en frontend y backend
- **Mantenibilidad**: Fácil agregar nuevos estados o modificar reglas
- **UX mejorada**: Botones deshabilitados según estado actual

**Implementación:**
- Backend: Validación de transiciones en `OrdenCompraService`
- Frontend: Lógica de UI basada en `getNextStates()`
- Estados finales: Rechazada y Enviada no permiten edición
- Protección: No se pueden eliminar órdenes en estado 'Enviada'

## 8. Validaciones

### Capas de Validación

**1. Frontend (React Hook Form + Zod)**
- Validación inmediata para UX
- Reduce carga en servidor
- Feedback instantáneo

**2. Backend (Express-validator + Zod)**
- Seguridad: No confiar solo en frontend
- Validación de formato
- Sanitización de datos

**3. Base de Datos (Constraints)**
- Última línea de defensa
- Integridad referencial
- Constraints de unicidad
- Validadores personalizados en modelos Sequelize

**Justificación:**
- **Defense in depth**: Múltiples capas de validación
- **Seguridad**: Validación en backend es crítica
- **UX**: Validación en frontend mejora experiencia

### Validación de RNC/Cédula Dominicano

**Justificación:**
- **Requerimiento de negocio**: Validar documentos de identidad dominicanos
- **Algoritmo específico**: Requiere implementación de algoritmo de validación dominicano
- **Defense in depth**: Validación en tres capas (Frontend, Backend, Base de datos)

**Implementación:**
- Algoritmo de validación para cédulas (11 dígitos) y RNCs (9 u 11 dígitos)
- Validación de dígito verificador
- Funciones de generación para migraciones de datos
- Integrado en middleware de validación y modelo Sequelize

## 9. Nomenclatura y Convenciones

### Nombres de Tablas
- **Singular en español**: `Departamento`, `Articulo` (según requerimientos del profesor)
- **CamelCase en JavaScript**: `OrdenCompra`, `UnidadMedida`
- **PascalCase en SQL Server**: `OrdenCompra`, `UnidadMedida` (convención SQL Server, aunque Sequelize puede usar snake_case si se configura)

### Nombres de Archivos
- **Backend**: PascalCase para modelos, camelCase para servicios/controllers
- **Frontend**: PascalCase para componentes, camelCase para hooks/utilities

### Endpoints REST
- **Plural**: `/api/departamentos` (convención REST)
- **Kebab-case**: `/api/ordenes-compra` (legibilidad)
- **Verbos HTTP**: GET, POST, PUT, DELETE estándar

## 10. Consideraciones de Seguridad

### Autenticación con JWT

**Justificación:**
- **Stateless**: No requiere sesiones en servidor
- **Escalable**: Funciona bien en arquitectura distribuida
- **Estándar**: Ampliamente adoptado

### Passport.js

**Ventajas:**
- **Flexibilidad**: Múltiples estrategias de autenticación
- **Middleware**: Fácil integración con Express
- **Extensible**: Fácil añadir OAuth, LDAP, etc.

## 11. Testing Strategy

### Unit Tests
- Services: Lógica de negocio
- Repositories: Acceso a datos
- Utils: Funciones auxiliares

### Integration Tests
- Controllers: Flujo completo request → response
- Routes: Endpoints REST
- Database: Operaciones de BD

### E2E Tests (Opcional)
- Flujos completos de usuario
- Integración frontend-backend

**Justificación:**
- **Cobertura**: Diferentes niveles de testing
- **Confianza**: Cambios no rompen funcionalidad existente
- **Documentación**: Tests como documentación viva

## 12. Consideraciones de Escalabilidad

### Preparación para Futuro

**Horizontal Scaling:**
- Stateless backend permite múltiples instancias
- Base de datos puede ser replicada
- Frontend puede estar en CDN

**Caché:**
- React Query maneja caché en frontend
- Preparado para Redis en backend (opcional)

**Monitoreo:**
- Logging estructurado
- Health check endpoint
- Preparado para APM (Application Performance Monitoring)

## 13. UX y Diseño de Interfaz

### Diseño Unificado de Botones

**Justificación:**
- **Consistencia visual**: Mismo estilo en todas las páginas
- **Usabilidad**: Colores semánticos facilitan reconocimiento de acciones
- **Mantenibilidad**: Cambios de diseño centralizados

**Implementación:**
- Estilo consistente: `px-3 py-1.5` con bordes y fondos definidos
- Colores semánticos: Azul (Editar), Rojo (Desactivar/Eliminar), Verde (Activar)
- Transiciones suaves: `transition-colors` para mejor feedback
- Tooltips informativos: Explican por qué botones están deshabilitados

### Visualización de Detalles

**Justificación:**
- **Información completa**: Usuario necesita ver todos los detalles de una orden
- **Evitar scroll horizontal**: Modal grande previene scroll innecesario
- **Cálculos automáticos**: Subtotal y total calculados automáticamente

**Implementación:**
- Modal de tamaño `max-w-4xl` para detalles de órdenes
- Tabla completa con artículos, cantidades, costos y subtotales
- Formato de moneda dominicana con separadores de miles
- Disponible en páginas de Ordenes de Compra y Consultas

### Filtrado Inteligente de Dropdowns

**Justificación:**
- **Prevención de errores**: Evita selección de registros inactivos
- **Mejor UX**: Solo muestra opciones válidas
- **Consistencia**: Mismo comportamiento en todos los formularios

**Implementación:**
- Dropdowns filtran automáticamente registros activos
- Aplicado en formularios de creación/edición de órdenes de compra
- Filtrado en frontend para mejor rendimiento

### Limpieza Automática de Formularios

**Justificación:**
- **Mejor UX**: Usuario no necesita limpiar manualmente formularios
- **Prevención de errores**: Evita enviar datos de orden anterior
- **Consistencia**: Mismo comportamiento en todos los modales de creación

**Implementación:**
- `reset()` de React Hook Form al abrir modal de creación
- `replace()` de `useFieldArray` para arrays anidados
- `useEffect` para limpiar al cambiar estado del modal

## 14. Trade-offs y Compromisos

### Complejidad vs Simplicidad

**Decisiones:**
- **Repository Pattern**: Añade complejidad, pero mejora testabilidad
- **Service Layer**: Separación adicional, pero facilita mantenimiento
- **TypeScript**: Más verboso, pero reduce errores

**Balance:**
- Arquitectura suficiente para requerimientos actuales
- Preparada para crecimiento futuro
- No sobre-ingeniería para proyecto académico

### Performance vs Mantenibilidad

**Decisiones:**
- **ORM (Sequelize)**: Más lento que SQL raw, pero más mantenible
- **React Query**: Añade overhead, pero simplifica estado
- **Validaciones múltiples**: Más procesamiento, pero más seguro

**Balance:**
- Para proyecto académico, mantenibilidad > performance
- Optimizaciones pueden hacerse después si es necesario

## 15. Conformidad con Requerimientos

### ✅ Requerimientos Cumplidos

1. **Gestión de Departamentos**: ✓ CRUD completo con estados Activo/Inactivo
2. **Gestión de Artículos**: ✓ CRUD completo con estados Activo/Inactivo
3. **Gestión de Unidades de Medida**: ✓ CRUD completo con estados Activo/Inactivo
4. **Gestión de Proveedores**: ✓ CRUD completo con validación de RNC/Cédula dominicano
5. **Ordenes de Compra**: ✓ CRUD completo con detalles, State Machine para estados
6. **Consulta por criterios**: ✓ Endpoint implementado con filtros avanzados
7. **Patrón MVC**: ✓ Implementado en backend y frontend
8. **Tecnologías Open Source**: ✓ Node.js, Express, React, Sequelize, XState, etc.
9. **Tecnologías Propietarias**: ✓ SQL Server Express, SSMS, potencialmente componentes UI propietarios
10. **Integración con Contabilidad**: ✓ Servicio preparado para WS
11. **Validación de RNC/Cédula**: ✓ Algoritmo dominicano implementado en múltiples capas
12. **State Machine**: ✓ Control de transiciones de estado para órdenes de compra
13. **UX mejorada**: ✓ Diseño unificado, visualización de detalles, filtrado inteligente

### 📊 Balance Open Source vs Propietario

**Partes Significativas Open Source:**
- **Backend completo**: Node.js, Express.js, Sequelize ORM
- **Frontend completo**: React, TypeScript, React Query, Tailwind CSS
- **Herramientas de desarrollo**: Jest, ESLint, Prettier
- **Librerías**: Zod, Axios, Passport.js, JWT

**Partes Significativas Propietarias:**
- **Base de datos principal**: Microsoft SQL Server Express (propietario, gratis)
- **Herramientas de administración**: SQL Server Management Studio (SSMS) - propietario, gratis
- **Potencialmente componentes UI**: Syncfusion, DevExtreme, Telerik (versiones gratuitas para académicos)

**Distribución:**
- **~70% Open Source**: Backend y Frontend stack completo
- **~30% Propietario**: Base de datos y herramientas (crítico para persistencia de datos)
- Esta distribución asegura que ambas categorías sean significativas en el sistema

### 📋 Datos Mínimos

Todos los campos mínimos requeridos están incluidos en el modelo de datos.

