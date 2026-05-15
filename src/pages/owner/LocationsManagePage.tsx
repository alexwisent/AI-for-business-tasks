import { Link, useParams } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function LocationsManagePage() {
  const { sid } = useParams();
  const { data, user, deleteLocation } = useApp();
  const studio = data.studios.find((s) => s.id === sid);
  if (!studio || studio.ownerId !== user?.id) return <div className="card">Нет доступа.</div>;
  const locs = data.locations.filter((l) => l.studioId === studio.id);

  return (
    <div>
      <p className="muted">
        <Link to={`/owner/studio/${studio.id}`}>← {studio.name}</Link>
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <h1 style={{ margin: 0 }}>Локации</h1>
        <Link className="btn primary" to={`/owner/studio/${studio.id}/location/new`}>
          + Локация
        </Link>
      </div>
      <div className="grid cols-2" style={{ marginTop: "1rem" }}>
        {locs.map((l) => (
          <div key={l.id} className="card">
            <h3 style={{ marginTop: 0 }}>{l.title}</h3>
            <p className="muted">{l.shortDescription}</p>
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
              <Link className="btn" to={`/location/${l.id}`}>
                Публичная страница
              </Link>
              <Link className="btn" to={`/owner/studio/${studio.id}/location/${l.id}`}>
                Изменить
              </Link>
              <button
                type="button"
                className="btn danger"
                onClick={() => {
                  if (confirm("Удалить?")) deleteLocation(l.id);
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      {locs.length === 0 && <p className="muted">Добавьте первую локацию.</p>}
    </div>
  );
}
