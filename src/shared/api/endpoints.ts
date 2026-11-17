// All backend paths belong here. Auth paths are example contracts for future API integration.
export const API_ENDPOINTS = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    verifyOtp: "/auth/verify-otp",
    resendOtp: "/auth/resend-otp",
  },
  profile: {
    me: "/users/me",
  },
} as const;
