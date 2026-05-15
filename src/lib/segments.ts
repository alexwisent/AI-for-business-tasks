import type { AppData } from "@/types";
import type { WeekSegment } from "@/components/WeekHourGrid";

export function segmentsForLocation(
  data: AppData,
  locationId: string,
  studioId: string,
  myUserId?: string,
): WeekSegment[] {
  const segs: WeekSegment[] = [];
  for (const c of data.closures) {
    if (c.scope === "studio" && c.studioId === studioId) {
      segs.push({ start: c.start, end: c.end, kind: "closure", title: c.note });
    }
    if (c.scope === "location" && c.locationId === locationId) {
      segs.push({ start: c.start, end: c.end, kind: "closure", title: c.note });
    }
  }
  for (const b of data.bookings) {
    if (b.type !== "location" || b.resourceId !== locationId || b.status !== "active") continue;
    segs.push({
      start: b.start,
      end: b.end,
      kind: b.renterId === myUserId ? "mine" : "busy",
      title: b.renterNickname,
    });
  }
  return segs;
}

export function segmentsForEquipment(
  data: AppData,
  equipmentId: string,
  studioId: string,
  unitIndex: number,
  myUserId?: string,
): WeekSegment[] {
  const segs: WeekSegment[] = [];
  for (const c of data.closures) {
    if (c.scope === "studio" && c.studioId === studioId) {
      segs.push({ start: c.start, end: c.end, kind: "closure", title: c.note });
    }
  }
  for (const b of data.bookings) {
    if (
      b.type !== "equipment" ||
      b.resourceId !== equipmentId ||
      b.status !== "active" ||
      b.unitIndex !== unitIndex
    )
      continue;
    segs.push({
      start: b.start,
      end: b.end,
      kind: b.renterId === myUserId ? "mine" : "busy",
      title: b.renterNickname,
    });
  }
  return segs;
}
