const PIXELS_PER_INCH = 96;

const DEFAULT_UNITS: Record<string, number> = {
  ch: 8,
  ex: 7.15625,
  em: 16,
  rem: 16,
  in: PIXELS_PER_INCH,
  cm: PIXELS_PER_INCH / 2.54,
  mm: PIXELS_PER_INCH / 25.4,
  pt: PIXELS_PER_INCH / 72,
  pc: PIXELS_PER_INCH / 6,
  px: 1
};

const UNIT_PATTERN = /^(-?\d+(?:\.\d+)?)([a-z%]*)$/i;

export type ParsedUnit = [number, string];

export function parseUnit(value: string | number): ParsedUnit {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return [value, ''];
  }

  const raw = typeof value === 'string' ? value.trim() : String(value);

  if (!raw) {
    return [Number.NaN, ''];
  }

  const match = raw.match(UNIT_PATTERN);
  if (!match) {
    return [Number.NaN, ''];
  }

  const amount = Number.parseFloat(match[1]);
  const unit = (match[2] || '').toLowerCase();

  return [amount, unit];
}

export type ToPxInput = string | number | null | undefined;

const toPX = (input: ToPxInput): number | null => {
  if (input === null || typeof input === 'undefined') {
    return null;
  }

  if (typeof input === 'number') {
    return Number.isFinite(input) ? input : null;
  }

  const value = input.trim();
  if (!value) {
    return null;
  }

  const direct = DEFAULT_UNITS[value];
  if (typeof direct === 'number') {
    return direct;
  }

  const [amount, unit] = parseUnit(value);
  if (Number.isNaN(amount) || !unit) {
    return Number.isFinite(amount) && !unit ? amount : null;
  }

  const multiplier = toPX(unit);

  return typeof multiplier === 'number' ? amount * multiplier : null;
};

export { toPX };

export default toPX;


