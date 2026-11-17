import AsyncStorage from "@react-native-async-storage/async-storage";
import { type StoredPreferences } from "./types";
import {
  DEFAULT_PREFERENCES,
  parseStoredPreferences,
} from "./preferences-schema";
export { DEFAULT_PREFERENCES } from "./preferences-schema";
const STORAGE_KEY = "@nest/preferences/v1";
export async function readPreferences(): Promise<StoredPreferences> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw
    ? parseStoredPreferences(JSON.parse(raw))
    : { ...DEFAULT_PREFERENCES };
}
export function writePreferences(
  preferences: StoredPreferences,
): Promise<void> {
  return AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
