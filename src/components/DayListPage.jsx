import { useState } from "react";
import { useMonthDoc } from "../lib/useMonthDoc";
import { MONTH_NAMES, daysInMonth, parseDay, writeErrorMessage } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";
import MonthPicker from "./MonthPicker";

/**
 * A page editing one list of day numbers on calendars/{year}/months/{month}
 * (extraWorkingDays or optionalLeaveDays).
 */
export default function DayListPage({ field, eyebrow, title, description, listLabel, emptyText }) {
  const { year, month } = useCalendar();
  const { data, loading, error, addDay, removeDay } = useMonthDoc(year, month);
  const [newDay, setNewDay] = useState("");
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

  const days = (data[field] || []).slice().sort((a, b) => a - b);
  const maxDay = daysInMonth(year, month);

  const run = async (write) => {
    setBusy(true);
    setSaveError("");
    try {
      await write();
      return true;
    } catch (err) {
      setSaveError(writeErrorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    const n = parseDay(newDay, maxDay);
    if (n === null) {
      setSaveError(`Enter a whole day number from 1 to ${maxDay}.`);
      return;
    }
    if (days.includes(n)) {
      setSaveError(`Day ${n} is already in the list.`);
      return;
    }
    if (await run(() => addDay(field, n))) setNewDay("");
  };

  const shownError = error || saveError;

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-sub">{description}</p>
        </div>
      </div>

      <MonthPicker />

      {shownError && <div className="page-error">{shownError}</div>}

      <label className="form-label">
        {listLabel} — {MONTH_NAMES[month - 1]} {year}
      </label>
      <div className="chip-field">
        {loading ? (
          <span className="form-hint">Loading…</span>
        ) : days.length === 0 ? (
          <span className="form-hint">{emptyText}</span>
        ) : (
          days.map((d) => (
            <span className="chip" key={d}>
              {d}
              <button
                aria-label={`Remove day ${d}`}
                disabled={busy}
                onClick={() => run(() => removeDay(field, d))}
              >
                ✕
              </button>
            </span>
          ))
        )}
        <form
          className="chip-add"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <input
            type="number"
            min={1}
            max={maxDay}
            step={1}
            placeholder="Day #"
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            aria-label="Day of month"
          />
          <button className="btn btn-ghost btn-sm" type="submit" disabled={!newDay || busy || loading}>
            + Add
          </button>
        </form>
      </div>
      <p className="form-hint">Enter the day-of-month number (1–{maxDay}).</p>
    </div>
  );
}
