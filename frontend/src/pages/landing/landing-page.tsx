import { Link } from "react-router-dom";

const features = [
  {
    title: "AI Pronunciation Coach",
    description: "Nhận phản hồi phát âm theo thời gian thực với điểm số và hướng dẫn cụ thể từ trợ lý AI VoiceUp.",
  },
  {
    title: "Mentor Cá Nhân",
    description: "Kết nối với mentor phù hợp kỹ năng và cấp độ để luyện tập hội thoại theo mục tiêu nghề nghiệp của bạn.",
  },
  {
    title: "Lộ Trình Cá Nhân Hóa",
    description: "Từ onboarding đến các phiên luyện tập hằng ngày được thiết kế dựa trên mục tiêu và ngành của bạn.",
  },
  {
    title: "Theo Dõi Tiến Bộ",
    description: "Xem biểu đồ cải thiện phát âm, từ vựng và sự tự tin qua từng phiên luyện tập.",
  },
];

const steps = [
  {
    label: "Tạo tài khoản",
    description: "Đăng ký VoiceUp và nhận quyền truy cập vào toàn bộ nền tảng.",
  },
  {
    label: "Hoàn tất onboarding",
    description: "Chia sẻ mục tiêu, trình độ và ngành nghề để hệ thống gợi ý lộ trình.",
  },
  {
    label: "Luyện tập cùng AI và mentor",
    description: "Bắt đầu luyện phát âm, thực hành hội thoại và đặt lịch với mentor yêu thích.",
  },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="flex w-full flex-col px-6 pt-8 pb-16 sm:px-10 sm:pt-10 lg:px-16 xl:px-24">
        <header className="flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight">VoiceUp</div>
          <nav className="flex items-center gap-4 text-base">
            <Link to="/login" className="rounded-full px-5 py-2 text-slate-300 transition hover:text-white">
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2.5 font-semibold text-white shadow-lg transition hover:opacity-90"
            >
              Đăng ký
            </Link>
          </nav>
        </header>

        <main className="mt-16 grid gap-24">
          <section className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-widest text-slate-200">
                Elevate Your English
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                Phát âm chuẩn, tự tin giao tiếp cùng VoiceUp trong 30 ngày
              </h1>
              <p className="text-base text-slate-300 md:text-lg">
                Kết hợp bài luyện phát âm được chấm điểm bởi AI và hỗ trợ từ mentor bản ngữ. VoiceUp giúp bạn luyện tập
                chủ động, theo sát tiến độ và bứt phá trong sự nghiệp quốc tế.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3 text-sm font-semibold shadow-lg transition hover:opacity-90"
                >
                  Bắt đầu ngay
                </Link>
                <Link to="/onboarding" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/40">
                  Xem VoiceUp hoạt động thế nào
                </Link>
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-white">4.9/5</span>
                  <span>Đánh giá từ 1.200+ học viên</span>
                </div>
                <div className="h-3 w-px bg-white/20" />
                <div>Cam kết hoàn tiền trong 14 ngày</div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-indigo-500/30 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
                <div className="flex flex-col gap-4">
                  <p className="text-sm uppercase tracking-widest text-indigo-200">AI Feedback</p>
                  <div className="rounded-2xl bg-black/50 p-6">
                    <div className="text-sm text-slate-300">
                      "Bạn vừa phát âm từ <span className="font-semibold text-white">entrepreneur</span>. Hãy giữ năng lượng và kéo dài âm \"prə\" lâu hơn."
                    </div>
                    <div className="mt-4 text-right text-xs text-slate-500">VoiceUp Assistant</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
                    <h3 className="text-lg font-semibold">Mentor Lisa Johnson</h3>
                    <p className="mt-2 text-sm text-slate-300">TESOL Certified • 6 năm kinh nghiệm huấn luyện phát âm và phỏng vấn.</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                      <span>Chỉ còn 3 slot tuần này</span>
                      <span className="h-3 w-px bg-white/20" />
                      <span>Timezone GMT+7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-10">
            <h2 className="text-3xl font-semibold">VoiceUp giúp bạn bứt phá</h2>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-10">
            <h2 className="text-3xl font-semibold">3 bước để khởi động hành trình</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.label} className="rounded-2xl border border-white/10 bg-black/40 p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-lg font-semibold">
                      {index + 1}
                    </div>
                    <div className="text-lg font-semibold text-white">{step.label}</div>
                  </div>
                  <p className="mt-4 text-sm text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col items-center gap-6 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-10 text-center">
            <h2 className="text-3xl font-semibold text-white">Sẵn sàng chinh phục mục tiêu tiếng Anh của bạn?</h2>
            <p className="max-w-2xl text-sm text-white/80 md:text-base">
              Gia nhập cộng đồng VoiceUp, luyện tập với mentor chuyên nghiệp và nhận phản hồi tức thì từ AI. Chúng tôi đồng hành cùng bạn trong từng giờ luyện tập.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/register"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Bắt đầu miễn phí
              </Link>
              <Link to="/login" className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Tôi đã có tài khoản
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
