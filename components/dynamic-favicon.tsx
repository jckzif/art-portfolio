'use client';
import { useEffect } from 'react';

const COLORS = ['#e63946','#e76f51','#f4a261','#2a9d8f','#457b9d','#6a4c93','#c77dff','#d62828','#023e8a','#1b4332'];

export function DynamicFavicon({ src }: { src?: string }) {
  useEffect(() => {
    const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';

    if (src) {
      // use admin-uploaded favicon, bust cache with timestamp
      link.href = `${src}?v=${Date.now()}`;
      document.head.appendChild(link);
      return;
    }

    // fall back to random-colored J
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('J', 32, 34);
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  }, [src]);
  return null;
}
