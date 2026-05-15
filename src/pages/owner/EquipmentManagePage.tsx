import { Link, useParams } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function EquipmentManagePage() {
  const { sid } = useParams();
  const { data, user, deleteEquipment } = useApp();
  const studio = data.studios.find((s) => s.id === sid);
  if (!studio || studio.ownerId !== user?.id) return <div className="card">Нет доступа.</div>;
  const eqs = data.equipment.filter((e) => e.studioId === studio.id);

  return (
    <div>
      <p className="muted">
        <Link to={`/owner/studio/${studio.id}`}>← {studio.name}</Link>
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Оборудование</h1>
        <Link className="btn primary" to={`/owner/studio/${studio.id}/equipment/new`}>
          + Оборудование
        </Link>
      </div>
      <div className="grid cols-2" style={{ marginTop: "1rem" }}>
        {eqs.map((e) => (
          <div key={e.id} className="card">
            <h3 style={{ marginTop: 0 }}>{e.name}</h3>
            <p className="muted">
              {e.quantity} шт. · от {e.hourlyPrice} ₽/ч
            </p>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <Link className="btn" to={`/equipment/${e.id}`}>
                Публичная страница
              </Link>
              <Link className="btn" to={`/owner/studio/${studio.id}/equipment/${e.id}`}>
                Изменить
              </Link>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  if (confirm("Удалить?")) deleteEquipment(e.id);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      {eqs.length === 0 && <p className="muted">Добавьте оборудование.</p>}
    </div>
  );
}
