import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LearnerNavbar } from "../../../components/layout";
import { learnerApi } from "../../../api/learner.api";
import { sessionApi, type PracticeSession, type SessionStatus } from "../../../api/session.api";
import { useAuth } from "../../../context/AuthContext";

interface LearnerMetrics {
  currentStreak: number;
  averagePronunciationScore: number | null;
}

const statusLabels: Record<SessionStatus, string> = {
  PENDING: "Chờ mentor duyệt",
  SCHEDULED: "Đã xác nhận",
  IN_PROGRESS: "Đang diễn ra",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  REJECTED: "Bị từ chối",
};

const normalizeStatus = (raw?: string | null): SessionStatus | undefined => {
  if (!raw) return undefined;
  const upper = raw.toUpperCase() as SessionStatus;
  const allowed: SessionStatus[] = ["PENDING", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "REJECTED"];
  return allowed.includes(upper) ? upper : undefined;
};

const isInCurrentWeek = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = now.getDay() === 0 ? 7 : now.getDay();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - (day - 1));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return date >= startOfWeek && date < endOfWeek;
};

const formatSessionDate = (value?: string | null) => {
  if (!value) return "Chưa có thời gian";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có thời gian";
  return date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
};

const LearnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [metrics, setMetrics] = useState<LearnerMetrics | null>(null);
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [sessionsThisWeek, setSessionsThisWeek] = useState<number | null>(null);
  const [recentSessions, setRecentSessions] = useState<PracticeSession[]>([]);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const loadSessionSummaries = useCallback(async (learnerId: number) => {
    const response = await sessionApi.getLearnerSessions(learnerId);
    const list: PracticeSession[] = Array.isArray(response)
      ? response
      : response
        ? [response]
        : [];

    if (!list.length) {
      return { weekCount: null, recent: [] };
    }

    const weekCount = list.filter((session) => isInCurrentWeek(session.startTime)).length;
    const recent = [...list]
      .sort((a, b) => {
        const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
        const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 3);

    return { weekCount, recent };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const completed = window.sessionStorage.getItem("aesp_onboarding_complete");
    if (completed === "true") {
      setShowOnboardingBanner(true);
      window.sessionStorage.removeItem("aesp_onboarding_complete");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      if (!user?.id || !user.roles?.includes("LEARNER")) {
        if (isMounted) {
          setMetrics(null);
          setSessionsThisWeek(null);
          setRecentSessions([]);
        }
        return;
      }

      try {
        const profile = await learnerApi.getByUserId(user.id);
        if (!isMounted) return;

        if (profile) {
          setMetrics({
            currentStreak: profile.currentStreak ?? 0,
            averagePronunciationScore: profile.averagePronunciationScore ?? null,
          });

          try {
            const { weekCount, recent } = await loadSessionSummaries(profile.id);
            if (!isMounted) return;
            setSessionsThisWeek(weekCount);
            setRecentSessions(recent);
          } catch (sessionErr) {
            console.error("Failed to load learner sessions", sessionErr);
            if (isMounted) {
              setSessionsThisWeek(null);
              setRecentSessions([]);
            }
          }
        } else {
          setMetrics({ currentStreak: 0, averagePronunciationScore: null });
          setSessionsThisWeek(null);
          setRecentSessions([]);
        }
      } catch (err) {
        console.error("Failed to load learner metrics", err);
        if (isMounted) {
          setMetrics({ currentStreak: 0, averagePronunciationScore: null });
          setSessionsThisWeek(null);
          setRecentSessions([]);
        }
      }
    };

    void loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.roles, loadSessionSummaries]);

  const dayStreak = metrics?.currentStreak ?? 0;
  const averageScore = metrics?.averagePronunciationScore;
  const averageScoreDisplay = averageScore != null ? `${averageScore.toFixed(1)}%` : "--";
  const sessionsThisWeekDisplay = sessionsThisWeek && sessionsThisWeek > 0 ? sessionsThisWeek.toString() : "--";
  const leaderboardName = user?.fullName || "Learner";

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showOnboardingBanner && (
          <div className="mb-6 flex items-start justify-between rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800">
            <div>
              <p className="text-base font-semibold">Hồ sơ luyện tập của bạn đã hoàn tất!</p>
              <p className="text-sm text-green-700">Bắt đầu chọn mentor hoặc tham gia bài luyện nói ngay bây giờ.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowOnboardingBanner(false)}
              className="ml-4 rounded-md border border-green-300 px-3 py-1 text-sm font-semibold text-green-700 transition hover:bg-green-100"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Welcome */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Welcome back, {user?.fullName || "Learner"} <span className="inline-block">👋</span>
            </h2>
            <p className="mt-1 text-slate-500">You're making great progress. Keep it up!</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
          {[
            { title: "Day Streak", value: dayStreak.toString(), icon: "🔥" },
            { title: "Sessions This Week", value: sessionsThisWeekDisplay, icon: "🗓️" },
            { title: "Average Score", value: averageScoreDisplay, icon: "⭐" },
            { title: "Leaderboard Rank", value: "--", icon: "🏆" },
          ].map((stat) => (
            <div key={stat.title} className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">{stat.title}</p>
                  <p className="mt-1 text-xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - main content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Continue Session Card */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Continue Learning</p>
                  <h3 className="text-lg font-semibold text-slate-800">Meeting & Presentations</h3>
                  <p className="mt-1 text-sm text-slate-400">Lesson 3 of 8 • 38% Complete</p>
                </div>
                <button className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold">Continue Session</button>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-2 bg-blue-600" style={{ width: "38%" }} />
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <h4 className="text-lg font-semibold text-slate-800">Recent Sessions</h4>
              {recentSessions.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
                  Chưa có buổi học nào gần đây.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {recentSessions.map((session) => {
                    const topicTitle = session.topicName || session.topic || `Buổi học #${session.id}`;
                    const status = normalizeStatus(session.sessionStatus || session.status);
                    const duration = session.durationMinutes ?? session.duration ?? null;
                    return (
                      <div key={session.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                        <div>
                          <p className="font-semibold text-slate-800">{topicTitle}</p>
                          <p className="text-xs text-slate-400">
                            {formatSessionDate(session.startTime)} • {status ? statusLabels[status] : "Không xác định"}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-slate-700">{duration ? `${duration} phút` : "--"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
              <h5 className="text-sm font-semibold text-slate-800">Quick Actions</h5>
              <div className="mt-3 divide-y divide-slate-100">
                <button
                  type="button"
                  onClick={() => navigate("/topics")}
                  className="flex w-full items-center gap-3 rounded-md py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="text-lg">🎧</span>
                  <span>Start Solo Practice</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/mentor-selection")}
                  className="flex w-full items-center gap-3 rounded-md py-3 text-sm text-slate-700 transition hover:bg-slate-50"
                >
                  <span className="text-lg">📅</span>
                  <span>Book a Mentor</span>
                </button>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
              <h5 className="text-sm font-semibold text-slate-800">Leaderboard</h5>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold">1</div>
                    <div>{leaderboardName}</div>
                  </div>
                  <div className="text-slate-500">--pts</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default LearnerDashboard;
