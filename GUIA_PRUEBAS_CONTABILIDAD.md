# Guía de Pruebas - Integración con Contabilidad

## Pasos para Probar la Integración

### 1. Preparar el Entorno

#### 1.1 Ejecutar Migraciones
Asegúrate de que todas las migraciones estén ejecutadas, incluyendo la de `AsientoContable`:

```bash
npm run migrate
```

#### 1.2 Verificar que las Tablas Existan
Verifica en tu base de datos que existan las tablas:
- `Usuario`
- `OrdenCompra`
- `AsientoContable`

### 2. Iniciar los Servidores

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### 3. Iniciar Sesión

1. Abre tu navegador en: `http://localhost:5174`
2. Inicia sesión con:
   - **Usuario:** `admin`
   - **Contraseña:** `admin123`

### 4. Crear y Aprobar una Orden de Compra

#### 4.1 Crear una Orden de Compra
1. Ve a **Órdenes de Compra** en el menú
2. Haz clic en **Nueva Orden**
3. Completa el formulario:
   - Selecciona un **Departamento**
   - Selecciona un **Proveedor**
   - Agrega al menos un **Artículo** con cantidad y costo
4. Guarda la orden

#### 4.2 Aprobar la Orden
1. En la lista de órdenes, encuentra la orden que acabas de crear
2. Haz clic en **Editar** (si está en estado "Pendiente")
3. Cambia el estado a **"Aprobada"**
4. Guarda los cambios

**✅ Esto debería generar automáticamente 2 asientos contables:**
- Uno con cuenta 80 (Compra de Mercancías - DB)
- Otro con cuenta 82 (Cuentas x Pagar - CR)

### 5. Verificar los Asientos Generados

#### Opción A: Desde la Base de Datos
Ejecuta esta consulta SQL:

```sql
SELECT 
    id,
    identificadorAsiento,
    descripcion,
    tipoInventarioId as 'Auxiliar',
    cuentaContable as 'Cuenta',
    tipoMovimiento as 'Tipo',
    montoAsiento as 'Monto',
    estado,
    fechaAsiento,
    ordenCompraId
FROM AsientoContable
WHERE ordenCompraId = [ID_DE_TU_ORDEN]
ORDER BY tipoMovimiento;
```

Deberías ver 2 registros:
- Uno con `cuentaContable = '80'`, `tipoMovimiento = 'DB'`
- Otro con `cuentaContable = '82'`, `tipoMovimiento = 'CR'`
- Ambos con `tipoInventarioId = '7'` (Auxiliar de Compras)
- Ambos con `estado = 'Pendiente'`

#### Opción B: Desde la API
Puedes probar con curl o Postman:

```bash
# Obtener asientos de una orden específica
curl -X GET "http://localhost:3000/api/asientos-contables?ordenCompraId=1" \
  -H "Authorization: Bearer [TU_TOKEN]"
```

### 6. Probar la Página de Contabilidad

1. Ve a **Contabilidad** en el menú
2. Deberías ver una tabla con las transacciones pendientes
3. Las columnas mostradas son:
   - **Id. Transaccion**: ID del asiento
   - **Descripcion**: Descripción del asiento
   - **Fecha Transacciones**: Fecha del asiento
   - **Monto**: Monto del asiento
   - **Id. Asiento**: Identificador del asiento
   - **Tipo Movimiento**: DB o CR

### 7. Filtrar Transacciones por Fecha

1. En la página de Contabilidad, usa los filtros:
   - **Fecha Desde**: Selecciona una fecha
   - **Fecha Hasta**: Selecciona una fecha
2. Las transacciones se filtrarán automáticamente

### 8. Contabilizar Asientos

#### 8.1 Contabilizar Individualmente
1. Marca el checkbox de una transacción
2. Haz clic en **Contabilizar (1)**
3. El sistema intentará enviar el asiento al Web Service de contabilidad

#### 8.2 Contabilizar Múltiples
1. Marca varios checkboxes
2. Haz clic en **Contabilizar (N)** donde N es el número seleccionado
3. Todos los asientos seleccionados se enviarán

**Nota:** El sistema enviará el asiento completo (ambas líneas DB y CR) al Web Service.

### 9. Verificar Estados

Después de contabilizar, los estados pueden cambiar a:
- **Confirmado**: Si el Web Service respondió exitosamente
- **Error**: Si hubo un problema al comunicarse con el Web Service

Puedes verificar los estados en la base de datos:

```sql
SELECT id, identificadorAsiento, estado, cuentaContable, tipoMovimiento
FROM AsientoContable
WHERE ordenCompraId = [ID_DE_TU_ORDEN];
```

### 10. Configurar Web Service de Contabilidad (Opcional)

Si tienes un Web Service de contabilidad disponible, configura la URL en tu archivo `.env`:

```env
CONTABILIDAD_WS_URL=http://localhost:8080/api/contabilidad/asiento
```

Si no tienes un Web Service, los asientos se quedarán en estado "Error" al intentar contabilizarlos, pero puedes verificar que:
1. Los asientos se generan correctamente
2. La interfaz funciona correctamente
3. El formato de datos es el correcto

## Pruebas con Postman/Thunder Client

### Endpoint: Generar Asientos desde Orden

```http
POST http://localhost:3000/api/asientos-contables/generar/1
Authorization: Bearer [TU_TOKEN]
Content-Type: application/json
```

### Endpoint: Obtener Transacciones Pendientes

```http
GET http://localhost:3000/api/asientos-contables/pendientes?fechaDesde=2024-01-01&fechaHasta=2024-12-31
Authorization: Bearer [TU_TOKEN]
```

### Endpoint: Contabilizar un Asiento

```http
POST http://localhost:3000/api/asientos-contables/1/contabilizar
Authorization: Bearer [TU_TOKEN]
```

## Verificación de Datos Correctos

Según el Excel, un asiento de compras debe tener:

✅ **Id. Auxiliar**: 7 (Compras)  
✅ **Cuenta 80**: Compra de Mercancías (DB)  
✅ **Cuenta 82**: Cuentas x Pagar Proveedor X (CR)  
✅ **Mismo monto** en ambas líneas  
✅ **Misma fecha** en ambas líneas  
✅ **Descripción** relacionada con la orden  

## Solución de Problemas

### Los asientos no se generan automáticamente
- Verifica que la orden esté en estado "Aprobada"
- Revisa la consola del backend para ver errores
- Verifica que la migración de AsientoContable se ejecutó correctamente

### Error al contabilizar
- Verifica que el Web Service esté disponible (si lo tienes)
- Revisa la URL en `.env`
- Verifica que ambos asientos (DB y CR) estén en estado "Pendiente"

### No veo transacciones en la página
- Verifica que hayas aprobado al menos una orden
- Ajusta los filtros de fecha
- Revisa la consola del navegador para errores

## Próximos Pasos

Una vez que verifiques que todo funciona:
1. Integra con el Web Service real de contabilidad
2. Ajusta las cuentas contables según tu plan de cuentas
3. Personaliza las descripciones según tus necesidades

