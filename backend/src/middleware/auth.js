import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";

// Wrap Clerk auth middleware with error handling for Express 5 compatibility
const clerkAuth = ClerkExpressRequireAuth();

export const requireAuth = (req, res, next) => {
  clerkAuth(req, res, (err) => {
    if (err) {
      console.error("❌ Auth error:", err.message || err);
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  });
};