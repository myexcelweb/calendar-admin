export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// --- New hierarchical schema helpers (calendars/{year}/months/{monthId}/holidays/{dayId}) ---

/** Zero-pads a 1-2 digit number to a 2-character string id, e.g. 1 -> "01". */
export function pad2(n) {
  return String(n).padStart(2, "0");
}

/** Doc id used under calendars/{year}/months for a given month number (1-12). */
export function monthId(month /* 1-12 */) {
  return pad2(month);
}

/** Doc id used under .../holidays for a given day-of-month number. */
export function dayId(day) {
  return pad2(day);
}

export const DOW = ["S", "M", "T", "W", "T", "F", "S"];

export function daysInMonth(year, month /* 1-12 */) {
  return new Date(year, month, 0).getDate();
}

export function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function currentYear() {
  return new Date().getFullYear();
}

export function yearRange(centerYear, span = 4) {
  const years = [];
  for (let y = centerYear - 1; y <= centerYear + span; y++) years.push(y);
  return years;
}

/** Day-of-month typed by the admin as a whole number in 1..maxDay, or null if invalid. */
export function parseDay(value, maxDay) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= maxDay ? n : null;
}

/** Readable message for a failed Firestore write. */
export function writeErrorMessage(err) {
  if (err?.code === "permission-denied") {
    return "Not saved: permission denied by Firestore. Check that you're signed in with the admin account.";
  }
  return `Not saved: ${err?.message || err}`;
}
