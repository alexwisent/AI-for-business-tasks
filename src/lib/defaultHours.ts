import type { WorkingHours } from "@/types";

export const DEFAULT_WORKING_HOURS: WorkingHours = [
  { day: 0, open: 9, close: 21 },
  { day: 1, open: 9, close: 21 },
  { day: 2, open: 9, close: 21 },
  { day: 3, open: 9, close: 21 },
  { day: 4, open: 9, close: 21 },
  { day: 5, open: 10, close: 20 },
  { day: 6, open: 10, close: 20 },
];

export function resolveWorkingHours(
  locHours: WorkingHours | null | undefined,
  studioHours: WorkingHours | null | undefined,
): WorkingHours {
  if (locHours && locHours.length) return locHours;
  if (studioHours && studioHours.length) return studioHours;
  return DEFAULT_WORKING_HOURS;
}

export function buildHoursFromSimple(
  mf: { open: number; close: number },
  ss: { open: number; close: number },
): WorkingHours {
  const wh: WorkingHours = [];
  for (let d = 0; d < 5; d++) wh.push({ day: d, open: mf.open, close: mf.close });
  wh.push({ day: 5, open: ss.open, close: ss.close });
  wh.push({ day: 6, open: ss.open, close: ss.close });
  return wh;
}
