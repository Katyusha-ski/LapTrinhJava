import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi } from "../../api/session.api";
import { learnerApi } from "../../api/learner.api";
import { NavigationBar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";

interface Session {
  id: number;
  learnerId?: number;
  mentorId?: number;
  topicId?: number;
  startTime?: string;
  endTime?: string;
  duration?: number;
  status?: string;
  notes?: string;
  feedback?: string;
  createdAt?: string;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newSession, setNewSession] = useState({
    topicId: "",
    notes: "",
  });

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        handleLogout();
        return;
      }

      // Get learner profile to get learnerId
      const learner = await learnerApi.getByUserId(user.id);
      if (!learner) {
        setError("Không tìm thấy thông tin học viên");
        return;
      }

      // Get sessions for this learner
      const data = await sessionApi.getLearnerSessions(learner.id);
      setSessions(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError("Không thể tải danh sách buổi học. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, handleLogout]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!user?.id) {
        handleLogout();
        return;
      }

      const learner = await learnerApi.getByUserId(user.id);
      if (!learner) {
        setError("Không tìm thấy thông tin học viên");
        return;
      }

      await sessionApi.createSession({
        learnerId: learner.id,
        topicId: newSession.topicId ? parseInt(newSession.topicId) : null,
        notes: newSession.notes,
        status: "SCHEDULED",
      });

      setNewSession({ topicId: "", notes: "" });
      setShowCreateForm(false);
      await loadSessions();
    } catch (err) {
      setError("Không thể tạo buổi học. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleStatusChange = async (sessionId: number, newStatus: string) => {
    try {
      setError(null);
      await sessionApi.updateSessionStatus(sessionId, newStatus);
      await loadSessions();
    } catch (err) {
      setError("Không thể cập nhật trạng thái buổi học.");
      console.error(err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa buổi học này?")) {
      return;
    }

    try {
      setError(null);
      await sessionApi.deleteSession(sessionId);
      await loadSessions();
    } catch (err) {
      setError("Không thể xóa buổi học. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status?: string) => {
    const labels: Record<string, string> = {
      SCHEDULED: "Đã lên lịch",
      IN_PROGRESS: "Đang tiến hành",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
    };
    return labels[status || ""] || status || "Không xác định";
  };

  if (loading) {
    return (
      <div className="page-gradient">
        <NavigationBar user={user} onLogout={handleLogout} />
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
            <p>Đang tải danh sách buổi học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-gradient">
      <NavigationBar user={user} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buổi học luyện tập</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              + Tạo buổi học mới
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tạo buổi học mới</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chủ đề (không bắt buộc)</label>
                <input
                  type="number"
                  value={newSession.topicId}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, topicId: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ID của chủ đề"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                <textarea
                  value={newSession.notes}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, notes: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Ghi chú về buổi học..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Tạo buổi học
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Chưa có buổi học nào</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Tạo buổi học đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Buổi học #{session.id}</h3>
                    <p className="text-sm text-gray-500">
                      {session.createdAt
                        ? new Date(session.createdAt).toLocaleDateString("vi-VN")
                        : "Không xác định"}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                    {getStatusLabel(session.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-sm text-gray-600">
                  {session.topicId && (
                    <p>
                      <strong>Chủ đề ID:</strong> {session.topicId}
                    </p>
                  )}
                  {session.duration && (
                    <p>
                      <strong>Thời lượng:</strong> {session.duration} phút
                    </p>
                  )}
                  {session.notes && (
                    <p>
                      <strong>Ghi chú:</strong> {session.notes}
                    </p>
                  )}
                </div>

                {session.status === "SCHEDULED" && (
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => handleStatusChange(session.id, "IN_PROGRESS")}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Bắt đầu
                    </button>
                    <button
                      onClick={() => handleStatusChange(session.id, "CANCELLED")}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                    >
                      Hủy
                    </button>
                  </div>
                )}

                {session.status === "IN_PROGRESS" && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleStatusChange(session.id, "COMPLETED")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Kết thúc buổi học
                    </button>
                  </div>
                )}

                {session.status === "COMPLETED" && session.feedback && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-blue-900">Phản hồi:</p>
                    <p className="text-sm text-blue-700 mt-1">{session.feedback}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
