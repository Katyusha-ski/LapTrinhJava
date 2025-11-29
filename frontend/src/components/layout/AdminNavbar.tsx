import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { JwtResponse } from "../../types/jwt";

type RoleNavigationProps = {
  user?: JwtResponse | null;
  onLogout: () => void;
};

const NAV_LINKS = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Mentors", path: "/admin/mentor-management" },
  { label: "Learners", path: "/admin/learner-management" },
  { label: "Packages", path: "/packages" },
  { label: "System", path: "/admin/system" },
];

const AdminNavbar: React.FC<RoleNavigationProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleNavigate("/admin/dashboard")}
            className="flex items-center gap-3 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">A</div>
            <div>
              <p className="text-sm font-semibold">Admin Console</p>
              <p className="text-xs text-slate-300">Govern the platform</p>
            </div>
          </button>
        </div>
        <nav className="hidden gap-6 text-sm font-semibold md:flex">
          {NAV_LINKS.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`uppercase tracking-wide transition ${isActive ? "text-emerald-300" : "text-slate-300 hover:text-white"}`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-xs sm:block">
            <p className="text-sm font-semibold text-white">{user?.fullName || "Administrator"}</p>
            <p className="text-slate-300">{user?.email}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-semibold"
            >
              {user?.fullName?.charAt(0) || "A"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-slate-900/95 py-2 text-left text-sm text-white shadow-xl">
                <button
                  onClick={() => handleNavigate("/admin/settings")}
                  className="w-full px-4 py-2 transition hover:bg-white/10"
                >
                  Platform Settings
                </button>
                <button
                  onClick={() => handleNavigate("/admin/audit")}
                  className="w-full px-4 py-2 transition hover:bg-white/10"
                >
                  Audit Logs
                </button>
                <button onClick={handleLogout} className="w-full px-4 py-2 text-rose-300 transition hover:bg-white/10">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
