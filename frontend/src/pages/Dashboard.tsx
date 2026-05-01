/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useUser, UserButton, useAuth } from "@clerk/clerk-react";
import { socket } from "../socket";
import YouTube from "react-youtube";

type UserType = {
  name: string;
  socketId: string;
};

type SyncState = {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
};

type Message = {
  user: string;
  text: string;
};

const Dashboard = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  // =========================
  // USER + PREMIUM
  // =========================
  const [userData, setUserData] = useState<any>(null);

  // =========================
  // ROOM + USERS
  // =========================
  const [roomCode, setRoomCode] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [hostId, setHostId] = useState<string | null>(null);

  // =========================
  // QUEUE + CHAT
  // =========================
  const [queue, setQueue] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");

  // =========================
  // PLAYER
  // =========================
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [player, setPlayer] = useState<any>(null);
  const [pendingSync, setPendingSync] = useState<SyncState | null>(null);

  // =========================
  // SEARCH
  // =========================
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // =========================
  // WEBRTC (FULL)
  // =========================
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const peerRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const isHost = user?.id === hostId;

  // =========================
  // 💳 STRIPE UPGRADE
  // =========================
  const handleUpgrade = async () => {
    const token = await getToken();

    const res = await fetch(
      "http://localhost:5000/api/payment/create-checkout-session",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    window.location.href = data.url;
  };

  // =========================
  // 🎥 MEDIA
  // =========================
  const startMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setLocalStream(stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }
  };

  const createPeer = () => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("webrtc_ice", {
          roomCode: currentRoom,
          candidate: event.candidate,
        });
      }
    };

    return pc;
  };

  const startCall = async () => {
    if (!localStream) return;

    const pc = createPeer();
    peerRef.current = pc;

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("webrtc_offer", {
      roomCode: currentRoom,
      offer,
    });
  };

  // =========================
  // PLAYER
  // =========================
  const onReady = (event: any) => setPlayer(event.target);

  const applySync = (playerInstance: any, state: SyncState) => {
    const { videoId, currentTime, isPlaying } = state;

    setVideoId(videoId);

    setTimeout(() => {
      const drift = Math.abs(
        playerInstance.getCurrentTime() - currentTime
      );

      if (drift > 0.5) {
        playerInstance.seekTo(currentTime, true);
      }

      isPlaying
        ? playerInstance.playVideo()
        : playerInstance.pauseVideo();
    }, 300);
  };

  const searchAndAdd = async (query: string) => {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
    );

    const data = await res.json();
    const video = data.items[0];

    if (video) {
      socket.emit("add_to_queue", {
        roomCode: currentRoom,
        video: {
          videoId: video.id.videoId,
          title: video.snippet.title,
        },
      });
    }
  };

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {
    socket.connect();

    socket.on("room_users", setUsers);
    socket.on("queue_updated", setQueue);

    socket.on("sync_state", (state: SyncState) => {
      if (!player) {
        setPendingSync(state);
        setVideoId(state.videoId);
        return;
      }
      applySync(player, state);
    });

    socket.on("receive_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.text.startsWith("/play ")) {
        const query = msg.text.replace("/play ", "");
        searchAndAdd(query);
      }
    });

    // WebRTC
    socket.on("webrtc_offer", async ({ offer }) => {
      const pc = createPeer();
      peerRef.current = pc;

      await pc.setRemoteDescription(offer);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("webrtc_answer", {
        roomCode: currentRoom,
        answer,
      });
    });

    socket.on("webrtc_answer", async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(answer);
    });

    socket.on("webrtc_ice", async ({ candidate }) => {
      await peerRef.current?.addIceCandidate(candidate);
    });

    return () => socket.off();
  }, [player, currentRoom]);

  useEffect(() => {
    if (!player || !pendingSync) return;
    applySync(player, pendingSync);
    setPendingSync(null);
  }, [videoId, player, pendingSync]);

  // =========================
  // USER FETCH
  // =========================
  useEffect(() => {
    const fetchUser = async () => {
      const token = await getToken();

      const res = await fetch("http://localhost:5000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUserData(data);
    };

    fetchUser();
  }, []);

  // =========================
  // SEARCH
  // =========================
  useEffect(() => {
    if (!searchQuery) return;

    const timeout = setTimeout(async () => {
      setIsSearching(true);

      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=5&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
      );

      const data = await res.json();
      setResults(data.items || []);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  // =========================
  // ROOM
  // =========================
  const createRoom = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/room/create", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setCurrentRoom(data.roomCode);
    setHostId(data.hostId);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: { name: user?.firstName, socketId: socket.id },
    });
  };

  const joinRoom = async () => {
    const token = await getToken();

    const res = await fetch("http://localhost:5000/api/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomCode }),
    });

    const data = await res.json();
    setCurrentRoom(data.roomCode);
    setHostId(data.hostId);

    socket.emit("join_room", {
      roomCode: data.roomCode,
      user: { name: user?.firstName, socketId: socket.id },
    });
  };

  // =========================
  // CONTROLS
  // =========================
  const handlePlay = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.playVideo();

    socket.emit("play", {
      roomCode: currentRoom,
      videoId,
      time,
      userId: user?.id,
    });
  };

  const handlePause = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.pauseVideo();

    socket.emit("pause", { roomCode: currentRoom, time });
  };

  const handleSeek = () => {
    if (!player || !currentRoom || !isHost) return;

    const time = player.getCurrentTime();
    player.seekTo(time);

    socket.emit("seek", { roomCode: currentRoom, time });
  };

  const onStateChange = (event: any) => {
    if (event.data === 0 && currentRoom) {
      socket.emit("song_ended", { roomCode: currentRoom });
    }
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;

    socket.emit("send_message", {
      roomCode: currentRoom,
      message: {
        user: user?.firstName || "Anonymous",
        text: chatInput,
      },
    });

    setChatInput("");
  };

  // =========================
  // PAYWALL
  // =========================
  if (userData && !userData.isPremium) {
    return (
      <div className="p-10 text-center">
        <h2>Upgrade to Premium</h2>
        <button onClick={handleUpgrade}>Upgrade</button>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Welcome {user?.firstName}</h1>
      <UserButton />

      <button onClick={createRoom}>Create Room</button>
      <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} />
      <button onClick={joinRoom}>Join</button>

      <YouTube videoId={videoId} onReady={onReady} onStateChange={onStateChange} />

      <button onClick={handlePlay}>Play</button>
      <button onClick={handlePause}>Pause</button>
      <button onClick={handleSeek}>Sync</button>

      {/* Search */}
      <input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {results.map((video) => (
        <div key={video.id.videoId}>
          {video.snippet.title}
          <button onClick={() => socket.emit("add_to_queue", {
            roomCode: currentRoom,
            video: {
              videoId: video.id.videoId,
              title: video.snippet.title
            }
          })}>
            Add
          </button>
        </div>
      ))}

      {/* Queue */}
      {queue.map((item, i) => (
        <div key={i}>
          {item.title}
          {isHost && (
            <button onClick={() => socket.emit("play_from_queue", { roomCode: currentRoom, video: item })}>
              Play
            </button>
          )}
        </div>
      ))}

      {/* WebRTC */}
      <button onClick={startMedia}>Start Camera</button>
      <button onClick={startCall}>Start Call</button>

      <video ref={localVideoRef} autoPlay muted className="w-40" />
      <video ref={remoteVideoRef} autoPlay className="w-40" />

      {/* Chat */}
      <div>
        {messages.map((m, i) => (
          <p key={i}>{m.user}: {m.text}</p>
        ))}
        <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>

      {/* Users */}
      <ul>
        {users.map((u) => (
          <li key={u.socketId}>{u.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;