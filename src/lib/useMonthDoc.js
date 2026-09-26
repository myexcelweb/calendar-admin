import { useEffect, useState } from "react";
import { arrayRemove, arrayUnion, doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { MONTH_NAMES, monthId } from "./dates";

/**
 * Subscribes to calendars/{year}/months/{monthId}.
 *
 * This single document holds everything that's a "one value (or one list)
 * per month" fact: optionalLeaveDays, extraWorkingDays, note. Per-day facts
 * (holidays) live in a `holidays` subcollection under this doc - see
 * useMonthHolidays.js.
 *
 * Path example: calendars/2026/months/01  ==  "2026/january"
 */
export function useMonthDoc(year, month) {
  const mId = monthId(month);
  const path = `calendars/${year}/months/${mId}`;

  // The snapshot is tagged with the path it belongs to: right after switching month the
  // previous month's data is never shown (or edited) as if it were the new month's
  const [snapshot, setSnapshot] = useState({ path: null, data: {}, error: "" });

  useEffect(() => {
    const ref = doc(db, "calendars", String(year), "months", mId);
    const unsub = onSnapshot(
      ref,
      (snap) => setSnapshot({ path, data: snap.exists() ? snap.data() : {}, error: "" }),
      (err) => setSnapshot({ path, data: {}, error: `Couldn't load ${path}: ${err.message}` })
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, mId]);

  const current = snapshot.path === path;
  const data = current ? snapshot.data : {};
  const loading = !current;
  const error = current ? snapshot.error : "";

  /** Merge-writes one or more fields onto the month doc, creating it (and
   * its year/month "row") if it doesn't exist yet. */
  const setFields = (fields) =>
    setDoc(
      doc(db, "calendars", String(year), "months", mId),
      {
        year: Number(year),
        month: Number(month),
        monthName: MONTH_NAMES[month - 1],
        ...fields,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

  const setField = (field, value) => setFields({ [field]: value });

  // Adds / removes one day number on the server side, so two open tabs (or a stale
  // copy of the list) can never overwrite each other's changes
  const addDay = (field, day) => setField(field, arrayUnion(day));
  const removeDay = (field, day) => setField(field, arrayRemove(day));

  return { data, loading, error, setField, setFields, addDay, removeDay, path };
}
