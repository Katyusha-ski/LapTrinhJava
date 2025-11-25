import { useState, useEffect } from 'react';
import type { Mentor } from '../../../types/mentor';
import { useNavigate } from 'react-router-dom';
import { mentorApi } from '../../../api/mentor.api';

export const MentorList = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const pageSize = 10;

  useEffect(() => {
    loadMentors();
  }, [page]);

  const loadMentors = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await mentorApi.getAll(page, pageSize);
      const mentorList = Array.isArray(data) ? data : (data as any).content || [];
      setMentors(mentorList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors');
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await mentorApi.delete(id);
      setMentors(mentors.filter(m => m.id !== id));
      setDeleteId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete mentor');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
          <button
            onClick={() => navigate('/admin/mentors/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Mentor
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading mentors...</div>
          ) : mentors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No mentors found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Skills</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Rating</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{mentor.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{mentor.skills.join(', ')}</td>
                    <td className="px-6 py-4 text-sm">{'⭐'.repeat(Math.round(mentor.rating || 0))}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-white text-xs ${mentor.isAvailable ? 'bg-green-600' : 'bg-gray-400'}`}>
                        {mentor.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button onClick={() => setDeleteId(mentor.id)} className="text-red-600 hover:text-red-900">
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
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure?</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 border px-4 py-2 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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

export default MentorList;
