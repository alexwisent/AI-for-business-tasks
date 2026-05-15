import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function OwnerDashboard() {
  const { data, user } = useApp();
  const mine = data.studios.filter((s) => s.ownerId === user!.id);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Мои студии</h1>
        <Link to="/owner/studio/new" className="btn primary">
          + Новая студия
        </Link>
      </div>
      <p className="muted">У каждой студии своя публичная страница и набор локаций и оборудования.</p>
      <div className="grid cols-2">
        {mine.map((s) => (
          <div key={s.id} className="card">
            <h2 style={{ marginTop: 0 }}>{s.name}</h2>
            <p className="muted">/{s.slug}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              <Link className="btn" to={`/s/${s.slug}`}>
                Открыть сайт
              </Link>
              <Link className="btn" to={`/owner/studio/${s.id}`}>
                Настройки
              </Link>
              <Link className="btn" to={`/owner/studio/${s.id}/locations`}>
                Локации
              </Link>
              <Link className="btn" to={`/owner/studio/${s.id}/equipment`}>
                Оборудование
              </Link>
            </div>
          </div>
        ))}
      </div>
      {mine.length === 0 && <p className="muted">Создайте первую студию.</p>}
    </div>
  );
}
