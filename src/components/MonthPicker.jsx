import { useCalendar } from "../context/CalendarContext";
import { currentYear, yearRange, MONTH_NAMES } from "../lib/dates";

/** Year + month selectors shared by every page (the selection is kept across pages). */
export default function MonthPicker() {
  const { year, setYear, month, setMonth } = useCalendar();

  return (
    <div className="field-row">
      <select
        className="select"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        aria-label="Year"
      >
        {yearRange(currentYear()).map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <select
        className="select"
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        aria-label="Month"
      >
        {MONTH_NAMES.map((m, i) => (
          <option key={m} value={i + 1}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
