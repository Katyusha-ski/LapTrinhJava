import React, { useEffect, useMemo, useState } from "react";
import { mentorApi } from "../../../api/mentor.api";
import { learnerApi, type LearnerProfile } from "../../../api/learner.api";
import type { Mentor } from "../../../types/mentor";
import type { EnglishLevel } from "../../../types/shared";
import { ENGLISH_LEVEL_OPTIONS } from "../../../types/shared";
import { getAuth } from "../../../utils/auth";

interface FilterState {
  skill: string;
  level: string;
  minRating: string;
  maxRate: string;
}

const DEFAULT_FILTERS: FilterState = {
  skill: "",
  level: "",
  minRating: "",
  maxRate: "",
};

const MentorSelection: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(null);
  const [selectedMentorId, setSelectedMentorId] = useState<number | null>(null);

  const auth = getAuth();
  const userId = auth?.id;

  const buildSearchParams = (onlyAvailable = true) => {
    const params: Record<string, unknown> = { onlyAvailable };
    if (filters.skill.trim()) params.skill = filters.skill.trim();
    if (filters.level) params.level = filters.level as EnglishLevel;
    if (filters.minRating) params.minRating = Number(filters.minRating);
    if (filters.maxRate) params.maxRate = Number(filters.maxRate);
    return params;
  };

  const loadMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildSearchParams(true);
      const data = await mentorApi.search(params);
      setMentors(data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách mentor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      return;
    }

    const fetchProfile = async () => {
      try {
        const profile = await learnerApi.getByUserId(userId);
        setLearnerProfile(profile);
      } catch (err: any) {
        setError(err?.message ?? "Không thể tải thông tin học viên");
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadMentors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    loadMentors();
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setTimeout(() => loadMentors(), 0);
  };

  const handleSelectMentor = async (mentorId: number) => {
    if (!learnerProfile?.id) {
      setError("Không tìm thấy hồ sơ học viên để gán mentor.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await mentorApi.assignMentor(learnerProfile.id, mentorId);
      setLearnerProfile(updated ?? learnerProfile);
      setSelectedMentorId(mentorId);
      setSuccess("Đã chọn mentor thành công. Mentor sẽ sớm liên hệ với bạn!");
    } catch (err: any) {
      setError(err?.message ?? "Không thể gán mentor. Vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const uniqueSkills = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((mentor) => mentor.skills?.forEach((skill) => set.add(skill)));
    return Array.from(set);
  }, [mentors]);

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Chọn Mentor Đồng Hành</h1>
          <p className="mt-2 text-sm text-gray-600">
            Lọc mentor theo kỹ năng, trình độ để tìm người phù hợp nhất với mục tiêu luyện nói của bạn.
          </p>
        </header>

        <section className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
          <form onSubmit={handleApplyFilters} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
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
              <label className="block text-sm font-medium text-gray-700">Trình độ mong muốn</label>
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

            <div className="flex items-center gap-3 lg:col-span-4">
              <button
                type="submit"
                className="rounded-xl bg-blue-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
              >
                Tìm mentor
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-xl border border-gray-200 px-6 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-800"
              >
                Đặt lại
              </button>
              {loading && <span className="text-sm text-gray-500">Đang tải...</span>}
            </div>
          </form>
        </section>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2">
          {mentors.length === 0 && !loading ? (
            <div className="md:col-span-2 rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h2 className="text-lg font-semibold text-gray-800">Không có mentor phù hợp</h2>
              <p className="mt-2 text-sm text-gray-500">
                Thử nới lỏng bộ lọc hoặc chọn kỹ năng khác để xem thêm lựa chọn.
              </p>
            </div>
          ) : (
            mentors.map((mentor) => {
              const isSelected = mentor.id === selectedMentorId || mentor.id === learnerProfile?.mentorId;
              return (
                <article
                  key={mentor.id}
                  className={`rounded-3xl border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    isSelected ? "border-emerald-400 bg-emerald-50" : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {mentor.avatarUrl ? (
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.fullName}
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        {mentor.fullName?.charAt(0) ?? "M"}
                      </div>
                    )}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{mentor.fullName}</h2>
                      <p className="text-sm text-gray-500">
                        {mentor.experienceYears ?? 0} năm kinh nghiệm • {mentor.totalStudents ?? 0} học viên
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">{mentor.bio ?? "Mentor này chưa cập nhật giới thiệu."}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {mentor.supportedLevels?.map((level) => (
                      <span
                        key={level}
                        className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600"
                      >
                        {level}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>
                        <span className="font-semibold text-gray-800">Đánh giá:</span>{" "}
                        {mentor.rating != null ? mentor.rating.toFixed(1) : "Chưa có"}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-800">Học phí:</span>{" "}
                        {mentor.hourlyRate != null ? `$${mentor.hourlyRate.toFixed(2)}/h` : "Liên hệ"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSelectMentor(mentor.id)}
                      disabled={isSelected || loading}
                      className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "bg-emerald-500 text-white hover:bg-emerald-500 disabled:cursor-not-allowed"
                          : "bg-blue-500 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      }`}
                    >
                      {isSelected ? "Đã chọn" : "Chọn mentor"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default MentorSelection;
