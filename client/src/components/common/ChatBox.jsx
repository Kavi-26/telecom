import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';
import './ChatBox.css';

// Hard-coded GenAI response engine
const getAIResponse = (message, domain) => {
  const msg = message.toLowerCase().trim();

  // RAN queries
  if (msg.includes('bts') || msg.includes('base station') || msg.includes('ran')) {
    if (msg.includes('rsrp') || msg.includes('signal'))
      return '📡 Current average **RSRP** across the network is **-78.4 dBm**. BTS-JKT-001 has the best signal at -75.5 dBm. For detailed RSRP charts, check the RAN Dashboard.';
    if (msg.includes('sinr'))
      return '📊 Network average **SINR** is **15.8 dB**. BTS-BDG-001 leads at 22.1 dB. BTS-MKS-001 is degraded at 9.8 dB. For more, check the RAN Dashboard.';
    if (msg.includes('capacity') || msg.includes('utilization'))
      return '⚠️ **BTS-JKT-003** has capacity utilization at **91.5%**. BTS-JKT-002 is also elevated at 78.2%. Consider load balancing or capacity expansion.';
    return '📡 RAN network currently has **10 BTS stations**: 7 up, 3 degraded/down. Overall RAN health is **75%**. Type "show bts status" for full details.';
  }

  // CORE queries
  if (msg.includes('core') || msg.includes('hlr') || msg.includes('epc') || msg.includes('mme') || msg.includes('gateway')) {
    if (msg.includes('latency'))
      return '⏱️ Current average **core latency** is **3.8ms**. All elements within normal range except EPC-01 at 5.2ms (slightly elevated). IMS-01 is optimal at 1.9ms.';
    if (msg.includes('success') || msg.includes('attach'))
      return '✅ Average **attach/detach success rate** is **99.5%**. EPC-02 has dropped to 98.2% — monitor closely for further degradation.';
    if (msg.includes('throughput'))
      return '📈 Total core **throughput**: GW-INET-01 at 12 Gbps (primary), PGW-01 at 7.2 Gbps.';
    return '🖥️ CORE network has **11 elements**: 9 active, 2 idle/down. Overall CORE health is **82%**. Type "core latency" or "core throughput" for KPI details.';
  }

  // Transport queries
  if (msg.includes('transport') || msg.includes('link') || msg.includes('bandwidth') || msg.includes('backbone')) {
    if (msg.includes('saturation') || msg.includes('congestion') || msg.includes('utilization'))
      return '⚠️ Link **Core-BDG → Core-SBY** is at **96% utilization** (4.8/5.0 Gbps) — approaching saturation. Consider traffic engineering or temporary bandwidth upgrade.';
    if (msg.includes('bandwidth'))
      return '📊 Total backbone bandwidth: **37,500 Mbps**. Currently using ~**24,200 Mbps** (64.5%). Two links of concern: Core-BDG→Core-SBY (96%) and Core-JKT→Core-SBY (72%).';
    return '🌐 IP Transport: **8 links** total — 6 up, 2 degraded/down. Most critical: Core-BDG→Core-SBY (96% utilization). Overall transport health is **75%**.';
  }

  // Network health
  if (msg.includes('health') || msg.includes('status') || msg.includes('overview') || msg.includes('summary')) {
    return '💚 **Overall Network Health: 77%**\n\n- RAN: 75% (7/10 BTS up)\n- CORE: 82% (9/11 elements active)\n- IP Transport: 75% (6/8 links up)\n\nRecommend incident bridge call with NOC Manager to discuss degradation.';
  }

  // Report queries
  if (msg.includes('report') || msg.includes('trend') || msg.includes('history') || msg.includes('export')) {
    return '📊 I can help you generate reports! Head to the **Reports** page to:\n- View historical KPI trends for RAN, CORE, and IP\n- Export data to Excel (.xlsx) or PDF format\n- Drill down by location or network element\n\nWould you like me to highlight any specific time period or domain?';
  }

  // Help
  if (msg.includes('help') || msg.includes('what can you') || msg === '?') {
    return `🤖 **I'm your TelcoVision AI Assistant!** I can help you with:\n\n` +
      `📡 **RAN**: BTS status, RSRP/RSRQ/SINR KPIs, capacity\n` +
      `🖥️ **CORE**: HLR/EPC/Gateway status, latency, throughput\n` +
      `🌐 **Transport**: Link status, bandwidth utilization\n` +
      `📊 **Reports**: Performance trends, export\n` +
      `💚 **Health**: Overall network health score\n\n` +
      `Try asking: *"Show network health"* or *"What is the SINR status?"*`;
  }

  // Greeting
  if (msg.match(/^(hi|hello|hey|good morning|good afternoon|howdy)/)) {
    const greetings = [
      '👋 Hello! I\'m your TelcoVision AI. Network is being monitored in real-time. How can I assist you today?',
      '👋 Hi there! Currently tracking 10 BTS stations, 11 core elements, and 8 transport links. What would you like to know?',
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // Domain-specific context
  if (domain === 'ran') {
    return '📡 I\'m in RAN context. I can see you\'re on the RAN dashboard. Try asking about "BTS status", "RSRP values", "SINR trends", or "capacity utilization". What would you like to know?';
  }
  if (domain === 'core') {
    return '🖥️ I\'m in CORE context. Try asking about "gateway status", "HLR performance", "attach success rate", or "EPC latency". What would you like to know?';
  }
  if (domain === 'transport') {
    return '🌐 I\'m in Transport context. Try asking about "link status", "bandwidth utilization", "backbone congestion", or "link failures". What would you like to know?';
  }

  return '🤖 I understand you\'re asking about "' + message + '". I can help with RAN, CORE, IP Transport monitoring, and reports. Try asking: "show network health", or type "help" for all commands.';
};

export default function ChatBox({ domain = 'general' }) {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: '👋 Hi! I\'m your TelcoVision AI. I can help you analyze network status, KPIs, and more. Type "help" to see what I can do!',
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open, minimized]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: Date.now(), role: 'user', text, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI thinking delay
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const response = getAIResponse(text, domain);
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      role: 'assistant',
      text: response,
      time: new Date(),
    }]);
    setTyping(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatText = (text) => {
    // Bold **text**
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const quickPrompts = ['Network health', 'BTS status', 'KPI Overview', 'Help'];

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          className="chat-fab"
          onClick={() => setOpen(true)}
          title="Open AI Assistant"
          id="chat-fab"
        >
          <MessageCircle size={22} />
          <span className="chat-fab-badge">AI</span>
        </button>
      )}

      {open && (
        <div className={`chat-window ${minimized ? 'minimized' : ''}`}>
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-bot-avatar">
                <Bot size={16} />
              </div>
              <div>
                <span className="chat-bot-name">TelcoAI Assistant</span>
                <span className="chat-bot-status">
                  <span className="status-dot up" />
                  Online · {domain !== 'general' ? domain.toUpperCase() : 'All domains'}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="chat-btn" onClick={() => setMinimized(v => !v)}>
                {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
              <button className="chat-btn" onClick={() => setOpen(false)}>
                <X size={14} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="chat-messages">
                {messages.map(msg => (
                  <div key={msg.id} className={`chat-msg chat-msg-${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="msg-avatar assistant-avatar"><Bot size={12} /></div>
                    )}
                    <div className="msg-bubble">
                      <div className="msg-text">{formatText(msg.text)}</div>
                      <div className="msg-time">{formatTime(msg.time)}</div>
                    </div>
                    {msg.role === 'user' && (
                      <div className="msg-avatar user-avatar"><User size={12} /></div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="chat-msg chat-msg-assistant">
                    <div className="msg-avatar assistant-avatar"><Bot size={12} /></div>
                    <div className="msg-bubble typing-bubble">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick prompts */}
              <div className="chat-quick-prompts">
                {quickPrompts.map(p => (
                  <button
                    key={p}
                    className="quick-prompt"
                    onClick={() => { setInput(p); }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="chat-input-area">
                <textarea
                  className="chat-input"
                  placeholder="Ask about network status, KPIs..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  rows={1}
                  id="chat-input"
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || typing}
                  title="Send message"
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
