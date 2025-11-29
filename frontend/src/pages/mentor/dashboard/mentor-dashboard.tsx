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
import { httpClient } from "../../../api/httpClient";
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
  const [showLearnerList, setShowLearnerList] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState<LearnerProfile | null>(null);
  const [selectedLearnerLoading, setSelectedLearnerLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalLoading, setFeedbackModalLoading] = useState(false);
  const [feedbackScores, setFeedbackScores] = useState<PronunciationScore[]>([]);
  const [feedbackLearnerName, setFeedbackLearnerName] = useState<string | null>(null);
  const [levelUpdating, setLevelUpdating] = useState(false);
  const LEVEL_OPTIONS = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

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

  const handleQuickFeedback = async (learnerId?: number, learnerName?: string) => {
    if (!learnerId) {
      // nếu không có learnerId, mở danh sách học viên để chọn
      setShowLearnerList(true);
      return;
    }
    try {
      setFeedbackModalLoading(true);
      setFeedbackScores([]);
      setFeedbackLearnerName(learnerName ?? null);
      const resp = await pronunciationApi.getScoresByLearner(learnerId, 0, 5).catch(() => null);
      const records = normalizePayload<PronunciationScore>(resp);
      setFeedbackScores(records);
      setShowFeedbackModal(true);
    } catch (e) {
      console.error("Lấy phản hồi thất bại", e);
    } finally {
      setFeedbackModalLoading(false);
    }
  };

  const mentorTools = [
    {
      label: "Đánh giá & Định mức",
      description: "Bắt đầu bài kiểm tra đánh giá cho học viên (Adaptive).",
      action: (learnerId?: number) => navigate(`/learner/assessment${learnerId ? `?learnerId=${learnerId}` : ""}`),
    },
    {
      label: "Tài liệu",
      description: "Chia sẻ hoặc gán tài liệu/ tài nguyên học tập cho học viên.",
      action: (learnerId?: number) => navigate(`/topics${learnerId ? `?learnerId=${learnerId}` : ""}`),
    },
    {
      label: "Phản hồi ngay",
      description: "Nhận phản hồi phát âm nhanh từ dữ liệu gần nhất.",
      action: (learnerId?: number, learnerName?: string) => void handleQuickFeedback(learnerId, learnerName),
    },
    {
      label: "Gợi ý diễn đạt",
      description: "Đề xuất cách diễn đạt và cụm từ tự nhiên.",
      action: (learnerId?: number) => navigate(`/conversation${learnerId ? `?learnerId=${learnerId}` : ""}`),
    },
    {
      label: "Từ vựng & Thành ngữ",
      description: "Gợi ý từ vựng, collocations và idioms theo chủ đề.",
      action: (learnerId?: number) => navigate(`/conversation${learnerId ? `?learnerId=${learnerId}` : ""}`),
    },
    {
      label: "Chia sẻ kinh nghiệm",
      description: "Đăng ghi chú, mẹo giao tiếp và kinh nghiệm thực tế cho học viên.",
      action: () => navigate("/mentor/profile"),
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
              {card.label === "Tổng học viên" && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowLearnerList(true)}
                    className="inline-flex items-center rounded-md border px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Xem danh sách học viên
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>

        
          

        {loading && <p className="mt-6 text-center text-sm text-slate-500">Đang tải dữ liệu thực từ hệ thống...</p>}
        {/* Feedback modal (phản hồi nhanh) */}
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowFeedbackModal(false)} />
            <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-lg font-semibold text-slate-800">Phản hồi phát âm nhanh</h3>
                <button className="text-sm text-slate-600" onClick={() => setShowFeedbackModal(false)}>Đóng</button>
              </div>
              <div className="p-4 max-h-96 overflow-auto">
                <p className="text-sm text-slate-500">{feedbackLearnerName ? `Học viên: ${feedbackLearnerName}` : ""}</p>
                {feedbackModalLoading && <p className="mt-3 text-sm text-slate-500">Đang tải phản hồi...</p>}
                {!feedbackModalLoading && feedbackScores.length === 0 && (
                  <p className="mt-3 text-sm text-slate-500">Không có phản hồi nào để hiển thị.</p>
                )}
                {!feedbackModalLoading && feedbackScores.map((s) => (
                  <div key={s.id} className="mt-3 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{`Bản ghi #${s.id}`}</p>
                        <p className="text-xs text-slate-500">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-700">{formatNumber(s.scorePercentage ?? 0, 1)}%</p>
                        <p className="text-xs text-slate-500">Điểm phát âm</p>
                      </div>
                    </div>
                    {/* Hiện tại hiển thị thông tin cơ bản: id, ngày tạo và điểm. */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Learner list modal */}
        {showLearnerList && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowLearnerList(false)} />
            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="text-lg font-semibold text-slate-800">Danh sách học viên</h3>
                <button className="text-sm text-slate-600" onClick={() => setShowLearnerList(false)}>Đóng</button>
              </div>
              <div className="grid grid-cols-3 gap-4 p-4">
                <div className="col-span-1 max-h-96 overflow-auto border-r pr-2">
                  {assignedLearners.length === 0 && <p className="text-sm text-slate-500">Không có học viên được gán.</p>}
                  {assignedLearners.map((l) => (
                    <button
                      key={l.id}
                      onClick={async () => {
                        setSelectedLearnerLoading(true);
                        try {
                          const resp = await learnerApi.getById(l.id);
                          setSelectedLearner(resp as LearnerProfile);
                        } catch (e) {
                          // fallback to already loaded profile
                          setSelectedLearner(l);
                        } finally {
                          setSelectedLearnerLoading(false);
                        }
                      }}
                      className={`w-full text-left rounded-md px-3 py-2 text-sm hover:bg-slate-50 ${selectedLearner?.id === l.id ? "bg-slate-100" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{l.fullName || l.name || `Learner #${l.id}`}</p>
                          <p className="text-xs text-slate-500">{l.englishLevel || "-"}</p>
                        </div>
                        <div className="text-xs text-slate-400">#{l.id}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="col-span-2 max-h-96 overflow-auto p-2">
                  {selectedLearnerLoading && <p className="text-sm text-slate-500">Đang tải...</p>}
                  {!selectedLearner && !selectedLearnerLoading && (
                    <p className="text-sm text-slate-500">Chọn một học viên để xem chi tiết.</p>
                  )}
                  {selectedLearner && (
                    <div>
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white flex font-semibold">{selectedLearner.fullName?.charAt(0) ?? "L"}</div>
                        <div>
                          <p className="text-lg font-semibold text-slate-800">{selectedLearner.fullName || selectedLearner.name}</p>
                          <p className="text-sm text-slate-500">ID: #{selectedLearner.id}</p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Trình độ</p>
                          <p className="font-medium text-slate-700">{selectedLearner.englishLevel ?? "Chưa đặt"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Ngày tạo</p>
                          <p className="font-medium text-slate-700">{selectedLearner.createdAt ? new Date(selectedLearner.createdAt).toLocaleDateString() : "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Tổng giờ</p>
                          <p className="font-medium text-slate-700">{selectedLearner.totalPracticeHours ?? 0} giờ</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Điểm phát âm TB</p>
                          <p className="font-medium text-slate-700">{selectedLearner.averagePronunciationScore ?? "-"}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-slate-500">Cài đặt trình độ</p>
                        <div className="mt-2 flex items-center gap-2">
                          <select
                            value={selectedLearner.englishLevel ?? ""}
                            onChange={(e) => setSelectedLearner({ ...selectedLearner, englishLevel: e.target.value })}
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            <option value="">Chưa đặt</option>
                            {LEVEL_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <button
                            onClick={async () => {
                              if (!selectedLearner) return;
                              setLevelUpdating(true);
                              try {
                                const payload = { userId: selectedLearner.userId, englishLevel: selectedLearner.englishLevel ?? null };
                                const updated = await learnerApi.update(selectedLearner.id, payload as any);
                                // cập nhật local state
                                setSelectedLearner(updated as LearnerProfile);
                                setAssignedLearners((prev) => prev.map((l) => (l.id === updated.id ? (updated as LearnerProfile) : l)));
                              } catch (err) {
                                console.error("Cập nhật level thất bại", err);
                                alert("Cập nhật level thất bại. Vui lòng thử lại.");
                              } finally {
                                setLevelUpdating(false);
                              }
                            }}
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                            disabled={levelUpdating}
                          >
                            {levelUpdating ? "Đang lưu..." : "Lưu"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-600">Mục tiêu học tập</h4>
                        <p className="mt-1 text-sm text-slate-500">{selectedLearner.learningGoals ?? "Chưa có"}</p>
                      </div>
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-600">Gửi phản hồi cho học viên</h4>
                        <textarea
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Viết feedback cho học viên (phát âm, ngữ pháp, lưu ý)..."
                          className="mt-2 w-full rounded-md border px-3 py-2 text-sm"
                          rows={4}
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={async () => {
                              if (!selectedLearner) return;
                              if (!feedbackText.trim()) {
                                alert('Vui lòng nhập nội dung feedback.');
                                return;
                              }
                              setSendingFeedback(true);
                              try {
                                const payload = { learnerId: selectedLearner.id, content: feedbackText.trim() };
                                await httpClient('/api/feedback', { method: 'POST', body: JSON.stringify(payload) });
                                setFeedbackText("");
                                alert('Gửi feedback thành công.');
                                // Optionally, refresh mentor feedbacks elsewhere
                              } catch (err) {
                                console.error('Gửi feedback thất bại', err);
                                alert('Gửi feedback thất bại. Vui lòng thử lại.');
                              } finally {
                                setSendingFeedback(false);
                              }
                            }}
                            disabled={sendingFeedback}
                            className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50"
                          >
                            {sendingFeedback ? 'Đang gửi...' : 'Gửi feedback'}
                          </button>
                        </div>
                      </div>
                      {/* action buttons: quick mentor tools for this learner */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-slate-600">Công cụ cho học viên</h4>
                        <div className="mt-2 grid gap-2 md:grid-cols-3">
                          {mentorTools.map((tool) => (
                            <button
                              key={tool.label}
                              onClick={() => tool.action(selectedLearner.id)}
                              className="rounded-md border px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <div className="font-medium">{tool.label}</div>
                              <div className="text-xs text-slate-500">{tool.description}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MentorDashboard;
