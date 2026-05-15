import { differenceInMinutes } from "date-fns";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ImageCarousel } from "@/components/ImageCarousel";
import { WeekHourGrid } from "@/components/WeekHourGrid";
import { useToast } from "@/components/Shell";
import { resolveWorkingHours } from "@/lib/defaultHours";
import { priceForHours } from "@/lib/pricing";
import { segmentsForLocation } from "@/lib/segments";
import { readFilesAsDataUrls } from "@/lib/files";
import { useApp, useLocation } from "@/store/AppStore";

export function LocationPublicPage() {
  const { id } = useParams();
  const loc = useLocation(id);
  const { data, user, addBooking } = useApp();
  const { show, el } = useToast();

  const studio = useMemo(() => data.studios.find((s) => s.id === loc?.studioId), [data.studios, loc?.studioId]);

  const [week, setWeek] = useState(() => new Date());
  const [pending, setPending] = useState<{ start: string; end: string } | null>(null);

  const wh = useMemo(() => {
    if (!loc || !studio) return [];
    return resolveWorkingHours(loc.workingHours, studio.workingHours);
  }, [loc, studio]);

  const segs = useMemo(() => {
    if (!loc || !studio) return [];
    return segmentsForLocation(data, loc.id, studio.id, user?.id);
  }, [data, loc, studio, user?.id]);

  const cats = useMemo(() => {
    if (!loc || !studio) return [];
    return data.locationCategories.filter((c) => loc.categoryIds.includes(c.id) && c.ownerId === studio.ownerId);
  }, [data.locationCategories, loc, studio]);

  if (!loc || !studio) return <div className="card">Локация не найдена.</div>;

  const hours = pending
    ? Math.max(1 / 60, differenceInMinutes(new Date(pending.end), new Date(pending.start)) / 60)
    : 0;
  const price = pending
    ? priceForHours(hours, loc.hourlyPrice, loc.halfDayPrice, loc.dayPrice)
    : 0;

  async function confirmBook() {
    if (!loc || !pending || !user) return;
    if (user.role !== "renter") {
      show("Бронировать могут только арендаторы");
      return;
    }
    const r = addBooking({
      type: "location",
      resourceId: loc.id,
      renterId: user.id,
      renterNickname: user.nickname,
      start: pending.start,
      end: pending.end,
      status: "active",
      totalPrice: price,
    });
    if (!r.ok) show(r.error ?? "Не удалось");
    else show("Бронь создана");
    setPending(null);
  }

  return (
    <div>
      {el}
      <p className="muted">
        <Link to={`/s/${studio.slug}`}>← {studio.name}</Link>
      </p>

      <div className="grid cols-2" style={{ alignItems: "start" }}>
        <div>
          <ImageCarousel images={loc.images} />
        </div>
        <div className="card">
          <h1 style={{ marginTop: 0 }}>{loc.title}</h1>
          <p>
            <strong>Адрес:</strong> {loc.address}
          </p>
          <p>
            <strong>Размер:</strong> {loc.sizeSqm} м²
          </p>
          <p>
            <strong>Что есть:</strong> {loc.amenities}
          </p>
          <p>
            <strong>Стоимость:</strong> {loc.hourlyPrice} ₽/ч · {loc.halfDayPrice} ₽/полдня · {loc.dayPrice} ₽/день
          </p>
          {cats.length > 0 && (
            <p>
              {cats.map((c) => (
                <span key={c.id} className="pill" style={{ marginRight: 6 }}>
                  {c.name}
                </span>
              ))}
            </p>
          )}
          <h3>Описание</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{loc.description}</p>
          {loc.rules && (
            <>
              <h3>Правила</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{loc.rules}</p>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Календарь занятости</h2>
        <WeekHourGrid
          weekAnchor={week}
          onWeekAnchorChange={setWeek}
          workingHours={wh}
          segments={segs}
          interactive={!!user && user.role === "renter"}
          onPickRange={(s, e) => setPending({ start: s, end: e })}
        />
      </div>

      {pending && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3>Подтверждение брони</h3>
          <p className="muted">
            {new Date(pending.start).toLocaleString()} — {new Date(pending.end).toLocaleString()}
          </p>
          <p>
            <strong>Итого:</strong> {price.toFixed(0)} ₽ (~{hours.toFixed(2)} ч)
          </p>
          {!user && <p className="muted">Войдите как арендатор, чтобы забронировать.</p>}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button type="button" className="btn primary" disabled={!user} onClick={() => void confirmBook()}>
              Забронировать
            </button>
            <button type="button" className="btn" onClick={() => setPending(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Комментарии</h2>
        <CommentsBlock locationId={loc.id} />
      </div>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Отзывы</h2>
        <ReviewsBlock locationId={loc.id} />
      </div>
    </div>
  );
}

function CommentsBlock({ locationId }: { locationId: string }) {
  const { data, user, addComment } = useApp();
  const [text, setText] = useState("");
  const rows = useMemo(
    () => data.comments.filter((c) => c.locationId === locationId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.comments, locationId],
  );
  return (
    <>
      {rows.map((c) => (
        <div key={c.id} style={{ borderBottom: "1px solid #e2e8f0", padding: "0.5rem 0" }}>
          <strong>{c.nickname}</strong>{" "}
          <span className="muted">{new Date(c.createdAt).toLocaleString()}</span>
          <p style={{ margin: "0.35rem 0 0" }}>{c.text}</p>
        </div>
      ))}
      {rows.length === 0 && <p className="muted">Комментариев пока нет.</p>}
      {user && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="field">
            <label>Новый комментарий</label>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              if (!text.trim()) return;
              addComment({ locationId, userId: user.id, nickname: user.nickname, text: text.trim() });
              setText("");
            }}
          >
            Отправить
          </button>
        </div>
      )}
      {!user && <p className="muted">Войдите, чтобы оставить комментарий.</p>}
    </>
  );
}

function ReviewsBlock({ locationId }: { locationId: string }) {
  const { data, user, addReview } = useApp();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [imgs, setImgs] = useState<string[]>([]);
  const rows = useMemo(
    () => data.reviews.filter((r) => r.locationId === locationId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.reviews, locationId],
  );
  return (
    <>
      {rows.map((r) => (
        <div key={r.id} style={{ borderBottom: "1px solid #e2e8f0", padding: "0.75rem 0" }}>
          <div>
            <strong>{r.nickname}</strong>{" "}
            <span className="stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</span>
          </div>
          <p style={{ margin: "0.35rem 0" }}>{r.text}</p>
          <div className="grid cols-3">
            {r.images.map((u, i) => (
              <img key={i} src={u} alt="" className="thumb" style={{ height: 120 }} />
            ))}
          </div>
        </div>
      ))}
      {rows.length === 0 && <p className="muted">Отзывов пока нет.</p>}
      {user && user.role === "renter" && (
        <div style={{ marginTop: "0.75rem" }}>
          <div className="field">
            <label>Оценка</label>
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} звёзд
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Текст</label>
            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="field">
            <label>Фото (несколько)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const urls = await readFilesAsDataUrls(e.target.files);
                setImgs((x) => [...x, ...urls]);
              }}
            />
          </div>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              if (!text.trim()) return;
              addReview({
                locationId,
                userId: user.id,
                nickname: user.nickname,
                stars,
                text: text.trim(),
                images: imgs,
              });
              setText("");
              setImgs([]);
            }}
          >
            Опубликовать отзыв
          </button>
        </div>
      )}
      {(!user || user.role !== "renter") && <p className="muted">Отзыв с оценкой может оставить арендатор.</p>}
    </>
  );
}
