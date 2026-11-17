export type User = { name: string; email: string };
export type Challenge = { user: User; expiresAt: number };

export type AuthSession = { user: User; accessToken: string };
