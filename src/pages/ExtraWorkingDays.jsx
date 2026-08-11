import { useState } from "react";
import { useMonthDoc } from "../lib/useMonthDoc";
import { currentYear, yearRange, MONTH_NAMES, daysInMonth } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";

export default function ExtraWorkingDays() {
  const { year, setYear, month, setMonth } = useCalendar();
  const { data, loading, setField } = useMonthDoc(year, month);
  const [newDay, setNewDay] = useState("");

  const days = (data.extraWorkingDays || []).slice().sort((a, b) => a - b);
  const maxDay = daysInMonth(year, month);

  const addDay = async () => {
    const n = Number(newDay);
    if (!n || n < 1 || n > maxDay || days.includes(n)) return;
    await setField("extraWorkingDays", [...days, n].sort((a, b) => a - b));
    setNewDay("");
  };

  const removeDay = async (d) => {
    await setField("extraWorkingDays", days.filter((x) => x !== d));
  };

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Working calendar override</p>
          <h1 className="page-title">Extra working days</h1>
          <p className="page-sub">
            Stored as calendars/{"{year}"}/months/{"{month}"}.extraWorkingDays — days that
            are normally off (usually weekends) but declared working.
          </p>
        </div>
      </div>

      <div className="field-row">
        <select className="select" value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {yearRange(currentYear()).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select className="select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          {MONTH_NAMES.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <label className="form-label">
        Extra working days — {MONTH_NAMES[month - 1]} {year}
      </label>
      <div className="chip-field">
        {loading ? (
          <span className="form-hint">Loading…</span>
        ) : days.length === 0 ? (
          <span className="form-hint">No extra working days set for this month yet.</span>
        ) : (
          days.map((d) => (
            <span className="chip" key={d}>
              {d}
              <button aria-label={`Remove day ${d}`} onClick={() => removeDay(d)}>
                ✕
              </button>
            </span>
          ))
        )}
        <span className="chip-add">
          <input
            type="number"
            min={1}
            max={maxDay}
            placeholder="Day #"
            value={newDay}
            onChange={(e) => setNewDay(e.target.value)}
            aria-label="Day of month"
          />
          <button className="btn btn-ghost btn-sm" onClick={addDay} disabled={!newDay}>
            + Add
          </button>
        </span>
      </div>
      <p className="form-hint">Enter the day-of-month number (1–{maxDay}).</p>
    </div>
  );
}
