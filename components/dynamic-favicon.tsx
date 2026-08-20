'use client';
import { useEffect } from 'react';

const COLORS = ['#e63946','#e76f51','#f4a261','#2a9d8f','#457b9d','#6a4c93','#c77dff','#d62828','#023e8a','#1b4332'];

export function DynamicFavicon() {
  useEffect(() => {
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
    const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
    link.rel = 'icon';
    link.href = canvas.toDataURL('image/png');
    document.head.appendChild(link);
  }, []);
  return null;
}
