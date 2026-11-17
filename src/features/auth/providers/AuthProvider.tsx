import { type Challenge, type User } from "../types/auth";
import { createContext, useContext, useState, type ReactNode } from "react";
import { requestCode, verifyCode } from "../services/auth-service";
type Auth = {
  user: User | null;
  challenge: Challenge | null;
  beginVerification: (user: User) => Promise<void>;
  verify: (code: string) => Promise<void>;
  signOut: () => void;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  async function beginVerification(next: User) {
    setChallenge(await requestCode(next));
  }
  async function verify(code: string) {
    if (!challenge) throw new Error("Please sign in to request a code first.");
    setUser(await verifyCode(challenge, code));
    setChallenge(null);
  }
  function signOut() {
    setUser(null);
    setChallenge(null);
  }
  return (
    <AuthContext.Provider
      value={{ user, challenge, beginVerification, verify, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
