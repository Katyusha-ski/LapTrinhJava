import { Link, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Onboarding from "./pages/onboarding";
import AdminMentorManagement from "./pages/admin/mentor-management";
import MentorSelection from "./pages/learner/mentor-selection";
import LandingPage from "./pages/landing";
import { getToken } from "./utils/auth";

const HomePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-3xl font-semibold mb-4">AESP Dashboard</h1>
    <p className="text-gray-600">Bạn đã đăng nhập thành công.</p>
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <Link
        to="/onboarding"
        className="rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
      >
        Hoàn thiện hồ sơ luyện tập
      </Link>
      <Link
        to="/learner/mentors"
        className="rounded-xl border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
      >
        Chọn mentor
      </Link>
      <Link
        to="/admin/mentors"
        className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
      >
        Quản lý mentor (Admin)
      </Link>
      <Link
        to="/"
        className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-500 transition hover:border-gray-300 hover:bg-gray-50"
      >
        Xem trang Landing
      </Link>
    </div>
  </div>
);

function App() {
  const token = getToken();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/onboarding" element={token ? <Onboarding /> : <Navigate to="/login" replace />} />
      <Route path="/admin/mentors" element={token ? <AdminMentorManagement /> : <Navigate to="/login" replace />} />
      <Route path="/learner/mentors" element={token ? <MentorSelection /> : <Navigate to="/login" replace />} />
      <Route path="/dashboard" element={token ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="*" element={<Navigate to={token ? "/dashboard" : "/"} replace />} />
    </Routes>
  );
}

export default App;