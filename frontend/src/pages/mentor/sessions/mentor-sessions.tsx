import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MentorNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { mentorApi } from "../../../api/mentor.api";
import { sessionApi, type PracticeSession, type SessionStatus } from "../../../api/session.api";
import type { Mentor } from "../../../types/mentor";

const STATUS_ORDER: SessionStatus[] = [
  "PENDING",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "REJECTED",
];

const statusLabels: Record<SessionStatus, string> = {
  PENDING: "Chờ duyệt",
  SCHEDULED: "Đã xác nhận",
  IN_PROGRESS: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REJECTED: "Đã từ chối",
};

const statusBadgeClass: Record<SessionStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-rose-100 text-rose-700",
  REJECTED: "bg-slate-200 text-slate-700",
};

const normalizeSessions = (payload: unknown): PracticeSession[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as PracticeSession[];
  if (typeof payload === "object" && payload !== null) {
    const maybePage = payload as { content?: PracticeSession[] };
    if (Array.isArray(maybePage.content)) {
      return maybePage.content;
    }
  }
  return [];
};

const normalizeStatus = (raw?: string | null): SessionStatus | undefined => {
  if (!raw) return undefined;
  const upper = raw.toUpperCase() as SessionStatus;
  return STATUS_ORDER.includes(upper) ? upper : undefined;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "Chưa đặt";
  return new Date(value).toLocaleString("vi-VN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MentorSessionsPage = () => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);
  const [actionSessionId, setActionSessionId] = useState<number | null>(null);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const loadSessions = useCallback(async () => {
    if (!user?.id) {
      setSessions([]);
      return;
    }

    setLoading(true);
    setError(null);
    setMissingProfile(false);

    try {
      let mentor: Mentor | null = null;
      try {
        mentor = await mentorApi.getByUserId(user.id);
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          setMissingProfile(true);
          setSessions([]);
          return;
        }
        throw err;
      }

      setMentorProfile(mentor);
      if (!mentor?.id) {
        setSessions([]);
        return;
      }

      const payload = await sessionApi.getMentorSessions(mentor.id);
      const list = normalizeSessions(payload);
      list.sort((a, b) => {
        const statusA = normalizeStatus(a.sessionStatus || a.status) ?? "PENDING";
        const statusB = normalizeStatus(b.sessionStatus || b.status) ?? "PENDING";
        const statusDiff = STATUS_ORDER.indexOf(statusA) - STATUS_ORDER.indexOf(statusB);
        if (statusDiff !== 0) return statusDiff;
        const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return dateA - dateB;
      });
      setSessions(list);
    } catch (err) {
      console.error("Failed to load mentor sessions", err);
      setError("Không thể tải danh sách buổi học. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  const pendingSessions = useMemo(
    () =>
      sessions.filter((session) => (normalizeStatus(session.sessionStatus || session.status) ?? "PENDING") === "PENDING"),
    [sessions]
  );

  const approvedUpcoming = useMemo(
    () =>
      sessions.filter((session) => {
        const status = normalizeStatus(session.sessionStatus || session.status);
        if (status !== "SCHEDULED" && status !== "IN_PROGRESS") {
          return false;
        }
        if (!session.startTime) return false;
        return new Date(session.startTime) >= new Date();
      }),
    [sessions]
  );

  const handleDecision = async (sessionId: number, decision: "approve" | "reject") => {
    try {
      setActionSessionId(sessionId);
      setError(null);
      const targetStatus: SessionStatus = decision === "approve" ? "SCHEDULED" : "REJECTED";
      await sessionApi.updateSessionStatus(sessionId, targetStatus);
      await loadSessions();
    } catch (err) {
      console.error("Failed to update session status", err);
      setError("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setActionSessionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-sky-50">
      <MentorNavbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-sm uppercase tracking-wide text-slate-500">Mentor workspace</p>
          <h1 className="text-3xl font-bold text-slate-900">Phê duyệt buổi học</h1>
          <p className="mt-2 text-slate-600">
            Xem nhanh các lịch luyện tập do học viên gửi và xác nhận để khóa lịch dạy của bạn.
          </p>
        </header>

        {missingProfile && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
            Không tìm thấy hồ sơ mentor cho tài khoản này. Liên hệ quản trị viên để được cấp quyền trước khi xem lịch.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Đang chờ duyệt</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{pendingSessions.length}</p>
            <p className="mt-1 text-xs text-slate-500">Buổi học cần hành động ngay</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sắp diễn ra</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">{approvedUpcoming.length}</p>
            <p className="mt-1 text-xs text-slate-500">Buổi đã xác nhận trong tương lai</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mã mentor</p>
            <p className="mt-3 text-3xl font-bold text-slate-900">#{mentorProfile?.id ?? "--"}</p>
            <p className="mt-1 text-xs text-slate-500">Hiển thị cho học viên khi họ đặt lịch</p>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-500"></div>
              <p className="text-sm text-slate-500">Đang tải phiên học...</p>
            </div>
          </div>
        ) : (
          <>
            <section className="mb-10 rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Yêu cầu mới</p>
                  <p className="text-xs text-slate-500">Các lịch học viên vừa gửi tới bạn</p>
                </div>
                {pendingSessions.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {pendingSessions.length} yêu cầu chờ duyệt
                  </span>
                )}
              </div>

              {pendingSessions.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Hiện chưa có yêu cầu mới. Khi học viên gửi lịch, chúng sẽ xuất hiện ở đây để bạn xác nhận.
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingSessions.map((session) => (
                    <div key={session.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {session.learnerName || `Học viên #${session.learnerId ?? "--"}`}
                          </p>
                          <p className="text-xs text-slate-500">{formatDateTime(session.startTime)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass.PENDING}`}>
                          {statusLabels.PENDING}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-slate-600">
                        <p className="font-medium text-slate-700">
                          Chủ đề: {session.topicName || session.topic || "Chưa chọn"}
                        </p>
                        {session.notes && (
                          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-500">Ghi chú: {session.notes}</p>
                        )}
                      </div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          disabled={actionSessionId === session.id}
                          onClick={() => handleDecision(session.id, "approve")}
                          className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {actionSessionId === session.id ? "Đang xác nhận..." : "Chấp nhận"}
                        </button>
                        <button
                          type="button"
                          disabled={actionSessionId === session.id}
                          onClick={() => handleDecision(session.id, "reject")}
                          className="flex-1 rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Tất cả buổi học</p>
                  <p className="text-xs text-slate-500">Bao gồm cả lịch đã xác nhận và lịch trong quá khứ</p>
                </div>
                <button
                  type="button"
                  onClick={() => loadSessions()}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Làm mới
                </button>
              </div>

              {sessions.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                  Bạn chưa có buổi học nào trong hệ thống.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Học viên</th>
                        <th className="px-4 py-3">Chủ đề</th>
                        <th className="px-4 py-3">Thời gian</th>
                        <th className="px-4 py-3">Trạng thái</th>
                        <th className="px-4 py-3 text-right">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessions.map((session) => {
                        const status = normalizeStatus(session.sessionStatus || session.status) ?? "PENDING";
                        return (
                          <tr key={session.id}>
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {session.learnerName || `Học viên #${session.learnerId ?? "--"}`}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {session.topicName || session.topic || "Chưa chọn"}
                            </td>
                            <td className="px-4 py-3 text-slate-600">{formatDateTime(session.startTime)}</td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass[status]}`}>
                                {statusLabels[status]}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {status === "PENDING" ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    disabled={actionSessionId === session.id}
                                    onClick={() => handleDecision(session.id, "approve")}
                                    className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Chấp nhận
                                  </button>
                                  <button
                                    type="button"
                                    disabled={actionSessionId === session.id}
                                    onClick={() => handleDecision(session.id, "reject")}
                                    className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">--</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default MentorSessionsPage;
