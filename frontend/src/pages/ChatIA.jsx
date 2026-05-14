import { useState, useRef, useEffect } from 'react'

const INITIAL_CHATS = [
  { id: 1, name: 'Mantenimiento ventilador', folder: 'Equipos biomédicos', pinned: true },
  { id: 2, name: 'Calibración ECG',          folder: 'Equipos biomédicos', pinned: false },
  { id: 3, name: 'Protocolo de limpieza',    folder: 'Consultas generales', pinned: false },
  { id: 4, name: 'Normas ISO equipos',       folder: 'Consultas generales', pinned: false },
  { id: 5, name: 'Revisión bomba infusión',  folder: null, pinned: false },
]

const INITIAL_MESSAGES = {
  1: [{ id: 1, role: 'ai', text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' }],
  2: [{ id: 1, role: 'ai', text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' }],
  3: [
    { id: 1, role: 'ai',   text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' },
    { id: 2, role: 'user', text: '¿Cuál es el protocolo de limpieza para un desfibrilador?' },
    { id: 3, role: 'ai',   text: 'El protocolo incluye: desconectar el equipo, limpiar con paño húmedo con solución desinfectante aprobada, evitar líquidos en conectores y revisar el estado de los electrodos.' },
  ],
  4: [{ id: 1, role: 'ai', text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' }],
  5: [{ id: 1, role: 'ai', text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' }],
}

export default function ChatIA() {
  const [chats, setChats]             = useState(INITIAL_CHATS)
  const [messages, setMessages]       = useState(INITIAL_MESSAGES)
  const [activeChatId, setActiveChatId] = useState(3)
  const [input, setInput]             = useState('')
  const [showPlus, setShowPlus]       = useState(false)
  const [openMenu, setOpenMenu]       = useState(null)
  const [editingMsg, setEditingMsg]   = useState(null)
  const [editText, setEditText]       = useState('')
  const [showMoveModal, setShowMoveModal] = useState(null)
  const [newFolder, setNewFolder]     = useState('')
  const messagesEndRef                = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeChatId])

  const activeChat = chats.find(c => c.id === activeChatId)
  const activeMessages = messages[activeChatId] || []

  const folders = [...new Set(chats.filter(c => c.folder).map(c => c.folder))]

  const handleNewChat = (temporary = false) => {
    const id = Date.now()
    const name = temporary ? 'Chat temporal' : 'Nuevo chat'
    setChats(prev => [...prev, { id, name, folder: null, pinned: false, temporary }])
    setMessages(prev => ({ ...prev, [id]: [{ id: 1, role: 'ai', text: 'Hola, soy el asistente biomédico. ¿En qué puedo ayudarte?' }] }))
    setActiveChatId(id)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: input.trim() }
    const aiMsg   = { id: Date.now() + 1, role: 'ai', text: '[ Respuesta de la IA — próximamente conectada a la API ]' }
    setMessages(prev => ({ ...prev, [activeChatId]: [...(prev[activeChatId] || []), userMsg, aiMsg] }))
    setInput('')
    setShowPlus(false)

    // Renombrar chat si se llama "Nuevo chat"
    if (activeChat?.name === 'Nuevo chat') {
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, name: input.trim().slice(0, 30) } : c))
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEditStart = (msg) => {
    setEditingMsg(msg.id)
    setEditText(msg.text)
  }

  const handleEditSave = (msgId) => {
    const msgs = messages[activeChatId]
    const idx  = msgs.findIndex(m => m.id === msgId)
    const updated = msgs.slice(0, idx + 1).map(m =>
      m.id === msgId ? { ...m, text: editText, edited: true } : m
    )
    const aiResponse = { id: Date.now(), role: 'ai', text: '[ Respuesta actualizada — próximamente conectada a la API ]' }
    setMessages(prev => ({ ...prev, [activeChatId]: [...updated, aiResponse] }))
    setEditingMsg(null)
  }

  const handlePin = (id) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c))
    setOpenMenu(null)
  }

  const handleDelete = (id) => {
    setChats(prev => prev.filter(c => c.id !== id))
    setMessages(prev => { const n = { ...prev }; delete n[id]; return n })
    if (activeChatId === id) setActiveChatId(chats.find(c => c.id !== id)?.id || null)
    setOpenMenu(null)
  }

  const handleMove = (chatId, folder) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, folder: folder || null } : c))
    setShowMoveModal(null)
    setNewFolder('')
    setOpenMenu(null)
  }

  const sortedChats = [...chats].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
  const chatsInFolders = folders.map(f => ({ folder: f, items: sortedChats.filter(c => c.folder === f) }))
  const chatsNoFolder  = sortedChats.filter(c => !c.folder)

  const renderChatItem = (chat) => (
    <div
      key={chat.id}
      style={{ ...s.chatItem, ...(chat.id === activeChatId ? s.chatItemActive : {}) }}
      onClick={() => { setActiveChatId(chat.id); setOpenMenu(null) }}
    >
      {chat.pinned && <span style={s.pin}>📌</span>}
      <span style={{ ...s.chatName, ...(chat.id === activeChatId ? s.chatNameActive : {}) }}>
        {chat.name}
        {chat.temporary && <span style={s.tempBadge}>temp</span>}
      </span>
      <button
        style={s.dotsBtn}
        onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === chat.id ? null : chat.id) }}
      >⋯</button>

      {openMenu === chat.id && (
        <div style={s.dotsMenu} onClick={e => e.stopPropagation()}>
          <div style={s.dotsItem} onClick={() => handlePin(chat.id)}>
            {chat.pinned ? '📌 Desfijar' : '📌 Fijar'}
          </div>
          <div style={s.dotsItem} onClick={() => { setShowMoveModal(chat.id); setOpenMenu(null) }}>
            📁 Mover
          </div>
          <div style={{ ...s.dotsItem, ...s.dotsItemDanger }} onClick={() => handleDelete(chat.id)}>
            🗑 Borrar
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={s.wrapper} onClick={() => setOpenMenu(null)}>

      {/* Sidebar */}
      <div style={s.sidebar} onClick={e => e.stopPropagation()}>
        <div style={s.sidebarTop}>
          <button style={s.btnNew} onClick={() => handleNewChat(false)}>
            <span>✏</span> Nuevo chat
          </button>
          <button style={s.btnTemp} onClick={() => handleNewChat(true)}>
            <span>⏱</span> Chat temporal
          </button>
        </div>

        <div style={s.chatsList}>
          {chatsInFolders.map(({ folder, items }) => (
            <div key={folder} style={{ marginBottom: '8px' }}>
              <div style={s.folderHeader}>📁 {folder}</div>
              {items.map(renderChatItem)}
            </div>
          ))}
          {chatsNoFolder.map(renderChatItem)}
        </div>
      </div>

      {/* Main */}
      <div style={s.main}>

        {/* Header */}
        <div style={s.chatHeader}>
          <div>
            <div style={s.chatTitle}>{activeChat?.name || 'Chat IA'}</div>
            <div style={s.chatSubtitle}>Asistente Biomédico</div>
          </div>
        </div>

        {/* Mensajes */}
        <div style={s.messages}>
          {activeMessages.map((msg, idx) => {
            const isLast     = idx === activeMessages.length - 1
            const isLastUser = msg.role === 'user' && isLast

            return (
              <div key={msg.id} style={{ ...s.msgRow, ...(msg.role === 'user' ? s.msgRowUser : {}) }}>
                <div style={{ ...s.avatar, ...(msg.role === 'ai' ? s.avatarAI : s.avatarUser) }}>
                  {msg.role === 'ai' ? 'IA' : 'Tú'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>

                  {editingMsg === msg.id ? (
                    <div style={s.editWrap}>
                      <textarea
                        style={s.editInput}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button style={s.btnSaveEdit} onClick={() => handleEditSave(msg.id)}>Guardar y reenviar</button>
                        <button style={s.btnCancelEdit} onClick={() => setEditingMsg(null)}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ ...s.bubble, ...(msg.role === 'user' ? s.bubbleUser : s.bubbleAI) }}>
                      {msg.text}
                      {msg.edited && <span style={s.editedBadge}>editado</span>}
                    </div>
                  )}

                  {isLastUser && editingMsg !== msg.id && (
                    <button style={s.editBtn} onClick={() => handleEditStart(msg)}>✏ Editar</button>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          {showPlus && (
            <div style={s.plusMenu}>
              <button style={s.plusMenuItem}>🖼 Subir foto</button>
              <button style={s.plusMenuItem}>📄 Subir documento</button>
              <button style={s.plusMenuItem}>🌐 Investigar en internet</button>
            </div>
          )}
          <div style={s.inputWrap}>
            <button style={s.plusBtn} onClick={e => { e.stopPropagation(); setShowPlus(!showPlus) }}>+</button>
            <textarea
              style={s.textarea}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              rows={1}
            />
            <button style={s.sendBtn} onClick={handleSend}>➤</button>
          </div>
        </div>
      </div>

      {/* Modal mover chat */}
      {showMoveModal && (
        <div style={s.modalOverlay} onClick={() => setShowMoveModal(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitle}>Mover chat a carpeta</h3>
            <p style={s.modalSub}>Selecciona una carpeta existente o crea una nueva</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {folders.map(f => (
                <button key={f} style={s.folderOption} onClick={() => handleMove(showMoveModal, f)}>
                  📁 {f}
                </button>
              ))}
              <button style={{ ...s.folderOption, color: '#64748b', borderStyle: 'dashed' }} onClick={() => handleMove(showMoveModal, null)}>
                Sin carpeta
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                style={s.folderInput}
                value={newFolder}
                onChange={e => setNewFolder(e.target.value)}
                placeholder="Nueva carpeta..."
              />
              <button
                style={s.btnCreateFolder}
                onClick={() => { if (newFolder.trim()) handleMove(showMoveModal, newFolder.trim()) }}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  wrapper:       { display: 'flex', height: '100%', background: '#f8fafc', overflow: 'hidden' },
  sidebar:       { width: '240px', background: '#0f172a', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarTop:    { padding: '12px', borderBottom: '1px solid #1e293b' },
  btnNew:        { width: '100%', padding: '8px 12px', background: '#1e293b', color: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' },
  btnTemp:       { width: '100%', padding: '8px 12px', background: 'transparent', color: '#64748b', border: '1px dashed #334155', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' },
  chatsList:     { flex: 1, overflowY: 'auto', padding: '8px' },
  folderHeader:  { display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', color: '#64748b', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' },
  chatItem:      { display: 'flex', alignItems: 'center', padding: '7px 8px', borderRadius: '7px', cursor: 'pointer', position: 'relative', marginBottom: '2px' },
  chatItemActive:{ background: '#1e3a5f' },
  pin:           { fontSize: '10px', marginRight: '4px' },
  chatName:      { flex: 1, color: '#cbd5e1', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  chatNameActive:{ color: '#93c5fd' },
  tempBadge:     { fontSize: '10px', background: '#334155', color: '#94a3b8', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' },
  dotsBtn:       { background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', fontSize: '16px', flexShrink: 0 },
  dotsMenu:      { position: 'absolute', right: '4px', top: '32px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '4px', zIndex: 20, width: '150px' },
  dotsItem:      { padding: '7px 10px', color: '#cbd5e1', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' },
  dotsItemDanger:{ color: '#f87171' },
  main:          { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  chatHeader:    { padding: '14px 20px', borderBottom: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 },
  chatTitle:     { fontSize: '14px', fontWeight: '600', color: '#0f172a' },
  chatSubtitle:  { fontSize: '12px', color: '#94a3b8' },
  messages:      { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  msgRow:        { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  msgRowUser:    { flexDirection: 'row-reverse' },
  avatar:        { width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '600' },
  avatarAI:      { background: '#dbeafe', color: '#1d4ed8' },
  avatarUser:    { background: '#e0f2fe', color: '#0369a1' },
  bubble:        { padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.6' },
  bubbleAI:      { background: '#fff', border: '1px solid #e2e8f0', color: '#334155', borderRadius: '4px 12px 12px 12px' },
  bubbleUser:    { background: '#2563eb', color: '#fff', borderRadius: '12px 4px 12px 12px' },
  editedBadge:   { fontSize: '10px', background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '4px', marginLeft: '8px' },
  editBtn:       { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' },
  editWrap:      { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', width: '100%' },
  editInput:     { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '8px', padding: '8px', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: 'system-ui, sans-serif' },
  btnSaveEdit:   { padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' },
  btnCancelEdit: { padding: '6px 14px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '7px', fontSize: '12px', cursor: 'pointer' },
  inputArea:     { padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0', flexShrink: 0 },
  plusMenu:      { display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' },
  plusMenuItem:  { padding: '6px 12px', borderRadius: '7px', fontSize: '12px', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer' },
  inputWrap:     { display: 'flex', alignItems: 'flex-end', gap: '8px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '8px 10px' },
  plusBtn:       { width: '30px', height: '30px', background: '#f1f5f9', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#64748b', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  textarea:      { flex: 1, border: 'none', background: 'transparent', resize: 'none', fontSize: '13px', color: '#0f172a', outline: 'none', lineHeight: '1.5', fontFamily: 'system-ui, sans-serif' },
  sendBtn:       { width: '30px', height: '30px', background: '#2563eb', border: 'none', borderRadius: '7px', cursor: 'pointer', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  modalOverlay:  { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  modal:         { background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '380px' },
  modalTitle:    { fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
  modalSub:      { fontSize: '13px', color: '#64748b', marginBottom: '16px' },
  folderOption:  { padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#334155', textAlign: 'left' },
  folderInput:   { flex: 1, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' },
  btnCreateFolder:{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
}