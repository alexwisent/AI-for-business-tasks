import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { readFilesAsDataUrls } from "@/lib/files";
import { buildHoursFromSimple } from "@/lib/defaultHours";
import { slugify } from "@/lib/storage";
import { newId } from "@/lib/id";
import { useApp } from "@/store/AppStore";
import type { Studio, WorkingHours } from "@/types";

export function StudioEditPage() {
  const { id } = useParams();
  const isNew = id === "new";
  const nav = useNavigate();
  const { data, user, upsertStudio, deleteStudio } = useApp();

  const existing = useMemo(
    () => (!isNew ? data.studios.find((s) => s.id === id) : undefined),
    [data.studios, id, isNew],
  );

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState<string | undefined>(undefined);
  const [mfO, setMfO] = useState(9);
  const [mfC, setMfC] = useState(21);
  const [ssO, setSsO] = useState(10);
  const [ssC, setSsC] = useState(20);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSlug(existing.slug);
      setDescription(existing.description);
      setCover(existing.coverImage);
      const wh = existing.workingHours;
      if (wh && wh.length) {
        setMfO(wh[0].open);
        setMfC(wh[0].close);
        setSsO(wh[5]?.open ?? 10);
        setSsC(wh[5]?.close ?? 20);
      }
    } else if (isNew) {
      setName("");
      setSlug("");
      setDescription("");
      setCover(undefined);
    }
  }, [existing, isNew]);

  useEffect(() => {
    if (isNew && name && !slug) setSlug(slugify(name));
  }, [isNew, name, slug]);

  function uniqueSlug(s: string, selfId?: string) {
    let base = s;
    let i = 1;
    while (data.studios.some((x) => x.slug === base && x.id !== selfId)) {
      base = `${s}-${i++}`;
    }
    return base;
  }

  function save() {
    if (!user) return;
    const wh: WorkingHours = buildHoursFromSimple({ open: mfO, close: mfC }, { open: ssO, close: ssC });
    const sid = existing?.id ?? newId();
    const studio: Studio = {
      id: sid,
      ownerId: user.id,
      name: name.trim() || "Без названия",
      slug: uniqueSlug((slug.trim() || slugify(name)).toLowerCase(), sid),
      description: description.trim(),
      coverImage: cover,
      workingHours: wh,
    };
    upsertStudio(studio);
    if (isNew) nav(`/owner/studio/${sid}`, { replace: true });
  }

  return (
    <div className="card card-wide">
      <h1 style={{ marginTop: 0 }}>{isNew ? "Новая студия" : "Редактирование студии"}</h1>
      <div className="field">
        <label>Название</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>URL-часть (slug)</label>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} />
      </div>
      <div className="field">
        <label>Описание</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="field">
        <label>Обложка</label>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const [u] = await readFilesAsDataUrls(e.target.files);
            setCover(u);
          }}
        />
        {cover && <img src={cover} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 8 }} />}
      </div>
      <h3>График работы студии (по умолчанию для локаций)</h3>
      <p className="muted">Пн–Пт и Сб–Вс отдельно.</p>
      <div className="grid cols-2">
        <div className="field">
          <label>Пн–Пт: от (час)</label>
          <input type="number" min={0} max={23} value={mfO} onChange={(e) => setMfO(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Пн–Пт: до (час)</label>
          <input type="number" min={1} max={24} value={mfC} onChange={(e) => setMfC(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Сб–Вс: от</label>
          <input type="number" min={0} max={23} value={ssO} onChange={(e) => setSsO(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Сб–Вс: до</label>
          <input type="number" min={1} max={24} value={ssC} onChange={(e) => setSsC(Number(e.target.value))} />
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
        <button type="button" className="btn primary" onClick={save}>
          Сохранить
        </button>
        {!isNew && existing && (
          <>
            <Link className="btn" to={`/owner/studio/${existing.id}/locations`}>
              Локации
            </Link>
            <Link className="btn" to={`/owner/studio/${existing.id}/equipment`}>
              Оборудование
            </Link>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (confirm("Удалить студию и все локации, брони и оборудование?")) {
                  deleteStudio(existing.id);
                  nav("/owner");
                }
              }}
            >
              Удалить студию
            </button>
          </>
        )}
      </div>
    </div>
  );
}
