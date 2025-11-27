import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { learnerApi, type LearnerProfile, type LearnerMutationRequest } from "../../../api/learner.api";
import { useAuth } from "../../../context/AuthContext";
import { NavigationBar } from "../../../components/layout";

interface OnboardingSnapshot {
  age?: string;
  level?: string;
  goals?: string[];
  profession?: string;
  savedAt?: string;
  fullName?: string;
  avatarUrl?: string;
}

const AGE_LABELS: Record<string, string> = {
  "18-24": "Độ tuổi: 18-24",
  "25-34": "Độ tuổi: 25-34",
  "35-44": "Độ tuổi: 35-44",
  "45+": "Độ tuổi: 45+",
};

const GOAL_LABELS: Record<string, string> = {
  career: "Công việc & sự nghiệp",
  family: "Gia đình & bạn bè",
  travel: "Du lịch",
  partner: "Giao tiếp với đối tác",
  brain: "Rèn luyện trí não",
  study: "Học tập",
};

const PROFESSION_LABELS: Record<string, string> = {
  it: "Công nghệ & Kỹ thuật",
  business: "Tài chính & Kinh doanh",
  education: "Giáo dục & Học thuật",
  creative: "Sáng tạo, Truyền thông & Thiết kế",
  marketing: "Tiếp thị & Bán hàng",
  health: "Y tế & Khoa học",
  skilled: "Kỹ thuật & Nghề chuyên môn",
  service: "Dịch vụ & Nhà hàng khách sạn",
  logistics: "Vận chuyển & Logistics",
  freelance: "Kinh doanh tự do & Làm chủ",
};

const ENGLISH_LEVEL_LABELS: Record<string, string> = {
  A1: "Sơ cấp (A1)",
  A2: "Tiền trung cấp (A2)",
  B1: "Trung cấp (B1)",
  B2: "Trung cấp cao (B2)",
  C1: "Nâng cao (C1)",
  C2: "Thành thạo (C2)",
};

