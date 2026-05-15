import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function MyBookingsPage() {
  const { data, user, cancelBooking } = useApp();
  const rows = useMemo(
    () => data.bookings.filter((b) => b.renterId === user!.id).sort((a, b) => b.start.localeCompare(a.start)),
    [data.bookings, user],
  );

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Мои брони</h1>
      <p className="muted">
        Перейдите в <Link to="/">каталог</Link>, чтобы найти студию.
      </p>
      <div className="card">
        {rows.length === 0 && <p className="muted">Пока нет броней.</p>}
        {rows.map((b) => {
          const loc = b.type === "location" ? data.locations.find((l) => l.id === b.resourceId) : undefined;
          const eq = b.type === "equipment" ? data.equipment.find((e) => e.id === b.resourceId) : undefined;
          const studio =
            loc?.studioId && data.studios.find((s) => s.id === loc.studioId)
              ? data.studios.find((s) => s.id === loc.studioId)
              : eq && data.studios.find((s) => s.id === eq.studioId);
          return (
            <div key={b.id} style={{ borderBottom: "1px solid #e2e8f0", padding: "0.65rem 0" }}>
              <div>
                <strong>{b.type === "location" ? loc?.title : `${eq?.name} №${(b.unitIndex ?? 0) + 1}`}</strong>{" "}
                <span className="pill">{b.status === "active" ? "активна" : "отменена"}</span>
              </div>
              <div className="muted" style={{ fontSize: "0.9rem" }}>
                {studio && <Link to={`/s/${studio.slug}`}>{studio.name}</Link>} · {new Date(b.start).toLocaleString()} —{" "}
                {new Date(b.end).toLocaleString()}
              </div>
              <div>Оплата по расчёту: {b.totalPrice} ₽</div>
              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.35rem" }}>
                {b.type === "location" && loc && (
                  <Link className="btn" to={`/location/${loc.id}`}>
                    Страница локации
                  </Link>
                )}
                {b.type === "equipment" && eq && (
                  <Link className="btn" to={`/equipment/${eq.id}`}>
                    Страница оборудования
                  </Link>
                )}
                {b.status === "active" && (
                  <button
                    type="button"
                    className="btn danger"
                    onClick={() => {
                      if (confirm("Отменить бронь?")) cancelBooking(b.id, user!.id);
                    }}
                  >
                    Отменить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
