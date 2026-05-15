import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/store/AppStore";
import type { UserRole } from "@/types";

export function RegisterPage() {
  const nav = useNavigate();
  const { register } = useApp();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("renter");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await register(nickname, password, role);
    if (!r.ok) {
      setErr(r.error ?? "Ошибка");
      return;
    }
    if (r.role === "owner") nav("/owner", { replace: true });
    else nav("/", { replace: true });
  }

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <h2 style={{ marginTop: 0 }}>Регистрация</h2>
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
            autoComplete="new-password"
          />
        </div>
        <div className="field">
          <label>Тип аккаунта</label>
          <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            <option value="renter">Арендатор</option>
            <option value="owner">Владелец студии</option>
          </select>
        </div>
        {err && <p style={{ color: "#b91c1c" }}>{err}</p>}
        <button className="btn primary" type="submit">
          Создать аккаунт
        </button>
      </form>
      <p className="muted">
        Уже есть аккаунт? <Link to="/login">Вход</Link>
      </p>
    </div>
  );
}
