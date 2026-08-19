export function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
export function formatProjectDate(date: string | null) { if (!date) return ''; return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`)); }
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const maxImageBytes = 20 * 1024 * 1024;
