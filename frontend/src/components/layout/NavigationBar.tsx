import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { JwtResponse } from "../../types/jwt";

interface NavigationBarProps {
  user?: JwtResponse | null;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: "Learn", path: "/learn" },
  { label: "Practice", path: "/practice" },
  { label: "Mentors", path: "/mentor-selection" },
  { label: "Analytics", path: "/analytics" },
];

const NavigationBar: React.FC<NavigationBarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const canViewLearnerProfile = user?.roles?.includes("LEARNER");

  const handleNavigate = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-50 border-transparent bg-gradient-to-r from-white/90 via-sky-50/80 to-indigo-50/80 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => handleNavigate("/dashboard")}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 text-white font-bold shadow-md">V</div>
            <span className="font-semibold bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">VoiceUp</span>
          </button>
        </div>

        <nav className="hidden gap-6 text-sm font-semibold text-slate-700 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className={`transition ${
                  isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-500"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.fullName || "User"}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-500 text-white font-medium shadow-lg"
            >
              {user?.fullName?.charAt(0) || "U"}
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200/60 bg-white/90 py-2 shadow-xl backdrop-blur">
                {canViewLearnerProfile && (
                  <button
                    onClick={() => handleNavigate("/learner/profile")}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Learner Profile
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 transition-colors hover:bg-slate-50"
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

export default NavigationBar;
