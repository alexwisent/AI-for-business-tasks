import { Link, useParams } from "react-router-dom";
import { useApp, useStudioBySlug } from "@/store/AppStore";
import { equipmentCategoryLabel } from "@/lib/labels";

export function StudioPublicPage() {
  const { slug } = useParams();
  const { data } = useApp();
  const studio = useStudioBySlug(slug);
  if (!studio) return <div className="card">Студия не найдена.</div>;

  const locs = data.locations.filter((l) => l.studioId === studio.id);
  const eqs = data.equipment.filter((e) => e.studioId === studio.id);

  return (
    <div>
      <div className="card studio-banner" style={{ marginBottom: "1.5rem" }}>
        <p className="page-header" style={{ margin: 0 }}>
          <Link to="/" className="back-link" style={{ color: "#94a3b8" }}>
            ← Каталог
          </Link>
        </p>
        <h1 style={{ marginTop: 0 }}>{studio.name}</h1>
        <p className="muted" style={{ marginBottom: 0, maxWidth: "52ch" }}>
          {studio.description}
        </p>
      </div>

      <div className="section-head">
        <h2>Локации</h2>
        {locs.length > 0 && <span className="muted">{locs.length}</span>}
      </div>
      {locs.length === 0 && <p className="muted">Локаций пока нет.</p>}
      <div className="grid cols-3">
        {locs.map((l) => (
          <Link key={l.id} to={`/location/${l.id}`} className="card catalog-card">
            {l.images[0] ? (
              <img className="thumb" alt="" src={l.images[0]} />
            ) : (
              <div className="thumb-placeholder" />
            )}
            <div className="catalog-body">
              <h3>{l.title}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {l.shortDescription}
              </p>
              <span className="price-tag" style={{ marginTop: "0.5rem" }}>
                от {l.hourlyPrice} ₽/ч
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="section-head">
        <h2>Оборудование в студии</h2>
        {eqs.length > 0 && <span className="muted">{eqs.length}</span>}
      </div>
      {eqs.length === 0 && <p className="muted">Оборудования пока нет.</p>}
      <div className="grid cols-3">
        {eqs.map((e) => (
          <Link key={e.id} to={`/equipment/${e.id}`} className="eq-card">
            <div style={{ position: "relative" }}>
              {e.images[0] ? (
                <img className="thumb" alt="" src={e.images[0]} />
              ) : (
                <div className="thumb-placeholder" />
              )}
            </div>
            <div style={{ padding: "0.85rem 1.1rem 1.1rem" }}>
              <div className="pill">{equipmentCategoryLabel[e.category]}</div>
              <h3 style={{ margin: "0.4rem 0 0.25rem", fontSize: "1.05rem" }}>{e.name}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {e.quantity} шт. · от {e.hourlyPrice} ₽/ч
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
