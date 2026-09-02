// Date-only helpers. Stored values are ISO strings (possibly with time),
// but domain dates are calendar days and must not shift across timezones.

export function dateOnlyPart(value: string): string {
  if (!value) return '';
  return value.split('T')[0];
}

export function toLocalDate(value: string): Date {
  const [year, month, day] = dateOnlyPart(value).split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function dateOnlyToISO(value: string): string {
  const part = dateOnlyPart(value);
  if (!part) return '';
  return `${part}T00:00:00.000Z`;
}

export function formatDateOnly(value: string, locale: string = 'zh'): string {
  const part = dateOnlyPart(value);
  if (!part) return '';
  const [year, month, day] = part.split('-');
  if (locale === 'en') {
    return `${year}-${month}-${day}`;
  }
  return `${year}/${month}/${day}`;
}

export function isValidDateOnly(value: string): boolean {
  const part = dateOnlyPart(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(part)) return false;
  const date = toLocalDate(part);
  return !Number.isNaN(date.getTime()) && dateOnlyPart(toISOFromLocal(date)) === part;
}

function toISOFromLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayDateOnly(): string {
  return toISOFromLocal(new Date());
}
