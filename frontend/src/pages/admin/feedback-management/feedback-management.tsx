import React, { useEffect, useState } from 'react';
import { listFeedbacks, moderateFeedback, deleteFeedback, FeedbackResponse } from '../../../api/feedback.api';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const pageSizeOptions = [10, 20, 50];

const FeedbackManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<FeedbackResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !user.roles?.includes('ADMIN')) {
      navigate('/login');
      return;
    }
    fetchPage(page, size, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, statusFilter, user]);

  const fetchPage = async (p: number, s: number, status?: string) => {
    setLoading(true);
    try {
      const res = await listFeedbacks(p, s, status);
      console.debug('Feedback list response:', res);
      // support backend returning either a Page-like object or a raw array
      if (Array.isArray((res as any).content) || Array.isArray(res as any)) {
        if (Array.isArray((res as any).content)) {
          setItems((res as any).content as FeedbackResponse[]);
          setTotal((res as any).totalElements ?? ((res as any).content as FeedbackResponse[]).length);
        } else {
          setItems(res as any as FeedbackResponse[]);
          setTotal((res as any).length ?? 0);
        }
      } else {
        setItems(res.content || []);
        setTotal(res.totalElements ?? 0);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleModerate = async (id: number, status: string) => {
    try {
      await moderateFeedback(id, status);
      toast.success('Updated');
      fetchPage(page, size, statusFilter);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await deleteFeedback(id);
      toast.success('Deleted');
      fetchPage(page, size, statusFilter);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Feedback Management</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm">Status:</label>
          <select value={statusFilter ?? ''} onChange={(e) => setStatusFilter(e.target.value || undefined)} className="rounded border px-2 py-1">
            <option value="">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <label className="text-sm">Per page:</label>
          <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }} className="rounded border px-2 py-1">
            {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No feedbacks to show.</div>
          ) : null}

          {/* Cards list */}
          {items.map((it) => (
            <div key={it.id} className="bg-white rounded-lg shadow-sm p-4 border">
              <div className="flex items-start gap-4">
                <div className="w-12 text-sm text-gray-600">#{it.id}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-medium text-gray-900">{it.learnerName ?? '—'}</div>
                      <div className="text-sm text-gray-500">{it.createdAt ? new Date(it.createdAt).toLocaleString() : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* status badge */}
                      {it.status === 'PENDING' && <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 text-sm">Pending</span>}
                      {it.status === 'APPROVED' && <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm">Approved</span>}
                      {it.status === 'REJECTED' && <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 text-sm">Rejected</span>}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{it.content}</div>

                  <div className="mt-4 flex items-center gap-2">
                    {it.status !== 'APPROVED' && (
                      <button onClick={() => handleModerate(it.id, 'APPROVED')} className="rounded bg-green-50 px-3 py-1 text-sm text-green-700">Approve</button>
                    )}
                    {it.status !== 'REJECTED' && (
                      <button onClick={() => handleModerate(it.id, 'REJECTED')} className="rounded bg-amber-50 px-3 py-1 text-sm text-amber-700">Reject</button>
                    )}
                    <button onClick={() => handleDelete(it.id)} className="rounded bg-rose-50 px-3 py-1 text-sm text-rose-600">Delete</button>

                    {/* tags: quick metadata */}
                    <div className="ml-4 flex items-center gap-2">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">ID: {it.id}</span>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">Len: {it.content?.length ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing {items.length} of {total}</div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 rounded border" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Prev</button>
              <span className="text-sm">Page {page + 1}</span>
              <button className="px-3 py-1 rounded border" disabled={(page + 1) * size >= total} onClick={() => setPage((p) => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;
