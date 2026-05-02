import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useChatStore, useRoomStore } from "../store";

export const Chat = () => {
  const { user } = useUser();
  const { currentRoom } = useRoomStore();
  const { messages, chatInput, addMessage, setChatInput } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleReceiveMessage = (msg: { user: string; text: string; timestamp: string }) => {
      addMessage(msg);
      if (msg.text.startsWith("/play ")) {
        const query = msg.text.replace("/play ", "");
        console.log(`Command: search for "${query}"`);
      }
    };
    socket.on("receive_message", handleReceiveMessage);
    return () => { socket.off("receive_message", handleReceiveMessage); };
  }, [addMessage]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentRoom) return;
    socket.emit("send_message", {
      roomCode: currentRoom,
      message: { user: user?.firstName || "Anonymous", text: chatInput },
    });
    setChatInput("");
  };

  if (!currentRoom) return null;

  return (
    <div className="bottom-dock">
      <div className="dock-drag" title="Drag to resize"></div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-sys">No messages yet. Start chatting!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.user === (user?.firstName || "Anonymous");
            return (
              <div key={idx} className="chat-msg">
                <div className={`chat-avatar ${isMe ? "av-pink" : "av-violet"}`}>
                  {msg.user.substring(0, 2).toUpperCase()}
                </div>
                <div className="chat-content">
                  <div className="chat-meta">
                    <span className="chat-name" style={{ color: isMe ? "var(--pink)" : "var(--violet)" }}>{msg.user}</span>
                    <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMe && <span style={{ fontSize: 10, background: "var(--pink-dim)", color: "var(--pink)", border: "1px solid rgba(236,72,153,0.2)", padding: "1px 5px", borderRadius: 4 }}>you</span>}
                  </div>
                  <div className="chat-text">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="dock-input-row" onSubmit={handleSendMessage}>
        <input
          className="chat-input"
          placeholder="Message… or /play <song>"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        />
        <button type="submit" className="dock-btn send" title="Send">➤</button>
        <div className="dock-btn active-mic" title="Mute / Unmute">🎤</div>
        <div className="dock-btn" title="Camera Off">📷</div>
        <div className="dock-btn" title="Settings">⚙️</div>
      </form>
    </div>
  );
};