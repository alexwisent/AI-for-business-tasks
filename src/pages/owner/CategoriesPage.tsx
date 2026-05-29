import { useMemo, useState } from "react";
import { useToast } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import { newId } from "@/lib/id";
import type { LocationCategory } from "@/types";

export function CategoriesPage() {
  const { data, user, upsertCategory, deleteCategory } = useApp();
  const { show, el } = useToast();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const all = useMemo(
    () => [...data.locationCategories].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [data.locationCategories],
  );

  function creatorLabel(ownerId: string) {
    const u = data.users.find((x) => x.id === ownerId);
    return u?.nickname ?? "неизвестно";
  }

  function add() {
    if (!user || !name.trim()) return;
    const c: LocationCategory = { id: newId(), ownerId: user.id, name: name.trim() };
    const r = upsertCategory(c, user.id);
    if (!r.ok) show(r.error ?? "Не удалось");
    else {
      show("Категория доступна всем владельцам");
      setName("");
    }
  }

  function saveEdit() {
    if (!user || !editingId || !editName.trim()) return;
    const existing = data.locationCategories.find((c) => c.id === editingId);
    if (!existing) return;
    const r = upsertCategory({ ...existing, name: editName.trim() }, user.id);
    if (!r.ok) show(r.error ?? "Не удалось");
    else setEditingId(null);
  }

  function remove(id: string) {
    if (!user) return;
    if (!confirm("Удалить категорию? Она пропадёт у всех владельцев и снимется с локаций.")) return;
    const r = deleteCategory(id, user.id);
    if (!r.ok) show(r.error ?? "Не удалось");
  }

  return (
    <div className="card" style={{ maxWidth: 640 }}>
      {el}
      <h1 style={{ marginTop: 0 }}>Категории локаций</h1>
      <p className="muted">
        Категории общие: любой владелец видит весь список и может выбрать их при редактировании локации. Удалить или
        переименовать может только тот, кто создал категорию.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Новая категория" style={{ flex: 1 }} />
        <button type="button" className="btn primary" onClick={add}>
          Добавить
        </button>
      </div>
      <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0 }}>
        {all.map((c) => {
          const mine = c.ownerId === user!.id;
          return (
            <li
              key={c.id}
              style={{
                marginBottom: "0.65rem",
                padding: "0.5rem 0",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              {editingId === c.id ? (
                <>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ marginRight: 8 }} />
                  <button type="button" className="btn primary" onClick={saveEdit}>
                    Сохранить
                  </button>
                  <button type="button" className="btn" onClick={() => setEditingId(null)}>
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <strong>{c.name}</strong>{" "}
                  <span className="muted" style={{ fontSize: "0.85rem" }}>
                    · создал {creatorLabel(c.ownerId)}
                    {mine ? " (вы)" : ""}
                  </span>
                  {mine ? (
                    <>
                      {" "}
                      <button
                        type="button"
                        className="btn"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditName(c.name);
                        }}
                      >
                        Изменить
                      </button>
                      <button type="button" className="btn danger" onClick={() => remove(c.id)}>
                        Удалить
                      </button>
                    </>
                  ) : (
                    <span className="muted" style={{ fontSize: "0.85rem", marginLeft: "0.35rem" }}>
                      только создатель может изменить
                    </span>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ul>
      {all.length === 0 && <p className="muted">Пока нет категорий — добавьте первую.</p>}
    </div>
  );
}
