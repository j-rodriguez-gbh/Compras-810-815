export interface Departamento {
  id: number
  nombre: string
  estado: 'Activo' | 'Inactivo'
  createdAt?: string
  updatedAt?: string
}

export interface UnidadMedida {
  id: number
  descripcion: string
  estado: 'Activo' | 'Inactivo'
  createdAt?: string
  updatedAt?: string
}

export interface Proveedor {
  id: number
  cedulaRNC: string
  nombreComercial: string
  estado: 'Activo' | 'Inactivo'
  createdAt?: string
  updatedAt?: string
}

export interface Articulo {
  id: number
  descripcion: string
  marca?: string
  unidadMedidaId: number
  existencia: number
  estado: 'Activo' | 'Inactivo'
  unidadMedida?: UnidadMedida
  createdAt?: string
  updatedAt?: string
}

export interface OrdenCompraDetalle {
  id?: number
  ordenCompraId?: number
  articuloId: number
  cantidad: number
  unidadMedidaId: number
  costoUnitario: number
  subtotal?: number
  articulo?: Articulo
  unidadMedida?: UnidadMedida
}

export interface OrdenCompra {
  id: number
  numeroOrden: string
  fechaOrden: string
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Enviada'
  departamentoId: number
  proveedorId: number
  departamento?: Departamento
  proveedor?: Proveedor
  detalles?: OrdenCompraDetalle[]
  createdAt?: string
  updatedAt?: string
}

export interface Usuario {
  id: number
  username: string
  email: string
  nombre: string
  rol: 'Administrador' | 'Usuario'
  estado: 'Activo' | 'Inactivo'
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nombre: string
}

export interface AuthResponse {
  token: string
  usuario: Usuario
}

export interface AsientoContable {
  id: number
  identificadorAsiento: string
  descripcion?: string
  tipoInventarioId?: string
  cuentaContable?: string
  tipoMovimiento: 'DB' | 'CR'
  fechaAsiento: string
  montoAsiento: number
  estado: 'Pendiente' | 'Enviado' | 'Confirmado' | 'Error'
  ordenCompraId?: number
  ordenCompra?: OrdenCompra
  createdAt?: string
  updatedAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface AsientoContableExterno {
  id: number
  createdAt: string
  isActive: boolean
  description: string
  auxiliary: {
    id: number
    createdAt: string
    isActive: boolean
    name: string
  }
  account: {
    id: number
    createdAt: string
    isActive: boolean
    description: string
    allowsMovement: string
    level: number
    balance: number
  }
  movementType: 'DB' | 'CR'
  entryDate: string
  amount: number
  transactionStatus: string
}


