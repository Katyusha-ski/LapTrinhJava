import React from 'react';
import { useEffect, useState } from 'react';
import { httpClient } from '../../api/httpClient';

type Purchase = {
  id: number;
  learnerId: number;
  learnerName: string;
  packageId: number;
  packageName: string;
  paymentAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  status: string;
  createdAt?: string;
};

export const PackageList: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await httpClient('/api/admin/subscriptions', { method: 'GET' });
      setPurchases(res ?? []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPurchases();
  }, []);

  const changeStatus = async (id: number, status: string) => {
    try {
      await httpClient(`/api/admin/subscriptions/${id}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      // Refresh
      void loadPurchases();
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Purchase Management</h1>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">View learner purchases and manage payment status</div>
          <div>
            <button onClick={() => void loadPurchases()} className="rounded bg-slate-100 px-3 py-1 text-sm">Refresh</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.learnerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.packageName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${p.paymentAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {p.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-2 text-emerald-600">
                        <span className="rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 text-xs">✓</span>
                        <span className="font-medium">Active</span>
                      </span>
                    ) : p.status === 'CANCELLED' ? (
                      <span className="inline-flex items-center gap-2 text-amber-600">
                        <span className="rounded-full bg-amber-100 text-amber-700 px-1.5 py-0.5 text-xs">!</span>
                        <span className="font-medium">Cancelled</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-600">
                        <span className="rounded-full bg-gray-100 text-gray-700 px-1.5 py-0.5 text-xs">•</span>
                        <span className="font-medium capitalize">{p.status.toLowerCase()}</span>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.paymentDate ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {p.status === 'ACTIVE' ? (
                      <button
                        onClick={() => void changeStatus(p.id, 'CANCELLED')}
                        className="rounded bg-amber-500 px-3 py-1 text-white text-sm"
                      >
                        Cancel Active
                      </button>
                    ) : (
                      <button
                        onClick={() => void changeStatus(p.id, 'ACTIVE')}
                        className="rounded bg-emerald-500 px-3 py-1 text-white text-sm"
                      >
                        Set Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No purchases found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageList;
