import { useState, useEffect } from "react";
import { socket } from "../socket";
import { useRoomStore } from "../store";

interface RoomUser { socketId: string; clerkId: string; name: string; avatar?: string; }

export const Users = () => {
  const { users, setUsers, hostId } = useRoomStore();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const handle = (u: RoomUser[]) => setUsers(u);
    socket.on("room_users", handle);
    return () => { socket.off("room_users", handle); };
  }, [setUsers]);

  if (users.length === 0) return null;

  return (
    <div className="sidebar-members">
      <div className="members-header" onClick={() => setOpen(!open)}>
        <div className="members-title">
          Members
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-body)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
            ({users.length})
          </span>
        </div>
        <span className={`chevron ${open ? "open" : ""}`}>▼</span>
      </div>
      
      {open && (
        <div className="members-list">
          {(users as RoomUser[]).map((u, i) => {
            const isHost = u.clerkId === hostId;
            const avatars = ["av-pink", "av-violet", "av-teal", "av-amber"];
            const avClass = avatars[i % avatars.length];
            return (
              <div key={u.socketId} className="member-row">
                <div className={`member-avatar ${avClass}`}>
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} />
                  ) : (
                    u.name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="member-name">
                  {u.name}
                  {isHost && <span className="badge badge-host">👑 Host</span>}
                </div>
                <div className="member-icons">
                  <span className="m-icon on">🎤</span>
                  <span className="m-icon on">📷</span>
                </div>
                <div className="online-dot"></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};