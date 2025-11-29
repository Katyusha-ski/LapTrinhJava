import { useState, useEffect } from 'react';
import { learnerApi } from '../../../api/learner.api';
import { userApi } from '../../../api/user.api';
import { toast } from 'react-toastify';
import { Popconfirm } from 'antd';
import type { LearnerProfile } from '../../../api/learner.api';

export const LearnerList = () => {
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewLearner, setViewLearner] = useState<LearnerProfile | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editValues, setEditValues] = useState<{
    mentorId?: number | null;
    englishLevel?: string | null;
    learningGoals?: string | null;
  }>({ mentorId: null, englishLevel: 'A1', learningGoals: '' });

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

  const openEdit = (learner: LearnerProfile) => {
    setEditId(learner.id ?? null);
    setEditValues({
      mentorId: learner.mentorId ?? null,
      englishLevel: learner.englishLevel ?? 'A1',
      learningGoals: learner.learningGoals ?? '',
    });
    setIsEditOpen(true);
  };

  const openView = (learner: LearnerProfile) => {
    setViewLearner(learner);
    setIsViewOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editId) return;
    try {
      await learnerApi.update(editId, {
        userId: 0, // API expects userId but backend uses existing association; keep 0 to avoid changing
        mentorId: editValues.mentorId ?? null,
        englishLevel: editValues.englishLevel ?? null,
        learningGoals: editValues.learningGoals ?? null,
      });
      toast.success('Cập nhật learner thành công');
      setIsEditOpen(false);
      setEditId(null);
      loadLearners();
    } catch (err) {
      toast.error('Không thể cập nhật learner');
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
                        <div className="flex items-center gap-3">
                          <button onClick={() => openView(learner)} className="bg-yellow-400 text-black px-3 py-1 rounded-lg border border-yellow-400 hover:bg-yellow-500">View</button>
                          <button onClick={() => openEdit(learner)} className="text-blue-600 hover:text-blue-900 border border-gray-300 px-3 py-1 rounded-lg">Edit</button>
                          {learner.isActive ? (
                            <Popconfirm
                              title="Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?"
                              onConfirm={async () => {
                                try {
                                  await userApi.setActive(learner.userId, false);
                                  toast.success('Tài khoản đã bị vô hiệu hóa');
                                  loadLearners();
                                } catch (err) {
                                  toast.error('Không thể cập nhật trạng thái tài khoản');
                                }
                              }}
                              okText="Vô hiệu hóa"
                              cancelText="Hủy"
                            >
                              <button className="bg-white text-red-600 px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">Disable</button>
                            </Popconfirm>
                          ) : (
                            <Popconfirm
                              title="Bạn có chắc chắn muốn kích hoạt tài khoản này?"
                              onConfirm={async () => {
                                try {
                                  await userApi.setActive(learner.userId, true);
                                  toast.success('Tài khoản đã được kích hoạt');
                                  loadLearners();
                                } catch (err) {
                                  toast.error('Không thể cập nhật trạng thái tài khoản');
                                }
                              }}
                              okText="Kích hoạt"
                              cancelText="Hủy"
                            >
                              <button className="bg-green-600 text-white px-3 py-1 rounded-lg border border-green-600">Enable</button>
                            </Popconfirm>
                          )}
                          <button onClick={() => setDeleteId(learner.id)} className="bg-red-600 text-white px-3 py-1 rounded-lg border border-red-600 hover:bg-red-700">
                            Delete
                          </button>
                        </div>
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
                <button onClick={() => setDeleteId(null)} className="flex-1 border border-gray-300 px-4 py-2 rounded-lg">
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg border border-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {isEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Learner</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mentor ID (optional)</label>
                  <input
                    type="number"
                    value={editValues.mentorId ?? ''}
                    onChange={e => setEditValues({ ...editValues, mentorId: e.target.value ? Number(e.target.value) : null })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">English Level</label>
                  <select
                    value={editValues.englishLevel ?? 'A1'}
                    onChange={e => setEditValues({ ...editValues, englishLevel: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Learning Goals</label>
                  <textarea
                    value={editValues.learningGoals ?? ''}
                    onChange={e => setEditValues({ ...editValues, learningGoals: e.target.value })}
                    className="w-full border rounded px-3 py-2 h-24"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-4 justify-end">
                <button onClick={() => { setIsEditOpen(false); setEditId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button onClick={() => handleEditSubmit()} className="px-4 py-2 bg-blue-600 text-white rounded-lg border border-blue-600">Save</button>
              </div>
            </div>
          </div>
        )}
        {isViewOpen && viewLearner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Learner Details</h3>
              <div className="grid grid-cols-1 gap-2">
                <div><strong>Full Name:</strong> {viewLearner.fullName || viewLearner.name || '-'}</div>
                <div><strong>User ID:</strong> {viewLearner.userId ?? '-'}</div>
                <div><strong>Active:</strong> {viewLearner.isActive ? 'Yes' : 'No'}</div>
                <div><strong>English Level:</strong> {viewLearner.englishLevel || '-'}</div>
                <div><strong>Learning Goals:</strong> {viewLearner.learningGoals || '-'}</div>
                <div><strong>Mentor ID:</strong> {viewLearner.mentorId ?? '-'}</div>
                <div><strong>Current Streak:</strong> {viewLearner.currentStreak ?? '-'}</div>
                <div><strong>Total Practice Hours:</strong> {viewLearner.totalPracticeHours ?? '-'}</div>
                <div><strong>Average Pronunciation Score:</strong> {viewLearner.averagePronunciationScore ?? '-'}</div>
                <div><strong>Joined At:</strong> {viewLearner.createdAt ?? '-'}</div>
              </div>
              <div className="mt-6 flex gap-4 justify-end">
                <button onClick={() => { setIsViewOpen(false); setViewLearner(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnerList;
