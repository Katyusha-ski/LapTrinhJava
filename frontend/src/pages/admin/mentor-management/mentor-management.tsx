import React, { useEffect, useMemo, useState } from "react";
import { mentorApi } from "../../../api/mentor.api";
import type { Mentor } from "../../../types/mentor";
import type { EnglishLevel } from "../../../types/shared";
import { ENGLISH_LEVEL_OPTIONS } from "../../../types/shared";

interface FilterState {
  skill: string;
  level: string;
  minRating: string;
  maxRate: string;
  onlyAvailable: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  skill: "",
  level: "",
  minRating: "",
  maxRate: "",
  onlyAvailable: false,
};

const AdminMentorManagement: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const buildSearchParams = () => {
    const params: Record<string, unknown> = {};
    if (filters.skill.trim()) params.skill = filters.skill.trim();
    if (filters.level) params.level = filters.level as EnglishLevel;
    if (filters.minRating) params.minRating = Number(filters.minRating);
    if (filters.maxRate) params.maxRate = Number(filters.maxRate);
    if (filters.onlyAvailable) params.onlyAvailable = true;
    return params;
  };

  const loadMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildSearchParams();
      const hasParams = Object.keys(params).length > 0;
      const data = hasParams
        ? await mentorApi.search(params)
        : await mentorApi.getAll();
      setMentors(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách mentor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    loadMentors();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setTimeout(() => {
      loadMentors();
    }, 0);
  };

  const handleToggleAvailability = async (mentorId: number) => {
    try {
      const updated = await mentorApi.toggleAvailability(mentorId);
      setMentors((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      setStatusMessage(`Đã cập nhật trạng thái của ${updated.fullName}`);
    } catch (err: any) {
      setError(err?.message ?? "Không thể cập nhật trạng thái mentor");
    }
  };

  const uniqueSkills = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((mentor) => {
      mentor.skills?.forEach((skill) => set.add(skill));
    });
    return Array.from(set);
  }, [mentors]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Mentor</h1>
          <p className="mt-2 text-sm text-gray-600">
            Lọc theo kỹ năng, trình độ và các tiêu chí khác để quản lý đội ngũ mentor.
          </p>
        </header>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleApplyFilters} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Kỹ năng</label>
              <input
                type="text"
                value={filters.skill}
                onChange={(e) => setFilters((prev) => ({ ...prev, skill: e.target.value }))}
                placeholder="Ví dụ: Business English"
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
                list="mentor-skill-suggestions"
              />
              <datalist id="mentor-skill-suggestions">
                {uniqueSkills.map((skill) => (
                  <option key={skill} value={skill} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Trình độ</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              >
                <option value="">Tất cả</option>
                {ENGLISH_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Điểm đánh giá tối thiểu</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={filters.minRating}
                onChange={(e) => setFilters((prev) => ({ ...prev, minRating: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Học phí tối đa (USD/h)</label>
              <input
                type="number"
                min={0}
                step={5}
                value={filters.maxRate}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxRate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring"
              />
            </div>

            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
              <input
                id="onlyAvailable"
                type="checkbox"
                checked={filters.onlyAvailable}
                onChange={(e) => setFilters((prev) => ({ ...prev, onlyAvailable: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="onlyAvailable" className="ml-2 text-sm text-gray-700">
                Chỉ hiển thị mentor đang mở lịch
              </label>
            </div>

            <div className="flex gap-3 lg:col-span-5">
              <button
                type="submit"
                className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Áp dụng bộ lọc
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
              >
                Đặt lại
              </button>
            </div>
          </form>
        </section>

        {statusMessage && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
            {statusMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Danh sách mentor</h2>
            {loading && <span className="text-sm text-gray-500">Đang tải...</span>}
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Mentor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kinh nghiệm
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Đánh giá
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Học phí
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Kỹ năng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trình độ hỗ trợ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mentors.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                      Không tìm thấy mentor nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  mentors.map((mentor) => (
                    <tr key={mentor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {mentor.avatarUrl ? (
                            <img
                              src={mentor.avatarUrl}
                              alt={mentor.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                              {mentor.fullName?.charAt(0) ?? "M"}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{mentor.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {mentor.totalStudents ?? 0} học viên • {mentor.bio ?? "Chưa có mô tả"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {mentor.experienceYears ?? 0} năm
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {mentor.rating != null ? mentor.rating.toFixed(1) : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {mentor.hourlyRate != null ? `$${mentor.hourlyRate.toFixed(2)}/h` : "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {mentor.skills?.length ? (
                            mentor.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Chưa cập nhật</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        <div className="flex flex-wrap gap-1">
                          {mentor.supportedLevels?.length ? (
                            mentor.supportedLevels.map((level) => (
                              <span
                                key={level}
                                className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600"
                              >
                                {level}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">Chưa cập nhật</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            mentor.isAvailable
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {mentor.isAvailable ? "Đang mở lịch" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(mentor.id)}
                          className="rounded-xl border border-blue-200 px-4 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                          Đổi trạng thái
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminMentorManagement;
