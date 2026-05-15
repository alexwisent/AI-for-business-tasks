import type { AppData } from "@/types";
import { STORAGE_KEY } from "@/types";

const empty: AppData = {
  users: [],
  studios: [],
  locations: [],
  equipment: [],
  locationCategories: [],
  bookings: [],
  reviews: [],
  comments: [],
  closures: [],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(empty);
    const parsed = JSON.parse(raw) as AppData;
    return {
      ...empty,
      ...parsed,
      users: parsed.users ?? [],
      studios: parsed.studios ?? [],
      locations: parsed.locations ?? [],
      equipment: parsed.equipment ?? [],
      locationCategories: parsed.locationCategories ?? [],
      bookings: parsed.bookings ?? [],
      reviews: parsed.reviews ?? [],
      comments: parsed.comments ?? [],
      closures: parsed.closures ?? [],
    };
  } catch {
    return structuredClone(empty);
  }
}

export type SaveResult = { ok: true } | { ok: false; error: string };

export function saveData(data: AppData): SaveResult {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (e) {
    const name = e instanceof Error ? e.name : "";
    if (name === "QuotaExceededError") {
      return {
        ok: false,
        error: "Недостаточно места в браузере. Удалите часть фото или очистите данные сайта.",
      };
    }
    return { ok: false, error: "Не удалось сохранить данные" };
  }
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
  };
  const lower = text.trim().toLowerCase();
  let out = "";
  for (const ch of lower) {
    if (map[ch]) out += map[ch];
    else if (/[a-z0-9]/.test(ch)) out += ch;
    else if (/\s|-/.test(ch)) out += "-";
  }
  out = out.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return out || "studio";
}
