import * as React from "react";
import { addDays, addHours, format, startOfWeek } from "date-fns";
import type { WorkingHours } from "@/types";
import { resolveWorkingHours } from "@/lib/defaultHours";

const dayRu = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function mondayIndex(d: Date) {
  return (d.getDay() + 6) % 7;
}

function hoursForDay(wh: WorkingHours, day: Date): { open: number; close: number } | null {
  const idx = mondayIndex(day);
  const row = wh.find((w) => w.day === idx);
  if (!row) return null;
  return { open: row.open, close: row.close };
}

function cellInWorkingHours(day: Date, hour: number, wh: WorkingHours) {
  const h = hoursForDay(wh, day);
  if (!h) return false;
  return hour >= h.open && hour < h.close;
}

export type WeekSegment = {
  start: string;
  end: string;
  kind: "busy" | "mine" | "closure";
  title?: string;
};

type Props = {
  weekAnchor: Date;
  onWeekAnchorChange: (d: Date) => void;
  workingHours: WorkingHours;
  segments: WeekSegment[];
  interactive?: boolean;
  onPickRange?: (startIso: string, endIso: string) => void;
  readOnly?: boolean;
};

function hourCellDate(weekStart: Date, dayIndex: number, hour: number) {
  const d = addDays(weekStart, dayIndex);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0);
}

function overlapsHour(h0: Date, h1: Date, s: Date, e: Date) {
  return s.getTime() < h1.getTime() && e.getTime() > h0.getTime();
}

export function WeekHourGrid({
  weekAnchor,
  onWeekAnchorChange,
  workingHours,
  segments,
  interactive,
  onPickRange,
  readOnly,
}: Props) {
  const wh = workingHours?.length ? workingHours : resolveWorkingHours(null, null);
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hoursBand = Array.from({ length: 24 }, (_, h) => h);

  const [a, setA] = React.useState<{ d: number; h: number } | null>(null);

  React.useEffect(() => {
    setA(null);
  }, [weekStart.getTime(), interactive]);

  function scanCell(dayIndex: number, hour: number) {
    const day = days[dayIndex];
    const h0 = hourCellDate(weekStart, dayIndex, hour);
    const h1 = addHours(h0, 1);
    const inWh = cellInWorkingHours(day, hour, wh);
    let closure = false;
    let busy = false;
    let mine = false;
    if (inWh) {
      for (const seg of segments) {
        const s = new Date(seg.start);
        const e = new Date(seg.end);
        if (!overlapsHour(h0, h1, s, e)) continue;
        if (seg.kind === "closure") closure = true;
        else if (seg.kind === "mine") mine = true;
        else busy = true;
      }
    }
    return { inWh, closure, busy, mine, h0, h1 };
  }

  function paint(dayIndex: number, hour: number) {
    const { inWh, closure, busy, mine } = scanCell(dayIndex, hour);
    if (!inWh) return "cell out";
    if (closure) return "cell closure";
    if (busy) return "cell busy";
    if (mine) return "cell mine";

    if (a) {
      const i0 = a.d * 100 + a.h;
      const i1 = dayIndex * 100 + hour;
      const lo = Math.min(i0, i1);
      const hi = Math.max(i0, i1);
      const cur = dayIndex * 100 + hour;
      if (cur >= lo && cur <= hi) return "cell sel";
    }

    return "cell";
  }

  function rangeBlocked(d0: number, h0: number, d1: number, h1: number) {
    const i0 = d0 * 100 + h0;
    const i1 = d1 * 100 + h1;
    const lo = Math.min(i0, i1);
    const hi = Math.max(i0, i1);
    for (let cur = lo; cur <= hi; cur++) {
      const d = Math.floor(cur / 100);
      const h = cur % 100;
      const { inWh, closure, busy } = scanCell(d, h);
      if (!inWh || closure || busy) return true;
    }
    return false;
  }

  function onCellClick(dayIndex: number, hour: number) {
    if (readOnly || !interactive || !onPickRange) return;
    const { inWh, closure, busy } = scanCell(dayIndex, hour);
    if (!inWh || closure || busy) return;

    if (!a) {
      setA({ d: dayIndex, h: hour });
      return;
    }

    const d0 = a.d;
    const h0 = a.h;
    const d1 = dayIndex;
    const h1 = hour;
    if (rangeBlocked(d0, h0, d1, h1)) {
      setA({ d: dayIndex, h: hour });
      return;
    }

    const i0 = d0 * 100 + h0;
    const i1 = d1 * 100 + h1;
    const lo = Math.min(i0, i1);
    const hi = Math.max(i0, i1);
    const dd0 = Math.floor(lo / 100);
    const hh0 = lo % 100;
    const dd1 = Math.floor(hi / 100);
    const hh1 = hi % 100;
    const start = hourCellDate(weekStart, dd0, hh0);
    const end = addHours(hourCellDate(weekStart, dd1, hh1), 1);
    onPickRange(start.toISOString(), end.toISOString());
    setA(null);
  }

  return (
    <div className="week-cal">
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.5rem" }}>
        <button
          type="button"
          className="btn"
          onClick={() => onWeekAnchorChange(addDays(weekAnchor, -7))}
        >
          ← неделя
        </button>
        <button type="button" className="btn" onClick={() => onWeekAnchorChange(new Date())}>
          Сегодня
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => onWeekAnchorChange(addDays(weekAnchor, 7))}
        >
          неделя →
        </button>
        <span className="muted">
          {format(weekStart, "d MMM")} — {format(addDays(weekStart, 6), "d MMM yyyy")}
        </span>
      </div>
      <table>
        <thead>
          <tr>
            <th />
            {days.map((d, i) => (
              <th key={i}>
                {dayRu[i]} {format(d, "d.MM")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hoursBand.map((hour) => (
            <tr key={hour}>
              <td className="hour">{hour}:00</td>
              {days.map((day, dayIndex) => (
                <td
                  key={`${dayIndex}-${hour}`}
                  className={paint(dayIndex, hour)}
                  title={`${format(day, "dd.MM")} ${hour}:00`}
                  onClick={() => onCellClick(dayIndex, hour)}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {interactive && !readOnly && (
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          Два клика по свободным часам: первый — начало, второй — конец интервала.
        </p>
      )}
    </div>
  );
}
