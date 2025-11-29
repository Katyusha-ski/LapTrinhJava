import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { LearnerNavbar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";
import { topicApi, type Topic } from "../../api/topic.api";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export default function TopicsPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const loadTopics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Topic[] = [];

      if (searchKeyword) {
        data = await topicApi.search(searchKeyword);
      } else if (filterLevel) {
        data = await topicApi.getByLevel(filterLevel);
      } else if (filterCategory) {
        data = await topicApi.getByCategory(filterCategory);
      } else {
        data = await topicApi.list();
        if (!data.length) {
          data = await topicApi.listAll();
        }
      }

      setTopics(data);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Không thể tải danh sách chủ đề. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterLevel, filterCategory, searchKeyword]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void loadTopics();
  };

  const levelColorMap = useMemo<Record<string, string>>(
    () => ({
      A1: "bg-emerald-100 text-emerald-800",
      A2: "bg-lime-100 text-lime-800",
      B1: "bg-blue-100 text-blue-800",
      B2: "bg-indigo-100 text-indigo-800",
      C1: "bg-purple-100 text-purple-800",
      C2: "bg-rose-100 text-rose-800",
    }),
    []
  );

  const getLevelColor = (level?: string | null) => levelColorMap[level ?? ""] ?? "bg-gray-100 text-gray-800";

  const levelLabelMap: Record<string, string> = {
    A1: "A1 · Beginner",
    A2: "A2 · Elementary",
    B1: "B1 · Intermediate",
    B2: "B2 · Upper-Int",
    C1: "C1 · Advanced",
    C2: "C2 · Proficient",
  };

  const getLevelLabel = (level?: string | null) => levelLabelMap[level ?? ""] || level || "Không xác định";

  const handleLogout = () => {
    clearAuth();
    navigate("/landing");
  };

  const pageShell = (content: ReactNode) => (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">{content}</div>
      </div>
    </div>
  );

  if (loading) {
    return pageShell(
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p>Đang tải chủ đề luyện tập...</p>
        </div>
      </div>
    );
  }

  return pageShell(
    <>
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Chủ đề luyện nói</h1>
            <button onClick={() => navigate("/dashboard")} className="text-gray-500 hover:text-gray-700">
              ← Quay lại
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 rounded-2xl glass-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Tìm kiếm và lọc</h2>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Từ khóa tìm kiếm</label>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    placeholder="Tìm kiếm chủ đề..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Trình độ</label>
                  <select
                    value={filterLevel || ""}
                    onChange={(e) => setFilterLevel(e.target.value || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Tất cả trình độ</option>
                    {CEFR_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {getLevelLabel(level)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Danh mục</label>
                  <select
                    value={filterCategory || ""}
                    onChange={(e) => setFilterCategory(e.target.value || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Tất cả danh mục</option>
                    <option value="GRAMMAR">Ngữ pháp</option>
                    <option value="VOCABULARY">Từ vựng</option>
                    <option value="CONVERSATION">Hội thoại</option>
                    <option value="PRONUNCIATION">Phát âm</option>
                    <option value="LISTENING">Nghe hiểu</option>
                    <option value="WRITING">Viết</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded bg-blue-500 px-6 py-2 font-bold text-white transition hover:bg-blue-600 md:flex-none"
                >
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchKeyword("");
                    setFilterLevel(null);
                    setFilterCategory(null);
                    void loadTopics();
                  }}
                  className="flex-1 rounded bg-gray-500 px-6 py-2 font-bold text-white transition hover:bg-gray-600 md:flex-none"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>

          {/* Topics Grid */}
          {topics.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow-md">
              <p className="text-lg text-gray-500">Không tìm thấy chủ đề nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => (
                <div key={topic.id} className="glass-card rounded-2xl p-6 transition-shadow duration-300 hover:shadow-2xl">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="flex-1 text-lg font-semibold text-gray-900">{topic.title}</h3>
                    <span
                      className={`ml-2 whitespace-nowrap rounded px-2 py-1 text-xs font-medium ${getLevelColor(topic.level)}`}
                    >
                      {getLevelLabel(topic.level)}
                    </span>
                  </div>

                  {topic.category && (
                    <span className="mb-3 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                      {topic.category}
                    </span>
                  )}

                  {topic.description && (
                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">{topic.description}</p>
                  )}

                  {topic.keywords && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-medium text-gray-700">Từ khóa:</p>
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.split(",").map((keyword: string, idx: number) => (
                          <span key={idx} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <button
                      className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white transition hover:bg-blue-600"
                      onClick={() =>
                        navigate(`/topics/practice/${topic.id}`, {
                          state: { topic },
                        })
                      }
                    >
                      Luyện tập chủ đề này
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
    </>
  );
}
