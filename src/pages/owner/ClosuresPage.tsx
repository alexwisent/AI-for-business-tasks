import { useMemo, useState } from "react";
import { useApp } from "@/store/AppStore";
import type { ClosureScope } from "@/types";

export function ClosuresPage() {
  const { data, user, addClosure, deleteClosure } = useApp();
  const studios = data.studios.filter((s) => s.ownerId === user!.id);
  const [studioId, setStudioId] = useState(studios[0]?.id ?? "");
  const [scope, setScope] = useState<ClosureScope>("studio");
  const [locationId, setLocationId] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");

  const locs = useMemo(() => data.locations.filter((l) => l.studioId === studioId), [data.locations, studioId]);

  const mineClosures = useMemo(() => {
    const ids = new Set(studios.map((s) => s.id));
    return data.closures.filter((c) => ids.has(c.studioId));
  }, [data.closures, studios]);

  function submit() {
    if (!studioId || !start || !end) return;
    addClosure({
      scope,
      studioId,
      locationId: scope === "location" ? locationId || undefined : undefined,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      note: note.trim() || undefined,
    });
    setNote("");
  }

  return (
    <div className="grid cols-2" style={{ alignItems: "start" }}>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Приостановить работу</h2>
        <p className="muted">Закрытия видны в календарях и блокируют новые брони.</p>
        <div className="field">
          <label>Студия</label>
          <select value={studioId} onChange={(e) => setStudioId(e.target.value)}>
            {studios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Область</label>
          <select value={scope} onChange={(e) => setScope(e.target.value as ClosureScope)}>
            <option value="studio">Вся студия (все локации и оборудование)</option>
            <option value="location">Только одна локация</option>
          </select>
        </div>
        {scope === "location" && (
          <div className="field">
            <label>Локация</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              <option value="">— выберите —</option>
              {locs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label>Начало</label>
          <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="field">
          <label>Конец</label>
          <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div className="field">
          <label>Комментарий</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <button type="button" className="btn primary" onClick={submit}>
          Добавить закрытие
        </button>
      </div>
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Активные закрытия</h2>
        {mineClosures.length === 0 && <p className="muted">Пока нет.</p>}
        <ul style={{ paddingLeft: "1.1rem" }}>
          {mineClosures.map((c) => {
            const st = data.studios.find((s) => s.id === c.studioId);
            const loc = c.locationId ? data.locations.find((l) => l.id === c.locationId) : null;
            return (
              <li key={c.id} style={{ marginBottom: "0.65rem" }}>
                <strong>{st?.name}</strong> · {c.scope === "studio" ? "вся студия" : loc?.title}
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {new Date(c.start).toLocaleString()} — {new Date(c.end).toLocaleString()}
                </div>
                {c.note && <div>{c.note}</div>}
                <button type="button" className="btn danger" onClick={() => deleteClosure(c.id)}>
                  Удалить
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
