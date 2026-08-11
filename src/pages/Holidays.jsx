import { useState } from "react";
import { useMonthHolidays } from "../lib/useMonthHolidays";
import { currentYear, yearRange, MONTH_NAMES, daysInMonth } from "../lib/dates";
import { useCalendar } from "../context/CalendarContext";
import Drawer from "../components/Drawer";

const emptyForm = { day: "", name: "" };

export default function Holidays() {
  const { year, setYear, month, setMonth } = useCalendar();
  const { holidays, loading, setHoliday, removeHoliday } = useMonthHolidays(year, month);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);

  const maxDay = daysInMonth(year, month);

  const openAdd = () => {
    setEditingDay(null);
    setForm(emptyForm);
    setDrawerOpen(true);
  };

  const openEdit = (h) => {
    setEditingDay(h.day);
    setForm({ day: String(h.day), name: h.name });
    setDrawerOpen(true);
  };

  const handleSubmit = async () => {
    const day = Number(form.day);
    if (!form.name.trim() || !day || day < 1 || day > maxDay) return;
    setBusy(true);
    try {
      await setHoliday(day, form.name);
      setDrawerOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (day) => {
    if (!confirm("Remove this holiday? This can't be undone.")) return;
    await removeHoliday(day);
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
