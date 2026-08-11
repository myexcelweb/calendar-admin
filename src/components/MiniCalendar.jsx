import { useCalendar } from "../context/CalendarContext";
import { useMonthDoc } from "../lib/useMonthDoc";
import { useMonthHolidays } from "../lib/useMonthHolidays";
import { DOW, MONTH_NAMES, daysInMonth } from "../lib/dates";

export default function MiniCalendar() {
  const { year, month } = useCalendar();
  const { holidays } = useMonthHolidays(year, month);
  const { data: monthData } = useMonthDoc(year, month);

  const workingDays = new Set(monthData.extraWorkingDays || []);
  const leaveDays = new Set(monthData.optionalLeaveDays || []);
  const note = monthData.note || "";
  const holidayByDay = new Map(holidays.map((h) => [h.day, h]));

  const total = daysInMonth(year, month);
  const firstDow = new Date(year, month - 1, 1).getDay();
  const cells = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <aside className="preview-rail">
      <p className="preview-eyebrow">Live preview</p>
      <p className="preview-year">
        {MONTH_NAMES[month - 1]} {year}
      </p>

      <div className="mini-cal-grid">
        {DOW.map((d, i) => (
          <span className="mini-cal-dow" key={`${d}-${i}`}>
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span className="mini-cal-day blank" key={`b${i}`} />;
          const holiday = holidayByDay.get(day);
          const isWorking = workingDays.has(day);
          const isLeave = leaveDays.has(day);
          const classes = ["mini-cal-day"];
          if (holiday) classes.push("holiday");
          if (isWorking) classes.push("working");
          if (isLeave) classes.push("leave");
          const title = [
            holiday?.name,
            isWorking ? "Extra working day" : null,
            isLeave ? "Optional leave" : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <span className={classes.join(" ")} key={day} title={title || undefined}>
              {day}
            </span>
          );
        })}
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--amber-soft)" }} />
          Holiday
        </span>
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--coral-soft)" }} />
          Extra working day
        </span>
        <span className="legend-item">
          <span
            className="legend-swatch"
            style={{ background: "transparent", boxShadow: "inset 0 0 0 1.5px var(--teal)" }}
          />
          Optional leave
        </span>
      </div>

      {note && (
        <div style={{ marginTop: 22 }}>
          <p className="preview-eyebrow" style={{ marginBottom: 6 }}>
            Note this month
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.5, color: "var(--ink-soft)" }}>{note}</p>
        </div>
      )}
    </aside>
  );
}
