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
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>{studio.name}</h1>
        <p className="muted">{studio.description}</p>
      </div>

      <h2>Локации</h2>
      {locs.length === 0 && <p className="muted">Локаций пока нет.</p>}
      <div className="grid cols-3">
        {locs.map((l) => (
          <Link key={l.id} to={`/location/${l.id}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            {(l.images[0] && <img className="thumb" alt="" src={l.images[0]} />) || (
              <div className="thumb" style={{ background: "#e2e8f0" }} />
            )}
            <h3 style={{ marginBottom: "0.25rem" }}>{l.title}</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {l.shortDescription}
            </p>
          </Link>
        ))}
      </div>

      <h2 style={{ marginTop: "1.5rem" }}>Оборудование в студии</h2>
      {eqs.length === 0 && <p className="muted">Оборудования пока нет.</p>}
      <div className="grid cols-3">
        {eqs.map((e) => (
          <Link key={e.id} to={`/equipment/${e.id}`} className="eq-card" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ position: "relative" }}>
              {(e.images[0] && <img className="thumb" alt="" src={e.images[0]} style={{ height: 160 }} />) || (
                <div className="thumb" style={{ height: 160, background: "#e2e8f0" }} />
              )}
            </div>
            <div style={{ padding: "0.75rem 1rem" }}>
              <div className="pill">{equipmentCategoryLabel[e.category]}</div>
              <h3 style={{ margin: "0.35rem 0" }}>{e.name}</h3>
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
