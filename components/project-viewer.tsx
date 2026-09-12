"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ProjectImage } from "@/lib/types";
import { imageUrl } from "@/lib/images";

export function ProjectViewer({ images, title }: { images: ProjectImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const move = useCallback(
    (delta: number) => setIndex(i => (i + delta + images.length) % images.length),
    [images.length]
  );

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [move]);

  if (!images.length) return <p className="py-24">This project has no artwork yet.</p>;

  const image = images[index];
  let start = 0;

  return (
    <section aria-label="Artwork viewer" className="mt-4">
      <div
        className="relative flex h-[calc(100dvh-200px)] sm:h-[calc(100dvh-260px)] min-h-[280px] items-center justify-center bg-white pt-6 sm:pt-12"
        onTouchStart={e => (start = e.changedTouches[0].screenX)}
        onTouchEnd={e => {
          const d = e.changedTouches[0].screenX - start;
          if (Math.abs(d) > 45) move(d > 0 ? -1 : 1);
        }}
      >
        <button
          aria-label="Previous artwork"
          onClick={() => move(-1)}
          className="absolute left-4 sm:left-6 z-10 text-black p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="relative w-full h-full flex items-center justify-center">
          <button
            aria-label="Open fullscreen artwork"
            onClick={() => setLightbox(true)}
            className="relative w-full h-full flex items-center justify-center cursor-zoom-in"
          >
            <div className="relative max-w-[90vw] max-h-full w-full h-full flex items-center justify-center">
              <Image
                src={imageUrl(image.storage_path)}
                alt={image.alt_text || title}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-contain object-center max-h-full max-w-full"
              />
              {/* overlays removed — caption and counter will render below the viewer */}
            </div>
          </button>
        </div>

        <button
          aria-label="Next artwork"
          onClick={() => move(1)}
          className="absolute right-4 sm:right-6 z-10 text-black p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* caption bottom-left */}
      <div className="fixed left-2 sm:left-4 bottom-2 sm:bottom-4 z-50 pointer-events-auto max-w-[55vw] sm:max-w-[60vw]">
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-800 bg-white/80 backdrop-blur-sm rounded px-2 py-1">{image.caption || 'No image description has been added.'}</p>
      </div>
      {/* counter bottom-right */}
      {images.length > 1 && (
        <div className="fixed right-2 sm:right-4 bottom-2 sm:bottom-4 z-50 pointer-events-auto">
          <div className="text-xs sm:text-sm text-neutral-600 bg-white/80 rounded px-2 py-1">{`${index + 1} / ${images.length}`}</div>
        </div>
      )}
    </section>
  );
}
