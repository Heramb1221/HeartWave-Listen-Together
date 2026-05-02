import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { X, Check, Zap, Crown, Shield, ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const FEATURES = [
  "Unlimited song requests",
  "Host shared listening rooms",
  "Advanced equalizer controls",
  "Listening analytics dashboard",
  "High-quality audio streaming",
  "Mobile app priority access",
  "Voice chat with friends",
  "Save & export playlists",
];

interface UpgradeModalProps {
  onClose: () => void;
}

export const UpgradeModal = ({ onClose }: UpgradeModalProps) => {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"plan" | "confirm">("plan");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/payment/create-checkout-session`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to create checkout session");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert("Failed to upgrade. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md animate-scale-in"
        style={{
          background: "rgba(20,20,20,0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          backdropFilter: "blur(24px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(157,78,221,0.08)",
        }}
      >
        {/* Gradient accent top bar */}
        <div className="h-1 w-full rounded-t-3xl" style={{ background: "linear-gradient(90deg, #FF3B3B, #9D4EDD, #FF6EC7)" }} />

        <div className="p-7">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg transition-colors duration-200"
            style={{ color: "var(--text-secondary)", background: "rgba(255,255,255,0.05)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
          >
            <X size={18} />
          </button>

          {step === "plan" ? (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)" }}>
                  <Crown size={20} className="text-white" />
                </div>
                <div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.35rem", color: "var(--text-primary)" }}>
                    Go Premium
                  </h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Unlock the full HeartWave experience</p>
                </div>
              </div>

              {/* Price */}
              <div className="text-center py-5 px-4 mb-5 rounded-2xl" style={{ background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.15)" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "3rem", color: "var(--text-primary)", lineHeight: 1 }}>
                  $9.99
                  <span style={{ fontSize: "1rem", fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
                </div>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 6 }}>Cancel anytime · No hidden fees</p>
              </div>

              {/* Features */}
              <div className="space-y-2.5 mb-6">
                {FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,59,59,0.15)" }}>
                      <Check size={12} style={{ color: "var(--primary-500)" }} />
                    </div>
                    <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <button
                onClick={() => setStep("confirm")}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)", color: "white", boxShadow: "0 4px 20px rgba(255,59,59,0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(255,59,59,0.45)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(255,59,59,0.3)"; }}
              >
                <Zap size={16} /> Continue to Upgrade
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl text-sm font-medium mt-2 transition-colors duration-200"
                style={{ color: "var(--text-secondary)", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              >
                Maybe later
              </button>
            </>
          ) : (
            <>
              {/* Confirm step */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, rgba(255,59,59,0.2), rgba(157,78,221,0.2))", border: "1px solid rgba(255,59,59,0.2)" }}>
                  <Shield size={28} style={{ color: "var(--primary-500)" }} />
                </div>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.35rem", color: "var(--text-primary)", marginBottom: 8 }}>
                  Ready to upgrade?
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.65 }}>
                  You'll be taken to our secure Stripe checkout. Your subscription starts at <strong style={{ color: "var(--text-primary)" }}>$9.99/month</strong>.
                </p>
              </div>

              <div className="space-y-2.5 mb-6 p-4 rounded-xl" style={{ background: "rgba(31,31,31,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}>
                {["Secure payment via Stripe", "30-day money-back guarantee", "Cancel anytime from your account"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <Check size={14} style={{ color: "var(--primary-500)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)", color: "white", boxShadow: "0 4px 20px rgba(255,59,59,0.3)" }}
              >
                {isLoading ? (
                  <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Processing...</>
                ) : (
                  <><ArrowRight size={16} /> Proceed to Payment</>
                )}
              </button>
              <button
                onClick={() => setStep("plan")}
                className="w-full py-3 rounded-xl text-sm font-medium mt-2 transition-colors duration-200"
                style={{ color: "var(--text-secondary)", background: "transparent" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
              >
                ← Back
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
