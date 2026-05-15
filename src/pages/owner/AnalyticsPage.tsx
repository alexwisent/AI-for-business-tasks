import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/store/AppStore";

import type { AppData, Booking } from "@/types";

function studioOfBooking(data: AppData, b: Booking): string | undefined {
  if (b.type === "location") return data.locations.find((l) => l.id === b.resourceId)?.studioId;
  return data.equipment.find((e) => e.id === b.resourceId)?.studioId;
}

export function AnalyticsPage() {
  const { data, user } = useApp();
  const studios = data.studios.filter((s) => s.ownerId === user!.id);
  const [studioId, setStudioId] = useState(studios[0]?.id ?? "");
  const [locFilter, setLocFilter] = useState<string>("all");

  const locs = useMemo(() => data.locations.filter((l) => l.studioId === studioId), [data.locations, studioId]);

  const filteredBookings = useMemo(() => {
    return data.bookings.filter((b) => {
      if (b.status !== "active") return false;
      const sid = studioOfBooking(data, b);
      if (sid !== studioId) return false;
      if (locFilter !== "all") {
        if (b.type === "location") return b.resourceId === locFilter;
        return false;
      }
      return true;
    });
  }, [data, studioId, locFilter]);

  const financeByDay = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; count: number }>();
    for (const b of filteredBookings) {
      const d = new Date(b.start);
      const key = d.toISOString().slice(0, 10);
      const row = map.get(key) ?? { date: key, revenue: 0, count: 0 };
      row.revenue += b.totalPrice;
      row.count += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBookings]);

  const byResource = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of filteredBookings) {
      const label =
        b.type === "location"
          ? `Локация: ${data.locations.find((l) => l.id === b.resourceId)?.title ?? b.resourceId}`
          : `Оборудование: ${data.equipment.find((e) => e.id === b.resourceId)?.name ?? b.resourceId}`;
      map.set(label, (map.get(label) ?? 0) + b.totalPrice);
    }
    return [...map.entries()].map(([name, revenue]) => ({ name, revenue }));
  }, [data.equipment, data.locations, filteredBookings]);

  const calendarRows = useMemo(() => {
    return [...filteredBookings].sort((a, b) => a.start.localeCompare(b.start));
  }, [filteredBookings]);

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Аналитика</h1>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <div className="grid cols-2">
          <div className="field">
            <label>Студия</label>
            <select value={studioId} onChange={(e) => setStudioId(e.target.value)}>
              {studios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Фильтр локации</label>
            <select value={locFilter} onChange={(e) => setLocFilter(e.target.value)}>
              <option value="all">Все локации и оборудование</option>
              {locs.map((l) => (
                <option key={l.id} value={l.id}>
                  Только: {l.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="muted">
          При выборе конкретной локации отображаются только её брони (оборудование привязано к студии, не к локации).
        </p>
      </div>

      <div className="grid cols-2" style={{ alignItems: "stretch" }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Выручка по дням</h2>
          {financeByDay.length === 0 ? (
            <p className="muted">Нет данных.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={financeByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" name="₽" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Количество броней по дням</h2>
          {financeByDay.length === 0 ? (
            <p className="muted">Нет данных.</p>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={financeByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" name="Брони" stroke="#16a34a" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Выручка по локациям и оборудованию</h2>
        {byResource.length === 0 ? (
          <p className="muted">Нет данных.</p>
        ) : (
          <div style={{ width: "100%", height: Math.max(220, byResource.length * 36) }}>
            <ResponsiveContainer>
              <BarChart layout="vertical" data={byResource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={200} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#7c3aed" name="₽" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Календарь записей (список)</h2>
        {calendarRows.length === 0 ? (
          <p className="muted">Нет активных броней в выбранном фильтре.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "0.35rem" }}>Кто</th>
                  <th>Тип</th>
                  <th>Объект</th>
                  <th>Начало</th>
                  <th>Конец</th>
                  <th>₽</th>
                </tr>
              </thead>
              <tbody>
                {calendarRows.map((b) => {
                  const title =
                    b.type === "location"
                      ? data.locations.find((l) => l.id === b.resourceId)?.title
                      : `${data.equipment.find((e) => e.id === b.resourceId)?.name ?? ""} №${(b.unitIndex ?? 0) + 1}`;
                  return (
                    <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "0.35rem" }}>{b.renterNickname}</td>
                      <td>{b.type === "location" ? "Локация" : "Оборудование"}</td>
                      <td>{title}</td>
                      <td>{new Date(b.start).toLocaleString()}</td>
                      <td>{new Date(b.end).toLocaleString()}</td>
                      <td>{b.totalPrice}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
