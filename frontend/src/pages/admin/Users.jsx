import { useState, useEffect } from 'react'
import { getUsers, createUser, updateUser, toggleUser } from '../../services/users'

const ROLES = ['admin', 'tecnico', 'viewer']
const ROLE_LABELS = { admin: 'Administrador', tecnico: 'Técnico', viewer: 'Visualizador' }
const ROLE_COLORS = {
  admin:   { bg: '#dbeafe', color: '#1d4ed8' },
  tecnico: { bg: '#dcfce7', color: '#15803d' },
  viewer:  { bg: '#f3f4f6', color: '#374151' },
}

const emptyForm = {
  name: '', email: '', password: '', password_confirmation: '', rol: 'tecnico', activo: true
}

export default function Users() {
  const [users, setUsers]                         = useState([])
  const [loading, setLoading]                     = useState(true)
  const [showModal, setShowModal]                 = useState(false)
  const [editing, setEditing]                     = useState(null)
  const [form, setForm]                           = useState(emptyForm)
  const [errors, setErrors]                       = useState({})
  const [saving, setSaving]                       = useState(false)
  const [message, setMessage]                     = useState('')
  const [nuevoCodigoAcceso, setNuevoCodigoAcceso] = useState('')
  const [showPass, setShowPass]                   = useState(false)
  const [showConfirm, setShowConfirm]             = useState(false)
  const [matchError, setMatchError]               = useState('')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const res = await getUsers()
      setUsers(res.data)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setMatchError('')
    setNuevoCodigoAcceso('')
    setShowPass(false)
    setShowConfirm(false)
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditing(user)
    setForm({
      name: user.name, email: user.email,
      password: '', password_confirmation: '',
      rol: user.rol, activo: user.activo,
    })
    setErrors({})
    setMatchError('')
    setNuevoCodigoAcceso('')
    setShowPass(false)
    setShowConfirm(false)
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMatchError('')

    if (!editing || form.password) {
      if (form.password !== form.password_confirmation) {
        setMatchError('Las contraseñas no coinciden.')
        return
      }
    }

    setSaving(true)
    setErrors({})
    try {
      if (editing) {
        setNuevoCodigoAcceso('')
        const payload = {
          name: form.name, email: form.email,
          rol: form.rol, activo: form.activo,
        }
        if (form.password) {
          payload.password = form.password
          payload.password_confirmation = form.password_confirmation
        }
        await updateUser(editing.id, payload)
        setMessage('Usuario actualizado correctamente.')
      } else {
        const res = await createUser(form)
        setNuevoCodigoAcceso(res.data.codigo_acceso)
        setMessage('Usuario creado correctamente.')
      }
      setShowModal(false)
      fetchUsers()
      setTimeout(() => setMessage(''), 5000)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (user) => {
    try {
      await toggleUser(user.id)
      setMessage(user.activo ? 'Usuario desactivado.' : 'Usuario activado.')
      fetchUsers()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      if (err.response?.status === 422) {
        setMessage(err.response.data.message)
      }
    }
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestión de Usuarios</h1>
          <p style={styles.subtitle}>{users.length} usuarios registrados</p>
        </div>
        <button onClick={openCreate} style={styles.btnPrimary}>
          + Nuevo usuario
        </button>
      </div>

      {/* Mensaje de éxito */}
      {message && <div style={styles.successBox}>{message}</div>}

      {/* Código de acceso generado */}
      {nuevoCodigoAcceso && (
        <div style={styles.codigoBox}>
          <span style={styles.codigoBoxLabel}>Código de acceso generado:</span>
          <span style={styles.codigoBoxValue}>{nuevoCodigoAcceso}</span>
          <span style={styles.codigoBoxHint}>— Compártelo con el usuario para que pueda iniciar sesión</span>
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div style={styles.loading}>Cargando usuarios...</div>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                {['ID', 'Código acceso', 'Nombre', 'Correo', 'Rol', 'Estado', 'Último acceso', 'Acciones'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user.id} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ ...styles.td, color: '#94a3b8', fontWeight: '600', fontSize: '13px' }}>
                    #{user.id}
                  </td>
                  <td style={styles.td}>
                    <span style={styles.codigoBadge}>
                      {user.codigo_acceso || '—'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.userName}>{user.name}</div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: ROLE_COLORS[user.rol]?.bg,
                      color: ROLE_COLORS[user.rol]?.color,
                    }}>
                      {ROLE_LABELS[user.rol] || user.rol}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      background: user.activo ? '#dcfce7' : '#fee2e2',
                      color: user.activo ? '#15803d' : '#dc2626',
                    }}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ ...styles.td, color: '#94a3b8', fontSize: '13px' }}>
                    {user.ultimo_acceso || 'Nunca'}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button onClick={() => openEdit(user)} style={styles.btnEdit}>
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggle(user)}
                        style={user.activo ? styles.btnDeactivate : styles.btnActivate}
                      >
                        {user.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editing ? 'Editar usuario' : 'Nuevo usuario'}
              </h2>
              <button onClick={() => setShowModal(false)} style={styles.btnClose}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>

              {/* Nombre */}
              <div style={styles.field}>
                <label style={styles.label}>Nombre completo</label>
                <input
                  style={styles.input}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Juan García"
                  required
                />
                {errors.name && <span style={styles.error}>{errors.name[0]}</span>}
              </div>

              {/* Correo */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Correo electrónico
                  <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: '6px' }}>(uso interno)</span>
                </label>
                <input
                  style={styles.input}
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="usuario@hospital.com"
                  required
                />
                {errors.email && <span style={styles.error}>{errors.email[0]}</span>}
              </div>

              {/* Contraseña */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Contraseña{' '}
                  {editing && (
                    <span style={{ color: '#94a3b8', fontWeight: 400 }}>
                      (dejar vacío para no cambiar)
                    </span>
                  )}
                </label>
                <div style={styles.passWrap}>
                  <input
                    style={styles.passInput}
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    required={!editing}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPass(!showPass)}
                    title={showPass ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <span style={styles.error}>{errors.password[0]}</span>}
              </div>

              {/* Confirmar contraseña */}
              {(!editing || form.password) && (
                <div style={styles.field}>
                  <label style={styles.label}>Confirmar contraseña</label>
                  <div style={styles.passWrap}>
                    <input
                      style={styles.passInput}
                      type={showConfirm ? 'text' : 'password'}
                      value={form.password_confirmation}
                      onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                      placeholder="Repite la contraseña"
                      required={!editing || !!form.password}
                    />
                    <button
                      type="button"
                      style={styles.eyeBtn}
                      onClick={() => setShowConfirm(!showConfirm)}
                      title={showConfirm ? 'Ocultar' : 'Mostrar'}
                    >
                      {showConfirm ? '🙈' : '👁'}
                    </button>
                  </div>
                  {form.password_confirmation && (
                    <span style={{
                      fontSize: '12px',
                      color: form.password === form.password_confirmation ? '#15803d' : '#dc2626'
                    }}>
                      {form.password === form.password_confirmation
                        ? '✓ Las contraseñas coinciden'
                        : '✗ Las contraseñas no coinciden'}
                    </span>
                  )}
                  {matchError && <span style={styles.error}>{matchError}</span>}
                  {errors.password_confirmation && (
                    <span style={styles.error}>{errors.password_confirmation[0]}</span>
                  )}
                </div>
              )}

              {/* Rol */}
              <div style={styles.field}>
                <label style={styles.label}>Rol</label>
                <select
                  style={styles.input}
                  value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                {errors.rol && <span style={styles.error}>{errors.rol[0]}</span>}
              </div>

              {/* Estado — solo al editar */}
              {editing && (
                <div style={styles.field}>
                  <label style={styles.label}>Estado</label>
                  <select
                    style={styles.input}
                    value={form.activo ? 'true' : 'false'}
                    onChange={e => setForm({ ...form, activo: e.target.value === 'true' })}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              )}

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={styles.btnCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={styles.btnPrimary}
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

const styles = {
  container:      { padding: '32px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' },
  header:         { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  title:          { fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' },
  subtitle:       { fontSize: '13px', color: '#64748b', margin: 0 },
  successBox:     { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#15803d', marginBottom: '16px' },
  codigoBox:      { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  codigoBoxLabel: { fontSize: '13px', color: '#1e40af' },
  codigoBoxValue: { fontFamily: 'monospace', fontSize: '18px', fontWeight: '700', color: '#1d4ed8', letterSpacing: '0.1em' },
  codigoBoxHint:  { fontSize: '12px', color: '#64748b' },
  loading:        { textAlign: 'center', padding: '40px', color: '#64748b' },
  tableWrap:      { background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' },
  table:          { width: '100%', borderCollapse: 'collapse' },
  th:             { padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' },
  td:             { padding: '12px 16px', fontSize: '14px', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  userName:       { fontWeight: '600', color: '#0f172a' },
  badge:          { padding: '3px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: '500' },
  codigoBadge:    { fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#0f172a', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.05em' },
  actions:        { display: 'flex', gap: '8px' },
  btnPrimary:     { padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  btnEdit:        { padding: '5px 12px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnDeactivate:  { padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnActivate:    { padding: '5px 12px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' },
  btnCancel:      { padding: '9px 18px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  overlay:        { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal:          { background: '#fff', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' },
  modalHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  modalTitle:     { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 },
  btnClose:       { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' },
  form:           { display: 'flex', flexDirection: 'column', gap: '16px' },
  field:          { display: 'flex', flexDirection: 'column', gap: '6px' },
  label:          { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input:          { padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#0f172a', outline: 'none' },
  passWrap:       { display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' },
  passInput:      { flex: 1, padding: '9px 12px', border: 'none', fontSize: '14px', color: '#0f172a', outline: 'none' },
  eyeBtn:         { padding: '0 12px', background: '#f8fafc', border: 'none', cursor: 'pointer', fontSize: '16px', height: '100%', borderLeft: '1px solid #e2e8f0' },
  error:          { fontSize: '12px', color: '#dc2626' },
  modalFooter:    { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
}