/** Formatea una fecha ISO a "5 Mar 2026". */
export function formatWorkoutDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Devuelve el ISO string del inicio del período (semana o mes). */
export function getPeriodStart(period: 'week' | 'month'): string {
  const now = new Date();
  if (period === 'week') {
    const day = now.getDay();                   // 0=Dom … 6=Sáb
    const diff = day === 0 ? -6 : 1 - day;     // retroceder hasta el lunes
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    return monday.toISOString();
  }
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

/** Formatea volumen en kg o toneladas. */
export function formatVolume(kg: number): string {
  return kg >= 1000
    ? `${(kg / 1000).toFixed(1)} t`
    : `${Math.round(kg)} kg`;
}
