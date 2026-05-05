import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/ChatWidget.css";

const CHATBOT_API = "/chatbot-api";

function renderMarkdown(text: string): string {
  // Tables: detect blocks where lines start/end with |
  text = text.replace(
    /((?:\|.+\|\n?)+)/g,
    (block) => {
      const rows = block.trim().split("\n").filter(r => r.trim().startsWith("|"));
      if (rows.length < 1) return block;

      let html = '<table class="chat-md-table">';
      rows.forEach((row, i) => {
        // Skip separator rows like |---|---|
        if (/^\|[\s\-:|]+\|$/.test(row.replace(/\|[\s\-:|]+/g, "|---"))) return;
        const cells = row.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        const tag = i === 0 ? "th" : "td";
        html += `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join("")}</tr>`;
      });
      html += "</table>";
      return html;
    }
  );

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^[*-] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

const EDGE_MARGIN = 18;
const BTN_SIZE = 56;

interface ChatContext {
  page: number;
  docName: string;
}

interface ChatMessage {
  role: "user" | "ai";
  content: string;
  loading?: boolean;
  error?: string;
  context?: ChatContext[];
}

interface Position {
  x: number;
  y: number;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Drag state
  const [pos, setPos] = useState<Position>({ x: window.innerWidth - BTN_SIZE - EDGE_MARGIN, y: window.innerHeight - BTN_SIZE - EDGE_MARGIN });
  const [side, setSide] = useState<"left" | "right">("right");
  const dragging = useRef(false);
  const dragStart = useRef({ px: 0, py: 0, sx: 0, sy: 0 });
  const hasMoved = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Snap to nearest side
  const snapToSide = useCallback((x: number, y: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = x + BTN_SIZE / 2;
    const snappedSide: "left" | "right" = centerX < vw / 2 ? "left" : "right";
    const snappedX = snappedSide === "left" ? EDGE_MARGIN : vw - BTN_SIZE - EDGE_MARGIN;
    const clampedY = Math.max(EDGE_MARGIN, Math.min(y, vh - BTN_SIZE - EDGE_MARGIN));
    setSide(snappedSide);
    setPos({ x: snappedX, y: clampedY });
  }, []);

  // Mouse events
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isOpen) return;
    dragging.current = true;
    hasMoved.current = false;
    dragStart.current = { px: e.clientX, py: e.clientY, sx: pos.x, sy: pos.y };
    e.preventDefault();
  }, [isOpen, pos]);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.px;
      const dy = e.clientY - dragStart.current.py;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
      const nx = dragStart.current.sx + dx;
      const ny = dragStart.current.sy + dy;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      setPos({
        x: Math.max(0, Math.min(nx, vw - BTN_SIZE)),
        y: Math.max(0, Math.min(ny, vh - BTN_SIZE)),
      });
    };

    const onPointerUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      setPos((prev) => {
        snapToSide(prev.x, prev.y);
        return prev;
      });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [snapToSide]);

  // Keep in bounds on resize
  useEffect(() => {
    const onResize = () => snapToSide(pos.x, pos.y);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [pos, snapToSide]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleWidget = () => {
    if (hasMoved.current) {
      hasMoved.current = false;
      return;
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "ai", content: "", loading: true },
    ]);

    try {
      const res = await fetch(`${CHATBOT_API}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error || `Lỗi server (${res.status})`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let fullText = "";
      let contextChunks: ChatContext[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6);
          if (raw === "[DONE]") break;
          try {
            const msg = JSON.parse(raw) as { type: string; chunks?: ChatContext[]; content?: string; message?: string };
            if (msg.type === "context") {
              contextChunks = msg.chunks ?? [];
            } else if (msg.type === "token") {
              fullText += msg.content ?? "";
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "ai",
                  content: fullText,
                  context: contextChunks,
                  loading: false,
                };
                return updated;
              });
            } else if (msg.type === "error") {
              throw new Error(msg.message);
            }
          } catch (parseErr) {
            if ((parseErr as Error).message !== "Unexpected end of JSON input")
              throw parseErr;
          }
        }
      }

      // Final update
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: fullText,
          context: contextChunks,
          loading: false,
        };
        return updated;
      });
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: "",
          error: (err as Error).message,
          loading: false,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Compute chat window position based on button side
  const windowStyle: React.CSSProperties = side === "left"
    ? { left: 0, bottom: 70 }
    : { right: 0, bottom: 70 };

  return (
    <div
      className={`chat-widget-wrapper ${dragging.current ? "dragging" : ""}`}
      ref={wrapperRef}
      style={{
        left: pos.x,
        top: pos.y,
        transition: dragging.current ? "none" : "left 0.35s cubic-bezier(.4,.9,.3,1), top 0.35s cubic-bezier(.4,.9,.3,1)",
      }}
    >
      {/* Floating button */}
      <button
        className={`chat-widget-toggle ${isOpen ? "open" : ""}`}
        onPointerDown={onPointerDown}
        onClick={toggleWidget}
        title="Chat với AI"
        style={{ touchAction: "none" }}
      >
        {isOpen ? (
          <i className="fas fa-times"></i>
        ) : (
          <i className="fas fa-robot"></i>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className={`chat-widget-window ${side === "left" ? "side-left" : "side-right"}`} style={windowStyle}>
          <div className="chat-widget-header">
            <div className="chat-widget-header-info">
              <div className="chat-widget-avatar">AI</div>
              <div>
                <div className="chat-widget-title">AI Trợ lý VAR</div>
                <div className="chat-widget-subtitle">
                  Hỗ trợ tư vấn & tra cứu thông tin
                </div>
              </div>
            </div>
            <button className="chat-widget-close" onClick={toggleWidget}>
              <i className="fas fa-minus"></i>
            </button>
          </div>

          <div className="chat-widget-messages">
            {messages.length === 0 && (
              <div className="chat-widget-welcome">
                <div className="chat-widget-welcome-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <p>Xin chào! Tôi là trợ lý AI của VAR.</p>
                <p className="chat-widget-hint">
                  Hãy hỏi tôi bất cứ điều gì về dịch vụ, tin tức, đội ngũ, quy trình hoặc thông tin trên website.
                </p>
                <div className="chat-widget-suggestions">
                  {[
                    "VAR có những dịch vụ gì?",
                    "Quy trình tư vấn đấu thầu?",
                    "Liên hệ với VAR như thế nào?",
                    "Đội ngũ chuyên gia gồm ai?",
                  ].map((q, i) => (
                    <button
                      key={i}
                      className="chat-widget-suggestion-btn"
                      onClick={() => { setInput(q); }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-widget-msg ${msg.role}`}>
                {msg.role === "ai" && (
                  <div className="chat-widget-msg-avatar">AI</div>
                )}
                <div className="chat-widget-msg-bubble">
                  {msg.loading ? (
                    <div className="chat-widget-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : msg.error ? (
                    <span className="chat-widget-error">⚠ {msg.error}</span>
                  ) : msg.role === "ai" ? (
                    <div
                      className="chat-widget-ai-text"
                      dangerouslySetInnerHTML={{
                        __html: renderMarkdown(msg.content),
                      }}
                    />
                  ) : (
                    <span>{msg.content}</span>
                  )}
                  {msg.context && msg.context.length > 0 && (
                    <div className="chat-widget-context">
                      <span className="chat-widget-context-label">
                        {msg.context[0].page > 0
                          ? `📄 ${msg.context[0].docName} - Trang ${msg.context[0].page}`
                          : `🌐 ${msg.context[0].docName}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget-input-area">
            <textarea
              ref={inputRef}
              className="chat-widget-input"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chat-widget-send"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
