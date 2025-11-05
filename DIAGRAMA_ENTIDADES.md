# Diagrama de Entidades y Relaciones

## Modelo Entidad-Relación (MER)

```
┌─────────────────┐
│  Departamento   │
├─────────────────┤
│ PK id           │
│    nombre       │
│    estado       │
│    timestamps   │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│  OrdenCompra    │
├─────────────────┤
│ PK id           │
│    numeroOrden  │
│    fechaOrden   │
│    estado       │
│ FK departamentoId│
│ FK proveedorId  │
│    timestamps   │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌──────────────────────┐
│ OrdenCompraDetalle  │
├──────────────────────┤
│ PK id                │
│ FK ordenCompraId     │
│ FK articuloId        │
│ FK unidadMedidaId    │
│    cantidad          │
│    costoUnitario     │
│    subtotal          │
│    timestamps        │
└──────────┬───────────┘
           │
           │ N:1
           │
           ▼
┌─────────────────┐
│    Articulo     │
├─────────────────┤
│ PK id           │
│    descripcion  │
│    marca        │
│ FK unidadMedidaId│
│    existencia   │
│    estado       │
│    timestamps   │
└────────┬────────┘
         │
         │ N:1
         │
         ▼
┌─────────────────┐
│ UnidadMedida    │
├─────────────────┤
│ PK id           │
│    descripcion  │
│    estado       │
│    timestamps   │
└─────────────────┘

┌─────────────────┐
│   Proveedor     │
├─────────────────┤
│ PK id           │
│    cedulaRNC    │
│    nombreComercial│
│    estado       │
│    timestamps   │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐
│  OrdenCompra    │
└─────────────────┘

┌─────────────────┐
│ AsientoContable │
├─────────────────┤
│ PK id           │
│    identificadorAsiento│
│    descripcion  │
│    tipoInventarioId│
│    cuentaContable│
│    tipoMovimiento│
│    fechaAsiento │
│    montoAsiento │
│    estado       │
│ FK ordenCompraId│ (nullable)
│    timestamps   │
└─────────────────┘
```

## Relaciones Detalladas

### 1. Departamento ↔ OrdenCompra
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Un Departamento puede tener múltiples Ordenes de Compra
- **Restricción**: No se puede eliminar un Departamento si tiene Ordenes asociadas

### 2. Proveedor ↔ OrdenCompra
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Un Proveedor puede tener múltiples Ordenes de Compra
- **Restricción**: No se puede eliminar un Proveedor si tiene Ordenes asociadas

### 3. OrdenCompra ↔ OrdenCompraDetalle
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Una Orden de Compra puede tener múltiples Detalles
- **Restricción**: Una Orden debe tener al menos un Detalle para ser válida

### 4. Articulo ↔ OrdenCompraDetalle
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Un Artículo puede aparecer en múltiples Detalles de Orden
- **Restricción**: No se puede eliminar un Artículo si está en Detalles de Orden

### 5. UnidadMedida ↔ Articulo
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Una Unidad de Medida puede ser usada por múltiples Artículos
- **Restricción**: No se puede eliminar una Unidad de Medida si está en uso

### 6. UnidadMedida ↔ OrdenCompraDetalle
- **Tipo**: Uno a Muchos (1:N)
- **Cardinalidad**: Una Unidad de Medida puede ser usada en múltiples Detalles
- **Nota**: Permite que el detalle tenga una unidad diferente a la del artículo (por conversión)

### 7. OrdenCompra ↔ AsientoContable
- **Tipo**: Uno a Muchos (1:N, opcional)
- **Cardinalidad**: Una Orden de Compra puede generar múltiples Asientos Contables
- **Nota**: Relación nullable porque puede haber asientos sin orden asociada

## Consideraciones de Diseño

### Normalización
- Base de datos normalizada hasta 3NF (Tercera Forma Normal)
- Evita redundancia de datos
- Mantiene integridad referencial

### Índices Recomendados
- `numeroOrden` (UNIQUE) en OrdenCompra
- `cedulaRNC` (UNIQUE) en Proveedor
- `nombre` (UNIQUE) en Departamento
- `descripcion` (UNIQUE) en UnidadMedida
- `fechaOrden` en OrdenCompra (para consultas por fecha)
- `estado` en todas las tablas (para filtros frecuentes)

### Campos Calculados
- `subtotal` en OrdenCompraDetalle: `cantidad * costoUnitario`
- `total` en OrdenCompra: Suma de todos los subtotales de sus detalles (calculado en aplicación, no en BD)

### Soft Delete
- Todas las entidades principales tienen campo `estado`
- En lugar de DELETE físico, se actualiza `estado = 'Inactivo'`
- Permite recuperación y auditoría

