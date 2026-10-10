import { User } from "../types";
import { STORAGE_KEYS } from "./storageService";

export const authService = {
  saveSession(user: User) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  },
  getSavedSession(): User | null {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION) || "null");
  },
  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },
};
