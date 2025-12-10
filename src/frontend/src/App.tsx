import { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import DepartamentosPage from './pages/Departamentos/DepartamentosPage'
import UnidadesMedidaPage from './pages/UnidadesMedida/UnidadesMedidaPage'
import ProveedoresPage from './pages/Proveedores/ProveedoresPage'
import ArticulosPage from './pages/Articulos/ArticulosPage'
import OrdenesCompraPage from './pages/OrdenesCompra/OrdenesCompraPage'
import ConsultasPage from './pages/Consultas/ConsultasPage'
import ContabilidadPage from './pages/Contabilidad/ContabilidadPage'
import LoginPage from './pages/Login/LoginPage'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { useAuth } from './hooks/useAuth'

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

const CalculatorIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zM9 12.75h3.75v-1.5H9v1.5zm0 2.25h3.75v-1.5H9v1.5zM9 9h3.75V7.5H9V9zm-6 3.75h3.75v-1.5H3v1.5zm0 2.25h3.75v-1.5H3v1.5zM3 9h3.75V7.5H3V9zm12 3.75h3.75v-1.5H15v1.5zm0 2.25h3.75v-1.5H15v1.5zM15 9h3.75V7.5H15V9z" />
  </svg>
)

function App() {
  const location = useLocation()
  const { isAuthenticated, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/" replace />
  }

  if (location.pathname === '/login') {
    return <LoginPage />
  }

  const navLinks = [
    { 
      to: '/departamentos', 
      label: 'Departamentos', 
      icon: BuildingOfficeIcon,
      activeColor: 'bg-blue-50 text-blue-700 border-blue-500',
      hoverColor: 'hover:bg-blue-50 hover:text-blue-600',
      iconColor: 'text-blue-600'
    },
    { 
      to: '/unidades-medida', 
      label: 'Unidades de Medida', 
      icon: RulerIcon,
      activeColor: 'bg-purple-50 text-purple-700 border-purple-500',
      hoverColor: 'hover:bg-purple-50 hover:text-purple-600',
      iconColor: 'text-purple-600'
    },
    { 
      to: '/proveedores', 
      label: 'Proveedores', 
      icon: TruckIcon,
      activeColor: 'bg-green-50 text-green-700 border-green-500',
      hoverColor: 'hover:bg-green-50 hover:text-green-600',
      iconColor: 'text-green-600'
    },
    { 
      to: '/articulos', 
      label: 'Artículos', 
      icon: CubeIcon,
      activeColor: 'bg-orange-50 text-orange-700 border-orange-500',
      hoverColor: 'hover:bg-orange-50 hover:text-orange-600',
      iconColor: 'text-orange-600'
    },
    { 
      to: '/ordenes-compra', 
      label: 'Órdenes de Compra', 
      icon: DocumentTextIcon,
      activeColor: 'bg-indigo-50 text-indigo-700 border-indigo-500',
      hoverColor: 'hover:bg-indigo-50 hover:text-indigo-600',
      iconColor: 'text-indigo-600'
    },
    { 
      to: '/consultas', 
      label: 'Consultas', 
      icon: MagnifyingGlassIcon,
      activeColor: 'bg-pink-50 text-pink-700 border-pink-500',
      hoverColor: 'hover:bg-pink-50 hover:text-pink-600',
      iconColor: 'text-pink-600'
    },
    { 
      to: '/contabilidad', 
      label: 'Contabilidad', 
      icon: CalculatorIcon,
      activeColor: 'bg-teal-50 text-teal-700 border-teal-500',
      hoverColor: 'hover:bg-teal-50 hover:text-teal-600',
      iconColor: 'text-teal-600'
    },
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-md border-b-2 border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[4rem] py-2">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sistema de Compras
                </h1>
              </div>
              <div className="hidden md:ml-8 md:flex md:space-x-2 md:flex-1 md:justify-start">
                {navLinks.map((link) => {
                  const Icon = link.icon
                  const active = isActive(link.to)
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 min-w-[70px] ${
                        active
                          ? `${link.activeColor} border-b-2 shadow-sm transform scale-105`
                          : `text-gray-600 ${link.hoverColor} hover:shadow-md hover:scale-105`
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? '' : link.iconColor}`} />
                      <span className="text-center leading-tight font-semibold">{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {user && (
                <div className="hidden sm:block relative group">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xs cursor-pointer hover:from-blue-500 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-110">
                    {getInitials(user.nombre)}
                  </div>
                  <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-white to-blue-50 rounded-lg shadow-xl border-2 border-blue-200 py-2 z-50">
                    <div className="px-4 py-2">
                      <p className="text-sm font-semibold text-gray-900">{user.nombre}</p>
                      <p className="text-xs text-blue-600 font-medium">{user.rol}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={logout}
                className="inline-flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium text-red-600 hover:text-white hover:bg-gradient-to-br hover:from-red-500 hover:to-red-600 transition-all duration-200 min-w-[60px] shadow-sm hover:shadow-md transform hover:scale-105"
                data-testid="logout-button"
                title="Cerrar Sesión"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                <span className="hidden lg:inline text-center leading-tight font-semibold">Salir</span>
              </button>
              
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.to)
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                      active
                        ? `${link.activeColor} shadow-sm`
                        : `text-gray-600 ${link.hoverColor}`
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? '' : link.iconColor}`} />
                    {link.label}
                  </Link>
                )
              })}
              {user && (
                <div className="px-3 py-2 border-t-2 border-blue-200 mt-2 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold text-xs shadow-md">
                      {getInitials(user.nombre)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user.nombre}</p>
                      <p className="text-xs text-blue-600 font-medium">{user.rol}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DepartamentosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/departamentos"
            element={
              <ProtectedRoute>
                <DepartamentosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades-medida"
            element={
              <ProtectedRoute>
                <UnidadesMedidaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proveedores"
            element={
              <ProtectedRoute>
                <ProveedoresPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/articulos"
            element={
              <ProtectedRoute>
                <ArticulosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ordenes-compra"
            element={
              <ProtectedRoute>
                <OrdenesCompraPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consultas"
            element={
              <ProtectedRoute>
                <ConsultasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contabilidad"
            element={
              <ProtectedRoute>
                <ContabilidadPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

