import { useEffect, useRef, useState } from "react";
import { type TextInputInstance } from "react-native";
import { useAuth } from "../providers/AuthProvider";
export function useOtpVerification() {
  const { user, challenge, beginVerification, verify } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const input = useRef<TextInputInstance>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await verify(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (!challenge || cooldown > 0 || busy) return;
    setBusy(true);
    try {
      await beginVerification(challenge.user);
      setCode("");
      setError("");
      setCooldown(30);
      input.current?.focus();
    } catch {
      setError("Unable to request a code. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return {
    user,
    challenge,
    code,
    setCode,
    error,
    busy,
    cooldown,
    input,
    submit,
    resend,
  };
}
