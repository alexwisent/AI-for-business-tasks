import { useState } from "react";
import { useApp } from "@/store/AppStore";
import { newId } from "@/lib/id";
import type { LocationCategory } from "@/types";

export function CategoriesPage() {
  const { data, user, upsertCategory, deleteCategory } = useApp();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const mine = data.locationCategories.filter((c) => c.ownerId === user!.id);

  function add() {
    if (!user || !name.trim()) return;
    const c: LocationCategory = { id: newId(), ownerId: user.id, name: name.trim() };
    upsertCategory(c);
    setName("");
  }

  function saveEdit() {
    if (!user || !editingId || !editName.trim()) return;
    upsertCategory({ id: editingId, ownerId: user.id, name: editName.trim() });
    setEditingId(null);
  }

  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <h1 style={{ marginTop: 0 }}>Категории локаций</h1>
      <p className="muted">Используйте при редактировании локации (природа, хромакей и т.д.).</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Новая категория" style={{ flex: 1 }} />
        <button type="button" className="btn primary" onClick={add}>
          Добавить
        </button>
      </div>
      <ul style={{ paddingLeft: "1.1rem", listStyle: "none" }}>
        {mine.map((c) => (
          <li key={c.id} style={{ marginBottom: "0.65rem" }}>
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
                {c.name}{" "}
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
                <button type="button" className="btn danger" onClick={() => deleteCategory(c.id)}>
                  Удалить
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      {mine.length === 0 && <p className="muted">Пока пусто.</p>}
    </div>
  );
}
