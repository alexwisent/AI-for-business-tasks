import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function Shell({ children }: { children: ReactNode }) {
  const { user, logout } = useApp();
  return (
    <div className="app-shell">
      <header className="top-nav">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden>
            ◉
          </span>
          StudioRent
        </Link>
        <NavLink to="/" end>
          Каталог
        </NavLink>
        {!user && (
          <>
            <Link to="/login">Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
        {user?.role === "owner" && (
          <>
            <Link to="/owner">Мои студии</Link>
            <Link to="/owner/categories">Категории</Link>
            <Link to="/owner/closures">Закрытия</Link>
            <Link to="/owner/analytics">Аналитика</Link>
          </>
        )}
        {user?.role === "renter" && <Link to="/me">Мои брони</Link>}
        <span className="nav-spacer" />
        {user && (
          <span className="nav-user">
            {user.nickname} · {user.role === "owner" ? "владелец" : "арендатор"}
          </span>
        )}
        {user && (
          <button type="button" className="btn" onClick={logout}>
            Выйти
          </button>
        )}
      </header>
      <main className="page">{children}</main>
      <footer className="site-footer">Аренда фотостудий · демо в браузере</footer>
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const show = (m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2600);
  };
  const el = msg ? <div className="toast">{msg}</div> : null;
  return { show, el };
}
