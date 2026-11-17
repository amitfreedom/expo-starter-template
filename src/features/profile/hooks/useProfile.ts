import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { apiConfig } from "@/shared/config/env";
import { usePreferences } from "@/shared/preferences/PreferencesProvider";
import { apiSession } from "@/shared/api/session";
import { getProfile, updateProfile } from "../services/profile-service";
export const profileKeys = {
  all: ["profile"] as const,
  detail: (email: string, language: string) =>
    ["profile", email, language] as const,
};
// Ready-to-use example hooks; demo ProfileScreen intentionally uses its local session.
export function useProfile() {
  const { user } = useAuth();
  const { language } = usePreferences();
  return useQuery({
    queryKey: profileKeys.detail(user?.email ?? "", language),
    queryFn: ({ signal }) => getProfile(signal),
    enabled:
      !!user && !!apiConfig.baseURL && !!apiSession.getSnapshot().accessToken,
  });
}
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.all }),
  });
}
