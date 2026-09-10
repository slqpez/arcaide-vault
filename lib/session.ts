export interface SessionUser {
  name: string;
}

interface ScoreEntry {
  game: string;
  score: number;
  name: string;
}

const USER_KEY = "av_user";
const SCORES_KEY = "av_scores";
const USER_CHANGE_EVENT = "av-user-change";

let cachedRaw: string | null = null;
let cachedUser: SessionUser | null = null;

export function getUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedUser = JSON.parse(raw || "null");
    }
    return cachedUser;
  } catch {
    return null;
  }
}

export function setUser(user: SessionUser | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  window.dispatchEvent(new Event(USER_CHANGE_EVENT));
}

export function subscribeUser(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(USER_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(USER_CHANGE_EVENT, callback);
  };
}

export function saveScore(entry: ScoreEntry): void {
  try {
    const all = JSON.parse(localStorage.getItem(SCORES_KEY) || "[]");
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(SCORES_KEY, JSON.stringify(all));
  } catch {
    // localStorage no disponible; el guardado se omite silenciosamente, igual que el template.
  }
}
