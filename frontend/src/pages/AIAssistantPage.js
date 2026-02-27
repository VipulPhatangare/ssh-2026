import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import './AIAssistantPage.css';

// ─── N8N Webhook Configuration ───────────────────────────────────────────────
const N8N_WEBHOOK_URL         = 'https://synthomind.cloud/webhook/ssh-2026-main-chat-bot';
const N8N_COMPARE_WEBHOOK_URL = 'https://synthomind.cloud/webhook/ssh_2026_comaparision';

// ─── UI limits ───────────────────────────────────────────────────────────────
const MAX_SCHEMES_IN_CHAT = 4;

// ─── Generate unique IDs ──────────────────────────────────────────────────────
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateChatId = () => `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// ─── Format session timestamp for sidebar ────────────────────────────────────
const formatSessionTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-IN', { weekday: 'short' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

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

// ─── Send data to backend for processing ─────────────────────────────────────────
const uploadToBackend = async (file, message, chatId, sessionId) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('message', message);
    formData.append('chatId', chatId);
    formData.append('sessionId', sessionId);

    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:5000/api/ai/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ File uploaded to backend:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload error:', error);
    return null;
  }
};

// ─── Send text-only data to N8N webhook and get response ───────────────────────
const sendToWebhook = async (payload) => {
  try {
    console.log('📤 Sending to webhook:', payload);
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Webhook responded with status:', response.status);
    console.log('📦 Raw response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Webhook error:', error);
    console.error('❌ Error response:', error.response?.data);
    return null;
  }
};
// ─── Comparison result table component ──────────────────────────────────
const PARAM_LABELS = {
  objective:                'Objective',
  target_beneficiaries:     'Target Beneficiaries',
  eligibility_criteria:     'Eligibility Criteria',
  financial_benefits:       'Financial Benefits',
  type_of_assistance:       'Type of Assistance',
  application_mode:         'Application Mode',
  implementing_department:  'Implementing Dept.',
};

const ComparisonTable = ({ data }) => {
  if (!data) return <p>📊 No comparison data received.</p>;

  const schemes = Array.isArray(data.schemes) ? data.schemes : [];
  const paramKeys = Object.keys(PARAM_LABELS);
  const summary = data.comparison_summary || {};

  return (
    <div className="cmp-wrapper">
      <p className="cmp-title">⚖️ Scheme Comparison ({schemes.length} schemes)</p>

      {/* Scrollable table */}
      <div className="cmp-table-scroll">
        <table className="cmp-table">
          <thead>
            <tr>
              <th className="cmp-param-col">Parameter</th>
              {schemes.map((s, i) => (
                <th key={i} className="cmp-scheme-col">{s.scheme_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paramKeys.map(key => (
              <tr key={key}>
                <td className="cmp-param-cell">{PARAM_LABELS[key]}</td>
                {schemes.map((s, i) => (
                  <td key={i} className="cmp-value-cell">{s[key] || '—'}</td>
                ))}
              </tr>
            ))}
            {/* Official link row */}
            <tr>
              <td className="cmp-param-cell">Official Link</td>
              {schemes.map((s, i) => (
                <td key={i} className="cmp-value-cell">
                  {s.official_link
                    ? <a href={s.official_link} target="_blank" rel="noopener noreferrer" className="cmp-link">Apply ↗</a>
                    : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary section */}
      {(summary.key_differences || summary.who_should_apply_for_which) && (
        <div className="cmp-summary">
          {summary.key_differences && (
            <div className="cmp-summary-block">
              <p className="cmp-summary-label">🔍 Key Differences</p>
              <p className="cmp-summary-text">{summary.key_differences}</p>
            </div>
          )}
          {summary.who_should_apply_for_which && (
            <div className="cmp-summary-block">
              <p className="cmp-summary-label">🎯 Who Should Apply</p>
              <p className="cmp-summary-text">{summary.who_should_apply_for_which}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// ─── Component ────────────────────────────────────────────────────────────────
const AIAssistantPage = () => {
  const { user } = useContext(AuthContext);

  const [messages, setMessages]                 = useState([]);
  const [input, setInput]                       = useState('');
  const [isTyping, setIsTyping]                 = useState(false);
  const [isRecording, setIsRecording]           = useState(false);
  const [sidebarOpen, setSidebarOpen]           = useState(false);
  const [activeChat, setActiveChat]             = useState(null);
  const [isHindi, setIsHindi]                   = useState(false);
  const [dragOver, setDragOver]                 = useState(false);
  const [searchQuery, setSearchQuery]           = useState('');
  const [sessionId, setSessionId]               = useState(() => generateSessionId());
  const [uploadedFile, setUploadedFile]         = useState(null);
  const [isComparing, setIsComparing]           = useState(false);
  const [compareUsed, setCompareUsed]           = useState(false);
  const [sessions, setSessions]                 = useState([]);
  const [sessionsLoading, setSessionsLoading]   = useState(false);

  const messagesEndRef  = useRef(null);
  const textareaRef     = useRef(null);
  const fileInputRef    = useRef(null);
  const recognitionRef  = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load session list on mount (when user is available)
  useEffect(() => {
    if (user) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-save session to DB whenever messages change (debounced 600ms)
  useEffect(() => {
    if (!messages.length) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const title =
      messages.find(m => m.role === 'user')?.content?.slice(0, 60).trim() || 'New Chat';
    const timer = setTimeout(() => {
      axios
        .put(
          `http://localhost:5000/api/ai/sessions/${sessionId}`,
          { title, messages },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        .then(res => {
          const saved = res.data.session;
          if (saved) {
            setSessions(prev => {
              const exists = prev.find(s => s.sessionId === saved.sessionId);
              if (exists) {
                return prev.map(s => (s.sessionId === saved.sessionId ? saved : s));
              }
              return [saved, ...prev];
            });
          }
        })
        .catch(() => {});
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

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
  const sendMessage = async (text = input, fileData = uploadedFile) => {
    const trimmed = text.trim();
    if (!trimmed && !fileData) return;

    const chatId = generateChatId();
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      file: fileData,
      time: getTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setUploadedFile(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // If file exists, upload to backend (handles Cloudinary, PDF extraction, n8n)
    if (fileData && fileData.file) {
      setIsTyping(true);
      const uploadResult = await uploadToBackend(fileData.file, trimmed, chatId, sessionId);
      setIsTyping(false);

      if (uploadResult) {
        console.log('✅ Upload successful:', uploadResult.uploadId);

        const n8nResponse = uploadResult.n8nResponse;
        console.log('📥 N8N Response (upload):', n8nResponse);

        // Handle different response formats (same as text-only)
        let aiResponse = null;
        let schemes = [];

        if (n8nResponse) {
          if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
            aiResponse = n8nResponse[0].response;
            schemes = n8nResponse[0].schemes || [];
          } else if (typeof n8nResponse === 'object' && n8nResponse.response) {
            aiResponse = n8nResponse.response;
            schemes = n8nResponse.schemes || [];
          } else if (typeof n8nResponse === 'string') {
            aiResponse = n8nResponse;
          }
        }

        // Limit the number of schemes shown in the chat UI
        if (Array.isArray(schemes)) {
          schemes = schemes.slice(0, MAX_SCHEMES_IN_CHAT);
        }

        if (aiResponse) {
          const botMsg = {
            id: Date.now() + 1,
            role: 'bot',
            content: aiResponse,
            schemes: schemes || [],
            time: getTime(),
          };
          setMessages(prev => [...prev, botMsg]);
          return;
        }

        // If webhook failed or didn't return an AI response, still acknowledge upload
        const botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: uploadResult.webhookSuccess
            ? '📎 File uploaded successfully, but I did not receive a readable AI response. Please try again.'
            : '📎 File uploaded successfully, but the AI service did not respond. Please try again in a moment.',
          schemes: [],
          time: getTime(),
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      }

      // Upload failed
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: '❌ Upload failed. Please check your internet connection and try again.',
        schemes: [],
        time: getTime(),
      };
      setMessages(prev => [...prev, botMsg]);
      return;
    } else {
      // Text-only message - send directly to n8n and get AI response
      const webhookPayload = {
        chatId,
        sessionId,
        userId: user?._id || 'guest',
        userName: user?.fullName || 'Guest User',
        message: trimmed,
        timestamp: new Date().toISOString(),
        fileType: null,
        fileName: null,
        imageUrl: 'No',
        pdfText: 'No',
      };
      
      setIsTyping(true);
      const n8nResponse = await sendToWebhook(webhookPayload);
      setIsTyping(false);

      console.log('📥 N8N Response:', n8nResponse);
      console.log('📊 Response type:', typeof n8nResponse);
      console.log('📋 Is array:', Array.isArray(n8nResponse));
      console.log('📄 Full response:', JSON.stringify(n8nResponse, null, 2));

      // Handle different response formats
      let aiResponse = null;
      let schemes = [];

      if (n8nResponse) {
        // Case 1: Response is an array
        if (Array.isArray(n8nResponse) && n8nResponse.length > 0) {
          aiResponse = n8nResponse[0].response;
          schemes = n8nResponse[0].schemes || [];
        }
        // Case 2: Response is a single object
        else if (n8nResponse.response) {
          aiResponse = n8nResponse.response;
          schemes = n8nResponse.schemes || [];
        }
      }

      // Limit the number of schemes shown in the chat UI
      if (Array.isArray(schemes)) {
        schemes = schemes.slice(0, MAX_SCHEMES_IN_CHAT);
      }

      console.log('✅ Extracted AI Response:', aiResponse);
      console.log('📋 Extracted Schemes:', schemes);

      if (aiResponse) {
        const botMsg = {
          id: Date.now() + 1,
          role: 'bot',
          content: aiResponse,
          schemes: schemes || [],
          time: getTime(),
        };
        setMessages(prev => [...prev, botMsg]);
        return;
      } else {
        console.log('⚠️ No AI response found in n8n data');
      }
    }

    // Fallback for file uploads or when n8n doesn't respond
    console.log('🔄 Using fallback response');
    setIsTyping(true);
    const delay = 1500 + Math.random() * 500;
    setTimeout(() => {
      setIsTyping(false);
      const replyText = fileData
        ? `📎 I received your ${fileData.type.includes('pdf') ? 'PDF document' : 'image'}! I've processed it and forwarded to the AI assistant. Analysis will be ready shortly.`
        : getBotReply(trimmed);

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: replyText,
        file: null,
        schemes: [],
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

  // ─── File upload (Images & PDFs) ─────────────────────────────────────────────
  const handleFileUpload = (file) => {
    if (!file) return;
    
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    if (!isImage && !isPDF) {
      alert('Please upload only images (JPEG, PNG) or PDF files');
      return;
    }
    
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Create preview URL for images only
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setUploadedFile({
          file: file, // Store raw file for backend upload
          name: file.name,
          type: file.type,
          size: file.size,
          preview: ev.target.result, // For display only
        });
      };
      reader.readAsDataURL(file);
    } else {
      // PDF - no preview needed
      setUploadedFile({
        file: file, // Store raw file for backend upload
        name: file.name,
        type: file.type,
        size: file.size,
        preview: null,
      });
    }
  };

  const handleFileInput = (e) => handleFileUpload(e.target.files[0]);

  // ─── Drag & Drop ─────────────────────────────────────────────────────────────
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files[0]);
  };

  // ─── Voice toggle (Web Speech API) ───────────────────────────────────────────
  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    if (isRecording) {
      // Stop recording
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      // Start recording
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = isHindi ? 'hi-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // ─── New chat ─────────────────────────────────────────────────────────────────
  const startNewChat = () => {
    setMessages([]);
    const newSid = generateSessionId();
    setSessionId(newSid);
    setActiveChat(null);
    setCompareUsed(false);
    setSidebarOpen(false);
  };

  // ─── Load session list from DB ────────────────────────────────────────────────
  const loadSessions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setSessionsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/ai/sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  // ─── Open an existing session ─────────────────────────────────────────────────
  const openSession = async (sess) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/ai/sessions/${sess.sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const loaded = res.data.session;
      setMessages(loaded.messages || []);
      setSessionId(sess.sessionId);
      setActiveChat(sess.sessionId);
      setCompareUsed(false);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  };

  // ─── Delete a session ─────────────────────────────────────────────────────────
  const deleteSession = async (sessId, e) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.delete(`http://localhost:5000/api/ai/sessions/${sessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(prev => prev.filter(s => s.sessionId !== sessId));
      // If it was the open session, start fresh
      if (sessId === sessionId) startNewChat();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  // ─── Compare schemes ─────────────────────────────────────────────────────────
  const handleCompareSchemes = async () => {
    const latestSchemesMsg = [...messages].reverse().find(
      m => m.role === 'bot' && Array.isArray(m.schemes) && m.schemes.length > 0
    );
    if (!latestSchemesMsg) return;

    const schemesToCompare = latestSchemesMsg.schemes.slice(0, MAX_SCHEMES_IN_CHAT);
    const schemeNames = schemesToCompare.map(s => s.scheme_name).filter(Boolean);

    const payload = {
      sessionId,
      userId:   user?._id     || 'guest',
      userName: user?.fullName || 'Guest User',
      schemeNames,
      schemes:  schemesToCompare,
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Sending comparison request:', payload);
    setIsComparing(true);
    setCompareUsed(true);        // hide button permanently from this point
    setIsTyping(true);           // show bot typing animation

    try {
      const res = await axios.post(N8N_COMPARE_WEBHOOK_URL, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const raw = res.data;
      console.log('📊 Comparison response:', raw);

      // The webhook returns an array with one object containing the full comparison
      const compData = Array.isArray(raw) ? raw[0] : raw;

      const botMsg = {
        id: Date.now(),
        role: 'bot',
        content: null,
        schemes: [],
        comparison: true,
        comparisonData: compData || null,
        time: getTime(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('❌ Compare error:', err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'bot',
        content: '❌ Could not fetch comparison. Please try again.',
        schemes: [],
        time: getTime(),
      }]);
    } finally {
      setIsTyping(false);
      setIsComparing(false);
    }
  };

  // ─── Filtered sessions ────────────────────────────────────────────────────────
  const filteredSessions = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          � Drop image or PDF here to attach
        </div>
      )}

      {/* File preview */}
      {uploadedFile && (
        <div className="ai-file-preview">
          <div className="ai-file-preview-content">
            <span className="ai-file-icon">
              {uploadedFile.type.includes('pdf') ? '📄' : '🖼️'}
            </span>
            <span className="ai-file-name">{uploadedFile.name}</span>
            <button
              className="ai-file-remove"
              onClick={() => setUploadedFile(null)}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
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

          {/* Sessions list */}
          <div className="ai-history-list">
            {sessionsLoading ? (
              <p className="ai-history-empty">Loading…</p>
            ) : filteredSessions.length === 0 ? (
              <p className="ai-history-empty">
                {searchQuery ? 'No results' : 'No conversations yet'}
              </p>
            ) : (
              filteredSessions.map(sess => (
                <div
                  key={sess.sessionId}
                  className={`ai-history-item ${activeChat === sess.sessionId ? 'active' : ''}`}
                  onClick={() => openSession(sess)}
                >
                  <span className="ai-history-icon">💬</span>
                  <div className="ai-history-info">
                    <p className="ai-history-title">{sess.title || 'New Chat'}</p>
                    <p className="ai-history-time">{formatSessionTime(sess.updatedAt)}</p>
                  </div>
                  <button
                    className="ai-history-delete"
                    onClick={(e) => deleteSession(sess.sessionId, e)}
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >🗑️</button>
                </div>
              ))
            )}
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
        <div className={`ai-main${messages.length === 0 ? ' ai-main--empty' : ''}`}>
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
                        {msg.file && (
                          <div className="ai-msg-file">
                            {msg.file.type.includes('pdf') ? (
                              <div className="ai-pdf-preview">
                                <span className="ai-pdf-icon">📄</span>
                                <span className="ai-pdf-name">{msg.file.name}</span>
                              </div>
                            ) : (
                              <img
                                src={msg.file.preview || msg.file.base64}
                                alt="Uploaded"
                                className="ai-msg-image"
                              />
                            )}
                          </div>
                        )}
                        {/* Comparison Table */}
                        {msg.comparison && msg.comparisonData ? (
                          <ComparisonTable data={msg.comparisonData} />
                        ) : (
                          msg.content
                        )}

                        {/* Scheme Cards */}
                        {msg.schemes && msg.schemes.length > 0 && (
                          <div className="ai-schemes-container">
                            {(msg.schemes || []).slice(0, MAX_SCHEMES_IN_CHAT).map((scheme, idx) => (
                              <div key={idx} className="ai-scheme-card">
                                <div className="ai-scheme-header">
                                  <span className="ai-scheme-icon">📋</span>
                                  <h4 className="ai-scheme-name">{scheme.scheme_name}</h4>
                                </div>
                                <div className="ai-scheme-actions">
                                  <button
                                    className="ai-scheme-btn ai-apply-btn"
                                    onClick={() => window.open(scheme.official_link, '_blank')}
                                    disabled={!scheme.official_link}
                                  >
                                    Apply Now →
                                  </button>
                                  <button
                                    className="ai-scheme-btn ai-know-more-btn"
                                    onClick={() => window.location.href = `/schemes/${scheme.schemeId}`}
                                  >
                                    Know More
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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

          {/* ── Compare Schemes bar ── */}
          {(() => {
            if (compareUsed) return null;
            // Find most-recent bot message with >1 scheme
            const latestSchemeMsg = [...messages].reverse().find(
              m => m.role === 'bot' && Array.isArray(m.schemes) && m.schemes.length > 1
            );
            if (!latestSchemeMsg) return null;
            return (
              <div className="ai-compare-bar">
                <button
                  className={`ai-compare-btn ${isComparing ? 'loading' : ''}`}
                  onClick={handleCompareSchemes}
                  disabled={isComparing}
                >
                  {isComparing ? (
                    <><span className="ai-compare-spinner" /> Comparing…</>
                  ) : (
                    <>⚖️ Compare These Schemes</>
                  )}
                </button>
              </div>
            );
          })()}

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
                aria-label="Upload file"
                title="Upload image or PDF"
              >
                📎
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
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
                className={`ai-send-btn ${input.trim() || uploadedFile ? 'active' : 'inactive'}`}
                onClick={() => sendMessage()}
                disabled={!input.trim() && !uploadedFile}
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
