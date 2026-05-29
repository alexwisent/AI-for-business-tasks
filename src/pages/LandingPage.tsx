import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function LandingPage() {
  const { data } = useApp();
  return (
    <div>
      <section className="hero">
        <div className="hero-inner">
          <h1>Аренда фотостудий и оборудования</h1>
          <p>Выбирайте локации, смотрите занятость в календаре и бронируйте удобные часы.</p>
        </div>
      </section>

      <div className="section-head">
        <h2>Студии</h2>
        {data.studios.length > 0 && <span className="muted">{data.studios.length} в каталоге</span>}
      </div>

      {data.studios.length === 0 && (
        <p className="muted">Пока нет студий — зарегистрируйтесь как владелец и создайте первую.</p>
      )}
      <div className="grid cols-3">
        {data.studios.map((s) => (
          <Link key={s.id} to={`/s/${s.slug}`} className="card catalog-card">
            {s.coverImage ? (
              <img className="thumb" alt="" src={s.coverImage} />
            ) : (
              <div className="thumb-placeholder" />
            )}
            <div className="catalog-body">
              <h3>{s.name}</h3>
              <p className="muted" style={{ margin: 0 }}>
                {s.description.slice(0, 120)}
                {s.description.length > 120 ? "…" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
