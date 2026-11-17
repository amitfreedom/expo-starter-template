import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiSession } from "@/shared/api/session";
import { type AuthSession, type Challenge, type User } from "../types/auth";
import { requestCode, verifyCode } from "../services/auth-service";
type Auth = {
  user: User | null;
  challenge: Challenge | null;
  beginVerification: (user: User) => Promise<void>;
  verify: (code: string) => Promise<void>;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
};
const AuthContext = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  // These adapters are local demo operations and work offline. Real API mutations
  // should use the default online network mode from the QueryClient.
  const requestMutation = useMutation({
    mutationFn: requestCode,
    networkMode: "always",
  });
  const verifyMutation = useMutation({
    mutationFn: ({ challenge, code }: { challenge: Challenge; code: string }) =>
      verifyCode(challenge, code),
    networkMode: "always",
  });
  const signOut = useCallback(() => {
    apiSession.setAccessToken(null);
    queryClient.clear();
    setUser(null);
    setChallenge(null);
  }, [queryClient]);
  useEffect(() => apiSession.subscribeUnauthorized(signOut), [signOut]);
  function signIn(session: AuthSession) {
    if (!session.accessToken.trim())
      throw new Error("Please sign in to request a code first.");
    apiSession.setAccessToken(session.accessToken);
    queryClient.clear();
    setUser(session.user);
    setChallenge(null);
  }
  async function beginVerification(next: User) {
    const version = apiSession.getSnapshot().version;
    const nextChallenge = await requestMutation.mutateAsync(next);
    if (version !== apiSession.getSnapshot().version)
      throw new Error("Something went wrong. Please try again.");
    setChallenge(nextChallenge);
  }
  async function verify(code: string) {
    if (!challenge) throw new Error("Please sign in to request a code first.");
    const version = apiSession.getSnapshot().version;
    const nextUser = await verifyMutation.mutateAsync({ challenge, code });
    if (version !== apiSession.getSnapshot().version)
      throw new Error("Something went wrong. Please try again.");
    setUser(nextUser);
    setChallenge(null);
  }
  return (
    <AuthContext.Provider
      value={{ user, challenge, beginVerification, verify, signIn, signOut }}
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
