import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { sessionApi, type PracticeSession, type SessionStatus } from "../../api/session.api";
import { learnerApi, type LearnerProfile } from "../../api/learner.api";
import { mentorApi } from "../../api/mentor.api";
import { LearnerNavbar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";
import { topicApi, type Topic } from "../../api/topic.api";
import type { Mentor } from "../../types/mentor";

type TopicLike = Topic & {
  name?: string | null;
  topic_name?: string | null;
  cefr_level?: string | null;
  cefrLevel?: string | null;
};

const resolveTopicTitle = (topic?: Topic | null): string => {
  if (!topic) return "";
  const extended = topic as TopicLike;
  return (
    extended.title?.trim() ||
    extended.name?.trim() ||
    extended.topic_name?.trim() ||
    (extended.id ? `Chủ đề #${extended.id}` : "")
  );
};

const resolveTopicLevel = (topic?: Topic | null): string => {
  if (!topic) return "";
  const extended = topic as TopicLike;
  const rawLevel = extended.level || extended.cefr_level || extended.cefrLevel;
  return rawLevel ? rawLevel.toUpperCase() : "";
};

type Session = PracticeSession & {
  feedback?: string | null;
};

export default function SessionsPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [mentorInfo, setMentorInfo] = useState<Mentor | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
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
      setLearnerProfile(learner);
      if (learner.mentorId) {
        setSelectedMentorId(String(learner.mentorId));
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

  const loadTopics = useCallback(async () => {
    try {
      setTopicsLoading(true);
      let list = await topicApi.list();
      if (!list.length) {
        list = await topicApi.listAll();
      }
      setTopics(list);
    } catch (err) {
      console.error("Không thể tải danh sách chủ đề", err);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!learnerProfile?.mentorId) {
      setMentorInfo(null);
      setSelectedMentorId("");
      return;
    }

    let cancelled = false;
    const mentorId = learnerProfile.mentorId;
    const loadMentor = async () => {
      try {
        setMentorLoading(true);
        const mentor = await mentorApi.getById(mentorId);
        if (!cancelled) {
          setMentorInfo(mentor);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Không thể tải thông tin mentor", err);
          setMentorInfo(null);
        }
      } finally {
        if (!cancelled) {
          setMentorLoading(false);
        }
      }
    };

    void loadMentor();
    return () => {
      cancelled = true;
    };
  }, [learnerProfile?.mentorId]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const topicLookup = useMemo(() => {
    const map = new Map<number, Topic>();
    topics.forEach((topic) => {
      if (typeof topic.id === "number") {
        map.set(topic.id, topic);
      }
    });
    return map;
  }, [topics]);

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

      if (!selectedMentorId) {
        setError("Bạn cần chọn mentor trước khi đặt lịch.");
        return;
      }

      await sessionApi.createSession({
        learnerId: learner.id,
        topicId: newSession.topicId ? parseInt(newSession.topicId) : null,
        notes: newSession.notes,
        mentorId: parseInt(selectedMentorId, 10),
        type: "MENTOR_LED",
        startTime: formatDateForApi(new Date()),
      });

      setNewSession({ topicId: "", notes: "" });
      setShowCreateForm(false);
      await loadSessions();
    } catch (err) {
      setError("Không thể tạo buổi học. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleStatusChange = async (sessionId: number, newStatus: SessionStatus) => {
    try {
      setError(null);
      const session = sessions.find((item) => item.id === sessionId);
      const currentStatus = normalizeStatus(session?.sessionStatus || session?.status);

      if (!currentStatus) {
        setError("Không xác định được trạng thái hiện tại của buổi học.");
        return;
      }

      if (newStatus === "IN_PROGRESS" && currentStatus !== "SCHEDULED") {
        setError("Buổi học cần mentor xác nhận trước khi bạn có thể bắt đầu.");
        return;
      }

      if (newStatus === "COMPLETED" && currentStatus !== "IN_PROGRESS") {
        setError("Chỉ có thể kết thúc buổi học đang diễn ra.");
        return;
      }

      await sessionApi.updateSessionStatus(sessionId, newStatus);
      await loadSessions();
    } catch (err) {
      console.error(err);
      setError("Không thể cập nhật trạng thái buổi học.");
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

  const getStatusColor = (status?: SessionStatus) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-800";
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REJECTED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusLabels: Record<SessionStatus, string> = {
    PENDING: "Chờ mentor duyệt",
    SCHEDULED: "Đã xác nhận",
    IN_PROGRESS: "Đang diễn ra",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    REJECTED: "Mentor từ chối",
  };

  const getStatusLabel = (status?: SessionStatus) => (status ? statusLabels[status] : "Không xác định");

  const normalizeStatus = (raw?: string | null): SessionStatus | undefined => {
    if (!raw) return undefined;
    const upper = raw.toUpperCase() as SessionStatus;
    const allowed: SessionStatus[] = [
      "PENDING",
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ];
    return allowed.includes(upper) ? upper : undefined;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
        <LearnerNavbar user={user} onLogout={handleLogout} />
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
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />

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

        {learnerProfile && (
          learnerProfile.mentorId ? (
            <div className="mb-6 rounded-2xl border border-blue-100 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-semibold text-blue-600">Mentor đồng hành</p>
              <p className="text-lg font-bold text-gray-900">{mentorInfo?.fullName || `Mentor #${learnerProfile.mentorId}`}</p>
              <p className="text-sm text-gray-600">
                Mỗi lịch luyện tập mới sẽ được gửi cho mentor này để xác nhận trước khi bắt đầu.
              </p>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
              <p className="text-sm font-semibold text-amber-700">Bạn chưa có mentor</p>
              <p className="text-sm text-amber-700">Hãy chọn mentor ở trang lựa chọn mentor để có thể đặt lịch.</p>
              <button
                type="button"
                onClick={() => navigate("/mentor-selection")}
                className="mt-3 rounded-md bg-amber-500 px-3 py-2 text-white text-sm font-semibold hover:bg-amber-600"
              >
                Đi tới chọn mentor
              </button>
            </div>
          )
        )}

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
              {learnerProfile?.mentorId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mentor</label>
                  <select
                    value={selectedMentorId}
                    onChange={(e) => setSelectedMentorId(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Chọn mentor</option>
                    <option value={learnerProfile.mentorId}>{mentorInfo?.fullName || `Mentor #${learnerProfile.mentorId}`}</option>
                  </select>
                  {mentorLoading && <p className="mt-1 text-xs text-gray-500">Đang tải thông tin mentor...</p>}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Chủ đề (không bắt buộc)</label>
                <select
                  value={newSession.topicId}
                  onChange={(e) => setNewSession((prev) => ({ ...prev, topicId: e.target.value }))}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Chưa chọn</option>
                  {topics.map((topic) => {
                    const label = resolveTopicTitle(topic);
                    const level = resolveTopicLevel(topic);
                    return (
                      <option key={topic.id} value={topic.id}>
                        {label} {level ? `· CEFR ${level}` : ""}
                      </option>
                    );
                  })}
                </select>
                {topicsLoading && <p className="mt-1 text-xs text-gray-500">Đang tải chủ đề...</p>}
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
                  disabled={!learnerProfile?.mentorId}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Gửi lịch cho mentor
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Hủy
                </button>
              </div>
              <p className="text-center text-xs text-gray-500">
                Mentor sẽ nhận được thông báo và xác nhận lịch trước khi buổi học diễn ra.
              </p>
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
            {sessions.map((session) => {
              const topicInfo = session.topicId ? topicLookup.get(session.topicId) : null;
              const topicTitle = resolveTopicTitle(topicInfo);
              const topicLevel = resolveTopicLevel(topicInfo);
              const status = normalizeStatus(session.sessionStatus || session.status) ?? "PENDING";
              return (
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
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-sm text-gray-600">
                  {session.topicId && (
                    <div>
                      <p className="font-semibold text-gray-800">Chủ đề</p>
                      <p>
                        {topicTitle || `#${session.topicId}`}
                        {topicLevel && (
                          <span className="ml-1 text-xs text-gray-500">· CEFR {topicLevel}</span>
                        )}
                      </p>
                    </div>
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

                {status === "PENDING" && (
                  <div className="mb-4 rounded-md border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700">
                    Lịch đang chờ mentor xác nhận. Bạn sẽ nhận được thông báo khi được chấp nhận.
                  </div>
                )}

                {status === "REJECTED" && (
                  <div className="mb-4 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
                    Mentor đã từ chối yêu cầu này. Hãy tạo buổi học mới với ghi chú khác nếu cần.
                  </div>
                )}

                {status === "SCHEDULED" && (
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

                {status === "IN_PROGRESS" && (
                  <div className="mb-4">
                    <button
                      onClick={() => handleStatusChange(session.id, "COMPLETED")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Kết thúc buổi học
                    </button>
                  </div>
                )}

                {status === "COMPLETED" && session.feedback && (
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateForApi(date: Date) {
  const pad = (num: number) => num.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}
