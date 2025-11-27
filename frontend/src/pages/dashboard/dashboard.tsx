import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "../../components/layout";
import { getAuth, clearAuth } from "../../utils/auth";
import type { JwtResponse } from "../../types/jwt";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<JwtResponse | null>(null);

  useEffect(() => {
    const auth = getAuth();
    if (auth) {
      setUser(auth);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    navigate("/login");
  };

  const isLearner = user?.roles?.includes("LEARNER");

  return (
    <div className="min-h-screen bg-slate-50">
      <NavigationBar user={user} onLogout={handleLogout} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Welcome back, {user?.fullName || 'User'} <span className="inline-block">👋</span></h2>
            <p className="text-slate-500 mt-1">You're making great progress. Keep it up!</p>
          </div>
        </div>

        {/* Stats Row */}
        {isLearner && (
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-4">
            {[
              { title: 'Day Streak', value: '12', icon: '🔥' },
              { title: 'Sessions This Week', value: '8', icon: '🗓️' },
              { title: 'Average Score', value: '87', icon: '⭐' },
              { title: 'Leaderboard Rank', value: '#24', icon: '🏆' },
            ].map((s) => (
              <div key={s.title} className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">{s.title}</p>
                    <p className="mt-1 text-xl font-bold text-slate-800">{s.value}</p>
                  </div>
                  <div className="text-2xl">{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Columns */}
        {isLearner && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column - main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Continue Session Card */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Continue Learning</p>
                    <h3 className="text-lg font-semibold text-slate-800">Meeting & Presentations</h3>
                    <p className="text-sm text-slate-400 mt-1">Lesson 3 of 8 • 38% Complete</p>
                  </div>
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold">Continue Session</button>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-2 bg-blue-600" style={{ width: '38%' }} />
                </div>
              </div>

              {/* Recommended Practice */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-slate-800">Recommended Practice</h4>
                  <button className="text-sm text-blue-600">See More</button>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { title: 'Travel: At the Airport', level: 'Intermediate', time: '15 min' },
                    { title: 'Daily Life: Shopping & Bargaining', level: 'Beginner', time: '12 min' },
                    { title: "Healthcare: Doctor's Appointment", level: 'Advanced', time: '20 min' },
                  ].map((p) => (
                    <div key={p.title} className="flex items-center justify-between rounded-lg p-3 border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">▶️</div>
                        <div>
                          <p className="font-semibold text-slate-800">{p.title}</p>
                          <p className="text-xs text-slate-400">{p.level} • {p.time}</p>
                        </div>
                      </div>
                      <button className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md">Start</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Sessions */}
              <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
                <h4 className="text-lg font-semibold text-slate-800">Recent Sessions</h4>
                <div className="mt-4 space-y-3">
                  {[{ title: 'Job Interview Practice', time: '2 hours ago • 18 min', score: 92 }, { title: 'Business Email Writing', time: 'Yesterday • 15 min', score: 88 }, { title: 'Casual Conversation', time: '2 days ago • 20 min', score: 85 }].map((s) => (
                    <div key={s.title} className="flex items-center justify-between rounded-lg p-3 border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800">{s.title}</p>
                        <p className="text-xs text-slate-400">{s.time}</p>
                      </div>
                      <div className="text-sm font-semibold text-slate-700">{s.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-6">
              {/* Quick Actions */}
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-800">Quick Actions</h5>
                <div className="mt-3 divide-y divide-slate-100">
                  {[
                    { label: 'Start Solo Practice', icon: '🎧' },
                    { label: 'Join Group Room', icon: '👥' },
                    { label: 'Book a Mentor', icon: '📅' },
                  ].map((a) => (
                    <button key={a.label} className="w-full flex items-center gap-3 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-md">
                      <span className="text-lg">{a.icon}</span>
                      <span>{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Path */}
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-800">Learning Path</h5>
                <div className="mt-3 space-y-4">
                  {[{ title: 'Business English', pct: 42 }, { title: 'Travel Conversations', pct: 75 }, { title: 'Job Interview Prep', pct: 28 }].map((lp) => (
                    <div key={lp.title}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-700">{lp.title}</p>
                        <p className="text-xs text-slate-500">{lp.pct}%</p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                        <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${lp.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
                <h5 className="text-sm font-semibold text-slate-800">Leaderboard</h5>
                <div className="mt-3 space-y-2">
                  {[{ name: 'Alex Chen', pts: 1250 }, { name: 'Maria Silva', pts: 1180 }, { name: 'John Kim', pts: 1150 }, { name: 'You', pts: 890 }].map((l, idx) => (
                    <div key={l.name} className="flex items-center justify-between text-sm text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold">{idx + 1}</div>
                        <div>{l.name}</div>
                      </div>
                      <div className="text-slate-500">{l.pts}pts</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
