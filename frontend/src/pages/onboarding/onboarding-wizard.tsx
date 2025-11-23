import type { ReactNode } from "react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type AgeOption = {
  id: string;
  label: string;
  description: string;
};

type LevelOption = {
  id: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  label: string;
  helper: string;
};

type GoalOption = {
  id: string;
  label: string;
  emoji: string;
};

type ProfessionOption = {
  id: string;
  label: string;
};

type Step = "age" | "level" | "goals" | "profession" | "summary";

const ageOptions: AgeOption[] = [
  { id: "18-24", label: "Độ tuổi: 18-24", description: "Sinh viên, người mới đi làm" },
  { id: "25-34", label: "Độ tuổi: 25-34", description: "Phát triển nghề nghiệp" },
  { id: "35-44", label: "Độ tuổi: 35-44", description: "Thăng tiến và mở rộng cơ hội" },
  { id: "45+", label: "Độ tuổi: 45+", description: "Duy trì và nâng cao kỹ năng" },
];

const levelOptions: LevelOption[] = [
  { id: "A1", label: "Mới bắt đầu ", helper: "Làm quen tiếng Anh (A1)" },
  { id: "A2", label: "Tiền trung cấp", helper: "Giao tiếp cơ bản (A2)" },
  { id: "B1", label: "Trung cấp", helper: "Đối thoại hàng ngày (B1)" },
  { id: "B2", label: "Trung cấp cao", helper: "Làm việc chuyên nghiệp(B2)" },
  { id: "C1", label: "Nâng cao", helper: "Tự tin, linh hoạt (C1)" },
  { id: "C2", label: "Thành thạo", helper: "Tương đương bản ngữ (C2)" },
];

const goalOptions: GoalOption[] = [
  { id: "career", label: "Công việc & sự nghiệp", emoji: "💼" },
  { id: "family", label: "Gia đình & bạn bè", emoji: "👨‍👩‍👧" },
  { id: "travel", label: "Du lịch", emoji: "✈️" },
  { id: "partner", label: "Giao tiếp với đối tác", emoji: "💬" },
  { id: "brain", label: "Rèn luyện trí não", emoji: "🧠" },
  { id: "study", label: "Học tập", emoji: "🎓" },
];

const professionOptions: ProfessionOption[] = [
  { id: "it", label: "Công nghệ & Kỹ thuật" },
  { id: "business", label: "Tài chính & Kinh doanh" },
  { id: "education", label: "Giáo dục & Học thuật" },
  { id: "creative", label: "Sáng tạo, Truyền thông & Thiết kế" },
  { id: "marketing", label: "Tiếp thị & Bán hàng" },
  { id: "health", label: "Y tế & Khoa học" },
  { id: "skilled", label: "Kỹ thuật & Nghề chuyên môn" },
  { id: "service", label: "Dịch vụ & Nhà hàng khách sạn" },
  { id: "logistics", label: "Vận chuyển & Logistics" },
  { id: "freelance", label: "Kinh doanh tự do & Làm chủ" },
];

const steps: Step[] = ["age", "level", "goals", "profession", "summary"];

