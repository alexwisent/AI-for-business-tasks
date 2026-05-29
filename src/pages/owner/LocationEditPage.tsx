import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { readFilesAsDataUrls } from "@/lib/files";
import { buildHoursFromSimple } from "@/lib/defaultHours";
import { newId } from "@/lib/id";
import { useToast } from "@/components/Shell";
import { useApp } from "@/store/AppStore";
import type { Location, WorkingHours } from "@/types";

export function LocationEditPage() {
  const { sid, lid } = useParams();
  const isNew = lid === "new";
  const nav = useNavigate();
  const { data, user, upsertLocation } = useApp();
  const { show, el } = useToast();
  const [saving, setSaving] = useState(false);

  const studio = data.studios.find((s) => s.id === sid);
  const existing = !isNew ? data.locations.find((l) => l.id === lid) : undefined;

  const cats = useMemo(
    () => [...data.locationCategories].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [data.locationCategories],
  );

  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [sizeSqm, setSizeSqm] = useState(30);
  const [amenities, setAmenities] = useState("");
  const [hourlyPrice, setHourlyPrice] = useState(1500);
  const [halfDayPrice, setHalfDayPrice] = useState(5000);
  const [dayPrice, setDayPrice] = useState(9000);
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState("");
  const [inheritHours, setInheritHours] = useState(true);
  const [mfO, setMfO] = useState(9);
  const [mfC, setMfC] = useState(21);
  const [ssO, setSsO] = useState(10);
  const [ssC, setSsC] = useState(20);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setShortDescription(existing.shortDescription);
      setImages(existing.images);
      setAddress(existing.address);
      setSizeSqm(existing.sizeSqm);
      setAmenities(existing.amenities);
      setHourlyPrice(existing.hourlyPrice);
      setHalfDayPrice(existing.halfDayPrice);
      setDayPrice(existing.dayPrice);
      setDescription(existing.description);
      setRules(existing.rules ?? "");
      const inh = !existing.workingHours;
      setInheritHours(inh);
      if (!inh && existing.workingHours?.length) {
        setMfO(existing.workingHours[0].open);
        setMfC(existing.workingHours[0].close);
        setSsO(existing.workingHours[5]?.open ?? 10);
        setSsC(existing.workingHours[5]?.close ?? 20);
      }
      setCategoryIds(existing.categoryIds);
    }
  }, [existing]);

  if (!studio || studio.ownerId !== user?.id) return <div className="card">Нет доступа.</div>;

  function toggleCat(id: string) {
    setCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!studio || saving) return;
    setSaving(true);
    try {
      const wh: WorkingHours | null = inheritHours
        ? null
        : buildHoursFromSimple({ open: mfO, close: mfC }, { open: ssO, close: ssC });
      const loc: Location = {
        id: existing?.id ?? newId(),
        studioId: studio.id,
        title: title.trim() || "Локация",
        shortDescription: shortDescription.trim(),
        images,
        address: address.trim(),
        sizeSqm: Number(sizeSqm) || 0,
        amenities: amenities.trim(),
        hourlyPrice: Number(hourlyPrice) || 0,
        halfDayPrice: Number(halfDayPrice) || 0,
        dayPrice: Number(dayPrice) || 0,
        description: description.trim(),
        rules: rules.trim() || undefined,
        workingHours: wh,
        categoryIds,
      };
      const r = upsertLocation(loc);
      if (!r.ok) {
        show(r.error ?? "Не удалось сохранить");
        return;
      }
      show("Сохранено");
      nav(`/owner/studio/${studio.id}/locations`, { replace: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card card-wide">
      {el}
      <p className="muted">
        <Link to={`/owner/studio/${studio.id}/locations`}>← Локации</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{isNew ? "Новая локация" : "Редактирование локации"}</h1>
      <div className="field">
        <label>Название</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label>Короткое описание (для карточки)</label>
        <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
      </div>
      <div className="field">
        <label>Фото (несколько)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={async (e) => {
            const urls = await readFilesAsDataUrls(e.target.files);
            setImages((x) => [...x, ...urls]);
          }}
        />
        <div className="grid cols-3" style={{ marginTop: 8 }}>
          {images.map((u, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img src={u} alt="" className="thumb" />
              <button type="button" className="btn danger" style={{ marginTop: 4 }} onClick={() => setImages((x) => x.filter((_, j) => j !== i))}>
                Удалить фото
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="field">
        <label>Адрес</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      <div className="field">
        <label>Размер, м²</label>
        <input type="number" value={sizeSqm} onChange={(e) => setSizeSqm(Number(e.target.value))} />
      </div>
      <div className="field">
        <label>Что есть на локации</label>
        <textarea rows={2} value={amenities} onChange={(e) => setAmenities(e.target.value)} />
      </div>
      <div className="grid cols-3">
        <div className="field">
          <label>Цена / час</label>
          <input type="number" value={hourlyPrice} onChange={(e) => setHourlyPrice(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Цена / полдня</label>
          <input type="number" value={halfDayPrice} onChange={(e) => setHalfDayPrice(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Цена / день</label>
          <input type="number" value={dayPrice} onChange={(e) => setDayPrice(Number(e.target.value))} />
        </div>
      </div>
      <div className="field">
        <label>Подробное описание</label>
        <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="field">
        <label>Правила</label>
        <textarea rows={3} value={rules} onChange={(e) => setRules(e.target.value)} />
      </div>
      <div className="field">
        <label>
          <input type="checkbox" checked={inheritHours} onChange={(e) => setInheritHours(e.target.checked)} /> Наследовать
          график студии
        </label>
      </div>
      {!inheritHours && (
        <div className="grid cols-2">
          <div className="field">
            <label>Пн–Пт: от</label>
            <input type="number" value={mfO} onChange={(e) => setMfO(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Пн–Пт: до</label>
            <input type="number" value={mfC} onChange={(e) => setMfC(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Сб–Вс: от</label>
            <input type="number" value={ssO} onChange={(e) => setSsO(Number(e.target.value))} />
          </div>
          <div className="field">
            <label>Сб–Вс: до</label>
            <input type="number" value={ssC} onChange={(e) => setSsC(Number(e.target.value))} />
          </div>
        </div>
      )}
      <h3>Категории локации</h3>
      <p className="muted">
        Общий список категорий для всех владельцев. Новую категорию добавьте в разделе «Категории локаций».
      </p>
      {cats.length === 0 && <p className="muted">Категорий пока нет — любой владелец может добавить их в «Категории локаций».</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {cats.map((c) => (
          <label key={c.id} className="pill" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={categoryIds.includes(c.id)}
              onChange={() => toggleCat(c.id)}
              style={{ marginRight: 6 }}
            />
            {c.name}
          </label>
        ))}
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn primary" disabled={saving} onClick={save}>
          {saving ? "Сохранение…" : "Сохранить"}
        </button>
        <Link className="btn" to={`/owner/studio/${studio.id}/locations`}>
          Назад
        </Link>
      </div>
    </div>
  );
}
