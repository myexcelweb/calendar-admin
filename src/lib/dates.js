export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Firestore docs for optional_leaves / monthly_notes key months by lowercase
// name (e.g. "december"), not by number - this matches that convention.
export function monthKey(month /* 1-12 */) {
  return MONTH_NAMES[month - 1].toLowerCase();
}

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