const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("age");
  const [age, setAge] = useState<string>("");
  const [level, setLevel] = useState<LevelOption["id"] | "">("");
  const [goals, setGoals] = useState<string[]>([]);
  const [profession, setProfession] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const currentStepIndex = steps.indexOf(step);
  const progressPercent = useMemo(
    () => Math.round((currentStepIndex / (steps.length - 1)) * 100),
    [currentStepIndex]
  );

  const disableNext = useMemo(() => {
    if (step === "age") return !age;
    if (step === "level") return !level;
    if (step === "goals") return goals.length === 0;
    if (step === "profession") return !profession;
    return false;
  }, [age, level, goals, profession, step]);

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    }
  };

  const toggleGoal = (goalId: string) => {
    setGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleFinish = async () => {
    const payload = { age, level, goals, profession, savedAt: new Date().toISOString() };
    setIsSaving(true);
    try {
      localStorage.setItem("aesp_onboarding_profile", JSON.stringify(payload));
      navigate("/");
    } finally {
      setIsSaving(false);
    }
  };

  const renderAgeStep = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ageOptions.map((option) => {
        const active = age === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setAge(option.id)}
            className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <p className="text-base font-semibold text-gray-900">{option.label}</p>
            <p className="text-sm text-gray-500">{option.description}</p>
          </button>
        );
      })}
    </div>
  );

  const renderLevelStep = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {levelOptions.map((option) => {
        const active = level === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLevel(option.id)}
            className={`flex flex-col items-start rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <span className="text-lg font-semibold text-gray-900">{option.label}</span>
            <span className="text-sm text-gray-500">{option.helper}</span>
          </button>
        );
      })}
    </div>
  );

  const renderGoalStep = () => (
    <div className="space-y-3">
      {goalOptions.map((option) => (
        <label
          key={option.id}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <span className="flex items-center gap-3 text-gray-800">
            <span className="text-xl">{option.emoji}</span>
            {option.label}
          </span>
          <input
            type="checkbox"
            checked={goals.includes(option.id)}
            onChange={() => toggleGoal(option.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
        </label>
      ))}
    </div>
  );

  const renderProfessionStep = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {professionOptions.map((option) => {
        const active = profession === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setProfession(option.id)}
            className={`rounded-xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              active ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
            }`}
          >
            <span className="text-base font-semibold text-gray-900">{option.label}</span>
          </button>
        );
      })}
    </div>
  );

  const renderSummaryStep = () => {
    const ageLabel = ageOptions.find((item) => item.id === age)?.label;
    const levelLabel = levelOptions.find((item) => item.id === level)?.label;
    const goalLabels = goalOptions.filter((item) => goals.includes(item.id)).map((item) => item.label);
    const professionLabel = professionOptions.find((item) => item.id === profession)?.label;

    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin của bạn</h3>
          <div className="mt-4 space-y-3 text-gray-700">
            <p><span className="font-medium">Độ tuổi:</span> {ageLabel}</p>
            <p><span className="font-medium">Trình độ:</span> {levelLabel}</p>
            <p>
              <span className="font-medium">Mục tiêu:</span> {goalLabels.join(", ")}
            </p>
            <p><span className="font-medium">Công việc:</span> {professionLabel}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Thông tin này giúp hệ thống cá nhân hóa lộ trình và gợi ý mentor phù hợp.
        </p>
      </div>
    );
  };

  let content: ReactNode;
  switch (step) {
    case "age":
      content = renderAgeStep();
      break;
    case "level":
      content = renderLevelStep();
      break;
    case "goals":
      content = renderGoalStep();
      break;
    case "profession":
      content = renderProfessionStep();
      break;
    default:
      content = renderSummaryStep();
  }

  const titleMap: Record<Step, string> = {
    age: "Khám phá khả năng tiếng Anh của bạn",
    level: "Bạn đang ở trình độ tiếng Anh nào?",
    goals: "Vì sao bạn muốn học tiếng Anh?",
    profession: "Bạn đang làm công việc gì?",
    summary: "Hoàn tất hồ sơ luyện tập",
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-blue-500 hover:text-blue-600"
          >
            ← Quay lại
          </button>
          <span className="text-sm font-semibold text-blue-600">TRẮC NGHIỆM 3 PHÚT</span>
        </div>

        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{titleMap[step]}</h1>
            {step === "age" && (
              <p className="mt-2 text-sm text-gray-600">
                Nhận lộ trình học riêng phù hợp với mục tiêu của bạn.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8">{content}</div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 sm:flex-row">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-600 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Bước trước
          </button>

          {step === "summary" ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSaving}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
            >
              {isSaving ? "Đang lưu..." : "Hoàn tất"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={disableNext}
              className="w-full rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              Tiếp tục
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