export default function LearnerProfile() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingSnapshot | null>(null);

  const [formData, setFormData] = useState<LearnerMutationRequest>({
    userId: 0,
    englishLevel: "",
    learningGoals: "",
  });

  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    avatarUrl: "",
  });

  const loadProfile = useCallback(async () => {
    if (!user?.id) {
      clearAuth();
      navigate("/login", { replace: true });
      return;
    }
    const userId = user.id as number;
    setLoading(true);
    setError(null);
    try {
      const data = await learnerApi.getByUserId(userId);
      if (data) {
        setProfile(data);
        setFormData({
          userId: data.userId,
          englishLevel: data.englishLevel || "",
          learningGoals: data.learningGoals || "",
        });
        setBasicInfo({
          fullName: data.fullName || user?.fullName || "",
          avatarUrl: data.avatarUrl || "",
        });
      } else {
        setProfile(null);
        setFormData((prev) => ({ ...prev, userId }));
        setBasicInfo({
          fullName: user?.fullName || "",
          avatarUrl: "",
        });
      }
    } catch (err: any) {
      const message: string = err?.message ?? "";
      const status: number | undefined = typeof err?.status === "number" ? err.status : undefined;
      const normalizedMessage = message.toLowerCase();
      const notFound = status === 404 || normalizedMessage.includes("404") || normalizedMessage.includes("not found");
      if (notFound) {
        // No profile yet; allow user to create one
        setProfile(null);
        setFormData((prev) => ({ ...prev, userId }));
        setBasicInfo({
          fullName: user?.fullName || "",
          avatarUrl: "",
        });
      } else {
        console.error("Failed to load learner profile", err);
        setError("Không thể tải hồ sơ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.fullName, navigate, clearAuth]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (typeof user?.id === "number") {
      const userId = user.id;
      setFormData((prev) => ({ ...prev, userId }));
      setBasicInfo((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
      }));
    }
  }, [user?.id, user?.fullName]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("aesp_onboarding_profile");
      if (raw) {
        const parsed = JSON.parse(raw) as OnboardingSnapshot;
        setOnboarding(parsed);
        setBasicInfo((prev) => ({
          fullName: prev.fullName || parsed.fullName || user?.fullName || "",
          avatarUrl: prev.avatarUrl || parsed.avatarUrl || "",
        }));
        if (!profile) {
          setFormData((prev) => ({
            ...prev,
            englishLevel: prev.englishLevel || parsed.level || "",
            learningGoals:
              prev.learningGoals || (parsed.goals && parsed.goals.length > 0
                ? parsed.goals.map((goal) => GOAL_LABELS[goal] ?? goal).join(", ")
                : ""),
          }));
        }
      } else {
        setOnboarding(null);
      }
    } catch (err) {
      console.warn("Failed to parse onboarding snapshot", err);
      setOnboarding(null);
    }
  }, [profile, user?.fullName]);

  const resetFormState = useCallback(() => {
    const fallbackGoals = onboarding?.goals && onboarding.goals.length > 0
      ? onboarding.goals.map((goal) => GOAL_LABELS[goal] ?? goal).join(", ")
      : "";
    setFormData((prev) => ({
      ...prev,
      userId: user?.id ?? prev.userId,
      englishLevel: profile?.englishLevel || onboarding?.level || "",
      learningGoals: profile?.learningGoals || fallbackGoals,
    }));
    setBasicInfo({
      fullName: profile?.fullName || onboarding?.fullName || user?.fullName || "",
      avatarUrl: profile?.avatarUrl || onboarding?.avatarUrl || "",
    });
  }, [profile, onboarding, user?.id, user?.fullName]);

  const handleLogout = () => {
    clearAuth();
    navigate("/landing", { replace: true });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "fullName" || name === "avatarUrl") {
      setBasicInfo((prev) => ({ ...prev, [name]: value }));
    }
    if (name === "englishLevel" || name === "learningGoals") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      const payload: LearnerMutationRequest = {
        userId: user?.id ?? formData.userId,
        englishLevel: formData.englishLevel?.trim()
          ? formData.englishLevel.trim().toUpperCase()
          : null,
        learningGoals: formData.learningGoals?.trim() ? formData.learningGoals : null,
      };

      const nextProfile = profile?.id
        ? await learnerApi.update(profile.id, payload)
        : await learnerApi.create(payload);

      setProfile(nextProfile);
      setFormData({
        userId: nextProfile.userId,
        englishLevel: nextProfile.englishLevel || "",
        learningGoals: nextProfile.learningGoals || "",
      });
      setBasicInfo({
        fullName: nextProfile.fullName || basicInfo.fullName || "",
        avatarUrl: nextProfile.avatarUrl || basicInfo.avatarUrl || "",
      });

      setOnboarding((prev) => {
        const snapshot: OnboardingSnapshot = { ...(prev ?? {}) };
        const nextFullName = (nextProfile.fullName || basicInfo.fullName || "").trim();
        const nextAvatar = (nextProfile.avatarUrl || basicInfo.avatarUrl || "").trim();
        if (nextFullName) {
          snapshot.fullName = nextFullName;
        } else {
          delete snapshot.fullName;
        }
        if (nextAvatar) {
          snapshot.avatarUrl = nextAvatar;
        } else {
          delete snapshot.avatarUrl;
        }
        localStorage.setItem("aesp_onboarding_profile", JSON.stringify(snapshot));
        return snapshot;
      });

      setSuccess("Hồ sơ được cập nhật thành công!");
      setEditing(false);
    } catch (err) {
      setError("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-gradient">
        <NavigationBar user={user} onLogout={handleLogout} />
        <div className="flex min-h-[40vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p>Đang tải hồ sơ...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-gradient">
      <NavigationBar user={user} onLogout={handleLogout} />

      <div className="mx-auto max-w-4xl px-4 pb-10 pt-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hồ sơ học viên</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Quay lại
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Onboarding Summary */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Thông tin ban đầu</h2>
              <p className="text-sm text-gray-500">
                Dựa trên các câu trả lời khi bạn hoàn tất Cập nhật Hồ Sơ.
              </p>
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <button
                onClick={() => navigate("/onboarding")}
                className="rounded-md border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:border-blue-300 hover:text-blue-700"
              >
                Cập nhật Hồ sơ
              </button>
              <button
                onClick={() => {
                  if (editing) {
                    resetFormState();
                  }
                  setEditing((prev) => !prev);
                }}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  editing
                    ? "bg-gray-500 text-white hover:bg-gray-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {editing ? "Hủy" : "Chỉnh sửa"}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-20 w-20 flex-shrink-0">
              {basicInfo.avatarUrl ? (
                <img
                  src={basicInfo.avatarUrl}
                  alt={basicInfo.fullName || onboarding?.fullName || user?.fullName || "Avatar"}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600">
                  {(basicInfo.fullName || onboarding?.fullName || user?.fullName || "U").charAt(0)}
                </div>
              )}
            </div>
            <div className="w-full flex-1">
              <label className="text-xs font-semibold uppercase text-gray-500">Họ tên</label>
              {editing ? (
                <input
                  name="fullName"
                  value={basicInfo.fullName}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Nhập họ tên của bạn"
                />
              ) : (
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {basicInfo.fullName || onboarding?.fullName || user?.fullName || "Người dùng"}
                </p>
              )}
              {editing && (
                <div className="mt-3">
                  <label className="text-xs font-semibold uppercase text-gray-500">Đường dẫn ảnh</label>
                  <input
                    name="avatarUrl"
                    value={basicInfo.avatarUrl}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Dán liên kết ảnh đại diện hợp lệ (JPG, PNG...).</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Độ tuổi</p>
              <p className="mt-1 text-sm text-gray-800">
                {AGE_LABELS[onboarding?.age ?? ""] ?? "Chưa cập nhật"}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Công việc</p>
              <p className="mt-1 text-sm text-gray-800">
                {PROFESSION_LABELS[onboarding?.profession ?? ""] ?? "Chưa cập nhật"}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4 md:col-span-2">
              <p className="text-xs font-semibold uppercase text-gray-500">Cập nhật lần cuối</p>
              <p className="mt-1 text-sm text-gray-800">
                {onboarding?.savedAt
                  ? new Date(onboarding.savedAt).toLocaleString()
                  : "Chưa xác định"}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Trình độ tiếng Anh</label>
              {editing ? (
                <select
                  name="englishLevel"
                  value={formData.englishLevel || ""}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Chọn trình độ</option>
                  <option value="A1">Sơ cấp (A1)</option>
                  <option value="A2">Tiền trung cấp (A2)</option>
                  <option value="B1">Trung cấp (B1)</option>
                  <option value="B2">Trung cấp cao (B2)</option>
                  <option value="C1">Nâng cao (C1)</option>
                  <option value="C2">Thành thạo (C2)</option>
                </select>
              ) : (
                <p className="mt-1 text-sm text-gray-800">
                  {formData.englishLevel
                    ? ENGLISH_LEVEL_LABELS[formData.englishLevel] ?? formData.englishLevel
                    : "Chưa cập nhật"}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Mục tiêu học tập</label>
              {editing ? (
                <textarea
                  name="learningGoals"
                  value={formData.learningGoals || ""}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Mô tả mục tiêu học tập của bạn..."
                />
              ) : (
                <p className="mt-1 whitespace-pre-line text-sm text-gray-800">
                  {formData.learningGoals?.trim() ? formData.learningGoals : "Chưa cập nhật"}
                </p>
              )}
            </div>
          </div>

          {editing && (
            <div className="mt-6 flex justify-end gap-3 border-t pt-6">
              <button
                onClick={() => {
                  resetFormState();
                  setEditing(false);
                }}
                className="rounded-md border border-gray-300 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-green-500 px-6 py-2 text-sm font-medium text-white hover:bg-green-600"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đầy đủ</label>
                  <input
                    type="text"
                    value={basicInfo.fullName || user?.fullName || ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID học viên</label>
                  <input
                    type="text"
                    value={profile?.id ?? user?.id ?? ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Thống kê</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chuỗi luyện tập hiện tại</label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-md text-lg font-semibold text-blue-600">
                    {profile?.currentStreak || 0} ngày
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tổng giờ luyện tập</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md text-lg font-semibold text-green-600">
                    {profile?.totalPracticeHours || 0} giờ
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Điểm phát âm trung bình</label>
                  <div className="mt-1 rounded-md bg-purple-50 p-3 text-lg font-semibold text-purple-600">
                    {profile?.averagePronunciationScore != null
                      ? `${profile.averagePronunciationScore.toFixed(2)}%`
                      : "Chưa có"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mentor Info */}
          {profile?.mentorId && (
            <div className="mt-6 rounded-md bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                <strong>Mentor hiện tại:</strong> ID {profile.mentorId}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
