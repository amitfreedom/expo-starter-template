import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../providers/AuthProvider";
import { isEmail } from "../services/auth-service";
export function useAuthForm(signup: boolean) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const { beginVerification } = useAuth();
  async function submit() {
    if (busy) return;
    if (signup && name.trim().length < 2)
      return setError("Please enter your full name.");
    if (!isEmail(email)) return setError("Please enter a valid email address.");
    if (password.length < 8)
      return setError("Your password needs at least 8 characters.");
    setError(null);
    setBusy(true);
    try {
      await beginVerification({
        name: signup ? name.trim() : email.trim().split("@")[0],
        email: email.trim().toLowerCase(),
      });
      router.push("/otp");
    } catch (error) {
      setError(error);
    } finally {
      setBusy(false);
    }
  }
  return {
    name,
    setName: (value: string) => {
      setName(value);
      setError(null);
    },
    email,
    setEmail: (value: string) => {
      setEmail(value);
      setError(null);
    },
    password,
    setPassword: (value: string) => {
      setPassword(value);
      setError(null);
    },
    error,
    busy,
    submit,
  };
}
