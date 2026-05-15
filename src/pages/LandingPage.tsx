import { Link } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function LandingPage() {
  const { data } = useApp();
  return (
    <div>
      <div className="card" style={{ marginBottom: "1rem" }}>
        <h1 style={{ marginTop: 0 }}>Аренда фотостудий и оборудования</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          Демо работает полностью в браузере: аккаунты и данные хранятся в <code>localStorage</code> этого
          компьютера. Отдельная база данных не нужна.
        </p>
      </div>

      <h2>Студии</h2>
      {data.studios.length === 0 && <p className="muted">Пока нет студий — зарегистрируйтесь как владелец и создайте первую.</p>}
      <div className="grid cols-3">
        {data.studios.map((s) => (
          <Link key={s.id} to={`/s/${s.slug}`} className="card" style={{ textDecoration: "none", color: "inherit" }}>
            {s.coverImage && <img className="thumb" alt="" src={s.coverImage} />}
            <h3 style={{ marginBottom: "0.25rem" }}>{s.name}</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {s.description.slice(0, 120)}
              {s.description.length > 120 ? "…" : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
