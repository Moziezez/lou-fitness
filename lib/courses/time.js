// Session times are entered and shown in Kingston time. Jamaica has no DST,
// but the conversion below works for any IANA zone.
export const SESSION_TIMEZONE = "America/Jamaica";

const LOCAL_INPUT_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

function wallClockParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

// Milliseconds the zone is ahead of UTC at `date`.
function zoneOffset(date, timeZone) {
  const p = wallClockParts(date, timeZone);
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return asUtc - Math.floor(date.getTime() / 60000) * 60000;
}

/**
 * ISO timestamp -> "YYYY-MM-DDTHH:mm" in `timeZone`, for datetime-local inputs.
 * @param {string} iso
 */
export function toLocalInput(iso, timeZone = SESSION_TIMEZONE) {
  const p = wallClockParts(new Date(iso), timeZone);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/**
 * "YYYY-MM-DDTHH:mm" wall-clock time in `timeZone` -> Date, or null if invalid.
 * @param {string} value
 * @returns {Date | null}
 */
export function fromLocalInput(value, timeZone = SESSION_TIMEZONE) {
  const match = LOCAL_INPUT_PATTERN.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  if (Number.isNaN(guess)) return null;
  // Second pass corrects the offset when the guess lands across a DST change.
  const first = guess - zoneOffset(new Date(guess), timeZone);
  return new Date(guess - zoneOffset(new Date(first), timeZone));
}
