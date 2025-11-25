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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500" />
            <h1 className="text-xl font-bold text-gray-900">AESP</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{user?.fullName || "User"}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600"
              >
                {user?.fullName?.charAt(0) || "U"}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg py-2 z-10">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Xin chào, {user?.fullName || "User"}!</h2>
          <p className="mt-2 text-gray-600">Chọn một trong các tùy chọn dưới đây để tiếp tục</p>
        </div>

        {/* Learner Features */}
        {isLearner && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng học viên</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div
                onClick={() => navigate("/learner/profile")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">👤</span>
                </div>
                <h3 className="font-semibold text-gray-900">Hồ sơ cá nhân</h3>
                <p className="mt-2 text-sm text-gray-600">Xem và chỉnh sửa thông tin cá nhân</p>
              </div>

              <div
                onClick={() => navigate("/learner/mentor-selection")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">👨‍🏫</span>
                </div>
                <h3 className="font-semibold text-gray-900">Chọn mentor</h3>
                <p className="mt-2 text-sm text-gray-600">Tìm và chọn một mentor phù hợp</p>
              </div>

              <div
                onClick={() => navigate("/sessions")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900">Buổi học</h3>
                <p className="mt-2 text-sm text-gray-600">Quản lý buổi học và lịch trình</p>
              </div>

              <div
                onClick={() => navigate("/topics")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900">Chủ đề luyện tập</h3>
                <p className="mt-2 text-sm text-gray-600">Xem các chủ đề và bài học</p>
              </div>

              <div
                onClick={() => navigate("/conversation")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <h3 className="font-semibold text-gray-900">Hội thoại AI</h3>
                <p className="mt-2 text-sm text-gray-600">Luyện hội thoại với AI</p>
              </div>

              <div
                onClick={() => navigate("/pronunciation")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                  <span className="text-xl">🎤</span>
                </div>
                <h3 className="font-semibold text-gray-900">Luyện phát âm</h3>
                <p className="mt-2 text-sm text-gray-600">Cải thiện kỹ năng phát âm</p>
              </div>

              <div
                onClick={() => navigate("/onboarding")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <h3 className="font-semibold text-gray-900">Hoàn thiện hộ sơ</h3>
                <p className="mt-2 text-sm text-gray-600">Cập nhật thông tin mục tiêu</p>
              </div>
            </div>
          </div>
        )}

        {/* Admin Features */}
        {isAdmin && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng quản trị</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div
                onClick={() => navigate("/admin/mentor-management")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">⚙️</span>
                </div>
                <h3 className="font-semibold text-gray-900">Quản lý mentor</h3>
                <p className="mt-2 text-sm text-gray-600">Quản lý danh sách mentor</p>
              </div>

              <div
                onClick={() => navigate("/topics")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900">Quản lý chủ đề</h3>
                <p className="mt-2 text-sm text-gray-600">Quản lý các chủ đề luyện tập</p>
              </div>
            </div>
          </div>
        )}

        {/* Mentor Features */}
        {isMentor && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng mentor</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <div
                onClick={() => navigate("/sessions")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="text-xl">📅</span>
                </div>
                <h3 className="font-semibold text-gray-900">Buổi học của tôi</h3>
                <p className="mt-2 text-sm text-gray-600">Xem buổi học được giao</p>
              </div>

              <div
                onClick={() => navigate("/topics")}
                className="cursor-pointer rounded-lg bg-white p-6 shadow-sm transition hover:shadow-md hover:ring-2 hover:ring-blue-500"
              >
                <div className="mb-4 h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900">Chủ đề luyện tập</h3>
                <p className="mt-2 text-sm text-gray-600">Xem các chủ đề khả dụng</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Link */}
        <div className="mb-8">
          <div
            onClick={() => navigate("/landing")}
            className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 p-6 shadow-sm transition hover:shadow-md text-white"
          >
            <h3 className="font-semibold">Trang chủ</h3>
            <p className="mt-2 text-sm text-blue-100">Xem trang chủ của ứng dụng</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-gray-500">Tên người dùng</p>
              <p className="mt-1 font-semibold text-gray-900">{user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="mt-1 font-semibold text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Vai trò</p>
              <div className="mt-1 flex gap-2 flex-wrap">
                {user?.roles?.map((role) => (
                  <span
                    key={role}
                    className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600"
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
