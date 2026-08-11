import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { key: "holidays", label: "Holidays" },
  { key: "working-days", label: "Extra working days" },
  { key: "leaves", label: "Optional leave" },
  { key: "notes", label: "Notes" },
];

export default function Sidebar({ active, onNavigate }) {
  const { user, logout } = useAuth();

  return (
    <nav className="sidebar">
      <div className="brand">
        <span className="brand-mark">CalendarPro</span>
        <span className="brand-tag">Admin</span>
      </div>

      <div className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="sidebar-user">{user?.email}</span>
        <button className="logout-btn" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
