import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LearnerNavbar } from "../../components/layout";
import { learnerApi } from "../../api/learner.api";
import { packageApi, type LearningPackage } from "../../api/package.api";
import { subscriptionApi, type PaymentMethod, type Subscription } from "../../api/subscription.api";
import { toast } from "react-toastify";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "MOMO", label: "MoMo", description: "Thanh toán ví MoMo" },
  { value: "CREDIT_CARD", label: "Credit Card", description: "Visa/Master/JCB" },
  { value: "BANK_TRANSFER", label: "Chuyển khoản", description: "Chuyển khoản ngân hàng" },
];

const shimmer = "bg-gradient-to-br from-slate-50 via-white to-slate-100";

const LearnerPackagePage = () => {
  const { user, clearAuth } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const userRoles = user?.roles;

  const [learnerId, setLearnerId] = useState<number | null>(null);
  const [packages, setPackages] = useState<LearningPackage[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("MOMO");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !userRoles?.includes("LEARNER")) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;

    const loadInitial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profile, pkgList] = await Promise.all([
          learnerApi.getByUserId(userId),
          packageApi.list(),
        ]);
        if (cancelled) return;
        setLearnerId(profile.id);
        setPackages(pkgList.filter((pkg) => pkg.isActive !== false));
        try {
          const active = await subscriptionApi.getActive(profile.id);
          if (!cancelled) {
            setActiveSubscription(active);
          }
        } catch (activeErr: any) {
          const status = activeErr?.status ?? activeErr?.response?.status;
          if (status !== 404 && !cancelled) {
            console.warn("Failed to load active subscription", activeErr);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load learner packages", err);
          setError(err?.message || "Không thể tải gói học.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, [navigate, userId, userRoles]);

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) return null;
    return packages.find((pkg) => pkg.id === selectedPackageId) ?? null;
  }, [packages, selectedPackageId]);

  const handleSelectPackage = (pkg: LearningPackage) => {
    setSelectedPackageId(pkg.id);
  };

  const formatCurrency = (value?: number | null) => {
    if (value == null) return "--";
    return value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handlePurchase = async () => {
    if (!learnerId || !selectedPackage) {
      toast.error("Vui lòng chọn gói học");
      return;
    }
    const duration = selectedPackage.durationDays ?? 30;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + duration);

    setIsProcessing(true);
    try {
      const payload = {
        learnerId,
        packageId: selectedPackage.id,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        paymentAmount: Number(selectedPackage.price ?? 0),
        paymentMethod,
      };
      await subscriptionApi.create(payload);
      toast.success("Thanh toán thành công. Gói học đã được kích hoạt!");
      try {
        const active = await subscriptionApi.getActive(learnerId);
        setActiveSubscription(active);
      } catch (err) {
        console.warn("Unable to refresh active subscription", err);
      }
      setSelectedPackageId(null);
    } catch (err: any) {
      console.error("Failed to purchase package", err);
      const status = err?.status ?? err?.response?.status;
      const message = status === 409 ? "Bạn đã có gói hoạt động." : err?.message || "Không thể xử lý thanh toán.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 animate-spin rounded-full border-b-2 border-slate-500" />
          <p className="text-slate-600">Đang tải gói học...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-xl bg-white p-8 shadow text-center">
          <p className="text-slate-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearAuth();
    navigate("/landing", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-emerald-50 via-white to-slate-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <section className={`${shimmer} rounded-3xl border border-emerald-100 px-8 py-10 shadow-xl`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Chọn gói luyện tập</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Mở khóa toàn bộ trải nghiệm AI Speaking</h1>
              <p className="mt-2 text-slate-600">
                Nâng cấp hành trình học nói tiếng Anh với mentor cá nhân, phản hồi thời gian thực và thống kê luyện tập.
              </p>
            </div>
            {activeSubscription ? (
              <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4 text-sm text-slate-700">
                <p className="text-xs uppercase text-slate-500">Gói hiện tại</p>
                <p className="text-lg font-semibold text-emerald-700">{activeSubscription.packageName ?? "Đang hoạt động"}</p>
                <p className="text-xs text-slate-500">Hết hạn: {activeSubscription.endDate}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm text-slate-500">
                Chưa có gói hoạt động
              </div>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <article
              key={pkg.id}
              className={`flex flex-col rounded-2xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                selectedPackageId === pkg.id ? "border-emerald-400 bg-white" : "border-slate-200 bg-white/95"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{pkg.name}</h3>
                  <p className="text-sm text-slate-500">{pkg.description}</p>
                </div>
                {pkg.durationDays && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {pkg.durationDays} ngày
                  </span>
                )}
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{formatCurrency(pkg.price)}</p>
              <p className="text-xs text-slate-400">Thanh toán một lần</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {(pkg.features && pkg.features.length > 0 ? pkg.features : ["Luyện tập không giới hạn", "Báo cáo chi tiết", "Mentor hỗ trợ 24/7"]).map((feature, idx) => (
                  <li key={`${pkg.id}-feature-${idx}`} className="flex items-center gap-2">
                    <span className="text-emerald-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelectPackage(pkg)}
                className={`mt-auto rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  selectedPackageId === pkg.id
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                {selectedPackageId === pkg.id ? "Đang được chọn" : "Chọn gói này"}
              </button>
            </article>
          ))}
          {packages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/90 p-6 text-center text-slate-500">
              Hiện chưa có gói nào khả dụng.
            </div>
          )}
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900">Chi tiết thanh toán</h2>
            {selectedPackage ? (
              <>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                  <div>
                    <p className="text-sm text-slate-500">Gói đã chọn</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedPackage.name}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(selectedPackage.price)}</p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {PAYMENT_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-2xl border p-4 ${paymentMethod === option.value ? "border-emerald-400 bg-emerald-50/60" : "border-slate-200"}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={() => setPaymentMethod(option.value)}
                        className="hidden"
                      />
                      <p className="text-base font-semibold text-slate-900">{option.label}</p>
                      <p className="text-sm text-slate-500">{option.description}</p>
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchase}
                  className="mt-6 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-center text-white font-semibold shadow-lg transition hover:bg-emerald-500 disabled:opacity-60"
                >
                  {isProcessing ? "Đang xử lý..." : "Thanh toán và kích hoạt"}
                </button>
              </>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Hãy chọn một gói ở trên để xem chi tiết thanh toán.</p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/95 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Vì sao nên nâng cấp?</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Mentor AI và người thật theo dõi sự tiến bộ của bạn mỗi ngày.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Báo cáo phát âm, ngữ pháp và lưu loát sau từng buổi nói.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Quyền truy cập các chủ đề nâng cao và lớp nói trực tiếp.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500">•</span>
                Hỗ trợ ưu tiên 24/7 và lịch mentor linh hoạt.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LearnerPackagePage;
