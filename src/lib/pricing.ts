/** Простая модель: >=8ч — day, >=4ч — halfDay, иначе почасовая */
export function priceForHours(
  hours: number,
  hourly: number,
  halfDay: number,
  day: number,
): number {
  if (hours <= 0) return 0;
  if (hours >= 8) return day;
  if (hours >= 4) return halfDay;
  return Math.round(hourly * hours * 100) / 100;
}
