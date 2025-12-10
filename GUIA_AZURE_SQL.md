# Guía: Configurar SQL Server en Azure

Esta guía te ayudará a crear y configurar una base de datos SQL Server en Azure para tu aplicación.

## 📋 Requisitos Previos

- Cuenta de Azure (puedes crear una gratis en https://azure.microsoft.com/free/)
- Suscripción activa de Azure (tienes créditos gratis al registrarte)

---

## 🚀 PARTE 1: Crear SQL Server en Azure

### Paso 1: Acceder a Azure Portal

1. Ve a https://portal.azure.com
2. Inicia sesión con tu cuenta de Azure

### Paso 2: Crear un SQL Server

1. En el portal de Azure, haz clic en **"Create a resource"** (Crear un recurso) o busca "SQL Server" en la barra de búsqueda superior
2. Selecciona **"SQL Database"** o busca **"Azure SQL"**
3. Haz clic en **"Create"** (Crear)

### Paso 3: Configurar el SQL Server

**Pestaña "Basics" (Básicos):**

1. **Subscription (Suscripción)**: Selecciona tu suscripción
2. **Resource Group (Grupo de recursos)**:
   - Si no tienes uno, haz clic en **"Create new"**
   - Nombre sugerido: `compras-rg` o `sistema-compras-rg`
3. **Database name (Nombre de la base de datos)**: `ComprasDB`
4. **Server (Servidor)**:
   - Haz clic en **"Create new"**
   - **Server name**: `compras-sql-server` (debe ser único globalmente)
   - **Location (Región)**: Selecciona la región más cercana a ti (ej: `East US`, `West Europe`)
   - **Authentication method**: Selecciona **"Use SQL authentication"**
   - **Server admin login**: `comprasadmin` (o el nombre que prefieras)
   - **Password**: Crea una contraseña segura (guárdala, la necesitarás)
   - **Confirm password**: Confirma la contraseña
5. **Want to use SQL elastic pool?**: Selecciona **"No"**
6. **Compute + storage**: 
   - Para desarrollo/pruebas, selecciona **"Basic"** o **"Serverless"** (más económico)
   - Para producción, considera **"General Purpose"**

**Pestaña "Networking" (Redes):**

1. **Network connectivity**:
   - Selecciona **"Public endpoint"** (Endpoint público)
2. **Firewall rules**:
   - Marca **"Allow Azure services and resources to access this server"** ✅
   - Marca **"Add current client IP address"** ✅ (esto agregará tu IP actual)
   - Opcional: Para permitir acceso desde cualquier lugar (solo para desarrollo), puedes agregar una regla:
     - **Rule name**: `AllowAll`
     - **Start IP address**: `0.0.0.0`
     - **End IP address**: `255.255.255.255`
     - ⚠️ **ADVERTENCIA**: Esto es solo para desarrollo. En producción, usa IPs específicas.

**Pestaña "Security" (Seguridad):**

1. Puedes dejar las opciones por defecto o configurar según tus necesidades
2. **Microsoft Defender for SQL**: Puedes habilitarlo más tarde si lo necesitas

**Pestaña "Additional settings" (Configuración adicional):**

1. **Data source**: Deja "None" (Ninguna)
2. **Database collation**: Deja el valor por defecto (`SQL_Latin1_General_CP1_CI_AS`)

### Paso 4: Revisar y Crear

1. Haz clic en **"Review + create"** (Revisar y crear)
2. Revisa la configuración
3. Haz clic en **"Create"** (Crear)
4. Espera a que se complete la implementación (puede tardar 2-5 minutos)

---

## 🔧 PARTE 2: Obtener Información de Conexión

### Paso 1: Obtener el Nombre del Servidor

1. Una vez creado, ve a **"Go to resource"** (Ir al recurso)
2. En la página de la base de datos, verás el **"Server name"** (Nombre del servidor)
   - Ejemplo: `compras-sql-server.database.windows.net`
   - **Copia este nombre completo**

### Paso 2: Obtener el Nombre de la Base de Datos

- El nombre es el que configuraste: `ComprasDB`

### Paso 3: Obtener Credenciales

- **Usuario**: El que configuraste (ej: `comprasadmin`)
- **Contraseña**: La que configuraste al crear el servidor

---

## 🔐 PARTE 3: Configurar Firewall para Railway

### Paso 1: Agregar IP de Railway

Railway puede usar IPs dinámicas, pero puedes configurar el firewall de Azure para permitir conexiones desde Railway:

1. En Azure Portal, ve a tu **SQL Server** (no la base de datos)
2. En el menú lateral, busca **"Networking"** (Redes) o **"Firewalls and virtual networks"**
3. Haz clic en **"Add client IP"** para agregar tu IP actual
4. Para Railway, necesitarás agregar un rango de IPs o usar la opción "Allow Azure services"

**Opción Recomendada para Railway:**

1. En la sección de Firewall, marca:
   - ✅ **"Allow Azure services and resources to access this server"**
2. Esto permitirá que servicios de Azure (y Railway si está en Azure) se conecten

**Si Railway no está en Azure:**

1. Necesitarás obtener la IP pública de Railway (puede cambiar)
2. O usar una solución como **Azure Private Link** (más complejo)

**Alternativa Temporal para Desarrollo:**

1. Agrega una regla de firewall amplia temporalmente:
   - **Rule name**: `Railway`
   - **Start IP**: `0.0.0.0`
   - **End IP**: `255.255.255.255`
   - ⚠️ Solo para desarrollo/pruebas

---

## 🔌 PARTE 4: Configurar Variables de Entorno en Railway

Una vez que tengas tu SQL Server en Azure, configura estas variables en Railway:

### Variables de Conexión

```
DB_HOST=compras-sql-server.database.windows.net
DB_PORT=1433
DB_NAME=ComprasDB
DB_USER=comprasadmin
DB_PASSWORD=tu_contraseña_aqui
DB_INSTANCE=
DB_DIALECT=mssql
```

### Explicación de cada variable:

- **DB_HOST**: El nombre completo del servidor (ej: `compras-sql-server.database.windows.net`)
- **DB_PORT**: `1433` (puerto estándar de SQL Server)
- **DB_NAME**: `ComprasDB` (nombre de tu base de datos)
- **DB_USER**: El usuario admin que creaste (ej: `comprasadmin`)
- **DB_PASSWORD**: La contraseña que configuraste
- **DB_INSTANCE**: Déjalo vacío (no se usa para Azure SQL)
- **DB_DIALECT**: `mssql` (para SQL Server)

---

## 🧪 PARTE 5: Probar la Conexión

### Opción 1: Desde Azure Portal

1. Ve a tu base de datos en Azure Portal
2. Haz clic en **"Query editor"** (Editor de consultas) en el menú lateral
3. Inicia sesión con tus credenciales
4. Ejecuta una consulta simple: `SELECT 1 AS test;`
5. Si funciona, la conexión está correcta

### Opción 2: Desde tu aplicación local

1. Actualiza tu archivo `.env` local con las credenciales de Azure:
   ```env
   DB_HOST=compras-sql-server.database.windows.net
   DB_PORT=1433
   DB_NAME=ComprasDB
   DB_USER=comprasadmin
   DB_PASSWORD=tu_contraseña
   DB_INSTANCE=
   DB_DIALECT=mssql
   ```

2. Ejecuta las migraciones:
   ```bash
   npm run migrate
   ```

3. Si las migraciones se ejecutan correctamente, la conexión funciona

### Opción 3: Desde Railway

1. Configura las variables de entorno en Railway (ver Parte 4)
2. Ejecuta las migraciones desde Railway:
   - Ve a tu servicio en Railway
   - Abre la terminal/shell
   - Ejecuta: `npm run migrate`

---

## 📝 PARTE 6: Actualizar Configuración de Base de Datos

### Verificar configuración de Sequelize

Tu archivo `src/backend/config/database.config.js` ya está configurado para SQL Server. Solo necesitas asegurarte de que las variables de entorno estén correctas.

### Cadena de Conexión Alternativa

Si prefieres usar una cadena de conexión completa, Azure te proporciona una en el portal:

1. Ve a tu base de datos en Azure Portal
2. Haz clic en **"Connection strings"** (Cadenas de conexión)
3. Copia la cadena de conexión ADO.NET
4. Formato: `Server=tcp:compras-sql-server.database.windows.net,1433;Initial Catalog=ComprasDB;Persist Security Info=False;User ID=comprasadmin;Password=tu_password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`

---

## 💰 PARTE 7: Costos y Optimización

### Planes de Azure SQL Database

1. **Basic**: ~$5/mes - Para desarrollo/pruebas
2. **Serverless**: Pago por uso - Buena opción para desarrollo
3. **General Purpose**: Desde ~$150/mes - Para producción

### Reducir Costos

1. Usa **Serverless** para desarrollo
2. Pausa la base de datos cuando no la uses (Serverless)
3. Usa **Basic** tier para pruebas
4. Considera **Azure SQL Database Elastic Pool** si tienes múltiples bases de datos

---

## 🔒 PARTE 8: Seguridad (Producción)

### Mejores Prácticas

1. **No uses la regla de firewall 0.0.0.0 - 255.255.255.255 en producción**
2. **Usa IPs específicas** para Railway o servicios conocidos
3. **Habilita "Allow Azure services"** si Railway está en Azure
4. **Usa contraseñas seguras** (mínimo 12 caracteres, mayúsculas, minúsculas, números, símbolos)
5. **Habilita Microsoft Defender for SQL** para monitoreo de seguridad
6. **Configura alertas** para actividad sospechosa

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to server"

**Causa**: Firewall bloqueando la conexión
**Solución**: 
1. Verifica que tu IP esté en las reglas de firewall
2. Verifica que "Allow Azure services" esté habilitado
3. Agrega la IP de Railway si es necesario

### Error: "Login failed for user"

**Causa**: Credenciales incorrectas
**Solución**:
1. Verifica el usuario y contraseña en Azure Portal
2. Asegúrate de usar el formato correcto: `usuario@servidor` (a veces necesario)

### Error: "Timeout"

**Causa**: Base de datos pausada (Serverless) o problemas de red
**Solución**:
1. Si usas Serverless, espera a que se reactive (puede tardar 1-2 minutos)
2. Verifica la conectividad de red
3. Verifica que el puerto 1433 no esté bloqueado

### Error: "Encryption not supported"

**Causa**: Configuración de SSL/TLS
**Solución**:
- Azure SQL requiere encriptación. Tu configuración en `database.config.js` ya tiene `encrypt: true`, así que esto debería funcionar automáticamente.

---

## ✅ Checklist Final

- [ ] SQL Server creado en Azure
- [ ] Base de datos `ComprasDB` creada
- [ ] Firewall configurado (IPs permitidas)
- [ ] Credenciales guardadas de forma segura
- [ ] Variables de entorno configuradas en Railway
- [ ] Conexión probada desde local
- [ ] Migraciones ejecutadas en Azure
- [ ] Aplicación conectada desde Railway

---

## 📚 Recursos Adicionales

- [Documentación de Azure SQL Database](https://docs.microsoft.com/azure/azure-sql/database/)
- [Precios de Azure SQL Database](https://azure.microsoft.com/pricing/details/azure-sql-database/)
- [Guía de seguridad de Azure SQL](https://docs.microsoft.com/azure/azure-sql/database/security-overview)

---

¡Listo! Tu base de datos SQL Server está configurada en Azure y lista para usar con tu aplicación.

