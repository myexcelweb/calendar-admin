import { useEffect, useState } from "react";
import { deleteField } from "firebase/firestore";
import { useMonthDoc } from "../lib/useMonthDoc";
import { currentYear, yearRange, MONTH_NAMES } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";

export default function Notes() {
  const { year, setYear, month, setMonth } = useCalendar();
  const { data, loading, setField } = useMonthDoc(year, month);
  const [draft, setDraft] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [busy, setBusy] = useState(false);

  const savedNote = data.note || "";

  useEffect(() => {
    setDraft(savedNote);
    setSavedAt(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, loading]);

  const isDirty = draft !== savedNote;

  const save = async () => {
    setBusy(true);
    try {
      if (draft.trim()) {
        await setField("note", draft);
      } else {
        await setField("note", deleteField());
      }
      setSavedAt(Date.now());
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Free-text banner</p>
          <h1 className="page-title">Monthly notes</h1>
          <p className="page-sub">
            Stored as calendars/{"{year}"}/months/{"{month}"}.note — one note per month,
            shown on the calendar for that month.
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

      <label className="form-label" htmlFor="note-text">
        Note — {MONTH_NAMES[month - 1]} {year}
      </label>
      <textarea
        id="note-text"
        className="textarea"
        placeholder={loading ? "Loading…" : "e.g. Lok Adalat on 13 Jan."}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        disabled={loading}
      />

      <div className="field-row" style={{ marginTop: 14, justifyContent: "space-between" }}>
        <span className="form-hint">
          {busy
            ? "Saving…"
            : savedAt && !isDirty
            ? "Saved."
            : isDirty
            ? "Unsaved changes"
            : savedNote
            ? "Up to date"
            : "No note set for this month"}
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          {savedNote && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => setDraft("")}
              disabled={busy || draft === ""}
            >
              Clear
            </button>
          )}
          <button className="btn btn-primary btn-sm" onClick={save} disabled={busy || !isDirty}>
            Save note
          </button>
        </div>
      </div>
    </div>
  );
}
