import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/products", label: "Products" },
  { to: "/categories", label: "Categories" },
  { to: "/suppliers", label: "Suppliers" },
  { to: "/stock-movements", label: "Stock Movements" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">StockPilot</span>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">Inventory Management</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-300">
              {user?.name || "User"} <span className="text-slate-500">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg font-medium"
            >
              Logout
            </button>
          </div>
        </div>
        <nav className="bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    isActive
                      ? "border-blue-400 text-white"
                      : "border-transparent text-slate-300 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="text-center text-xs text-gray-400 py-4">
        StockPilot &copy; {new Date().getFullYear()} - Full-Stack Inventory Management System
      </footer>
    </div>
  );
}
