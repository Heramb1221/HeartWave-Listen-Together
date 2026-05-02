import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Music2 } from "lucide-react";

const Success = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 4000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg-primary)" }}>
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
          style={{ background: "rgba(34,197,94,0.08)" }} />
      </div>

      <div className="relative z-10 text-center animate-scale-in max-w-sm w-full">
        {/* Success icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 animate-bounce"
          style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", boxShadow: "0 8px 32px rgba(34,197,94,0.3)" }}>
          <Check size={40} className="text-white" />
        </div>

        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "2rem", color: "var(--text-primary)", marginBottom: 10 }}>
          Welcome to Premium! 🎉
        </h1>
        <p style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: 6, lineHeight: 1.6 }}>
          Your payment was successful. Enjoy unlimited HeartWave.
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 32 }}>
          Redirecting to dashboard in a few seconds…
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary-hw flex items-center justify-center gap-2 mx-auto"
          style={{ padding: "12px 32px" }}
        >
          <Music2 size={18} /> Go to Dashboard
        </button>

        {sessionId && (
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginTop: 28, opacity: 0.5 }}>
            Session ID: {sessionId}
          </p>
        )}
      </div>
    </div>
  );
};

export default Success;