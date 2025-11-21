import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import { getToken } from "./utils/auth";

const HomePage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center">
    <h1 className="text-3xl font-semibold mb-4">AESP Dashboard</h1>
    <p className="text-gray-600">Bạn đã đăng nhập thành công.</p>
  </div>
);

function App() {
  const token = getToken();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={token ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={token ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={token ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;