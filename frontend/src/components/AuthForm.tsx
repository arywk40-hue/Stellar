"use client";
import { useState } from "react";
import { sendOtp, verifyOtp } from "../lib/auth";

export default function AuthForm({ role }: { role: "donor" | "ngo" }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);

  async function handleSendOtp() {
    setLoading(true);
    await sendOtp(email);
    setStep("otp");
    setLoading(false);
  }

  async function handleVerifyOtp() {
    setLoading(true);
    const success = await verifyOtp(email, otp, role);
    setLoading(false);

    if (success) {
      window.location.href = "/";
    } else {
      alert("Invalid OTP");
    }
  }

  return (
    <div className="auth-form">
      {step === "email" ? (
        <>
          <input
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSendOtp} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      ) : (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      )}
    </div>
  );
}
