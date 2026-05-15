import { useState } from "react";

export function ImageCarousel({ images }: { images: string[] }) {
  const [i, setI] = useState(0);
  if (!images.length) {
    return (
      <div className="carousel carousel--empty">
        Нет фото
      </div>
    );
  }
  const idx = ((i % images.length) + images.length) % images.length;
  return (
    <div className="carousel">
      <img alt="" src={images[idx]} />
      {images.length > 1 && (
        <div className="nav">
          <button type="button" className="btn" onClick={() => setI((x) => x - 1)}>
            ‹
          </button>
          <button type="button" className="btn" onClick={() => setI((x) => x + 1)}>
            ›
          </button>
        </div>
      )}
    </div>
  );
}
