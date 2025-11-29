import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { MentorNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { mentorApi } from "../../../api/mentor.api";
import type { Mentor } from "../../../types/mentor";
import { learnerApi, type LearnerProfile } from "../../../api/learner.api";
import { sessionApi, type PracticeSession } from "../../../api/session.api";
import { pronunciationApi, type PronunciationScore } from "../../../api/pronunciation.api";

type MetricCard = {
  label: string;
  value: string;
  trend: number;
  helper: string;
};

type FeedbackEntry = {
  learnerName: string;
  score: number;
  delta: number;
  createdAt?: string | null;
};

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const getMonday = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // convert Sun(0) to 6
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const formatNumber = (value: number, fractionDigits = 0) =>
  value.toLocaleString("vi-VN", { maximumFractionDigits: fractionDigits, minimumFractionDigits: fractionDigits });

const formatTimeWindow = (session: PracticeSession) => {
  if (!session.startTime) return "--";
  const start = new Date(session.startTime);
  const end = session.endTime ? new Date(session.endTime) : null;
  const startText = start.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  if (!end) return startText;
  const endText = end.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  return `${startText} - ${endText}`;
};

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return "";
  const formatter = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });
  const now = Date.now();
  const value = new Date(iso).getTime();
  const diffMs = value - now;
  const diffMinutes = Math.round(diffMs / (1000 * 60));
  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(Math.round(diffMinutes), "minute");
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }
  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
};

