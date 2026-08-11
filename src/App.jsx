import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { CalendarProvider } from "./context/CalendarContext";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import MiniCalendar from "./components/MiniCalendar";
import Holidays from "./pages/Holidays";
import ExtraWorkingDays from "./pages/ExtraWorkingDays";
import OptionalLeaves from "./pages/OptionalLeaves";
import Notes from "./pages/Notes";

const PAGES = {
  holidays: Holidays,
  "working-days": ExtraWorkingDays,
  leaves: OptionalLeaves,
  notes: Notes,
};

export default function App() {
  const { user } = useAuth();
  const [active, setActive] = useState("holidays");

  if (user === undefined) {
    return <div className="center-loading">Loading…</div>;
  }

  if (!user) {
    return <Login />;
  }

  const Page = PAGES[active];

  return (
    <CalendarProvider>
      <div className="app-shell">
        <Sidebar active={active} onNavigate={setActive} />
        <Page />
        <MiniCalendar />
      </div>
    </CalendarProvider>
  );
}
