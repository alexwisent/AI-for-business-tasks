export type UserRole = "owner" | "renter";

export type User = {
  id: string;
  nickname: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
};

export type WorkingHours = {
  /** 0 = Пн … 6 = Вс */
  day: number;
  open: number;
  close: number;
}[];

export type Studio = {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  /** если пусто — считаем 9–21 каждый день */
  workingHours: WorkingHours | null;
};

export type Location = {
  id: string;
  studioId: string;
  title: string;
  shortDescription: string;
  images: string[];
  address: string;
  sizeSqm: number;
  amenities: string;
  hourlyPrice: number;
  halfDayPrice: number;
  dayPrice: number;
  description: string;
  rules?: string;
  /** null — наследовать график студии */
  workingHours: WorkingHours | null;
  categoryIds: string[];
};

export type EquipmentCategory =
  | "light"
  | "sound"
  | "props"
  | "cameras"
  | "tripods";

export type Equipment = {
  id: string;
  studioId: string;
  name: string;
  category: EquipmentCategory;
  quantity: number;
  images: string[];
  hourlyPrice: number;
  halfDayPrice: number;
  dayPrice: number;
  description: string;
  /** индекс = номер единицы − 1 */
  unitRepair: boolean[];
};

export type LocationCategory = {
  id: string;
  /** id владельца, создавшего категорию (удалять/редактировать может только он) */
  ownerId: string;
  name: string;
};

export type BookingType = "location" | "equipment";

export type Booking = {
  id: string;
  type: BookingType;
  resourceId: string;
  /** для оборудования: 0..quantity-1 */
  unitIndex?: number;
  renterId: string;
  renterNickname: string;
  start: string;
  end: string;
  status: "active" | "cancelled";
  totalPrice: number;
};

export type Review = {
  id: string;
  locationId: string;
  userId: string;
  nickname: string;
  stars: number;
  text: string;
  images: string[];
  createdAt: string;
};

export type Comment = {
  id: string;
  locationId: string;
  userId: string;
  nickname: string;
  text: string;
  createdAt: string;
};

export type ClosureScope = "studio" | "location";

export type Closure = {
  id: string;
  scope: ClosureScope;
  studioId: string;
  locationId?: string;
  start: string;
  end: string;
  note?: string;
};

export type AppData = {
  users: User[];
  studios: Studio[];
  locations: Location[];
  equipment: Equipment[];
  locationCategories: LocationCategory[];
  bookings: Booking[];
  reviews: Review[];
  comments: Comment[];
  closures: Closure[];
};

export const STORAGE_KEY = "studio-rental-app-v1";
export const SESSION_KEY = "studio-rental-session-v1";
