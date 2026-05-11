import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/admin/Users'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando...</div>
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.rol !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: '220px', background: '#0f172a', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>⚕ Biomédico</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{user?.nombre}</div>
          <span style={{ fontSize: '11px', background: '#1e3a5f', color: '#93c5fd', padding: '2px 8px', borderRadius: '99px', display: 'inline-block', marginTop: '6px' }}>
            {user?.rol}
          </span>
        </div>
        <nav style={{ padding: '16px 12px' }}>
          <Link to="/dashboard" style={navLink}>Dashboard</Link>
          {user?.rol === 'admin' && (
            <Link to="/admin/users" style={navLink}>Usuarios</Link>
          )}
        </nav>
        <div style={{ position: 'absolute', bottom: '24px', padding: '0 12px', width: '220px' }}>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px', background: '#1e293b', color: '#f87171', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            Cerrar sesión
          </button>
        </div>
      </div>
      {/* Contenido */}
      <div style={{ flex: 1, background: '#f8fafc', overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}

const navLink = {
  display: 'block', padding: '8px 12px', color: '#94a3b8',
  textDecoration: 'none', borderRadius: '8px', fontSize: '14px', marginBottom: '4px'
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <Layout><Dashboard /></Layout>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute>
          <Layout><Users /></Layout>
        </AdminRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}