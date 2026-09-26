import { useState } from "react";
import { useMonthHolidays } from "../lib/useMonthHolidays";
import { MONTH_NAMES, daysInMonth, parseDay, writeErrorMessage } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";
import Drawer from "../components/Drawer";
import MonthPicker from "../components/MonthPicker";

const emptyForm = { day: "", name: "" };

export default function Holidays() {
  const { year, month } = useCalendar();
  const { holidays, loading, error, setHoliday, removeHoliday } = useMonthHolidays(year, month);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");

  const maxDay = daysInMonth(year, month);

  const openAdd = () => {
    setEditingDay(null);
    setForm(emptyForm);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEdit = (h) => {
    setEditingDay(h.day);
    setForm({ day: String(h.day), name: h.name });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const day = parseDay(form.day, maxDay);
    if (day === null) {
      setFormError(`Enter a whole day number from 1 to ${maxDay}.`);
      return;
    }
    if (!form.name.trim()) {
      setFormError("Enter the holiday name.");
      return;
    }
    if (form.name.trim().length > 100) {
      setFormError("Keep the name under 100 characters.");
      return;
    }
    // Only one holiday per day: adding on a day that already has one would replace it
    const existing = holidays.find((h) => h.day === day);
    if (!editingDay && existing &&
        !confirm(`${MONTH_NAMES[month - 1]} ${day} already has "${existing.name}". Replace it?`)) {
      return;
    }
    setBusy(true);
    setFormError("");
    try {
      await setHoliday(day, form.name);
      setDrawerOpen(false);
    } catch (err) {
      setFormError(writeErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (day) => {
    if (!confirm("Remove this holiday? This can't be undone.")) return;
    setPageError("");
    try {
      await removeHoliday(day);
    } catch (err) {
      setPageError(writeErrorMessage(err));
    }
  };

  return (
    <div className="main">
      <div className="page-head">
        <div>
          <p className="page-eyebrow">Public holidays</p>
          <h1 className="page-title">Holidays</h1>
          <p className="page-sub">
            Stored as calendars/{"{year}"}/months/{"{month}"}/holidays/{"{day}"} — pick a year
            and month, then add the holiday for a specific date.
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          + Add holiday
        </button>
      </div>

      <MonthPicker />

      {(error || pageError) && <div className="page-error">{error || pageError}</div>}

      <div className="data-card">
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : holidays.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No holidays yet for {MONTH_NAMES[month - 1]} {year}</p>
            <p>Add the first one to get it onto the calendar.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.id}>
                  <td className="mono">{h.day}</td>
                  <td className="mono">{h.date}</td>
                  <td>{h.name}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(h.day)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {drawerOpen && (
        <Drawer
          title={editingDay ? "Edit holiday" : "Add holiday"}
          onClose={() => setDrawerOpen(false)}
          onSubmit={handleSubmit}
          submitLabel={editingDay ? "Save changes" : "Add holiday"}
          busy={busy}
        >
          {formError && <div className="page-error">{formError}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="h-day">
              Day of month — {MONTH_NAMES[month - 1]} {year}
            </label>
            <input
              id="h-day"
              type="number"
              className="text-input"
              min={1}
              max={maxDay}
              step={1}
              placeholder={`1–${maxDay}`}
              value={form.day}
              disabled={!!editingDay}
              onChange={(e) => setForm({ ...form, day: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="h-name">
              Name
            </label>
            <input
              id="h-name"
              className="text-input"
              placeholder="e.g. Independence Day"
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </Drawer>
      )}
    </div>
  );
}
