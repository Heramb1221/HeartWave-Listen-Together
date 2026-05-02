import express from "express";
import Room from "../models/Room.js";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { generateRoomCode } from "../utils/generateRoomCode.js";
import { clerkClient } from "@clerk/clerk-sdk-node";

const router = express.Router();

// ========================
// CREATE ROOM
// ========================
router.post("/create", requireAuth, async (req, res) => {
  try {
    const { userId } = req.auth;

    let user = await User.findOne({ clerkId: userId });

    // Auto-create user if they don't exist in our DB yet
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Anonymous",
          avatar: clerkUser.imageUrl,
        });
      } catch (clerkErr) {
        console.error("❌ Clerk user fetch failed:", clerkErr);
        return res.status(500).json({ error: "Failed to fetch user data" });
      }
    }

    const room = await Room.create({
      roomCode: generateRoomCode(),
      hostId: userId,
      users: [
        {
          clerkId: user.clerkId,
          name: user.name,
          avatar: user.avatar,
        }
      ]
    });

    res.json(room);
  } catch (err) {
    console.error("❌ Create room error:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// ========================
// JOIN ROOM
// ========================
router.post("/join", requireAuth, async (req, res) => {
  try {
    const { roomCode } = req.body;
    const { userId } = req.auth;

    if (!roomCode) {
      return res.status(400).json({ error: "Room code is required" });
    }

    const room = await Room.findOne({ roomCode });

    if (!room) return res.status(404).json({ error: "Room not found" });

    let user = await User.findOne({ clerkId: userId });

    // Auto-create user if they don't exist in our DB yet
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = await User.create({
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "Anonymous",
          avatar: clerkUser.imageUrl,
        });
      } catch (clerkErr) {
        console.error("❌ Clerk user fetch failed:", clerkErr);
        return res.status(500).json({ error: "Failed to fetch user data" });
      }
    }

    const alreadyJoined = room.users.find(u => u.clerkId === userId);

    if (!alreadyJoined) {
      room.users.push({
        clerkId: user.clerkId,
        name: user.name,
        avatar: user.avatar,
      });
    }

    await room.save();

    res.json(room);
  } catch (err) {
    console.error("❌ Join room error:", err);
    res.status(500).json({ error: "Join failed" });
  }
});

export default router;