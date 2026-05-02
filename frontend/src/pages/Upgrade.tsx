import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useState } from "react";
import { Check, ArrowLeft, Crown, Zap, Shield } from "lucide-react";

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

const Upgrade = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"plan" | "confirm">("plan");

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("http://localhost:5000/api/payment/create-checkout-session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative" style={{ background: "var(--bg-primary)" }}>
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow"
          style={{ background: "rgba(255,59,59,0.07)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse-glow delay-2000"
          style={{ background: "rgba(157,78,221,0.07)" }} />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
        style={{ color: "var(--text-secondary)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Card */}
        <div style={{ background: "rgba(20,20,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, backdropFilter: "blur(20px)", boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}>
          <div className="h-1 rounded-t-3xl" style={{ background: "linear-gradient(90deg, #FF3B3B, #9D4EDD, #FF6EC7)" }} />

          <div className="p-8">
            {step === "plan" ? (
              <>
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)" }}>
                    <Crown size={22} className="text-white" />
                  </div>
                  <div>
                    <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.6rem", color: "var(--text-primary)" }}>Go Premium</h1>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Unlock the full experience</p>
                  </div>
                </div>

                {/* Price */}
                <div className="text-center py-6 mb-6 rounded-2xl" style={{ background: "rgba(255,59,59,0.06)", border: "1px solid rgba(255,59,59,0.15)" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "3.5rem", color: "var(--text-primary)", lineHeight: 1 }}>
                    $9.99<span style={{ fontSize: "1.1rem", fontWeight: 400, color: "var(--text-secondary)" }}>/mo</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 8 }}>Cancel anytime · No hidden fees</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {FEATURES.map((feature) => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,59,59,0.15)" }}>
                        <Check size={11} style={{ color: "var(--primary-500)" }} />
                      </div>
                      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep("confirm")}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)", color: "white", boxShadow: "0 4px 20px rgba(255,59,59,0.3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; }}
                >
                  <Zap size={18} /> Continue to Upgrade
                </button>
              </>
            ) : (
              <>
                {/* Confirm step */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.2)" }}>
                    <Shield size={30} style={{ color: "var(--primary-500)" }} />
                  </div>
                  <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.5rem", color: "var(--text-primary)", marginBottom: 10 }}>
                    Ready to upgrade?
                  </h1>
                  <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    You'll be redirected to our secure Stripe checkout. Subscription starts at <strong style={{ color: "var(--text-primary)" }}>$9.99/month</strong>.
                  </p>
                </div>

                <div className="space-y-2.5 mb-8 p-4 rounded-xl" style={{ background: "rgba(31,31,31,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {["Secure payment via Stripe", "30-day money-back guarantee", "Cancel anytime from settings"].map((item) => (
                    <div key={item} className="flex items-center gap-2.5">
                      <Check size={14} style={{ color: "var(--primary-500)", flexShrink: 0 }} />
                      <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200"
                  style={{ background: "linear-gradient(135deg, #FF3B3B, #9D4EDD)", color: "white", boxShadow: "0 4px 20px rgba(255,59,59,0.3)" }}
                >
                  {isLoading ? (
                    <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full inline-block" /> Processing...</>
                  ) : "Proceed to Payment"}
                </button>
                <button
                  onClick={() => setStep("plan")}
                  className="w-full py-3 rounded-xl text-sm font-medium mt-2 transition-colors duration-200"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
                >
                  ← Back to plan
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;