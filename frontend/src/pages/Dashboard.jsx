import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const roleLabels = {
  admin:   'Administrador',
  tecnico: 'Técnico',
  viewer:  'Visualizador',
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Bienvenido, {user?.nombre}</h1>
            <span style={styles.badge}>{roleLabels[user?.rol] || user?.rol}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
        <p style={styles.message}>
          El sistema está funcionando correctamente.
          Aquí irán los módulos de equipos y mantenimiento.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  card: {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0',
  },
  badge: {
    background: '#dbeafe',
    color: '#1d4ed8',
    padding: '4px 12px',
    borderRadius: '99px',
    fontSize: '12px',
    fontWeight: '600',
  },
  logoutBtn: {
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  message: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
  },
}