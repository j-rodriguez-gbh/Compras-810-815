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

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

