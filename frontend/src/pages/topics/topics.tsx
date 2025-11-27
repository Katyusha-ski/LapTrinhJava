import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { NavigationBar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";
import { topicApi, type Topic } from "../../api/topic.api";

export default function TopicsPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    loadTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLevel, filterCategory, searchKeyword]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Topic[] = [];

      if (searchKeyword) {
        const result = await topicApi.search(searchKeyword);
        data = Array.isArray(result) ? result : result.content || [];
      } else if (filterLevel) {
        const result = await topicApi.getByLevel(filterLevel);
        data = Array.isArray(result) ? result : result.content || [];
      } else if (filterCategory) {
        const result = await topicApi.getByCategory(filterCategory);
        data = Array.isArray(result) ? result : result.content || [];
      } else {
        const result = await topicApi.list();
        data = Array.isArray(result) ? result : result.content || [];
      }

      setTopics(data);
    } catch (err) {
      setError("Không thể tải danh sách chủ đề. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTopics();
  };

  const getLevelColor = (level?: string | null) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-800";
      case "ADVANCED":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelLabel = (level?: string | null) => {
    const labels: Record<string, string> = {
      BEGINNER: "Sơ cấp",
      INTERMEDIATE: "Trung cấp",
      ADVANCED: "Nâng cao",
    };
    return labels[level || ""] || level || "Không xác định";
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const pageShell = (content: ReactNode) => (
    <div className="page-gradient">
      <NavigationBar user={user} onLogout={handleLogout} />
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
                <option value="BEGINNER">Sơ cấp</option>
                <option value="INTERMEDIATE">Trung cấp</option>
                <option value="ADVANCED">Nâng cao</option>
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
                loadTopics();
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
                <button className="w-full rounded bg-blue-500 px-4 py-2 font-bold text-white transition hover:bg-blue-600">
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
