import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { JwtResponse } from "../../types/jwt";

type RoleNavigationProps = {
  user?: JwtResponse | null;
  onLogout: () => void;
};

const FEATURE_LINKS = [
  { label: "Assessments", path: "/mentor/assessments" },
  { label: "Leveling", path: "/mentor/leveling" },
  { label: "Materials", path: "/mentor/materials" },
  { label: "Feedback", path: "/mentor/feedbacks" },
  { label: "Guidance", path: "/mentor/guidance" },
];

const MentorNavbar: React.FC<RoleNavigationProps> = ({ user, onLogout }) => {
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

  const highlight = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleNavigate("/mentor/dashboard")}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-sky-500 to-indigo-500 text-white font-bold shadow-md">
              M
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-semibold text-slate-900">Mentor Hub</span>
              <span className="text-xs text-slate-500">Your teaching cockpit</span>
            </div>
          </button>
        </div>

        <nav className="hidden gap-6 text-sm font-semibold text-slate-600 md:flex">
          {FEATURE_LINKS.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`uppercase tracking-wide transition ${highlight(item.path) ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName || "Mentor"}</p>
            <p className="text-xs text-slate-500">{user?.roles?.join(", ")}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 font-medium shadow-sm"
            >
              {user?.fullName?.charAt(0) || "M"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white/95 py-2 shadow-xl">
                <button
                  onClick={() => handleNavigate("/mentor/profile")}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Mentor Profile
                </button>
                <button
                  onClick={() => handleNavigate("/mentor/sessions")}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  Upcoming Sessions
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
                >
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

export default MentorNavbar;
