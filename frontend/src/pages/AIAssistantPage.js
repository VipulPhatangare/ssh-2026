import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AIAssistantPage.css';

// ─── Dummy chat history ───────────────────────────────────────────────────────
const HISTORY_ITEMS = [
  { id: 1, icon: '🚧', title: 'Complaint about pothole',       time: 'Today, 9:41 AM' },
  { id: 2, icon: '📄', title: 'Ration card application',       time: 'Today, 8:12 AM' },
  { id: 3, icon: '🏛️', title: 'Birth certificate status',      time: 'Yesterday' },
  { id: 4, icon: '💧', title: 'Water supply complaint',        time: 'Yesterday' },
  { id: 5, icon: '🏠', title: 'Property tax inquiry',          time: 'Mon, Feb 24' },
  { id: 6, icon: '👴', title: 'Pension scheme details',        time: 'Sun, Feb 23' },
  { id: 7, icon: '🏫', title: 'School enrollment help',        time: 'Sat, Feb 22' },
  { id: 8, icon: '🚗', title: 'Driving license renewal',       time: 'Fri, Feb 21' },
];

// ─── Quick action pills ───────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { icon: '📋', text: 'File Complaint',     hi: 'शिकायत दर्ज करें' },
  { icon: '📄', text: 'Apply Certificate',  hi: 'प्रमाणपत्र के लिए आवेदन करें' },
  { icon: '💰', text: 'Pay Tax Online',     hi: 'ऑनलाइन टैक्स भरें' },
  { icon: '🏥', text: 'Health Services',    hi: 'स्वास्थ्य सेवाएं' },
];

// ─── Keyword → AI response map ───────────────────────────────────────────────
const AI_RESPONSES = {
  pothole : '🚧 Road complaint registered! Ticket #RD-8821 has been created. The PWD team will inspect within 72 hours. You can track via the Applications section.',
  road    : '🚧 Road complaint registered! Ticket #RD-8821 has been created. The PWD team will inspect within 72 hours. You can track via the Applications section.',
  ration  : '🛒 Ration card applications can be done online! Please upload your residence proof, Aadhaar card, and income certificate. Processing takes 15–30 working days.',
  pension : '👴 PM Vaya Vandana Yojana offers ₹9,250/month guaranteed pension. Eligibility: Age 60+, Indian citizen. You can apply at LIC or online at pmvvy.gov.in.',
  certificate: '📜 Birth/Death/Domicile certificates are issued in 7 working days. Apply via DigiLocker or the CSC centre near you. Fee: ₹50 per certificate.',
  birth   : '📜 Birth certificates are issued in 7 working days. Apply via DigiLocker or your nearest CSC centre. Fee: ₹50 per certificate.',
  water   : '💧 Water supply complaint logged! Ticket #WS-3341 has been created. The Municipal Water Department will resolve this within 48 hours.',
  tax     : '🏠 Property tax can be paid online at mpenagarpalika.com. It is calculated based on area, location, and usage type. Need help calculating yours?',
  school  : '🏫 School enrollment for the 2025–26 session is now open. Visit the nearest Samagra Shiksha Kendra or apply at rssk.mp.gov.in with documents.',
  license : '🚗 Driving license renewal can be done at sarathi.parivahan.gov.in. Carry your existing DL, Aadhaar, and a recent passport photo.',
  health  : '🏥 Ayushman Bharat scheme offers free healthcare up to ₹5 lakh/year. Check eligibility at pmjay.gov.in with your Aadhaar or ration card.',
};

