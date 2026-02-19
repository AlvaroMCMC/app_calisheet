// ─── Extra per-set fields ─────────────────────────────────────────────────────
// Some equipment types require recording an additional variable per set
// beyond weight and reps (e.g. ring height for Anillas).

export interface ExtraField {
  /** DB column key */
  key: string;
  /** Display label (long) */
  label: string;
  /** Short label for table header */
  shortLabel: string;
  /** Allowed numeric range */
  min: number;
  max: number;
}

// ─── Equipment types ──────────────────────────────────────────────────────────

export interface EquipmentType {
  key: string;
  label: string;
  icon: string;          // Ionicons name
  hasWeight: boolean;
  weightLabel: string;
  isDuration?: boolean;
  extraField?: ExtraField;
}

export const EQUIPMENT_TYPES: EquipmentType[] = [
  { key: 'Barra',        label: 'Barra',     icon: 'remove-outline',       hasWeight: false, weightLabel: '' },
  { key: 'Paralelas',    label: 'Paralelas', icon: 'reorder-two-outline',  hasWeight: false, weightLabel: '' },
  {
    key: 'Anillas',
    label: 'Anillas',
    icon: 'ellipse-outline',
    hasWeight: false,
    weightLabel: '',
    extraField: {
      key: 'nivel_anillas',
      label: 'Nivel de anillas',
      shortLabel: 'Nivel',
      min: 1,
      max: 14,
    },
  },
  { key: '1 Mancuerna',  label: '1 Manc.',   icon: 'barbell-outline',  hasWeight: true,  weightLabel: 'Mancuerna (kg)' },
  { key: '2 Mancuernas', label: '2 Manc.',   icon: 'barbell-outline',  hasWeight: true,  weightLabel: 'C/manc. (kg)' },
  { key: 'Lastre',       label: 'Lastre',    icon: 'ribbon-outline',   hasWeight: true,  weightLabel: 'Lastre (kg)' },
  { key: 'Duración',     label: 'Duración',  icon: 'time-outline',     hasWeight: false, weightLabel: '', isDuration: true },
];

/** Returns true if any selected equipment requires recording weight. */
export function equipmentHasWeight(equipment: string[]): boolean {
  return EQUIPMENT_TYPES.some((e) => e.hasWeight && equipment.includes(e.key));
}

/** Returns true if the exercise is measured by duration instead of reps. */
export function equipmentHasDuration(equipment: string[]): boolean {
  return equipment.includes('Duración');
}

/** Format seconds as mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`;
}

/**
 * Returns the active ExtraField definition if any selected equipment has one,
 * or null otherwise.
 */
export function getExtraField(equipment: string[]): ExtraField | null {
  for (const eq of EQUIPMENT_TYPES) {
    if (eq.extraField && equipment.includes(eq.key)) return eq.extraField;
  }
  return null;
}

/**
 * Weight column label. Priority: Lastre > 2 Mancuernas > 1 Mancuerna.
 */
export function weightColumnLabel(equipment: string[]): string {
  if (equipment.includes('Lastre'))        return 'Lastre (kg)';
  if (equipment.includes('2 Mancuernas'))  return 'C/manc. (kg)';
  if (equipment.includes('1 Mancuerna'))   return 'Manc. (kg)';
  return 'Peso (kg)';
}

/** Short readable description of the equipment selection. */
export function equipmentSummary(equipment: string[]): string {
  if (equipment.length === 0) return 'Peso corporal';
  return equipment.join(' + ');
}
