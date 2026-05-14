import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/admin/Users'
import ChatIA from './pages/ChatIA'

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

function TecnicoRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.rol === 'viewer') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div>Cargando...</div>
  return user ? <Navigate to="/dashboard" replace /> : children
}

function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const inChat           = location.pathname === '/chat-ia'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const activeLink = (path) => ({
    ...navLink,
    ...(location.pathname === path ? navLinkActive : {}),
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar — oculto en chat IA ya que tiene su propio sidebar */}
      {!inChat && (
        <div style={{ width: '220px', background: '#0f172a', padding: '24px 0', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>⚕ Biomédico</div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{user?.nombre || user?.name}</div>
            <span style={{ fontSize: '11px', background: '#1e3a5f', color: '#93c5fd', padding: '2px 8px', borderRadius: '99px', display: 'inline-block', marginTop: '6px' }}>
              {user?.rol}
            </span>
          </div>
          <nav style={{ padding: '16px 12px', flex: 1 }}>
            <Link to="/dashboard"   style={activeLink('/dashboard')}>Dashboard</Link>
            {user?.rol === 'admin' && (
              <Link to="/admin/users" style={activeLink('/admin/users')}>Usuarios</Link>
            )}
            {(user?.rol === 'admin' || user?.rol === 'tecnico') && (
              <Link to="/chat-ia" style={activeLink('/chat-ia')}>Chat IA</Link>
            )}
          </nav>
          <div style={{ padding: '0 12px 24px' }}>
            <button onClick={handleLogout} style={{ width: '100%', padding: '8px', background: '#1e293b', color: '#f87171', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}

      {/* Contenido */}
      <div style={{ flex: 1, background: '#f8fafc', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Barra superior solo en chat IA */}
        {inChat && (
          <div style={{ background: '#0f172a', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>⚕ Biomédico — Chat IA</div>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '6px 14px', background: '#1e293b', color: '#93c5fd', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Menú principal
            </button>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

const navLink = {
  display: 'block', padding: '8px 12px', color: '#94a3b8',
  textDecoration: 'none', borderRadius: '8px', fontSize: '14px', marginBottom: '4px',
}

const navLinkActive = {
  background: '#1e293b', color: '#fff',
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/dashboard" element={
        <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute><Layout><Users /></Layout></AdminRoute>
      } />
      <Route path="/chat-ia" element={
        <TecnicoRoute><Layout><ChatIA /></Layout></TecnicoRoute>
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