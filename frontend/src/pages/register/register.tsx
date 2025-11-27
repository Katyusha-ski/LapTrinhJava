import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import path from "../../constants/path";
import { authApi } from "../../api/auth.api";
import { useAuth } from "../../context/AuthContext";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate functions
  const validateEmail = (value: string) => {
    const emailRegex = /^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.com$/;
    if (!value) return "Bạn chưa nhập email";
    if (!emailRegex.test(value)) return "Email không hợp lệ";
    if (value.split("@")[1]?.split(".")[1]?.length < 2) return "Tên miền email không hợp lệ";
    return "";
  };

  const validateUsername = (value: string) => {
    if (!value) return "Bạn chưa nhập username";
    if (value.length < 3) return "Username phải có ít nhất 3 ký tự";
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) return "Username chỉ chứa chữ, số, dấu chấm, gạch dưới hoặc gạch nối";
    return "";
  };

  const validateFullName = (value: string) => {
    if (!value.trim()) return "Bạn chưa nhập họ tên";
    return "";
  };

  const validatePhone = (value: string) => {
    if (!value) return ""; // optional
    if (!/^[0-9]{10,11}$/.test(value)) return "Số điện thoại phải có 10-11 chữ số";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Bạn chưa nhập mật khẩu";
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!strongPasswordRegex.test(value)) {
      return "Mật khẩu phải ≥8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt";
    }
    if (value !== value.trim()) return "Mật khẩu không được chứa khoảng trắng";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Bạn chưa nhập lại mật khẩu";
    if (value !== value.trim()) return "Mật khẩu không được chứa khoảng trắng";
    if (value !== password) return "Mật khẩu nhập lại không khớp";
    return "";
  };

  // Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const trimmedUsername = username.trim();
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();
    const usernameErr = validateUsername(trimmedUsername);
    const fullNameErr = validateFullName(trimmedFullName);
    const phoneErr = validatePhone(trimmedPhone);
    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(confirmPassword);

    setEmailError(emailErr);
    setUsernameError(usernameErr);
    setFullNameError(fullNameErr);
    setPhoneError(phoneErr);
    setPasswordError(passErr);
    setConfirmPasswordError(confirmErr);

    if (!emailErr && !usernameErr && !fullNameErr && !phoneErr && !passErr && !confirmErr) {
      try {
        const payload = {
          username: trimmedUsername,
          email,
          fullName: trimmedFullName,
          phone: trimmedPhone || undefined,
          password,
        };
        await authApi.register(payload);
        
        // Auto-login after successful registration
        const loginPayload = { username: trimmedUsername, password };
        const jwt = await authApi.login(loginPayload);
        setAuth(jwt as any);
        
        // Redirect to dashboard - delay slightly to ensure state update
        setTimeout(() => {
          navigate(path.dashboard);
        }, 100);
      } catch (err: any) {
        console.error(err);
        alert(err?.message || 'Đăng ký thất bại');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-100 via-gray-50 to-white flex flex-col justify-center items-center">
      <div className="bg-white p-8 rounded-xl w-96 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(validateEmail(e.target.value));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                emailError ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">{emailError}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError(validateUsername(e.target.value));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                usernameError ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">{usernameError}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Họ tên</label>
            <input
              type="text"
              placeholder="Họ và tên"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setFullNameError(validateFullName(e.target.value));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                fullNameError ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {fullNameError && (
              <p className="text-red-500 text-sm mt-1">{fullNameError}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium mb-1">Số điện thoại (tuỳ chọn)</label>
            <input
              type="tel"
              placeholder="Ví dụ: 0912345678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError(validatePhone(e.target.value));
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                phoneError ? "border-red-500" : "focus:border-blue-400"
              }`}
            />
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  passwordError ? "border-red-500" : "focus:border-blue-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm mt-1">{passwordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(validateConfirmPassword(e.target.value));
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring ${
                  confirmPasswordError
                    ? "border-red-500"
                    : "focus:border-blue-400"
                }`}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 mt-4"
          >
            Register
          </button>
        </form>
      </div>

      {/* Link to Login */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Bạn đã có tài khoản?{" "}
          <Link to={path.login} className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;