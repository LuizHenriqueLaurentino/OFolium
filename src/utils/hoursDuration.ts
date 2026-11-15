const DECIMAL_HOURS = /^(\d+)[.,](\d+)h$/;
const HOURS_AND_MINUTES = /^(\d+)h(?:(\d+)(?:min|m)?)?$/;
const MINUTES_ONLY = /^(\d+)(?:min|m)$/;

export function parseHoursToMinutes(value: string): number {
  const compact = value.trim().toLowerCase().replace(/\s+/g, '');
  if (!compact || compact.includes('-')) return 0;

  const decimalHours = DECIMAL_HOURS.exec(compact);
  if (decimalHours) {
    const hours = Number(`${decimalHours[1]}.${decimalHours[2]}`);
    if (!Number.isFinite(hours) || hours <= 0) return 0;
    return Math.round(hours * 60);
  }

  const hoursAndMinutes = HOURS_AND_MINUTES.exec(compact);
  if (hoursAndMinutes) {
    const hours = Number.parseInt(hoursAndMinutes[1], 10);
    const minutes = hoursAndMinutes[2] ? Number.parseInt(hoursAndMinutes[2], 10) : 0;
    if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours < 0 || minutes < 0) return 0;
    return hours * 60 + minutes;
  }

  const minutesOnly = MINUTES_ONLY.exec(compact);
  if (minutesOnly) {
    const minutes = Number.parseInt(minutesOnly[1], 10);
    return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
  }

  return 0;
}

export function valueToDecimalHours(value: string): number | null {
  const minutes = parseHoursToMinutes(value);
  if (minutes <= 0) return null;
  return Math.round((minutes / 60) * 100) / 100;
}
