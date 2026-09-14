"use client";
import { useState } from "react";

export function ProjectInfoButton({ title, date, description }: { title: string; date: string; description: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center w-5 h-5 ml-2 text-black hover:scale-110 transition-transform"
        aria-label="Project information"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-sm text-stone-600 mb-4">{date}</p>
            <p className="text-base leading-relaxed text-stone-800 mb-4">{description}</p>
            <button onClick={() => setOpen(false)} className="text-sm underline">
              close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
