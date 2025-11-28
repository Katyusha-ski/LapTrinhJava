import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LearnerNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { learnerApi, type LearnerProfile } from "../../../api/learner.api";
import { quizApi, type QuestionItemDto } from "../../../api/quiz.api";
import type { EnglishLevel } from "../../../types/shared";
import { ENGLISH_LEVEL_OPTIONS } from "../../../types/shared";
import { toast } from "react-toastify";

const CEFR_LEVELS: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const MAX_QUESTIONS = 10;
const STARTING_LEVEL: EnglishLevel = "B1";
const BRAND_PRIMARY = "#1E5B53";
const BRAND_ACCENT = "#CCFFAA";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_ACCENT} 0%, ${BRAND_PRIMARY} 100%)`;

const LearnerTestLevelPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnState = location.state as { from?: string } | undefined;
  const { user, clearAuth } = useAuth();

  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<EnglishLevel>(STARTING_LEVEL);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionItemDto | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [finalLevel, setFinalLevel] = useState<EnglishLevel | null>(null);

  const askedQuestionIdsRef = useRef<Set<number>>(new Set());

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const ensureLearnerProfile = useCallback(async () => {
    if (!user?.id) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingProfile(true);
      let profile: LearnerProfile | null = null;
      try {
        profile = await learnerApi.getByUserId(user.id);
      } catch (err: any) {
        const status = err?.status ?? err?.response?.status;
        if (status === 404) {
          profile = await learnerApi.autoCreate(user.id);
        } else {
          throw err;
        }
      }

      setLearner(profile);
    } catch (err: any) {
      console.error("Failed to load learner profile", err);
      toast.error("Không thể tải hồ sơ học viên.");
    } finally {
      setLoadingProfile(false);
    }
  }, [navigate, user?.id]);

  const loadQuestion = useCallback(async (level: EnglishLevel) => {
    if (!learner?.id) return;
    setLoadingQuestion(true);
    try {
      const response = await quizApi.startAttempt({
        learnerId: learner.id,
        targetLevel: level,
        questionCount: 1,
        excludeQuestionIds: Array.from(askedQuestionIdsRef.current),
      });

      const nextQuestion = response.questions[0];
      if (!nextQuestion) {
        toast.error("Không còn câu hỏi phù hợp. Vui lòng thử lại sau.");
        return;
      }
      askedQuestionIdsRef.current.add(nextQuestion.id);
      setCurrentQuestion(nextQuestion);
    } catch (err) {
      console.error("Failed to load question", err);
      toast.error("Không thể tải câu hỏi. Vui lòng thử lại.");
    } finally {
      setLoadingQuestion(false);
    }
  }, [learner?.id]);

  useEffect(() => {
    void ensureLearnerProfile();
  }, [ensureLearnerProfile]);

  useEffect(() => {
    if (learner && !finished && questionIndex === 0 && !currentQuestion) {
      void loadQuestion(currentLevel);
    }
  }, [learner, finished, questionIndex, currentQuestion, currentLevel, loadQuestion]);

  const adjustLevel = (level: EnglishLevel, isCorrect: boolean): EnglishLevel => {
    const idx = CEFR_LEVELS.indexOf(level);
    if (idx === -1) return level;
    const nextIdx = isCorrect ? Math.min(idx + 1, CEFR_LEVELS.length - 1) : Math.max(idx - 1, 0);
    return CEFR_LEVELS[nextIdx];
  };

  const handleAnswer = async (answerId: number) => {
    if (!currentQuestion || submittingAnswer || finished) {
      return;
    }
    setSubmittingAnswer(true);
    try {
      const submitResponse = await quizApi.submitAnswers({
        answers: [{ questionId: currentQuestion.id, answerId }],
      });
      const questionEvaluation = submitResponse.evaluations[0];
      const isCorrect = questionEvaluation ? questionEvaluation.correct : submitResponse.correctAnswers > 0;
      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
      }

      const answered = questionIndex + 1;
      const updatedLevel = adjustLevel(currentLevel, isCorrect);
      setCurrentLevel(updatedLevel);
      setQuestionIndex(answered);

      if (answered >= MAX_QUESTIONS) {
        await finalizeAssessment(updatedLevel, isCorrect);
      } else {
        await loadQuestion(updatedLevel);
      }
    } catch (err) {
      console.error("Failed to submit answer", err);
      toast.error("Không thể chấm câu trả lời. Vui lòng thử lại.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const finalizeAssessment = useCallback(async (finalAdaptiveLevel: EnglishLevel, lastCorrect: boolean) => {
    const totalCorrect = (lastCorrect ? correctCount + 1 : correctCount);
    const accuracy = totalCorrect / MAX_QUESTIONS;
    const finalLevelIndex = CEFR_LEVELS.indexOf(finalAdaptiveLevel);
    let estimatedLevel = finalAdaptiveLevel;

    if (accuracy < 0.4) {
      estimatedLevel = CEFR_LEVELS[Math.max(0, finalLevelIndex - 1)];
    } else if (accuracy >= 0.8) {
      estimatedLevel = CEFR_LEVELS[Math.min(CEFR_LEVELS.length - 1, finalLevelIndex + 1)];
    }

    setFinished(true);
    setFinalLevel(estimatedLevel);

    if (learner) {
      try {
        setUpdatingProfile(true);
        await learnerApi.update(learner.id, {
          userId: learner.userId,
          englishLevel: estimatedLevel,
        });
        setLearner({ ...learner, englishLevel: estimatedLevel });
      } catch (err) {
        console.error("Failed to update learner level", err);
        toast.error("Không thể lưu cấp độ mới.");
      } finally {
        setUpdatingProfile(false);
      }
    }
  }, [correctCount, learner]);

  const levelLabel = useMemo(() => {
    return ENGLISH_LEVEL_OPTIONS.find((opt) => opt.value === currentLevel)?.label ?? currentLevel;
  }, [currentLevel]);

  const accuracyPercent = useMemo(() => {
    if (!finished) return Math.round((correctCount / Math.max(1, questionIndex)) * 100);
    return Math.round((correctCount / MAX_QUESTIONS) * 100);
  }, [correctCount, finished, questionIndex]);

  const handleContinue = () => {
    const fallback = "/onboarding";
    const target = returnState?.from && returnState.from !== "/learner/testlevel" ? returnState.from : fallback;
    navigate(target, { replace: true });
  };

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-slate-600">Đang chuẩn bị bài đánh giá...</p>
        </div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <p className="mb-4 text-slate-700">Không tìm thấy hồ sơ học viên.</p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            onClick={() => navigate("/dashboard", { replace: true })}
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: BRAND_GRADIENT }}>
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 rounded-3xl bg-white/95 p-6 shadow-xl">
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND_PRIMARY }}>Step 1 · Level Check</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Đánh giá nhanh trình độ tiếng Anh</h1>
          <p className="mt-3 text-slate-600">
            Chúng tôi sẽ bắt đầu ở mức <span className="font-semibold">{levelLabel}</span> và tự động điều chỉnh khó/dễ dựa trên câu trả lời của bạn.
          </p>
          <div className="mt-4 h-2 w-full rounded-full bg-slate-100/80">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${(questionIndex / MAX_QUESTIONS) * 100}%`, backgroundColor: BRAND_PRIMARY }}
            />
          </div>
        </div>

        {!finished ? (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/40 bg-white/95 p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Câu hỏi {questionIndex + 1} / {MAX_QUESTIONS}</p>
                  <h2 className="text-2xl font-semibold text-slate-900">{currentQuestion?.text ?? "Đang tải câu hỏi..."}</h2>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-sm font-semibold"
                  style={{ backgroundColor: BRAND_ACCENT, color: BRAND_PRIMARY }}
                >
                  {currentLevel}
                </span>
              </div>

              {currentQuestion?.topicArea && (
                <p className="mt-2 text-sm text-slate-500">Chủ đề: {currentQuestion.topicArea}</p>
              )}

              <div className="mt-6 space-y-3">
                {loadingQuestion && !currentQuestion ? (
                  <p className="text-center text-slate-500">Đang lấy câu hỏi...</p>
                ) : (
                  currentQuestion?.answers.map((answer) => (
                    <button
                      key={answer.id}
                      onClick={() => handleAnswer(answer.id)}
                      disabled={submittingAnswer}
                      className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-slate-700 transition hover:-translate-y-0.5"
                      style={{ borderColor: submittingAnswer ? "#E2E8F0" : "rgba(30,91,83,0.35)" }}
                    >
                      <span>{answer.text}</span>
                      <span className="text-sm" style={{ color: BRAND_PRIMARY }}>Chọn</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div
              className="rounded-2xl border p-4"
              style={{ borderColor: `${BRAND_PRIMARY}33`, backgroundColor: `${BRAND_ACCENT}80` }}
            >
              <p className="text-sm" style={{ color: BRAND_PRIMARY }}>
                Độ chính xác hiện tại: <span className="font-semibold">{accuracyPercent}%</span>
              </p>
              <p className="text-xs text-slate-500">Cố gắng giữ trên 80% để tăng level nhanh hơn!</p>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border bg-white/95 p-8 text-center shadow-xl" style={{ borderColor: `${BRAND_PRIMARY}33` }}>
            <p className="text-sm font-semibold uppercase" style={{ color: BRAND_PRIMARY }}>Hoàn thành</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Cấp độ ước tính của bạn</h2>
            <p className="mt-4 text-5xl font-bold" style={{ color: BRAND_PRIMARY }}>{finalLevel}</p>
            <p className="mt-2 text-slate-500">Độ chính xác: {Math.round((correctCount / MAX_QUESTIONS) * 100)}%</p>
            {updatingProfile && <p className="mt-2 text-sm text-slate-400">Đang lưu kết quả...</p>}
            <button
              onClick={handleContinue}
              className="mt-6 rounded-xl px-6 py-3 text-white shadow-lg transition"
              style={{ backgroundColor: BRAND_PRIMARY }}
            >
              Tiếp tục Onboarding
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default LearnerTestLevelPage;
