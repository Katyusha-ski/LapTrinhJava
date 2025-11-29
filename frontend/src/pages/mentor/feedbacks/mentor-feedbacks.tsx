import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MentorNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { mentorApi } from "../../../api/mentor.api";
import { learnerApi, type LearnerProfile } from "../../../api/learner.api";
import { pronunciationApi, type PronunciationScore } from "../../../api/pronunciation.api";

const MentorFeedbacks: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [/* mentorId */, /* setMentorId */] = useState<number | null>(null);
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<LearnerProfile | null>(null);
  const [scores, setScores] = useState<PronunciationScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // helper to normalize API payloads which may be either an array or a paged { content: T[] }
  const normalizePayload = <T,>(payload: unknown): T[] => {
    const p = payload as unknown;
    if (Array.isArray(p)) return p as T[];
    if (typeof p === "object" && p !== null) {
      const maybe = p as { content?: unknown };
      if (Array.isArray(maybe.content)) return maybe.content as T[];
    }
    return [];
  };

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        // capture uid so TS knows it's defined
        const uid: number = user.id as number;

        // try get mentor profile
        let mentor = null;
        try {
          mentor = await mentorApi.getByUserId(uid);
        } catch (e) {
          mentor = null;
        }

        // load learners and filter by mentor
        const payload = await learnerApi.getAll(0, 1000);
        const all = normalizePayload<LearnerProfile>(payload);
        const assigned = mentor && (mentor as any).id ? all.filter((l) => l.mentorId === (mentor as any).id) : all.filter((l) => l.mentorId != null);
        if (!cancelled) setLearners(assigned);
      } catch (err) {
        console.error("Failed to load learners for feedback page", err);
        if (!cancelled) setError("Không thể tải dữ liệu học viên");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const selectLearner = async (learner: LearnerProfile) => {
    setSelectedLearner(learner);
    setScores([]);
    setLoading(true);
    try {
      const resp = await pronunciationApi.getScoresByLearner(learner.id, 0, 50);
      const list = normalizePayload<PronunciationScore>(resp);
      setScores(list);
    } catch (err) {
      console.error("Failed to load scores", err);
      setError("Không thể tải feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { clearAuth(); navigate("/landing"); };

  // placeholder - grouping not needed yet

  return (
    <div className="page-gradient min-h-screen">
      <MentorNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Feedback</p>
            <h1 className="text-2xl font-bold text-slate-800">Phản hồi học viên</h1>
            <p className="mt-1 text-sm text-slate-500">Xem các phản hồi/chấm điểm phát âm của học viên được gán.</p>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 rounded-2xl border bg-white/85 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600">Danh sách học viên</h3>
            <div className="mt-3 max-h-[60vh] overflow-auto">
              {loading && learners.length === 0 && <p className="text-sm text-slate-500">Đang tải...</p>}
              {learners.length === 0 && !loading && <p className="text-sm text-slate-500">Không có học viên.</p>}
              {learners.map((l) => (
                <button
                  key={l.id}
                  onClick={() => void selectLearner(l)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm hover:bg-slate-50 ${selectedLearner?.id === l.id ? "bg-slate-100" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{l.fullName || l.name || `Learner #${l.id}`}</p>
                      <p className="text-xs text-slate-500">{l.englishLevel ?? "-"}</p>
                    </div>
                    <div className="text-xs text-slate-400">#{l.id}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border bg-white/85 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-600">Chi tiết Feedback</h3>
            <div className="mt-4">
              {!selectedLearner && <p className="text-sm text-slate-500">Chọn một học viên để xem phản hồi.</p>}
              {selectedLearner && (
                <div>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white flex font-semibold">{selectedLearner.fullName?.charAt(0) ?? "L"}</div>
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{selectedLearner.fullName || selectedLearner.name}</p>
                      <p className="text-sm text-slate-500">ID: #{selectedLearner.id}</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {loading && <p className="text-sm text-slate-500">Đang tải phản hồi...</p>}
                    {!loading && scores.length === 0 && <p className="text-sm text-slate-500">Chưa có phản hồi phát âm nào.</p>}
                    {scores.map((s) => (
                      <div key={s.id} className="rounded-xl border px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{s.word ?? (s as any).transcribedText ?? "Bài tập"}</p>
                            <p className="text-xs text-slate-500">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ""}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-slate-700">{s.scorePercentage ?? "-"}%</p>
                            <p className="text-xs text-slate-500">Phiên #{s.sessionId ?? "-"}</p>
                          </div>
                        </div>
                        {s.feedback && <p className="mt-2 text-sm text-slate-600">{s.feedback}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </main>
    </div>
  );
};

export default MentorFeedbacks;
