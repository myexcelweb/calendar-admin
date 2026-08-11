import { createContext, useContext, useState } from "react";
import { currentYear } from "../lib/dates";

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  const [year, setYear] = useState(currentYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  return (
    <CalendarContext.Provider value={{ year, setYear, month, setMonth }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  return useContext(CalendarContext);
}