const FALLBACK_RESPONSES = [
  '🏛️ I am your dedicated citizen services assistant for Madhya Pradesh. How can I help you today?',
  '📋 You can file complaints, check scheme eligibility, track applications, or get document help. What do you need?',
  '✅ I can connect you to the right government office for this query. Please provide more details and I will assist you.',
  '🔍 Based on your query, I recommend visiting the nearest Lok Seva Kendra or calling the helpline at 1800-233-1107.',
  '💡 I found relevant information in our database. Would you like me to guide you step by step through the process?',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getTime = () =>
  new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

let fallbackIdx = 0;
const getBotReply = (text) => {
  const lower = text.toLowerCase();
  for (const key of Object.keys(AI_RESPONSES)) {
    if (lower.includes(key)) return AI_RESPONSES[key];
  }
  const reply = FALLBACK_RESPONSES[fallbackIdx % FALLBACK_RESPONSES.length];
  fallbackIdx++;
  return reply;
};

// ─── Component ────────────────────────────────────────────────────────────────
const AIAssistantPage = () => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const [isRecording, setIsRecording]   = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [activeChat, setActiveChat]     = useState(1);
  const [isHindi, setIsHindi]           = useState(false);
  const [dragOver, setDragOver]         = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  const messagesEndRef  = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef    = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    }
  };

  // ─── Send a message ──────────────────────────────────────────────────────────
  const sendMessage = (text = input, imageUrl = null) => {
    const trimmed = text.trim();
    if (!trimmed && !imageUrl) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      image: imageUrl,
      time: getTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Bot thinking…
    setIsTyping(true);
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setIsTyping(false);
      const replyText = imageUrl
        ? "🖼️ I can see your uploaded image! It looks like it shows a civic issue. I've noted it in your complaint. Would you like me to register a formal complaint?"
        : getBotReply(trimmed);

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: replyText,
        image: null,
        time: getTime(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, delay);
  };

  // ─── Keyboard handler ────────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ─── Image upload ────────────────────────────────────────────────────────────
  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => sendMessage('[Image uploaded]', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => handleImageFile(e.target.files[0]);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  // ─── Voice toggle ─────────────────────────────────────────────────────────────
  const toggleRecording = () => {
    setIsRecording(prev => {
      if (!prev) {
        // Simulate voice input ending after 3s
        setTimeout(() => {
          setIsRecording(false);
          sendMessage(isHindi ? 'पोटहोल की शिकायत दर्ज करें' : 'Report a pothole near my area');
        }, 3000);
      }
      return !prev;
    });
  };

  // ─── New chat ─────────────────────────────────────────────────────────────────
  const startNewChat = () => {
    setMessages([]);
    setActiveChat(null);
    setSidebarOpen(false);
  };

  // ─── Filtered history ────────────────────────────────────────────────────────
  const filteredHistory = HISTORY_ITEMS.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Masks Aadhaar ────────────────────────────────────────────────────────────
  const maskedAadhaar = '●●●● ●●●● 1234';

  // ─── Lang labels ─────────────────────────────────────────────────────────────
  const L = {
    newChat:     isHindi ? '✏️ नई बातचीत' : '✏️ New Chat',
    chatHistory: isHindi ? '💬 बातचीत इतिहास' : '💬 Chat History',
    search:      isHindi ? 'खोजें...' : 'Search conversations...',
    online:      isHindi ? 'ऑनलाइन' : 'Online',
    welcome:     isHindi ? 'नागरिक सेवा पोर्टल' : 'Citizen Service Portal',
    subtitle:    isHindi
      ? 'सरकारी योजनाओं, शिकायतों, या प्रमाणपत्रों के बारे में हिंदी या अंग्रेज़ी में पूछें।'
      : 'Ask anything about government services, schemes, complaints, or civic queries. Available in Hindi & English.',
    placeholder: isHindi ? 'पूछें या बोलें... 🎤' : 'Ask anything about government services...',
    footer:      isHindi
      ? '🔒 सुरक्षित · आधिकारिक सरकारी डेटा · DigiLocker एकीकृत · ⌨️ Shift+Enter नई पंक्ति'
      : '🔒 Secured · Official Government Data · DigiLocker Integrated · ⌨️ Shift+Enter for new line',
  };

  return (
    <div
      className="ai-page-root"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="ai-drag-overlay">
          📷 Drop image here to attach
        </div>
      )}

      <div className="ai-shell">
        {/* ──────── SIDEBAR ──────── */}
        <aside className={`ai-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Sidebar header */}
          <div className="ai-sidebar-header">
            <p className="ai-sidebar-title">{L.chatHistory}</p>
            <button className="ai-new-chat-btn" onClick={startNewChat}>
              {L.newChat}
            </button>
          </div>

          {/* Search */}
          <div className="ai-search-bar">
            <input
              type="text"
              className="ai-search-input"
              placeholder={L.search}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* History list */}
          <div className="ai-history-list">
            {filteredHistory.map(item => (
              <div
                key={item.id}
                className={`ai-history-item ${activeChat === item.id ? 'active' : ''}`}
                onClick={() => { setActiveChat(item.id); setSidebarOpen(false); }}
              >
                <span className="ai-history-icon">{item.icon}</span>
                <div className="ai-history-info">
                  <p className="ai-history-title">{item.title}</p>
                  <p className="ai-history-time">{item.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* User info */}
          <div className="ai-sidebar-footer">
            <div className="ai-user-avatar-small">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ai-user-meta">
              <p className="ai-user-name">{user?.fullName || 'Citizen'}</p>
              <p className="ai-user-aadhaar">Aadhaar: {maskedAadhaar}</p>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        <div
          className={`ai-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ──────── MAIN PANEL ──────── */}
        <div className="ai-main">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              {/* Mobile sidebar toggle */}
              <button
                className="ai-sidebar-toggle"
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Toggle sidebar"
              >
                ☰
              </button>

              <div className="ai-online-dot" title={L.online}></div>
              <span className="ai-chat-title">Citizen Services Assistant</span>
              <span className="ai-powered-badge">✨ AI Powered</span>
            </div>

            <div className="ai-chat-header-right">
              <button className="ai-icon-btn" aria-label="Search messages" title="Search">🔍</button>
              <button className="ai-icon-btn" aria-label="Export chat" title="Export">📤</button>
              <button className="ai-icon-btn" aria-label="Settings" title="Settings">⚙️</button>
              <button
                className="ai-lang-toggle"
                onClick={() => setIsHindi(prev => !prev)}
                aria-label="Toggle language"
              >
                {isHindi ? '🇬🇧 English' : '🇮🇳 हिंदी'}
              </button>
            </div>
          </div>

          {/* Messages / Welcome */}
          <div className="ai-messages">
            {messages.length === 0 ? (
              /* ── Welcome screen ── */
              <div className="ai-welcome">
                <div className="ai-welcome-icon">🏛️</div>
                <h1 className="ai-welcome-title">{L.welcome}</h1>
                <p className="ai-welcome-subtitle">{L.subtitle}</p>
                <div className="ai-quick-actions">
                  {QUICK_ACTIONS.map((a, i) => (
                    <button
                      key={i}
                      className="ai-quick-pill"
                      onClick={() => sendMessage(isHindi ? a.hi : a.text)}
                    >
                      <span>{a.icon}</span>
                      <span>{isHindi ? a.hi : a.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* ── Message bubbles ── */
              <>
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`ai-msg-row ${msg.role}`}
                  >
                    <div className={`ai-avatar ${msg.role}`}>
                      {msg.role === 'bot' ? '🏛️' : '👤'}
                    </div>
                    <div className="ai-bubble-wrap">
                      <div className="ai-bubble">
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="ai-msg-image"
                          />
                        )}
                        {msg.content}
                      </div>
                      <p className="ai-msg-time">{msg.time}</p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="ai-typing-row">
                    <div className="ai-avatar bot">🏛️</div>
                    <div className="ai-typing-bubble">
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                      <div className="typing-dot"></div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Recording bar */}
          {isRecording && (
            <div className="ai-recording-bar">
              <div className="recording-dot"></div>
              <span className="recording-label">
                {isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... speak now'}
              </span>
            </div>
          )}

          {/* Input Area */}
          <div className="ai-input-area">
            <div className="ai-input-container">
              {/* Image upload button */}
              <button
                className="ai-input-btn"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload image"
                title="Upload image"
              >
                📷
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                className="ai-textarea"
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={L.placeholder}
                aria-label="Message input"
              />

              {/* Mic button */}
              <button
                className={`ai-input-btn ${isRecording ? 'mic-active' : ''}`}
                onClick={toggleRecording}
                aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                {isRecording ? '⏹' : '🎤'}
              </button>

              {/* Send button */}
              <button
                className={`ai-send-btn ${input.trim() ? 'active' : 'inactive'}`}
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                aria-label="Send message"
                title="Send"
              >
                ➤
              </button>
            </div>

            <p className="ai-input-footer">{L.footer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage;