const normalizePayload = <T,>(payload: unknown): T[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (typeof payload === "object" && payload !== null) {
    const maybePage = payload as { content?: T[] };
    if (Array.isArray(maybePage.content)) {
      return maybePage.content;
    }
  }
  return [];
};

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [mentorProfile, setMentorProfile] = useState<Mentor | null>(null);
  const [assignedLearners, setAssignedLearners] = useState<LearnerProfile[]>([]);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [missingProfile, setMissingProfile] = useState(false);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        setMissingProfile(false);
        let mentor: Mentor | null = null;
        try {
          mentor = await mentorApi.getByUserId(userId);
        } catch (apiErr) {
          const status = (apiErr as { status?: number })?.status;
          if (status === 404) {
            setMissingProfile(true);
            mentor = null;
          } else {
            throw apiErr;
          }
        }
        setMentorProfile(mentor);

        const mentorId = mentor?.id;
        const sessionPromise = mentorId != null ? sessionApi.getMentorSessions(mentorId) : Promise.resolve([]);

        const [learnerPayload, sessionPayload] = await Promise.all([
          learnerApi.getAll(0, 500),
          sessionPromise,
        ]);

        const mentorIdSafe = mentor?.id;
        const learnersAll = normalizePayload<LearnerProfile>(learnerPayload);
        const learners = mentorIdSafe != null ? learnersAll.filter((item) => item.mentorId === mentorIdSafe) : [];
        setAssignedLearners(learners);

        const mentorSessions = normalizePayload<PracticeSession>(sessionPayload);
        setSessions(mentorSessions);

        if (learners.length > 0) {
          const topLearnerIds = learners.slice(0, 3).map((l) => l.id);
          const feedbackResponses = await Promise.all(
            topLearnerIds.map((learnerId) => pronunciationApi.getScoresByLearner(learnerId, 0, 2).catch(() => null))
          );

          const learnerMap = new Map(learners.map((l) => [l.id, l]));
          const normalizedFeedback: FeedbackEntry[] = [];
          feedbackResponses.forEach((response, idx) => {
            const records = normalizePayload<PronunciationScore>(response);
            if (!records.length) return;
            const latest = records[0];
            const previous = records[1];
            const score = latest.scorePercentage ?? 0;
            const delta = previous ? score - (previous.scorePercentage ?? 0) : 0;
            normalizedFeedback.push({
              learnerName: learnerMap.get(topLearnerIds[idx])?.fullName ?? "Learner",
              score,
              delta,
              createdAt: latest.createdAt ?? null,
            });
          });
          setFeedback(normalizedFeedback);
        } else {
          setFeedback([]);
        }
      } catch (err) {
        console.error("Failed to load mentor dashboard", err);
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [user?.id]);

  const { weekStart, weekEnd, prevWeekStart, prevWeekEnd } = useMemo(() => {
    const start = getMonday();
    return {
      weekStart: start,
      weekEnd: addDays(start, 7),
      prevWeekStart: addDays(start, -7),
      prevWeekEnd: start,
    };
  }, []);

  const sessionsThisWeek = useMemo(
    () =>
      sessions.filter((session) => {
        if (!session.startTime) return false;
        const start = new Date(session.startTime);
        return start >= weekStart && start < weekEnd;
      }),
    [sessions, weekStart, weekEnd]
  );

  const sessionsPrevWeek = useMemo(
    () =>
      sessions.filter((session) => {
        if (!session.startTime) return false;
        const start = new Date(session.startTime);
        return start >= prevWeekStart && start < prevWeekEnd;
      }),
    [sessions, prevWeekStart, prevWeekEnd]
  );

  const hoursTotals = useMemo(() => {
    const computeHours = (collection: PracticeSession[]) =>
      collection.reduce((sum, session) => {
        const minutes = session.durationMinutes ?? session.duration ?? 0;
        if (minutes) {
          return sum + minutes / 60;
        }
        if (session.startTime && session.endTime) {
          const diffMs = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
          return sum + Math.max(diffMs, 0) / (1000 * 60 * 60);
        }
        return sum;
      }, 0);
    return {
      total: computeHours(sessions),
      thisWeek: computeHours(sessionsThisWeek),
      prevWeek: computeHours(sessionsPrevWeek),
    };
  }, [sessions, sessionsThisWeek, sessionsPrevWeek]);

  const learnersThisMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return assignedLearners.filter((learner) => {
      if (!learner.createdAt) return false;
      const created = new Date(learner.createdAt);
      return created >= start;
    }).length;
  }, [assignedLearners]);

  const learnersLastMonth = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return assignedLearners.filter((learner) => {
      if (!learner.createdAt) return false;
      const created = new Date(learner.createdAt);
      return created >= start && created < end;
    }).length;
  }, [assignedLearners]);

  const metricCards: MetricCard[] = [
    {
      label: "Tổng học viên",
      value: formatNumber(assignedLearners.length),
      trend: learnersThisMonth - learnersLastMonth,
      helper: "So với tháng trước",
    },
    {
      label: "Phiên học tuần này",
      value: formatNumber(sessionsThisWeek.length),
      trend: sessionsThisWeek.length - sessionsPrevWeek.length,
      helper: "So với tuần trước",
    },
    {
      label: "Tổng giờ dạy",
      value: formatNumber(hoursTotals.total, 1) + " giờ",
      trend: hoursTotals.thisWeek - hoursTotals.prevWeek,
      helper: "Giờ dạy tuần này so với tuần trước",
    },
    {
      label: "Đánh giá trung bình",
      value: mentorProfile?.rating ? mentorProfile.rating.toFixed(1) + "/5" : "--/5",
      trend: 0,
      helper: "Thay đổi dựa trên đánh giá mới nhất",
    },
  ];

  const sessionsByDay = useMemo(() => {
    const map = new Map<number, number>();
    sessionsThisWeek.forEach((session) => {
      if (!session.startTime) return;
      const date = new Date(session.startTime);
      const idx = (date.getDay() + 6) % 7;
      map.set(idx, (map.get(idx) ?? 0) + 1);
    });
    return WEEKDAY_LABELS.map((label, idx) => ({ day: label, value: map.get(idx) ?? 0 }));
  }, [sessionsThisWeek]);

  const learnerGrowthData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }).map((_, index) => {
      const monthOffset = 5 - index;
      const start = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - monthOffset + 1, 1);
      const label = `T${start.getMonth() + 1}`;
      const cumulative = assignedLearners.filter((learner) => {
        if (!learner.createdAt) return true;
        const created = new Date(learner.createdAt);
        return created < end;
      }).length;
      return { label, value: cumulative };
    });
  }, [assignedLearners]);

  const upcomingSessions = useMemo(() => {
    const sorted = [...sessions]
      .filter((session) => session.startTime && new Date(session.startTime) > new Date())
      .sort((a, b) => new Date(a.startTime as string).getTime() - new Date(b.startTime as string).getTime());
    return sorted.slice(0, 3);
  }, [sessions]);

  const resources = [
    {
      label: "Phiên học",
      description: "Xem lịch sử, ghi chú và phản hồi chi tiết.",
      action: () => navigate("/sessions"),
    },
    {
      label: "Thư viện chủ đề",
      description: "Lựa chọn tình huống luyện nói phù hợp cho buổi tiếp theo.",
      action: () => navigate("/topics"),
    },
    {
      label: "Quản lý học viên",
      description: "Theo dõi hồ sơ và tiến độ học tập của từng học viên.",
      action: () => navigate("/admin/learners"),
    },
  ];

  const renderTrend = (trend: number) => (
    <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
      {trend >= 0 ? "+" : ""}
      {formatNumber(trend, Math.abs(trend) < 1 ? 1 : 0)}
    </span>
  );

  return (
    <div className="page-gradient min-h-screen">
      <MentorNavbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Dashboard</p>
            <h1 className="text-3xl font-bold text-slate-800">Chào mừng trở lại, {user?.fullName || "Mentor"}!</h1>
            <p className="mt-1 text-slate-500">Theo dõi tiến độ học viên và chuẩn bị cho các phiên dạy trong tuần.</p>
          </div>
          {mentorProfile && (
            <div className="rounded-2xl bg-white/80 px-5 py-3 shadow-sm">
              <p className="text-sm text-slate-500">Mã mentor</p>
              <p className="text-lg font-semibold text-slate-800">#{mentorProfile.id}</p>
            </div>
          )}
        </header>

        {missingProfile && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Không tìm thấy hồ sơ mentor cho tài khoản này. Vui lòng liên hệ quản trị viên để được cấp quyền.
          </p>
        )}
        {error && <p className="mb-4 rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((card) => (
            <div key={card.label} className="rounded-2xl border border-slate-100 bg-white/85 p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{card.label}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-slate-800">{card.value}</p>
                {renderTrend(card.trend)}
              </div>
              <p className="mt-1 text-xs text-slate-400">{card.helper}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Phiên học trong tuần</p>
                <p className="text-xs text-slate-400">Dữ liệu dựa trên lịch session thực tế</p>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionsByDay} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip cursor={{ fill: "rgba(59,130,246,0.08)" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Tăng trưởng học viên</p>
                <p className="text-xs text-slate-400">Cộng dồn theo tháng từ dữ liệu learner</p>
              </div>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={learnerGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" stroke="#94a3b8" />
                  <YAxis allowDecimals={false} stroke="#94a3b8" />
                  <Tooltip cursor={{ stroke: "#6366f1" }} />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Phiên học sắp tới</p>
                <p className="text-xs text-slate-400">Danh sách được lấy từ sessions của mentor</p>
              </div>
              <button onClick={() => navigate("/sessions")} className="text-sm font-semibold text-blue-600">Xem tất cả</button>
            </div>
            <div className="mt-5 space-y-4">
              {upcomingSessions.length === 0 && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Chưa có phiên học nào trong lịch tới.</p>
              )}
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {session.topic || session.topicName || "Phiên luyện nói"}
                    </p>
                    <p className="text-xs text-slate-500">{formatRelativeTime(session.startTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">{formatTimeWindow(session)}</p>
                    <p className="text-xs text-slate-500">Mã học viên #{session.learnerId ?? "--"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">Phản hồi gần đây</p>
                <p className="text-xs text-slate-400">Lấy từ pronunciation scores của học viên</p>
              </div>
              <button onClick={() => navigate("/admin/learners")} className="text-sm font-semibold text-blue-600">
                Xem tất cả
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {feedback.length === 0 && (
                <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">Chưa có phản hồi nào được ghi nhận.</p>
              )}
              {feedback.map((item, idx) => (
                <div key={`${item.learnerName}-${idx}`} className="rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{item.learnerName}</p>
                    <span className="text-sm font-semibold text-slate-700">{formatNumber(item.score, 1)} điểm</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.createdAt ? formatRelativeTime(item.createdAt) : "Vừa cập nhật"}</span>
                    <span className={item.delta >= 0 ? "text-emerald-600" : "text-rose-500"}>
                      {item.delta >= 0 ? "+" : ""}
                      {formatNumber(item.delta, 1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600">Quick actions</h3>
            <div className="mt-4 space-y-2">
              {resources.map((resource) => (
                <button
                  key={resource.label}
                  onClick={resource.action}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-left text-sm text-slate-600 transition hover:-translate-y-0.5 hover:bg-blue-50/80"
                >
                  <div>
                    <p className="font-semibold text-slate-700">{resource.label}</p>
                    <p className="text-xs text-slate-500">{resource.description}</p>
                  </div>
                  <span className="text-blue-600">→</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/85 p-6 shadow-sm lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-600">Ghi chú nhanh</h3>
            <p className="mt-2 text-xs text-slate-400">
              Mọi dữ liệu hiển thị ở dashboard đều đến từ API backend (learners, practice sessions, pronunciation scores).
            </p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
              <li>Lịch dạy cập nhật tự động dựa trên sessions được mentor gán.</li>
              <li>Biểu đồ được dựng bằng Recharts và đồng bộ với dữ liệu thật.</li>
              <li>Các chỉ số so sánh thay đổi dựa trên tuần hoặc tháng trước.</li>
            </ul>
          </div>
        </section>

        {loading && <p className="mt-6 text-center text-sm text-slate-500">Đang tải dữ liệu thực từ hệ thống...</p>}
      </main>
    </div>
  );
};

export default MentorDashboard;
