import { API_ENDPOINTS } from "@/shared/api/endpoints";
import { apiClient } from "@/shared/api/client";
import { type User } from "@/features/auth";
// Example contract: adapt endpoint paths and response mapping to your backend.
export async function getProfile(signal?: AbortSignal): Promise<User> {
  const { data } = await apiClient.get<User>(API_ENDPOINTS.profile.me, {
    signal,
    authMode: "required",
  });
  return data;
}
export async function updateProfile(input: Pick<User, "name">): Promise<User> {
  const { data } = await apiClient.patch<User>(
    API_ENDPOINTS.profile.me,
    input,
    {
      authMode: "required",
    },
  );
  return data;
}
