import { useEffect, useState } from "react";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
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
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const mId = monthId(month);
  const path = `calendars/${year}/months/${mId}`;

  useEffect(() => {
    setLoading(true);
    const ref = doc(db, "calendars", String(year), "months", mId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setData(snap.exists() ? snap.data() : {});
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, mId]);

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

  return { data, loading, setField, setFields, path };
}
