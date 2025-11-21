/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import path from "../../constants/path";
import { authApi } from "../../api/auth.api";
import { saveAuth } from "../../utils/auth";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);

  // Validate Username
  const validateUsername = (value: string) => {
    if (!value) return "Bạn chưa nhập username";
    if (value.length < 3) return "Username phải có ít nhất 3 ký tự";
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) return "Username chỉ chứa chữ, số, dấu chấm, gạch dưới hoặc gạch nối";
    return "";
  };

  // Validate Password
  const validatePassword = (value: string) => {
    if (!value) return "Bạn chưa nhập mật khẩu";
    if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
    if (value !== value.trim()) return "Mật khẩu không được chứa khoảng trắng";
    return "";
  };

  // Load email nếu đã lưu "Stay signed in"
  useEffect(() => {
    const savedUsername = localStorage.getItem("savedUsername");
    if (savedUsername) {
      setUsername(savedUsername);
      setStaySignedIn(true);
    }
  }, []);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(validateUsername(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(validatePassword(value));
  };

  const handleStaySignedInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaySignedIn(e.target.checked);
  };

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    const usernameErr = validateUsername(trimmedUsername);
    const passErr = validatePassword(password);
    setUsernameError(usernameErr);
    setPasswordError(passErr);

    if (!usernameErr && !passErr) {
      try {
        const payload = { username: trimmedUsername, password };
        const jwt = await authApi.login(payload);
        // Lưu token
        saveAuth(jwt as any);

        if (staySignedIn) {
          localStorage.setItem("savedUsername", trimmedUsername);
        } else {
          localStorage.removeItem("savedUsername");
          sessionStorage.setItem("tempUsername", trimmedUsername);
        }

        // Điều hướng tới dashboard (hoặc trang chính)
        navigate('/');
      } catch (err: any) {
        console.error(err);
        alert(err?.message || 'Đăng nhập thất bại');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-white flex flex-col justify-center items-center p-4">
      {/* Form Box */}
      <div className="bg-white p-10 rounded-xl w-full max-w-md shadow-md flex flex-col justify-between min-h-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-4">{/* Logo nếu cần */}</div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-10">Login</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 justify-between">
          <div className="space-y-6 ">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Username
              </label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  usernameError ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              {usernameError && (
                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>

              <input
                type={showPassword ? "text" : "password"} // Toggle type
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring pr-10 ${
                  passwordError ? "border-red-500" : "focus:border-blue-400"
                }`}
              />

              {/* Nút toggle password */}
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>

              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {/* Stay signed in + Forgot password */}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={handleStaySignedInChange}
                  className="mr-2 rounded border-gray-300 focus:ring-blue-400"
                />
                Stay signed in
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 mt-2"
          >
            Login
          </button>
        </form>
      </div>

      {/* Outside Links */}
      <div className="mt-6 text-center space-y-3">
        <a
          href="#"
          className="block text-sm text-blue-600 hover:underline"
        >
          Login with SSO
        </a>
        <p className="text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to={path.register} className="text-blue-600 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;