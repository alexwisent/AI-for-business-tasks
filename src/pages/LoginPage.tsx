import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/store/AppStore";

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useApp();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await login(nickname, password);
    if (!r.ok) {
      setErr(r.error ?? "Ошибка");
      return;
    }
    if (r.role === "owner") nav("/owner", { replace: true });
    else nav("/me", { replace: true });
  }

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
      <h2 style={{ marginTop: 0 }}>Вход</h2>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Никнейм</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="username" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
        <button className="btn primary" type="submit">
          Войти
        </button>
      </form>
      <p className="muted">
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
      </div>
    </div>
  );
}
