import { hindi } from "./locales/hi";
export type MessageKey = keyof typeof hindi;
export type Language = "en" | "hi";
export const isMessageKey = (value: string): value is MessageKey =>
  Object.hasOwn(hindi, value);
export function translate(
  language: Language,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const message = language === "hi" ? hindi[key] : key;
  return message.replace(/\{(\w+)\}/g, (token, name: string) =>
    String(params?.[name] ?? token),
  );
}
