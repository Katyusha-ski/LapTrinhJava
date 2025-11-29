import React from "react";
import type { JwtResponse } from "../../types/jwt";

type RoleNavigationProps = {
  user?: JwtResponse | null;
  onLogout: () => void;
};

const AdminNavbar: React.FC<RoleNavigationProps> = ({ user, onLogout }) => {
  const handleLogout = () => onLogout();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-950/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: avatar, name/email */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
            {user?.fullName?.charAt(0) || "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.fullName || "Administrator"}</p>
            <p className="text-xs text-slate-200">{user?.email || "admin@example.com"}</p>
          </div>
        </div>

        {/* Center: title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-white uppercase">Admin Dashboard</h1>
        </div>

        {/* Right: logout button anchored to the far right */}
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="rounded-md bg-rose-500 px-3 py-1 text-sm font-medium text-white hover:bg-rose-400"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
