const BRASILIA_TIME_ZONE = 'America/Sao_Paulo';

export function parseApiDate(value) {
  if (!value) return null;

  const hasTimezone = typeof value === 'string' && /(Z|[+-]\d{2}:?\d{2})$/i.test(value);
  const isDateOnly = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  const timestamp = typeof value === 'string' && !hasTimezone && !isDateOnly
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatBrasiliaDateTime(value) {
  const date = parseApiDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: BRASILIA_TIME_ZONE,
  }).format(date);
}

export function formatBrasiliaTime(value) {
  const date = parseApiDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: BRASILIA_TIME_ZONE,
  }).format(date);
}
