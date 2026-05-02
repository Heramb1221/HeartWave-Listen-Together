import { useState, useEffect } from "react";
import { useUser, useAuth, UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";
import { useRoomStore, useAuthStore } from "../store";
import { Player } from "../components/Player";
import { Controls } from "../components/Controls";
import { Search } from "../components/Search";
import { Queue } from "../components/Queue";
import { Chat } from "../components/Chat";
import { Users } from "../components/Users";
import { UpgradeModal } from "../components/UpgradeModal";
import "./Dashboard.css";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const { currentRoom, setCurrentRoom, setHostId, setUsers } = useRoomStore();
  const { userData, setUserData } = useAuthStore();

  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  // ── Fetch user data ──
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserData(data);
      } catch (error) {
        console.error("Fetch user error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [getToken, setUserData, navigate]);

  // ── Socket ──
  useEffect(() => { socket.connect(); return () => { socket.disconnect(); }; }, []);
  useEffect(() => {
    socket.on("room_users", setUsers);
    socket.on("error", (error) => { console.error("Socket error:", error); alert(error.message); });
    return () => { socket.off("room_users"); socket.off("error"); };
  }, [setUsers]);

  // ── Create room ──
  const createRoom = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/room/create`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCurrentRoom(data.roomCode);
      setHostId(user?.id);
      socket.emit("join_room", { roomCode: data.roomCode, user: { clerkId: user?.id, name: user?.firstName || "Anonymous", avatar: user?.imageUrl } });
    } catch (error) { console.error("Create room error:", error); alert("Failed to create room"); }
  };

  // ── Join room ──
  const joinRoom = async () => {
    if (!roomCode.trim()) { alert("Enter a room code"); return; }
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/room/join`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ roomCode }) });
      const data = await res.json();
      if (!data.roomCode) { alert("Room not found"); return; }
      setCurrentRoom(data.roomCode);
      setHostId(data.hostId);
      socket.emit("join_room", { roomCode: data.roomCode, user: { clerkId: user?.id, name: user?.firstName || "Anonymous", avatar: user?.imageUrl } });
      setRoomCode("");
    } catch (error) { console.error("Join room error:", error); alert("Failed to join room"); }
  };

  // ── Leave room ──
  const handleLeaveRoom = () => { socket.emit("leave_room", { roomCode: currentRoom }); setCurrentRoom(null); };

  // ── Copy code ──
  const handleCopyRoomCode = () => { if (!currentRoom) return; navigator.clipboard.writeText(currentRoom); setCopyToast(true); setTimeout(() => setCopyToast(false), 2000); };

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="dash-loading" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg-base)" }}>
        <div className="logo-icon" style={{ fontSize: "2rem", marginBottom: 16 }}>🎧</div>
        <p style={{ color: "var(--text-secondary)" }}>Loading HeartWave…</p>
      </div>
    );
  }

  // ── No room → Lobby ──
  if (!currentRoom) {
    return (
      <>
        {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-left">
            <div className="logo" onClick={() => navigate("/")}>
              <div className="logo-icon">🎧</div>
              <div className="logo-text">Heart<span>Wave</span></div>
            </div>
          </div>
          <div className="nav-right">
            {userData && !userData.isPremium && (
              <button className="btn btn-primary" onClick={() => setShowUpgradeModal(true)}>
                <span>⭐</span> Upgrade
              </button>
            )}
            {userData?.isPremium && (
              <div className="btn" style={{ background: "rgba(250,204,21,.08)", borderColor: "rgba(250,204,21,.18)", color: "#facc15", cursor: "default" }}>
                <span>⭐</span> Premium
              </div>
            )}
            <div className="avatar" style={{ background: "transparent" }}>
              <UserButton />
            </div>
          </div>
        </nav>
        {/* Lobby */}
        <div className="dash-lobby">
          <div className="dash-lobby-card">
            <h2>Start Listening Together</h2>
            <p>Create a room and invite friends, or join an existing one with a code.</p>
            <button className="lobby-btn-create" onClick={createRoom}>🎵 Create Room</button>
            <div className="lobby-join-row">
              <input className="lobby-join-input" placeholder="Enter room code…" value={roomCode} onChange={(e) => setRoomCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && joinRoom()} />
              <button className="lobby-btn-join" onClick={joinRoom}>Join</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── In Room ──
  return (
    <>
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
      
      {copyToast && (
        <div className="toast-container">
          <div className="toast">
            <div className="toast-dot"></div>
            <span style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>Room code</strong> copied!
            </span>
          </div>
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-left">
          <div className="logo" onClick={() => navigate("/")}>
            <div className="logo-icon">🎧</div>
            <div className="logo-text">Heart<span>Wave</span></div>
          </div>
          <div className="room-code" onClick={handleCopyRoomCode} title="Click to copy">
            ROOM · HW-{currentRoom}
          </div>
        </div>

        <div className="nav-center">
          <input className="room-name" defaultValue="Jam Session" onBlur={(e) => { if (!e.target.value.trim()) e.target.value = 'Jam Session'; }} />
          <span className="edit-icon">✎</span>
        </div>

        <div className="nav-right">
          <button className="btn" onClick={handleCopyRoomCode}>
            <span>🔗</span> Invite
          </button>
          {userData && !userData.isPremium && (
            <button className="btn btn-primary" onClick={() => setShowUpgradeModal(true)}>
              <span>⭐</span> Upgrade
            </button>
          )}
          {userData?.isPremium && (
            <div className="btn" style={{ background: "rgba(250,204,21,.08)", borderColor: "rgba(250,204,21,.18)", color: "#facc15", cursor: "default" }}>
              <span>⭐</span> Premium
            </div>
          )}
          <button className="btn btn-danger" onClick={handleLeaveRoom}>
            Leave
          </button>
          <div className="avatar" style={{ background: "transparent" }}>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* ── APP BODY ── */}
      <div className="app-body">
        <div className="main-row">

          {/* ═══ MAIN PLAYER ═══ */}
          <div className="player-area">
            <div className="karaoke-toggle">
              <div className="toggle-dot"></div>
              <span>Karaoke</span>
            </div>

            <div className="player-card">
              <Player />
              <Controls />
            </div>
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className="sidebar">
            <Search />
            <Queue />
            <Users />
          </div>

        </div>

        {/* ═══ BOTTOM DOCK ═══ */}
        <Chat />
      </div>
    </>
  );
};

export default Dashboard;