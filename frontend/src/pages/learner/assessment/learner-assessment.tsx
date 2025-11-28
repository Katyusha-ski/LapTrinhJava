import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LearnerNavbar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";
import { learnerApi, type LearnerProfile } from "../../../api/learner.api";
import {
  quizApi,
  type AdaptiveAssessmentResponse,
  type QuestionItemDto,
  type QuizAttemptResultResponse,
  type StartQuizAttemptResponse,
} from "../../../api/quiz.api";
import type { EnglishLevel } from "../../../types/shared";
import { ENGLISH_LEVEL_OPTIONS } from "../../../types/shared";

const ASSESSMENT_QUESTION_COUNT = 10;
const FALLBACK_LEVEL: EnglishLevel = "A1";

const ENGLISH_LEVEL_VALUES: EnglishLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const LearnerAssessmentPage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const [learner, setLearner] = useState<LearnerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [startConfigLevel, setStartConfigLevel] = useState<EnglishLevel>(FALLBACK_LEVEL);

  const [attemptData, setAttemptData] = useState<StartQuizAttemptResponse | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResultResponse | null>(null);
  const [assessment, setAssessment] = useState<AdaptiveAssessmentResponse | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [startingAttempt, setStartingAttempt] = useState(false);
  const [submittingAnswers, setSubmittingAnswers] = useState(false);
  const [persistingLevel, setPersistingLevel] = useState(false);

  const learnerLevelLabel = useMemo(() => {
    if (!learner?.englishLevel) return "Chưa xác định";
    return ENGLISH_LEVEL_OPTIONS.find((opt) => opt.value === learner.englishLevel)?.label ?? learner.englishLevel;
  }, [learner?.englishLevel]);

  const normalizeLevel = useCallback((level?: string | null): EnglishLevel => {
    const normalized = (level || "").toUpperCase();
    return ENGLISH_LEVEL_VALUES.includes(normalized as EnglishLevel)
      ? (normalized as EnglishLevel)
      : FALLBACK_LEVEL;
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const loadLearnerProfile = useCallback(async () => {
    if (!user?.id) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setLoadingProfile(true);
      setError(null);

      let profile: LearnerProfile | null = null;
      try {
        profile = await learnerApi.getByUserId(user.id);
      } catch (err) {
        const status = (err as { status?: number })?.status;
        if (status === 404) {
          profile = await learnerApi.autoCreate(user.id);
        } else {
          throw err;
        }
      }

      if (profile) {
        setLearner(profile);
        setStartConfigLevel(normalizeLevel(profile.englishLevel));
      }
    } catch (err) {
      console.error(err);
      setLearner(null);
      setError("Không thể tải thông tin học viên");
    } finally {
      setLoadingProfile(false);
    }
  }, [navigate, normalizeLevel, user?.id]);

  useEffect(() => {
    void loadLearnerProfile();
  }, [loadLearnerProfile]);

  const resetAttemptState = () => {
    setAttemptData(null);
    setSelectedAnswers({});
    setAttemptResult(null);
    setAssessment(null);
  };

  const handleStartAttempt = async () => {
    if (!learner?.id) {
      setError("Không tìm thấy hồ sơ học viên");
      return;
    }
    try {
      setStartingAttempt(true);
      setError(null);
      setAttemptResult(null);
      setAssessment(null);

      const response = await quizApi.startAttempt({
        learnerId: learner.id,
        targetLevel: startConfigLevel,
        questionCount: ASSESSMENT_QUESTION_COUNT,
      });

      setAttemptData(response);
      setSelectedAnswers({});
    } catch (err) {
      console.error(err);
      setError("Không thể khởi tạo bài đánh giá. Vui lòng thử lại.");
    } finally {
      setStartingAttempt(false);
    }
  };

  const handleSelectAnswer = (questionId: number, answerId: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const persistLearnerLevel = useCallback(
    async (newLevel: EnglishLevel) => {
      if (!learner) return;
      try {
        setPersistingLevel(true);
        const payload = {
          userId: learner.userId,
          mentorId: learner.mentorId ?? undefined,
          englishLevel: newLevel,
          learningGoals: learner.learningGoals ?? undefined,
          currentStreak: learner.currentStreak ?? undefined,
          totalPracticeHours: learner.totalPracticeHours ?? undefined,
          averagePronunciationScore: learner.averagePronunciationScore ?? undefined,
          ageRange: learner.ageRange ?? undefined,
          profession: learner.profession ?? undefined,
        };
        const updated = await learnerApi.update(learner.id, payload);
        setLearner(updated);
      } catch (err) {
        console.error(err);
        setError("Đánh giá thành công nhưng không thể lưu cấp độ mới");
      } finally {
        setPersistingLevel(false);
      }
    },
    [learner]
  );

  const handleSubmitAnswers = async () => {
    if (!attemptData) {
      setError("Hãy bắt đầu bài đánh giá trước.");
      return;
    }

    const unanswered = attemptData.questions.filter((q) => !selectedAnswers[q.id]);
    if (unanswered.length > 0) {
      setError("Vui lòng trả lời tất cả câu hỏi trước khi nộp.");
      return;
    }

    try {
      setSubmittingAnswers(true);
      setError(null);

      const submitResponse = await quizApi.submitAnswers({
        answers: attemptData.questions.map((question) => ({
          questionId: question.id,
          answerId: selectedAnswers[question.id],
        })),
      });

      setAttemptResult(submitResponse);

      const assessmentResponse = await quizApi.assessAttempt({
        startingLevel: attemptData.targetLevel ?? startConfigLevel,
        attemptResult: submitResponse,
      });

      setAssessment(assessmentResponse);
      await persistLearnerLevel(assessmentResponse.recommendedLevel);
    } catch (err) {
      console.error(err);
      setError("Không thể chấm điểm bài làm. Vui lòng thử lại.");
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const renderQuestionCard = (question: QuestionItemDto) => (
    <div key={question.id} className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3">
        <div>
          <p className="text-xs uppercase text-slate-400">Câu hỏi #{question.id}</p>
          <p className="font-semibold text-slate-800">{question.text}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          {question.level}
        </span>
      </div>
      {question.topicArea && (
        <p className="text-xs text-slate-500">Chủ đề: {question.topicArea}</p>
      )}
      <div className="mt-4 space-y-2">
        {question.answers.map((answer) => {
          const inputId = `question-${question.id}-answer-${answer.id}`;
          return (
            <label
              htmlFor={inputId}
              key={answer.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                selectedAnswers[question.id] === answer.id
                  ? "border-blue-500 bg-blue-50 text-blue-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={`question-${question.id}`}
                value={answer.id}
                checked={selectedAnswers[question.id] === answer.id}
                onChange={() => handleSelectAnswer(question.id, answer.id)}
                className="hidden"
              />
              <span>{answer.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p>Đang tải thông tin học viên...</p>
        </div>
      </div>
    );
  }

  if (!learner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl bg-white/90 p-8 text-center shadow-lg">
          <p className="mb-4 text-lg text-slate-700">Không tìm thấy hồ sơ học viên.</p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            onClick={() => navigate("/dashboard")}
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase text-slate-500">Current English Level</p>
            <p className="text-3xl font-bold text-slate-900">{learnerLevelLabel}</p>
            {assessment && (
              <p className="mt-2 text-sm text-slate-600">
                Đánh giá gần nhất đề xuất cấp độ <span className="font-semibold">{assessment.recommendedLevel}</span>.
              </p>
            )}
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p>Huấn luyện mentor: {learner.mentorId ? `#${learner.mentorId}` : "Chưa có"}</p>
            <p>Lần cập nhật gần nhất: {new Date().toLocaleDateString("vi-VN")}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Bắt đầu bài đánh giá</h2>
              <p className="text-sm text-slate-500">Hệ thống sẽ chọn câu hỏi phù hợp để ước lượng trình độ hiện tại.</p>
            </div>
            <button
              onClick={resetAttemptState}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Reset bài làm
            </button>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              Hệ thống sẽ tự động dùng cấp độ hiện tại của bạn để sinh {ASSESSMENT_QUESTION_COUNT} câu hỏi phù
              hợp. Bạn chỉ cần bấm nút bên dưới để bắt đầu.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Cấp độ đang sử dụng: <span className="font-semibold">{startConfigLevel}</span>
            </p>
          </div>

          <button
            onClick={handleStartAttempt}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700"
            disabled={startingAttempt}
          >
            {startingAttempt ? "Đang tạo bài kiểm tra..." : "Start assessing your English level"}
          </button>
        </section>

        {attemptData && (
          <section className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                Bộ câu hỏi ({attemptData.questionCount} câu)
              </h3>
              <span className="text-sm text-slate-500">
                Mức {attemptData.targetLevel} · {attemptData.questionType}
              </span>
            </div>
            <div className="space-y-4">
              {attemptData.questions.map((question) => renderQuestionCard(question))}
            </div>
            <button
              onClick={handleSubmitAnswers}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white shadow-lg hover:bg-emerald-700"
              disabled={submittingAnswers}
            >
              {submittingAnswers ? "Đang chấm điểm..." : "Nộp bài và xem kết quả"}
            </button>
          </section>
        )}

        {attemptResult && (
          <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Kết quả bài làm</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase text-slate-500">Tỷ lệ chính xác</p>
                <p className="text-3xl font-bold text-emerald-600">{Math.round(attemptResult.accuracy * 100)}%</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm uppercase text-slate-500">Số câu đúng</p>
                <p className="text-3xl font-bold text-slate-900">{attemptResult.correctAnswers}/{attemptResult.totalQuestions}</p>
              </div>
              {assessment && (
                <div className="rounded-xl bg-slate-50 p-4 text-center">
                  <p className="text-sm uppercase text-slate-500">Cấp độ đề xuất</p>
                  <p className="text-3xl font-bold text-indigo-600">{assessment.recommendedLevel}</p>
                  {persistingLevel && <p className="text-xs text-slate-500">Đang lưu hồ sơ...</p>}
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default LearnerAssessmentPage;
