import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { sha256Hex } from "@/lib/hash";
import { newId } from "@/lib/id";
import { loadData, saveData, slugify, type SaveResult } from "@/lib/storage";
import { priceForHours } from "@/lib/pricing";
import type {
  AppData,
  Booking,
  Closure,
  Comment,
  Equipment,
  Location,
  LocationCategory,
  Review,
  Studio,
  User,
  UserRole,
} from "@/types";
import { SESSION_KEY } from "@/types";

type SessionUser = Pick<User, "id" | "nickname" | "role">;

type Ctx = {
  data: AppData;
  user: SessionUser | null;
  refresh: () => void;
  login: (
    nickname: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; role?: UserRole }>;
  logout: () => void;
  register: (
    nickname: string,
    password: string,
    role: UserRole,
  ) => Promise<{ ok: boolean; error?: string; role?: UserRole }>;
  upsertStudio: (studio: Studio) => void;
  deleteStudio: (id: string) => void;
  upsertLocation: (loc: Location) => { ok: boolean; error?: string };
  deleteLocation: (id: string) => void;
  upsertEquipment: (eq: Equipment) => void;
  deleteEquipment: (id: string) => void;
  upsertCategory: (c: LocationCategory) => void;
  deleteCategory: (id: string) => void;
  addBooking: (b: Omit<Booking, "id">) => { ok: boolean; error?: string };
  cancelBooking: (id: string, byUserId: string) => { ok: boolean; error?: string };
  addReview: (r: Omit<Review, "id" | "createdAt">) => void;
  addComment: (c: Omit<Comment, "id" | "createdAt">) => void;
  addClosure: (c: Omit<Closure, "id">) => void;
  deleteClosure: (id: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

function readSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

function writeSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

function overlaps(a0: number, a1: number, b0: number, b1: number) {
  return a0 < b1 && b0 < a1;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const [sessionId, setSessionId] = useState<string | null>(() => readSession());

  const user = useMemo((): SessionUser | null => {
    if (!sessionId) return null;
    const u = data.users.find((x) => x.id === sessionId);
    if (!u) return null;
    return { id: u.id, nickname: u.nickname, role: u.role };
  }, [data.users, sessionId]);

  const patch = useCallback((fn: (d: AppData) => void): SaveResult => {
    let result: SaveResult = { ok: true };
    setData((d) => {
      const next = structuredClone(d);
      fn(next);
      const saved = saveData(next);
      if (!saved.ok) {
        result = saved;
        return d;
      }
      return next;
    });
    return result;
  }, []);

  const refresh = useCallback(() => setData(loadData()), []);

  const login = useCallback(
    async (nickname: string, password: string) => {
      const hash = await sha256Hex(password);
      const u = data.users.find(
        (x) => x.nickname.toLowerCase() === nickname.trim().toLowerCase() && x.passwordHash === hash,
      );
      if (!u) return { ok: false, error: "Неверный логин или пароль" };
      writeSession(u.id);
      setSessionId(u.id);
      return { ok: true, role: u.role };
    },
    [data.users],
  );

  const logout = useCallback(() => {
    writeSession(null);
    setSessionId(null);
  }, []);

  const register = useCallback(
    async (nickname: string, password: string, role: UserRole) => {
      const nick = nickname.trim();
      if (nick.length < 2) return { ok: false, error: "Никнейм слишком короткий" };
      if (password.length < 4) return { ok: false, error: "Пароль не короче 4 символов" };
      const exists = data.users.some((x) => x.nickname.toLowerCase() === nick.toLowerCase());
      if (exists) return { ok: false, error: "Такой никнейм уже занят" };
      const hash = await sha256Hex(password);
      const u: User = {
        id: newId(),
        nickname: nick,
        passwordHash: hash,
        role,
        createdAt: new Date().toISOString(),
      };
      patch((d) => {
        d.users.push(u);
      });
      writeSession(u.id);
      setSessionId(u.id);
      return { ok: true, role: u.role };
    },
    [data.users, patch],
  );

  const upsertStudio = useCallback(
    (studio: Studio) => {
      patch((d) => {
        const i = d.studios.findIndex((s) => s.id === studio.id);
        if (i >= 0) d.studios[i] = studio;
        else d.studios.push(studio);
      });
    },
    [patch],
  );

  const deleteStudio = useCallback(
    (id: string) => {
      patch((d) => {
        const locIds = new Set(d.locations.filter((l) => l.studioId === id).map((l) => l.id));
        const eqIds = new Set(d.equipment.filter((e) => e.studioId === id).map((e) => e.id));
        d.bookings = d.bookings.filter((b) => {
          if (b.type === "location") return !locIds.has(b.resourceId);
          if (b.type === "equipment") return !eqIds.has(b.resourceId);
          return true;
        });
        d.studios = d.studios.filter((s) => s.id !== id);
        d.locations = d.locations.filter((l) => l.studioId !== id);
        d.equipment = d.equipment.filter((e) => e.studioId !== id);
        d.closures = d.closures.filter((c) => c.studioId !== id);
      });
    },
    [patch],
  );

  const upsertLocation = useCallback(
    (loc: Location) => {
      const r = patch((d) => {
        const i = d.locations.findIndex((l) => l.id === loc.id);
        if (i >= 0) d.locations[i] = loc;
        else d.locations.push(loc);
      });
      return r.ok ? { ok: true as const } : { ok: false as const, error: r.error };
    },
    [patch],
  );

  const deleteLocation = useCallback(
    (id: string) => {
      patch((d) => {
        d.locations = d.locations.filter((l) => l.id !== id);
        d.bookings = d.bookings.filter((b) => !(b.type === "location" && b.resourceId === id));
        d.reviews = d.reviews.filter((r) => r.locationId !== id);
        d.comments = d.comments.filter((c) => c.locationId !== id);
        d.closures = d.closures.filter((c) => c.locationId !== id);
      });
    },
    [patch],
  );

  const upsertEquipment = useCallback(
    (eq: Equipment) => {
      patch((d) => {
        const i = d.equipment.findIndex((e) => e.id === eq.id);
        const repair = [...eq.unitRepair];
        while (repair.length < eq.quantity) repair.push(false);
        repair.length = eq.quantity;
        const fixed = { ...eq, unitRepair: repair };
        if (i >= 0) d.equipment[i] = fixed;
        else d.equipment.push(fixed);
      });
    },
    [patch],
  );

  const deleteEquipment = useCallback(
    (id: string) => {
      patch((d) => {
        d.equipment = d.equipment.filter((e) => e.id !== id);
        d.bookings = d.bookings.filter((b) => !(b.type === "equipment" && b.resourceId === id));
      });
    },
    [patch],
  );

  const upsertCategory = useCallback(
    (c: LocationCategory) => {
      patch((d) => {
        const i = d.locationCategories.findIndex((x) => x.id === c.id);
        if (i >= 0) d.locationCategories[i] = c;
        else d.locationCategories.push(c);
      });
    },
    [patch],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      patch((d) => {
        d.locationCategories = d.locationCategories.filter((x) => x.id !== id);
        for (const l of d.locations) {
          l.categoryIds = l.categoryIds.filter((cid) => cid !== id);
        }
      });
    },
    [patch],
  );

  const addBooking = useCallback(
    (b: Omit<Booking, "id">) => {
      const start = new Date(b.start).getTime();
      const end = new Date(b.end).getTime();
      if (!(start < end)) return { ok: false, error: "Некорректный интервал" };

      const conflict = data.bookings.some(
        (x) =>
          x.status === "active" &&
          x.type === b.type &&
          x.resourceId === b.resourceId &&
          (b.type === "location" || x.unitIndex === b.unitIndex) &&
          overlaps(start, end, new Date(x.start).getTime(), new Date(x.end).getTime()),
      );
      if (conflict) return { ok: false, error: "Время уже занято" };

      let studioId = "";
      if (b.type === "location") {
        const loc = data.locations.find((l) => l.id === b.resourceId);
        if (!loc) return { ok: false, error: "Локация не найдена" };
        studioId = loc.studioId;
      } else {
        const eq = data.equipment.find((e) => e.id === b.resourceId);
        if (!eq) return { ok: false, error: "Оборудование не найдено" };
        studioId = eq.studioId;
        if (b.unitIndex !== undefined && eq.unitRepair[b.unitIndex]) {
          return { ok: false, error: "Единица на ремонте" };
        }
      }

      const closed = data.closures.some((c) => {
        const cs = new Date(c.start).getTime();
        const ce = new Date(c.end).getTime();
        if (!overlaps(start, end, cs, ce)) return false;
        if (c.scope === "studio" && c.studioId === studioId) return true;
        if (c.scope === "location" && b.type === "location" && c.locationId === b.resourceId) return true;
        return false;
      });
      if (closed) return { ok: false, error: "Студия закрыта на это время" };

      const booking: Booking = { ...b, id: newId() };
      patch((d) => {
        d.bookings.push(booking);
      });
      return { ok: true };
    },
    [data.bookings, data.closures, data.equipment, data.locations, patch],
  );

  const cancelBooking = useCallback(
    (id: string, byUserId: string) => {
      const b = data.bookings.find((x) => x.id === id);
      if (!b) return { ok: false, error: "Бронь не найдена" };
      if (b.renterId !== byUserId) return { ok: false, error: "Это не ваша бронь" };
      if (b.status !== "active") return { ok: false, error: "Уже отменена" };
      patch((d) => {
        const x = d.bookings.find((k) => k.id === id);
        if (x) x.status = "cancelled";
      });
      return { ok: true };
    },
    [data.bookings, patch],
  );

  const addReview = useCallback(
    (r: Omit<Review, "id" | "createdAt">) => {
      const rev: Review = {
        ...r,
        id: newId(),
        createdAt: new Date().toISOString(),
      };
      patch((d) => {
        d.reviews.push(rev);
      });
    },
    [patch],
  );

  const addComment = useCallback(
    (c: Omit<Comment, "id" | "createdAt">) => {
      const row: Comment = {
        ...c,
        id: newId(),
        createdAt: new Date().toISOString(),
      };
      patch((d) => {
        d.comments.push(row);
      });
    },
    [patch],
  );

  const addClosure = useCallback(
    (c: Omit<Closure, "id">) => {
      const row: Closure = { ...c, id: newId() };
      patch((d) => {
        d.closures.push(row);
      });
    },
    [patch],
  );

  const deleteClosure = useCallback(
    (id: string) => {
      patch((d) => {
        d.closures = d.closures.filter((c) => c.id !== id);
      });
    },
    [patch],
  );

  const value = useMemo(
    () => ({
      data,
      user,
      refresh,
      login,
      logout,
      register,
      upsertStudio,
      deleteStudio,
      upsertLocation,
      deleteLocation,
      upsertEquipment,
      deleteEquipment,
      upsertCategory,
      deleteCategory,
      addBooking,
      cancelBooking,
      addReview,
      addComment,
      addClosure,
      deleteClosure,
    }),
    [
      data,
      user,
      refresh,
      login,
      logout,
      register,
      upsertStudio,
      deleteStudio,
      upsertLocation,
      deleteLocation,
      upsertEquipment,
      deleteEquipment,
      upsertCategory,
      deleteCategory,
      addBooking,
      cancelBooking,
      addReview,
      addComment,
      addClosure,
      deleteClosure,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const v = useContext(AppCtx);
  if (!v) throw new Error("useApp outside AppProvider");
  return v;
}

export function useStudioBySlug(slug: string | undefined) {
  const { data } = useApp();
  return useMemo(() => data.studios.find((s) => s.slug === slug), [data.studios, slug]);
}

export function useLocation(id: string | undefined) {
  const { data } = useApp();
  return useMemo(() => data.locations.find((l) => l.id === id), [data.locations, id]);
}

export { priceForHours, slugify };
