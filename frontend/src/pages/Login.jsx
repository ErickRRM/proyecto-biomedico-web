import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }               = useAuth()
  const navigate                = useNavigate()
  const [codigoAcceso, setCodigoAcceso] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(codigoAcceso, password)
      if (user.rol === 'admin')   navigate('/dashboard')
      if (user.rol === 'tecnico') navigate('/dashboard')
      if (user.rol === 'viewer')  navigate('/dashboard')
    } catch (err) {
      if (err.response?.status === 422) {
        setError('Correo o contraseña incorrectos.')
      } else if (err.response?.status === 403) {
        setError('Tu cuenta está desactivada. Contacta al administrador.')
      } else {
        setError('Error al conectar con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>

      {/* Panel izquierdo */}
      <div style={s.left}>
        <div style={s.leftContent}>
          <div style={s.cross}>
            <span style={s.ch} />
            <span style={s.cv} />
          </div>
          <h1 style={s.brandName}>Biomédico</h1>
          <p style={s.brandSub}>Sistema de Gestión de Mantenimiento de Equipos Biomédicos</p>
          <div style={s.features}>
            {[
              'Expedientes clínicos unificados',
              'Trazabilidad completa de acceso',
              'Cifrado de datos institucionales',
              'Control de roles y permisos',
            ].map((f, i) => (
              <div key={i} style={s.feat}>
                <span style={s.fdot} />
                <span style={s.ftext}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={s.leftFooter}>Biomédico v1.0</div>
      </div>

      {/* Panel derecho */}
      <div style={s.right}>
        <div style={s.card}>

          <div style={s.cardHeader}>
            <h2 style={s.title}>Acceso al sistema</h2>
            <p style={s.subtitle}>Ingrese sus credenciales institucionales</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorDot}>!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>

            {/* Correo */}
            <div style={s.field}>
            <label style={s.label}>Código de acceso</label>
              <div style={s.inputWrap}>
              <svg style={s.ico} viewBox="0 0 20 20" fill="none">
                <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M7 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
              <input
                type="text"
                value={codigoAcceso}
                onChange={e => setCodigoAcceso(e.target.value.toUpperCase())}
                placeholder="BIO-0001"
                required
                autoComplete="username"
                style={{ ...s.input, paddingLeft: '2.4rem', letterSpacing: '0.05em' }}
              />
             </div>
            </div>

            {/* Contraseña */}
            <div style={s.field}>
              <label style={s.label}>Contraseña</label>
              <div style={s.inputWrap}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ ...s.input, paddingLeft: '1rem', paddingRight: '2.8rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={s.eyeBtn}
                  title={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPass ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <span style={s.spinner} /> : 'Iniciar sesión'}
            </button>

            <p style={s.hint}>🔒 Acceso restringido a personal autorizado</p>

          </form>

          <div style={s.footer}>Sistema Biomédico — Uso institucional</div>
        </div>
      </div>
    </div>
  )
}

const C = {
  teal:      '#0f766e',
  tealDark:  '#0a2e28',
  tealDeep:  '#0d3d36',
  tealLight: '#a7f3d0',
  tealMid:   '#ccfbf1',
  slate:     '#0f172a',
  slateM:    '#334155',
  gray:      '#64748b',
  border:    '#e2e8f0',
  white:     '#ffffff',
  bg:        '#f1f5f9',
  error:     '#dc2626',
  errorBg:   '#fef2f2',
}

const s = {
  page:       { display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: C.bg },

  // Panel izquierdo
  left:       { width: '42%', background: `linear-gradient(160deg, ${C.tealDeep} 0%, ${C.tealDark} 100%)`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem 2.5rem' },
  leftContent:{ display: 'flex', flexDirection: 'column' },
  leftFooter: { color: 'rgba(167,243,208,0.5)', fontSize: '0.72rem', letterSpacing: '0.05em' },
  cross:      { position: 'relative', width: 40, height: 40, marginBottom: '1.5rem' },
  ch:         { position: 'absolute', top: '50%', left: 0, right: 0, height: 10, background: C.tealMid, borderRadius: 3, transform: 'translateY(-50%)', display: 'block' },
  cv:         { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, background: C.tealMid, borderRadius: 3, transform: 'translateX(-50%)', display: 'block' },
  brandName:  { color: C.white, fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 0.4rem' },
  brandSub:   { color: C.tealLight, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 2.5rem', lineHeight: 1.5 },
  features:   { display: 'flex', flexDirection: 'column', gap: '1rem' },
  feat:       { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  fdot:       { width: 7, height: 7, borderRadius: '50%', background: C.teal, border: `2px solid ${C.tealLight}`, flexShrink: 0 },
  ftext:      { color: '#cbd5e1', fontSize: '0.875rem' },

  // Panel derecho
  right:      { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' },
  card:       { background: C.white, borderRadius: 16, padding: '2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 4px 32px rgba(15,118,110,0.10)', border: `1px solid ${C.border}` },
  cardHeader: { marginBottom: '2rem' },
  title:      { fontSize: '1.4rem', fontWeight: 700, color: C.slate, margin: '0 0 0.3rem', letterSpacing: '-0.02em' },
  subtitle:   { fontSize: '0.875rem', color: C.gray, margin: 0 },

  // Error
  errorBox:   { background: C.errorBg, border: '1px solid #fecaca', color: C.error, borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  errorDot:   { width: 18, height: 18, borderRadius: '50%', background: C.error, color: C.white, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 },

  // Formulario
  form:       { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  field:      { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label:      { fontSize: '0.75rem', fontWeight: 600, color: C.slateM, letterSpacing: '0.04em', textTransform: 'uppercase' },
  inputWrap:  { position: 'relative', display: 'flex', alignItems: 'center' },
  ico:        { position: 'absolute', left: 12, width: 16, height: 16, color: C.gray, pointerEvents: 'none' },
  input:      { width: '100%', padding: '0.7rem 0.875rem', border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: '0.95rem', color: C.slate, background: '#fafafa', outline: 'none', boxSizing: 'border-box' },
  eyeBtn:     { position: 'absolute', right: 10, background: 'none', border: 'none', cursor: 'pointer', color: C.gray, padding: 4, display: 'flex', alignItems: 'center' },

  // Botón
  btn:        { background: C.teal, color: C.white, border: 'none', borderRadius: 8, padding: '0.85rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 46 },
  spinner:    { display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: C.white, borderRadius: '50%', animation: 'spin 0.7s linear infinite' },

  hint:       { textAlign: 'center', fontSize: '0.78rem', color: C.gray, margin: 0 },
  footer:     { marginTop: '2rem', paddingTop: '1rem', borderTop: `1px solid ${C.border}`, textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8' },
}