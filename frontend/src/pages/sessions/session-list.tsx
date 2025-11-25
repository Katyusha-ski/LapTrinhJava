import { useState, useEffect } from 'react';

// Inline types to avoid import issues
interface PracticeSession {
  id: number;
  learnerId: number;
  mentorId: number;
  startTime?: string | null;
  endTime?: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  topic?: string | null;
  duration?: number | null;
}

// Inline API to avoid import issues
const sessionApi = {
  getAll: async (page?: number, size?: number) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const response = await fetch(`http://localhost:8080/api/practice-sessions?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
};

export const SessionList = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionApi.getAll(1, 10);
      const list = Array.isArray(data) ? data : (data as any).content || [];
      setSessions(list);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Practice Sessions</h1>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Learner</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Mentor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Start</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{session.learnerId}</td>
                    <td className="px-6 py-4 text-sm">{session.mentorId}</td>
                    <td className="px-6 py-4 text-sm">{session.startTime}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs text-white ${
                        session.status === 'COMPLETED' ? 'bg-green-600' : 'bg-blue-600'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionList;
