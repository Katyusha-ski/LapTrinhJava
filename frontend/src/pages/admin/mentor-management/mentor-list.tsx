import { useState, useEffect } from 'react';
import type { Mentor } from '../../../types/mentor';
import { useNavigate } from 'react-router-dom';
import { mentorApi } from '../../../api/mentor.api';
import { userApi } from '../../../api/user.api';
import { Popconfirm } from 'antd';
import { toast } from 'react-toastify';

export const MentorList = () => {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editValues, setEditValues] = useState<{
    yearsExperience?: number | null;
    hourlyRate?: number | null;
    isAvailable?: boolean;
    skills?: string;
    bio?: string;
  }>({ yearsExperience: 0, hourlyRate: 0, isAvailable: true, skills: '', bio: '' });
  const [viewMentor, setViewMentor] = useState<Mentor | null>(null);
  const [isMentorViewOpen, setIsMentorViewOpen] = useState(false);

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

  const openEdit = (mentor: Mentor) => {
    setEditId(mentor.id ?? null);
    setEditValues({
      yearsExperience: mentor.experienceYears ?? 0,
      hourlyRate: mentor.hourlyRate ?? 0,
      isAvailable: mentor.isAvailable ?? true,
      skills: mentor.skills?.join(', ') ?? '',
      bio: mentor.bio ?? '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editId) return;
    try {
      await mentorApi.update(editId, {
        yearsExperience: editValues.yearsExperience ?? undefined,
        hourlyRate: editValues.hourlyRate ?? undefined,
        availability: editValues.isAvailable,
        qualifications: editValues.skills,
        bio: editValues.bio,
      });
      toast.success('Cập nhật mentor thành công');
      setIsEditOpen(false);
      setEditId(null);
      loadMentors();
    } catch (err) {
      toast.error('Không thể cập nhật mentor');
    }
  };

  const toggleUserActive = async (userId: number, active: boolean) => {
    try {
      await userApi.setActive(userId, active);
      toast.success('Cập nhật trạng thái tài khoản thành công');
      loadMentors();
    } catch (err) {
      toast.error('Không thể cập nhật trạng thái tài khoản');
    }
  };

  const openMentorView = (mentor: Mentor) => {
    setViewMentor(mentor);
    setIsMentorViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Mentor Management</h1>
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
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : mentors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No mentors found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-8 py-4 text-left text-2xl font-semibold">Name</th>
                  <th className="px-8 py-4 text-left text-2xl font-semibold">Skills</th>
                  <th className="px-8 py-4 text-left text-2xl font-semibold">Rating</th>
                  <th className="px-8 py-4 text-left text-2xl font-semibold">Status</th>
                  <th className="px-8 py-4 text-left text-2xl font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {mentors.map((mentor) => (
                  <tr key={mentor.id} className="hover:bg-gray-50">
                    <td className="px-9 py-6 text-xl">{mentor.fullName}</td>
                    <td className="px-9 py-6 text-xl text-gray-600 truncate max-w-2xl">{mentor.skills?.join(', ') ?? '-'}</td>
                    <td className="px-9 py-6 text-xl">{'⭐'.repeat(Math.round(mentor.rating || 0))}</td>
                    <td className="px-9 py-6 text-xl">
                      <span className={`px-3 py-1 rounded text-white text-sm ${mentor.isAvailable ? 'bg-green-600' : 'bg-gray-400'}`}>
                        {mentor.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-9 py-6 text-xl space-x-3">
                      <button onClick={() => openMentorView(mentor)} className="bg-yellow-400 text-black px-5 py-3 rounded-lg border border-yellow-400 hover:bg-yellow-500">View</button>
                      <button onClick={() => openEdit(mentor)} className="text-blue-600 hover:text-blue-900 border border-gray-300 px-5 py-3 rounded-lg">Edit</button>
                      {mentor.isActive ? (
                        <Popconfirm
                          title="Bạn có chắc chắn muốn vô hiệu hóa tài khoản này?"
                          onConfirm={() => toggleUserActive(mentor.userId, false)}
                          okText="Vô hiệu hóa"
                          cancelText="Hủy"
                        >
                          <button className="bg-white text-red-600 px-5 py-3 rounded-lg border border-gray-300 hover:bg-gray-50">Disable Account</button>
                        </Popconfirm>
                      ) : (
                        <Popconfirm
                          title="Bạn có chắc chắn muốn kích hoạt tài khoản này?"
                          onConfirm={() => toggleUserActive(mentor.userId, true)}
                          okText="Kích hoạt"
                          cancelText="Hủy"
                        >
                          <button className="bg-green-600 text-white px-5 py-3 rounded-lg border border-green-600">Enable</button>
                        </Popconfirm>
                      )}
                      <button onClick={() => setDeleteId(mentor.id)} className="bg-red-600 text-white px-5 py-3 rounded-lg border border-red-600 hover:bg-red-700">
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
        {isEditOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Mentor</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Years Experience</label>
                  <input
                    type="number"
                    value={editValues.yearsExperience ?? 0}
                    onChange={e => setEditValues({ ...editValues, yearsExperience: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hourly Rate</label>
                  <input
                    type="number"
                    value={editValues.hourlyRate ?? 0}
                    onChange={e => setEditValues({ ...editValues, hourlyRate: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="inline-flex items-center">
                    <input type="checkbox" checked={!!editValues.isAvailable} onChange={e => setEditValues({ ...editValues, isAvailable: e.target.checked })} className="mr-2" />
                    Available
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skills (comma separated)</label>
                  <input
                    type="text"
                    value={editValues.skills ?? ''}
                    onChange={e => setEditValues({ ...editValues, skills: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bio</label>
                  <textarea value={editValues.bio ?? ''} onChange={e => setEditValues({ ...editValues, bio: e.target.value })} className="w-full border rounded px-3 py-2 h-24" />
                </div>
              </div>
              <div className="mt-6 flex gap-4 justify-end">
                <button onClick={() => { setIsEditOpen(false); setEditId(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button onClick={() => handleEditSubmit()} className="px-4 py-2 bg-blue-600 text-white rounded-lg border border-blue-600">Save</button>
              </div>
            </div>
          </div>
        )}
        {isMentorViewOpen && viewMentor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Mentor Details</h3>
              <div className="grid grid-cols-1 gap-2">
                <div><strong>Full Name:</strong> {viewMentor.fullName}</div>
                <div><strong>User ID:</strong> {viewMentor.userId ?? '-'}</div>
                <div><strong>Available:</strong> {viewMentor.isAvailable ? 'Yes' : 'No'}</div>
                <div><strong>Experience Years:</strong> {viewMentor.experienceYears ?? '-'}</div>
                <div><strong>Hourly Rate:</strong> {viewMentor.hourlyRate ?? '-'}</div>
                <div><strong>Rating:</strong> {viewMentor.rating ?? '-'}</div>
                <div><strong>Skills:</strong> {viewMentor.skills?.join(', ') ?? '-'}</div>
                <div><strong>Bio:</strong> {viewMentor.bio ?? '-'}</div>
              </div>
              <div className="mt-6 flex gap-4 justify-end">
                <button onClick={() => { setIsMentorViewOpen(false); setViewMentor(null); }} className="px-4 py-2 border border-gray-300 rounded-lg">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorList;
