import { useEffect, useState } from "react";
import { deleteField } from "firebase/firestore";
import { useMonthDoc } from "../lib/useMonthDoc";
import { MONTH_NAMES, writeErrorMessage } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";
import MonthPicker from "../components/MonthPicker";

export default function Notes() {
  const { year, month } = useCalendar();
  const { data, loading, error, setField } = useMonthDoc(year, month);
  const [draft, setDraft] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState("");

  const savedNote = data.note || "";

  useEffect(() => {
    // Runs once the month's own data has loaded (loading stays true until then)
    setDraft(savedNote);
    setSavedAt(null);
    setSaveError("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, loading]);

  const isDirty = draft.trim() !== savedNote;

  const save = async () => {
    if (draft.length > 2000) {
      setSaveError("Keep the note under 2000 characters.");
      return;
    }
    setBusy(true);
    setSaveError("");
    try {
      if (draft.trim()) {
        await setField("note", draft.trim());
      } else {
        await setField("note", deleteField());
      }
      setSavedAt(Date.now());
    } catch (err) {
      setSaveError(writeErrorMessage(err));
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

      <MonthPicker />

      {(error || saveError) && <div className="page-error">{error || saveError}</div>}

      <label className="form-label" htmlFor="note-text">
        Note — {MONTH_NAMES[month - 1]} {year}
      </label>
      <textarea
        id="note-text"
        className="textarea"
        placeholder={loading ? "Loading…" : "e.g. Lok Adalat on 13 Jan."}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={2000}
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
