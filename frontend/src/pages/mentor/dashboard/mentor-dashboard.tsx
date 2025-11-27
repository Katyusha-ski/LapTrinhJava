import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "../../../components/layout";
import { useAuth } from "../../../context/AuthContext";

const MentorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const schedule = [
    {
      time: "09:00 - 09:45",
      learner: "Emma Tran",
      topic: "Interview preparation",
    },
    {
      time: "11:15 - 12:00",
      learner: "Lucas Nguyen",
      topic: "Advanced pronunciation",
    },
    {
      time: "14:00 - 14:45",
      learner: "Minh Pham",
      topic: "Business negotiation",
    },
  ];

  const resources = [
    {
      label: "Session history",
      description: "Review transcripts, notes, and learner feedback.",
      action: () => navigate("/sessions"),
    },
    {
      label: "Topic library",
      description: "Select curated speaking scenarios for upcoming lessons.",
      action: () => navigate("/topics"),
    },
    {
      label: "Learner profiles",
      description: "Understand goals and progress before each session.",
      action: () => navigate("/admin/learners"),
    },
  ];

  return (
    <div className="page-gradient">
      <NavigationBar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Mentor Workspace</h1>
            <p className="mt-1 text-slate-500">Plan your sessions, track learner momentum, and access teaching resources.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-800">Today's schedule</h2>
              <div className="mt-4 space-y-4">
                {schedule.map((item) => (
                  <div key={item.time} className="flex items-center justify-between rounded-xl border border-slate-200/40 bg-white/85 p-4 shadow-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.learner}</p>
                      <p className="text-xs text-slate-500">{item.topic}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">{item.time}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-slate-800">Upcoming reminders</h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                  Update feedback for the 14:00 session within 24 hours
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                  Share pronunciation resources with Minh
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                  Confirm availability for next week's group workshop
                </li>
              </ul>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">Quick resources</h3>
              <div className="mt-3 space-y-3">
                {resources.map((block) => (
                  <button
                    key={block.label}
                    onClick={block.action}
                    className="w-full rounded-xl border border-slate-200/50 bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <p className="text-sm font-semibold text-slate-700">{block.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{block.description}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-slate-800">Teaching insights</h3>
              <div className="mt-3 space-y-3 text-sm text-slate-600">
                <p>• Learners improved pronunciation accuracy by 8% this month.</p>
                <p>• Conversation topics about "Career" have the highest engagement.</p>
                <p>• 4 learners requested extra homework materials this week.</p>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default MentorDashboard;
