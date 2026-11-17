import { type Challenge, type User } from "../types/auth";
// Demo adapter. Replace with your authentication API before production.
export const DEMO_OTP = "123456";
export const OTP_LIFETIME_MS = 5 * 60 * 1000;
export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
export async function requestCode(user: User): Promise<Challenge> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return { user, expiresAt: Date.now() + OTP_LIFETIME_MS };
}
export async function verifyCode(
  challenge: Challenge,
  code: string,
): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  if (Date.now() > challenge.expiresAt)
    throw new Error("This code has expired. Request a new one.");
  if (code !== DEMO_OTP)
    throw new Error("That code doesn’t match. Please try again.");
  return challenge.user;
}
