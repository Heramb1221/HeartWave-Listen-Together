import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { socket } from "../socket";
import { useRoomStore, usePlayerStore } from "../store";

export const Controls = () => {
  const { user } = useUser();
  const { currentRoom, hostId } = useRoomStore();
  const { player, isPlaying } = usePlayerStore();
  const isHost = user?.id === hostId;

  const handlePlay = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("play", { roomCode: currentRoom, videoId: player.getVideoData().video_id, time: player.getCurrentTime(), userId: user?.id });
  };
  const handlePause = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("pause", { roomCode: currentRoom, time: player.getCurrentTime(), userId: user?.id });
  };
  const handleSync = () => {
    if (!player || !currentRoom || !isHost) return;
    socket.emit("play", { roomCode: currentRoom, videoId: player.getVideoData().video_id, time: player.getCurrentTime(), userId: user?.id });
  };
  const handleNext = () => {
    if (!currentRoom || !isHost) return;
    socket.emit("song_ended", { roomCode: currentRoom });
  };

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && player) {
      interval = setInterval(() => {
        setProgress(player.getCurrentTime() || 0);
        setDuration(player.getDuration() || 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, player]);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="controls-row">
      <button className="ctrl-btn" disabled={!isHost} title="Previous">⏮</button>
      <button className="ctrl-btn primary" disabled={!isHost} onClick={isPlaying ? handlePause : handlePlay} title={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button className="ctrl-btn" disabled={!isHost} onClick={handleNext} title="Next (host only)">⏭</button>
      <button className="ctrl-btn sync" onClick={handleSync} title="Sync to host">⟳</button>

      <div className="progress-wrap">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}></div>
        </div>
        <div className="progress-times">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="volume-wrap">
        <span className="vol-icon">🔊</span>
        <input 
          type="range" 
          className="vol" 
          min="0" 
          max="100" 
          defaultValue="75" 
          onChange={(e) => {
            if (player) player.setVolume(Number(e.target.value));
            const pct = e.target.value;
            e.target.style.background = `linear-gradient(90deg, #ec4899 ${pct}%, rgba(255,255,255,0.15) ${pct}%)`;
          }} 
        />
      </div>
    </div>
  );
};