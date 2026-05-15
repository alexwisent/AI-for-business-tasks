import { differenceInMinutes } from "date-fns";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageCarousel } from "@/components/ImageCarousel";
import { WeekHourGrid } from "@/components/WeekHourGrid";
import { useToast } from "@/components/Shell";
import { resolveWorkingHours } from "@/lib/defaultHours";
import { priceForHours } from "@/lib/pricing";
import { segmentsForEquipment } from "@/lib/segments";
import { equipmentCategoryLabel } from "@/lib/labels";
import { useApp } from "@/store/AppStore";

export function EquipmentPublicPage() {
  const { id } = useParams();
  const { data, user, addBooking } = useApp();
  const { show, el } = useToast();
  const eq = useMemo(() => data.equipment.find((e) => e.id === id), [data.equipment, id]);
  const studio = useMemo(() => data.studios.find((s) => s.id === eq?.studioId), [data.studios, eq?.studioId]);

  const [unit, setUnit] = useState(0);
  const [week, setWeek] = useState(() => new Date());
  const [pending, setPending] = useState<{ start: string; end: string } | null>(null);

  const wh = useMemo(() => {
    if (!eq || !studio) return [];
    return resolveWorkingHours(null, studio.workingHours);
  }, [eq, studio]);

  const segs = useMemo(() => {
    if (!eq || !studio) return [];
    return segmentsForEquipment(data, eq.id, studio.id, unit, user?.id);
  }, [data, eq, studio, unit, user?.id]);

  if (!eq || !studio) return <div className="card">Оборудование не найдено.</div>;

  const hours = pending
    ? Math.max(1 / 60, differenceInMinutes(new Date(pending.end), new Date(pending.start)) / 60)
    : 0;
  const price = pending ? priceForHours(hours, eq.hourlyPrice, eq.halfDayPrice, eq.dayPrice) : 0;

  async function confirmBook() {
    if (!eq || !pending || !user) return;
    if (user.role !== "renter") {
      show("Бронировать могут только арендаторы");
      return;
    }
    const r = addBooking({
      type: "equipment",
      resourceId: eq.id,
      unitIndex: unit,
      renterId: user.id,
      renterNickname: user.nickname,
      start: pending.start,
      end: pending.end,
      status: "active",
      totalPrice: price,
    });
    if (!r.ok) show(r.error ?? "Не удалось");
    else show("Бронь оборудования создана");
    setPending(null);
  }

  return (
    <div>
      {el}
      <p className="muted">
        <Link to={`/s/${studio.slug}`}>← {studio.name}</Link>
      </p>

      <div className="eq-card" style={{ marginBottom: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "1rem" }}>
          <div style={{ position: "relative" }}>
            <ImageCarousel images={eq.images} />
            {eq.unitRepair[unit] && <div className="repair-badge">НА РЕМОНТЕ</div>}
          </div>
          <div style={{ padding: "1rem" }}>
            <div className="pill">{equipmentCategoryLabel[eq.category]}</div>
            <h1 style={{ marginTop: "0.35rem" }}>{eq.name}</h1>
            <p className="muted">Всего единиц: {eq.quantity}. Выберите номер для брони — на одно время можно взять разные.</p>
            <p>
              <strong>Цены:</strong> {eq.hourlyPrice} ₽/ч · {eq.halfDayPrice} ₽/полдня · {eq.dayPrice} ₽/день
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{eq.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {Array.from({ length: eq.quantity }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn"
                  style={{
                    borderColor: unit === i ? "#2563eb" : undefined,
                    fontWeight: unit === i ? 700 : 400,
                  }}
                  onClick={() => {
                    setUnit(i);
                    setPending(null);
                  }}
                >
                  №{i + 1}
                  {eq.unitRepair[i] ? " (ремонт)" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Календарь занятости (единица №{unit + 1})</h2>
        <WeekHourGrid
          weekAnchor={week}
          onWeekAnchorChange={setWeek}
          workingHours={wh}
          segments={segs}
          interactive={!!user && user.role === "renter" && !eq.unitRepair[unit]}
          onPickRange={(s, e) => setPending({ start: s, end: e })}
        />
      </div>

      {pending && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Подтверждение брони оборудования</h3>
          <p className="muted">
            Единица №{unit + 1}: {new Date(pending.start).toLocaleString()} — {new Date(pending.end).toLocaleString()}
          </p>
          <p>
            <strong>Итого:</strong> {price.toFixed(0)} ₽
          </p>
          {!user && <p className="muted">Войдите как арендатор.</p>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn primary" disabled={!user || eq.unitRepair[unit]} onClick={() => void confirmBook()}>
              Забронировать
            </button>
            <button type="button" className="btn" onClick={() => setPending(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
