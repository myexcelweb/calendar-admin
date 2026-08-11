import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { dayId, isoDate } from "./dates";

/**
 * Subscribes to calendars/{year}/months/{monthId}/holidays - one doc per
 * calendar day that has a holiday, keyed by zero-padded day number.
 *
 * Path example: calendars/2026/months/01/holidays/26 == "2026/january/26"
 */
export function useMonthHolidays(year, month) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const mId = String(month).padStart(2, "0");

  useEffect(() => {
    setLoading(true);
    const col = collection(db, "calendars", String(year), "months", mId, "holidays");
    const unsub = onSnapshot(
      col,
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          day: Number(d.id),
          ...d.data(),
        }));
        list.sort((a, b) => a.day - b.day);
        setHolidays(list);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, mId]);

  const holidayRef = (day) =>
    doc(db, "calendars", String(year), "months", mId, "holidays", dayId(day));

  const setHoliday = (day, name) =>
    setDoc(holidayRef(day), {
      day: Number(day),
      name: name.trim(),
      date: isoDate(year, month, day),
      updatedAt: serverTimestamp(),
    });

  const removeHoliday = (day) => deleteDoc(holidayRef(day));

  return { holidays, loading, setHoliday, removeHoliday };
}
