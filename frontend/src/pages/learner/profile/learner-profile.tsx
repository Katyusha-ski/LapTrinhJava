import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { learnerApi, type LearnerProfile, type UpdateLearnerRequest } from "../../../api/learner.api";
import { authApi } from "../../../api/auth.api";

export default function LearnerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateLearnerRequest>({
    englishLevel: "",
    learningGoals: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = authApi.getLocalUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const data = await learnerApi.getByUserId(user.id);
      setProfile(data);
      if (data) {
        setFormData({
          englishLevel: data.englishLevel || "",
          learningGoals: data.learningGoals || "",
        });
      }
    } catch (err) {
      setError("Không thể tải hồ sơ. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);
      if (!profile) return;

      const updated = await learnerApi.update(profile.id, formData);
      setProfile(updated);
      setSuccess("Hồ sơ được cập nhật thành công!");
      setEditing(false);
    } catch (err) {
      setError("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Không tìm thấy hồ sơ học viên</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
                    value={profile.fullName || ""}
                    disabled
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID học viên</label>
                  <input
                    type="text"
                    value={profile.id}
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
                    {profile.currentStreak || 0} ngày
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tổng giờ luyện tập</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md text-lg font-semibold text-green-600">
                    {profile.totalPracticeHours || 0} giờ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Editable Info */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Thông tin học tập</h2>
              <button
                onClick={() => setEditing(!editing)}
                className={`px-4 py-2 rounded font-medium transition ${
                  editing
                    ? "bg-gray-500 hover:bg-gray-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {editing ? "Hủy" : "Chỉnh sửa"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Trình độ tiếng Anh</label>
                <select
                  name="englishLevel"
                  value={formData.englishLevel || ""}
                  onChange={handleChange}
                  disabled={!editing}
                  className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    !editing ? "bg-gray-100 text-gray-600" : "bg-white"
                  }`}
                >
                  <option value="">Chọn trình độ</option>
                  <option value="BEGINNER">Sơ cấp (A1-A2)</option>
                  <option value="INTERMEDIATE">Trung cấp (B1-B2)</option>
                  <option value="ADVANCED">Nâng cao (C1-C2)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Điểm phát âm trung bình</label>
                <input
                  type="text"
                  value={
                    profile.averagePronunciationScore
                      ? `${profile.averagePronunciationScore.toFixed(2)}%`
                      : "Chưa có"
                  }
                  disabled
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Mục tiêu học tập</label>
              <textarea
                name="learningGoals"
                value={formData.learningGoals || ""}
                onChange={handleChange}
                disabled={!editing}
                rows={4}
                className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  !editing ? "bg-gray-100 text-gray-600" : "bg-white"
                }`}
                placeholder="Mô tả mục tiêu học tập của bạn..."
              />
            </div>

            {/* Mentor Info */}
            {profile.mentorId && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700">
                  <strong>Mentor hiện tại:</strong> ID {profile.mentorId}
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <div className="mt-6 flex gap-3 justify-end border-t pt-6">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium"
              >
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
