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
import { dayId, isoDate, monthId } from "./dates";

/**
 * Subscribes to calendars/{year}/months/{monthId}/holidays - one doc per
 * calendar day that has a holiday, keyed by zero-padded day number.
 *
 * Path example: calendars/2026/months/01/holidays/26 == "2026/january/26"
 */
export function useMonthHolidays(year, month) {
  const mId = monthId(month);
  const path = `calendars/${year}/months/${mId}/holidays`;

  // Tagged with its path, like useMonthDoc: never show the previous month's list
  const [snapshot, setSnapshot] = useState({ path: null, holidays: [], error: "" });

  useEffect(() => {
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
        setSnapshot({ path, holidays: list, error: "" });
      },
      (err) => setSnapshot({ path, holidays: [], error: `Couldn't load ${path}: ${err.message}` })
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, mId]);

  const current = snapshot.path === path;
  const holidays = current ? snapshot.holidays : [];
  const loading = !current;
  const error = current ? snapshot.error : "";

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

  return { holidays, loading, error, setHoliday, removeHoliday };
}
