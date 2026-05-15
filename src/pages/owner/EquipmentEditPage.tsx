import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { readFilesAsDataUrls } from "@/lib/files";
import { equipmentCategoryOptions } from "@/lib/labels";
import { newId } from "@/lib/id";
import { useApp } from "@/store/AppStore";
import type { Equipment, EquipmentCategory } from "@/types";

export function EquipmentEditPage() {
  const { sid, eid } = useParams();
  const isNew = eid === "new";
  const nav = useNavigate();
  const { data, user, upsertEquipment } = useApp();

  const studio = data.studios.find((s) => s.id === sid);
  const existing = !isNew ? data.equipment.find((e) => e.id === eid) : undefined;

  const [name, setName] = useState("");
  const [category, setCategory] = useState<EquipmentCategory>("light");
  const [quantity, setQuantity] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [hourlyPrice, setHourlyPrice] = useState(500);
  const [halfDayPrice, setHalfDayPrice] = useState(1500);
  const [dayPrice, setDayPrice] = useState(2500);
  const [description, setDescription] = useState("");
  const [unitRepair, setUnitRepair] = useState<boolean[]>([]);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setQuantity(existing.quantity);
      setImages(existing.images);
      setHourlyPrice(existing.hourlyPrice);
      setHalfDayPrice(existing.halfDayPrice);
      setDayPrice(existing.dayPrice);
      setDescription(existing.description);
      setUnitRepair([...existing.unitRepair]);
    }
  }, [existing]);

  useEffect(() => {
    setUnitRepair((prev) => {
      const next = [...prev];
      while (next.length < quantity) next.push(false);
      next.length = quantity;
      return next;
    });
  }, [quantity]);

  if (!studio || studio.ownerId !== user?.id) return <div className="card">Нет доступа.</div>;

  function save() {
    if (!studio) return;
    const eq: Equipment = {
      id: existing?.id ?? newId(),
      studioId: studio.id,
      name: name.trim() || "Оборудование",
      category,
      quantity: Math.max(1, quantity),
      images,
      hourlyPrice: Number(hourlyPrice) || 0,
      halfDayPrice: Number(halfDayPrice) || 0,
      dayPrice: Number(dayPrice) || 0,
      description: description.trim(),
      unitRepair,
    };
    upsertEquipment(eq);
    if (isNew) nav(`/owner/studio/${studio.id}/equipment`, { replace: true });
  }

  return (
    <div className="card" style={{ maxWidth: 720 }}>
      <p className="muted">
        <Link to={`/owner/studio/${studio.id}/equipment`}>← Оборудование</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{isNew ? "Новое оборудование" : "Редактирование"}</h1>
      <div className="field">
        <label>Название</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Категория</label>
        <select value={category} onChange={(e) => setCategory(e.target.value as EquipmentCategory)}>
          {equipmentCategoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Количество единиц (каждая бронируется отдельно)</label>
        <input type="number" min={1} max={99} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      </div>
      <div className="field">
        <label>Фото</label>
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
            <div key={i}>
              <img src={u} alt="" className="thumb" />
              <button type="button" className="btn" onClick={() => setImages((x) => x.filter((_, j) => j !== i))}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="grid cols-3">
        <div className="field">
          <label>₽/час</label>
          <input type="number" value={hourlyPrice} onChange={(e) => setHourlyPrice(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>₽/полдня</label>
          <input type="number" value={halfDayPrice} onChange={(e) => setHalfDayPrice(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>₽/день</label>
          <input type="number" value={dayPrice} onChange={(e) => setDayPrice(Number(e.target.value))} />
        </div>
      </div>
      <div className="field">
        <label>Описание</label>
        <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <h3>Ремонт по единицам</h3>
      <p className="muted">На публичной странице появится плашка «На ремонте».</p>
      {unitRepair.map((rep, i) => (
        <label key={i} style={{ display: "block", marginBottom: 6 }}>
          <input type="checkbox" checked={rep} onChange={(e) => setUnitRepair((prev) => prev.map((p, j) => (j === i ? e.target.checked : p)))} />{" "}
          Единица №{i + 1} на ремонте
        </label>
      ))}
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
        <button type="button" className="btn primary" onClick={save}>
          Сохранить
        </button>
        <Link className="btn" to={`/owner/studio/${studio.id}/equipment`}>
          Назад
        </Link>
      </div>
    </div>
  );
}
