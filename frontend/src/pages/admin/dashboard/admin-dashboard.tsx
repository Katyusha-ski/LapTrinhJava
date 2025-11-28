import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const quickLinks = [
    {
      title: "Mentor Management",
      description: "Review mentor profiles and approvals.",
      action: () => navigate("/admin/mentor-management"),
    },
    {
      title: "Learner Directory",
      description: "Monitor learner progress and subscriptions.",
      action: () => navigate("/admin/learners"),
    },
    {
      title: "Packages",
      description: "Configure learning packages and pricing tiers.",
      action: () => navigate("/packages"),
    },
    {
      title: "Conversation Topics",
      description: "Curate and publish new speaking practice topics.",
      action: () => navigate("/admin/topic-management"),
    },
  ];

  const announcements = [
    {
      title: "Mentor verification",
      detail: "3 new mentor applications are pending review.",
    },
    {
      title: "System health",
      detail: "API latency is normal. No incidents reported in the last 24 hours.",
    },
    {
      title: "Billing",
      detail: "Quarterly revenue report is ready for download.",
    },
  ];

  return (
    <div className="page-gradient">
      <NavigationBar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Admin Control Center</h1>
            <p className="mt-1 text-slate-500">Manage operations, track performance, and support your mentors and learners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-800">Quick actions</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.title}
                    onClick={link.action}
                    className="flex h-full flex-col rounded-xl border border-slate-200/50 bg-white/80 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <span className="text-base font-semibold text-slate-800">{link.title}</span>
                    <span className="mt-2 text-sm text-slate-500">{link.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-800">Platform metrics</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { label: "Active learners", value: "1,248" },
                  { label: "Certified mentors", value: "82" },
                  { label: "Sessions booked (30d)", value: "3,476" },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-xl border border-slate-200/50 bg-white/90 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-800">{metric.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">Announcements</h3>
              <div className="mt-3 space-y-4">
                {announcements.map((item) => (
                  <div key={item.title} className="rounded-lg border border-slate-200/50 bg-white/90 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-700">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">Upcoming tasks</h3>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  Review mentor onboarding queue
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                  Send learner engagement report
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                  Configure holiday promotion campaign
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
