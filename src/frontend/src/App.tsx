import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DepartamentosPage from './pages/Departamentos/DepartamentosPage'
import UnidadesMedidaPage from './pages/UnidadesMedida/UnidadesMedidaPage'
import ProveedoresPage from './pages/Proveedores/ProveedoresPage'
import ArticulosPage from './pages/Articulos/ArticulosPage'
import OrdenesCompraPage from './pages/OrdenesCompra/OrdenesCompraPage'
import ConsultasPage from './pages/Consultas/ConsultasPage'

// Íconos SVG inline
const BuildingOfficeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-1.5-1.5h-9m-1.5 3h9m-1.5 3h9M3 6h12" />
  </svg>
)

const RulerIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0L3.75 8.25l8.511-8.511M11.261 20.25l2.489-2.489m0 0L21.75 12l-8.511-8.511M8.25 21.75H3.75v-4.5m0 0h4.5m-4.5 0l2.489-2.489m0 0L3.75 15.75m2.489-2.489L6.75 12m-2.489 2.489L3.75 15.75m2.489-2.489L8.25 12m2.489-2.489L12 8.25m-2.489 2.489L8.25 12" />
  </svg>
)

const TruckIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m6.75 4.5v-4.5m0 4.5h-3.75m3.75 0h3.75m-3.75-4.5h-3.75m0 0H5.625m0 0a1.125 1.125 0 01-1.125-1.125V8.25m0 0h6m-6 0h3m6 0h3m-3 0v6m0-6v-6m0 6h-3m3 0h3" />
  </svg>
)

const CubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
)

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const MagnifyingGlassIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
)

function App() {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Sistema de Compras</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/departamentos"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/departamentos')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  Departamentos
                </Link>
                <Link
                  to="/unidades-medida"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/unidades-medida')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <RulerIcon className="w-5 h-5" />
                  Unidades de Medida
                </Link>
                <Link
                  to="/proveedores"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/proveedores')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <TruckIcon className="w-5 h-5" />
                  Proveedores
                </Link>
                <Link
                  to="/articulos"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/articulos')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <CubeIcon className="w-5 h-5" />
                  Artículos
                </Link>
                <Link
                  to="/ordenes-compra"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/ordenes-compra')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <DocumentTextIcon className="w-5 h-5" />
                  Órdenes de Compra
                </Link>
                <Link
                  to="/consultas"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/consultas')
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Consultas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DepartamentosPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route path="/unidades-medida" element={<UnidadesMedidaPage />} />
          <Route path="/proveedores" element={<ProveedoresPage />} />
          <Route path="/articulos" element={<ArticulosPage />} />
          <Route path="/ordenes-compra" element={<OrdenesCompraPage />} />
          <Route path="/consultas" element={<ConsultasPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

