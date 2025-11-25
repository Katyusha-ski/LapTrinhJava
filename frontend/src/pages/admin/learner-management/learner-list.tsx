import { useState, useEffect } from 'react';
import { learnerApi } from '../../../api/learner.api';
import type { LearnerProfile } from '../../../api/learner.api';

export const LearnerList = () => {
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      const data = await learnerApi.getAll(1, 10);
      const list = Array.isArray(data) ? data : (data as any).content || [];
      setLearners(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await learnerApi.delete(id);
      setLearners(learners.filter(l => l.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Learner Management</h1>

        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Level</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Goal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {learners.map((learner) => (
                  <tr key={learner.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{learner.fullName || learner.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">{learner.englishLevel || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate">{learner.learningGoals || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <button onClick={() => setDeleteId(learner.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {deleteId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold mb-4">Delete Learner?</h3>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 border px-4 py-2 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerList;
