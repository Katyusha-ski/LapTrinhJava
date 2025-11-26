import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../../utils/auth";
import type { JwtResponse } from "../../types/jwt";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<JwtResponse | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isMentor = user?.roles?.includes("ROLE_MENTOR");
  const isLearner = user?.roles?.includes("ROLE_LEARNER");

  const learnerMenus = [
    { label: "Hồ sơ cá nhân", icon: "👤", color: "from-blue-500 to-cyan-500", path: "/learner/profile" },
    { label: "Chọn mentor", icon: "👨‍🏫", color: "from-emerald-500 to-teal-500", path: "/learner/mentor-selection" },
    { label: "Buổi học", icon: "📅", color: "from-amber-500 to-orange-500", path: "/sessions" },
    { label: "Chủ đề luyện tập", icon: "📚", color: "from-violet-500 to-purple-500", path: "/topics" },
    { label: "Hội thoại AI", icon: "💬", color: "from-pink-500 to-rose-500", path: "/conversation" },
    { label: "Luyện phát âm", icon: "🎤", color: "from-indigo-500 to-blue-500", path: "/pronunciation" },
  ];

  const adminMenus = [
    { label: "Quản lý mentor", icon: "⚙️", color: "from-purple-500 to-pink-500", path: "/admin/mentor-management" },
    { label: "Quản lý học viên", icon: "👥", color: "from-blue-500 to-indigo-500", path: "/admin/learner-management" },
    { label: "Quản lý chủ đề", icon: "📚", color: "from-cyan-500 to-blue-500", path: "/topics" },
  ];

  const mentorMenus = [
    { label: "Buổi học của tôi", icon: "📅", color: "from-amber-500 to-yellow-500", path: "/sessions" },
    { label: "Chủ đề luyện tập", icon: "📚", color: "from-violet-500 to-purple-500", path: "/topics" },
  ];

  const MenuCard = ({ label, icon, color, path }: typeof learnerMenus[0]) => (
    <button
      onClick={() => navigate(path)}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${color} p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer`}
    >
      <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
      <div className="relative flex flex-col items-center justify-center h-full text-white">
        <div className="mb-3 text-4xl">{icon}</div>
        <h3 className="text-center font-semibold text-sm sm:text-base">{label}</h3>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              A
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AESP Platform
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-white">{user?.fullName || "User"}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white hover:shadow-lg transition-all"
              >
                {user?.fullName?.charAt(0) || "U"}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-800 shadow-xl py-2 z-10 border border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-slate-700/50 transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Xin chào, {user?.fullName || "User"}! 👋
          </h2>
          <p className="mt-2 text-slate-400">Chào mừng bạn quay trở lại. Hãy chọn một tính năng để bắt đầu.</p>
        </div>

        {/* Learner Features */}
        {isLearner && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Tính năng học viên</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {learnerMenus.map((menu) => (
                <MenuCard key={menu.path} {...menu} />
              ))}
            </div>
          </div>
        )}

        {/* Admin Features */}
        {isAdmin && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Tính năng quản trị</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {adminMenus.map((menu) => (
                <MenuCard key={menu.path} {...menu} />
              ))}
            </div>
          </div>
        )}

        {/* Mentor Features */}
        {isMentor && (
          <div className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
              <h3 className="text-xl font-bold text-white">Tính năng mentor</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {mentorMenus.map((menu) => (
                <MenuCard key={menu.path} {...menu} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mb-12">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Liên kết nhanh</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => navigate("/landing")}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer text-white text-left"
            >
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              <h3 className="relative font-semibold text-lg">Trang chủ</h3>
              <p className="relative mt-2 text-sm text-blue-100">Xem trang chủ của ứng dụng</p>
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer text-white text-left"
            >
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-5" />
              <h3 className="relative font-semibold text-lg">Hoàn thiện hộ sơ</h3>
              <p className="relative mt-2 text-sm text-emerald-100">Cập nhật thông tin mục tiêu</p>
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700 p-6 shadow-lg">
          <h3 className="font-semibold text-white mb-6">Thông tin tài khoản</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Tên người dùng</p>
              <p className="mt-2 font-semibold text-white text-lg">{user?.username}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Email</p>
              <p className="mt-2 font-semibold text-white text-lg break-all">{user?.email}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Vai trò</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-block rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50 px-3 py-1 text-xs font-semibold text-blue-300"
                  >
                    {role === "ROLE_ADMIN" ? "Quản trị" : role === "ROLE_MENTOR" ? "Mentor" : "Học viên"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
