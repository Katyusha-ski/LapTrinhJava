import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MentorNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { mentorApi } from "../../../api/mentor.api";
import type { Mentor } from "../../../types/mentor";
import { ENGLISH_LEVEL_OPTIONS } from "../../../types/shared";
import { FaChalkboardTeacher, FaClock, FaStar } from "react-icons/fa";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Mentor&background=0D8ABC&color=fff";

const levelLabels = Object.fromEntries(ENGLISH_LEVEL_OPTIONS.map((item) => [item.value, item.label]));

const MentorProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      setMissingProfile(false);
      const data = await mentorApi.getByUserId(user.id);
      setProfile(data);
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 404) {
        setMissingProfile(true);
        setProfile(null);
      } else {
        setError("Không thể tải hồ sơ mentor. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      setLoading(false);
      return;
    }
    fetchProfile().catch(() => {
      setError("Không thể tải hồ sơ mentor. Vui lòng thử lại.");
      setLoading(false);
    });
  }, [authLoading, fetchProfile, user?.id]);

  const infoCards = useMemo(
    () => [
      {
        label: "Đánh giá trung bình",
        value: profile?.rating != null ? `${profile.rating.toFixed(1)}/5` : "--",
        icon: <FaStar className="text-amber-400" />,
        helper: "Tổng hợp từ phản hồi học viên",
      },
      {
        label: "Năm kinh nghiệm",
        value: profile?.experienceYears != null ? `${profile.experienceYears}+` : "--",
        icon: <FaChalkboardTeacher className="text-sky-500" />,
        helper: "Tính từ hồ sơ mentor",
      },
      {
        label: "Chi phí mỗi giờ",
        value:
          profile?.hourlyRate != null
            ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(
                Number(profile.hourlyRate)
              )
            : "--",
        icon: <FaClock className="text-emerald-500" />,
        helper: "Mức phí áp dụng cho phiên 1-1",
      },
    ],
    [profile?.experienceYears, profile?.hourlyRate, profile?.rating]
  );

  const levelTags = useMemo(() => {
    if (!profile?.supportedLevels?.length) return ["Chưa cập nhật"];
    return profile.supportedLevels.map((level) => levelLabels[level] || level);
  }, [profile?.supportedLevels]);

  const skillTags = useMemo(() => {
    if (!profile?.skills?.length) return ["Chưa có kỹ năng"];
    return profile.skills;
  }, [profile?.skills]);

  const renderLoadingState = () => (
    <div className="rounded-2xl border border-slate-100 bg-white/70 p-6 shadow-sm">
      <div className="h-6 w-32 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="mt-2 h-4 w-3/5 animate-pulse rounded-full bg-slate-200" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-100 p-4">
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-2 h-3 w-2/3 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMissingProfile = () => (
    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-8 text-center shadow-sm">
      <h2 className="text-2xl font-semibold text-amber-800">Chưa có hồ sơ mentor</h2>
      <p className="mt-3 text-amber-700">
        Tài khoản của bạn chưa được tạo hồ sơ mentor. Vui lòng liên hệ quản trị viên để được cấp quyền hoặc hoàn tất quy trình
        onboarding.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={() => navigate("/mentor")}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-amber-800 shadow-sm hover:bg-amber-100"
        >
          Quay lại Dashboard
        </button>
        <button
          onClick={fetchProfile}
          className="rounded-xl bg-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-700"
        >
          Thử tải lại
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-gradient min-h-screen">
      <MentorNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-wide text-slate-500">Hồ sơ mentor</p>
          <h1 className="text-3xl font-bold text-slate-900">Thông tin cá nhân & chuyên môn</h1>
          <p className="mt-2 text-slate-500">Theo dõi trạng thái hồ sơ, kỹ năng và cấp độ học viên bạn hỗ trợ.</p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            {error}
          </div>
        )}

        {loading && renderLoadingState()}
        {!loading && missingProfile && renderMissingProfile()}

        {!loading && !missingProfile && profile && (
          <section className="space-y-8">
            <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center">
                <img
                  src={profile.avatarUrl || DEFAULT_AVATAR}
                  alt="mentor-avatar"
                  className="h-32 w-32 rounded-2xl border border-slate-200 object-cover shadow-inner"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900">{profile.fullName || user?.fullName || "Mentor"}</h2>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        profile.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {profile.isAvailable ? "Đang nhận lịch" : "Tạm ẩn"}
                    </span>
                  </div>
                  <p className="mt-3 text-slate-600">{profile.bio || "Chưa cập nhật phần giới thiệu."}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span>#ID {profile.id}</span>
                    <span>•</span>
                    <span>Học viên đang hỗ trợ: {profile.totalStudents ?? 0}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {infoCards.map((card) => (
                  <div key={card.label} className="rounded-2xl border border-slate-100 px-4 py-5">
                    <div className="flex items-center gap-3 text-slate-500">
                      {card.icon}
                      <p className="text-xs font-semibold uppercase tracking-wide">{card.label}</p>
                    </div>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{card.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{card.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Kỹ năng chính</h3>
                <p className="mt-2 text-sm text-slate-500">Các chuyên môn bạn cung cấp cho học viên.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skillTags.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">Cấp độ hỗ trợ</h3>
                <p className="mt-2 text-sm text-slate-500">Đối tượng học viên bạn đang phụ trách.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {levelTags.map((level) => (
                    <span key={level} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                      {level}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Cập nhật hồ sơ</h3>
                  <p className="text-sm text-slate-500">Liên hệ quản trị viên nếu bạn cần chỉnh sửa thông tin hoặc bổ sung chứng chỉ.</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={fetchProfile}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Tải lại dữ liệu
                  </button>
                  <button
                    onClick={() => navigate("/mentor")}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Quay lại Dashboard
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default MentorProfilePage;
