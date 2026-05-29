import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function OwnerDashboard() {
  const { data, user } = useApp();
  const mine = data.studios.filter((s) => s.ownerId === user!.id);

  return (
    <div>
      <div className="section-head owner-page-head">
        <div>
          <h1 style={{ margin: 0 }}>Мои студии</h1>
          <p className="muted" style={{ margin: "0.35rem 0 0" }}>
            У каждой студии своя публичная страница и набор локаций и оборудования.
          </p>
        </div>
        <Link to="/owner/studio/new" className="btn primary">
          + Новая студия
        </Link>
      </div>

      {mine.length === 0 && <p className="muted">Создайте первую студию.</p>}

      <div className="grid cols-3">
        {mine.map((s) => {
          const locCount = data.locations.filter((l) => l.studioId === s.id).length;
          const eqCount = data.equipment.filter((e) => e.studioId === s.id).length;
          return (
            <article key={s.id} className="card catalog-card owner-studio-card">
              <Link to={`/s/${s.slug}`} className="catalog-card-media" title="Открыть публичную страницу">
                {s.coverImage ? (
                  <img className="thumb" alt="" src={s.coverImage} />
                ) : (
                  <div className="thumb-placeholder" />
                )}
              </Link>
              <div className="catalog-body">
                <h3>{s.name}</h3>
                <p className="muted owner-studio-slug">/{s.slug}</p>
                <p className="muted" style={{ margin: "0 0 0.65rem" }}>
                  {s.description.slice(0, 100)}
                  {s.description.length > 100 ? "…" : ""}
                </p>
                <p className="muted owner-studio-stats">
                  {locCount} лок. · {eqCount} ед. оборудования
                </p>
                <div className="owner-studio-actions">
                  <Link className="btn primary" to={`/s/${s.slug}`}>
                    Сайт
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
            </article>
          );
        })}
      </div>
    </div>
  );
}
