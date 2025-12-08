"use client";
import React, { useState } from "react";
import { sendOtp, verifyOtp } from "../lib/auth";

type Props = {
  onClose?: () => void;
  role?: "donor" | "ngo";
};

export default function AuthModal({ onClose, role = "donor" }: Props) {
  const [step, setStep] = useState<"choose" | "email" | "verify" | "done">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // ✅ SEND OTP
  async function handleSendOtp() {
    if (!email.includes("@")) {
      setMessage("Enter a valid email address");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await sendOtp(email);

      if (res?.code) {
        setMessage(`✅ Dev OTP: ${res.code}`);
      } else if (res?.previewUrl) {
        setMessage(`✅ Preview Email: ${res.previewUrl}`);
      } else {
        setMessage("✅ OTP sent to your email");
      }

      setStep("verify");
    } catch (e: any) {
      console.error("OTP SEND ERROR:", e);
      setMessage(e?.message || "❌ Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  // ✅ VERIFY OTP
  async function handleVerifyOtp() {
    if (!email || !code) {
      setMessage("Enter the OTP");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const ok = await verifyOtp(email, code, role);

      if (!ok) throw new Error("Invalid OTP");

      setStep("done");
      setMessage("✅ Login successful");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (e: any) {
      console.error("OTP VERIFY ERROR:", e);
      setMessage(e?.message || "❌ Verification failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={() => onClose?.()}>
          ×
        </button>

        {/* ✅ STEP 1 */}
        {step === "choose" && (
          <div>
            <h3>Sign in as {role === "ngo" ? "NGO" : "Donor"}</h3>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn" onClick={() => setStep("email")} disabled={loading}>
                Email OTP
              </button>
              <button className="btn" disabled>Apple (Soon)</button>
              <button className="btn" disabled>Google (Soon)</button>
            </div>
          </div>
        )}

        {/* ✅ STEP 2 */}
        {step === "email" && (
          <div>
            <h3>Enter your email</h3>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
            />

            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <button className="btn" onClick={() => setStep("choose")} disabled={loading}>
                Back
              </button>
            </div>

            {message && <div style={{ marginTop: 8, fontSize: 13 }}>{message}</div>}
          </div>
        )}

        {/* ✅ STEP 3 */}
        {step === "verify" && (
          <div>
            <h3>Enter verification code</h3>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              inputMode="numeric"
            />

            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button className="btn" onClick={() => setStep("email")} disabled={loading}>
                Back
              </button>
            </div>

            {message && <div style={{ marginTop: 8, fontSize: 13 }}>{message}</div>}
          </div>
        )}

        {/* ✅ STEP 4 */}
        {step === "done" && (
          <div>
            <h3>✅ Signed in successfully</h3>
            <div style={{ marginTop: 12 }}>
              <button className="btn" onClick={() => onClose?.()}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          z-index: 9999;
        }
        .modal {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          min-width: 320px;
          position: relative;
        }
        .modal-close {
          position: absolute;
          right: 12px;
          top: 8px;
          border: none;
          background: transparent;
          font-size: 18px;
          cursor: pointer;
        }
        input {
          width: 100%;
          padding: 8px;
          margin-top: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
        }
        .btn {
          padding: 8px 14px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          background: #2563eb;
          color: white;
        }
        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}