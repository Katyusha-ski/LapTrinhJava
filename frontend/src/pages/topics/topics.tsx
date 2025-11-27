import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { topicApi, type Topic } from "../../api/topic.api";

export default function TopicsPage() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    loadTopics();
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải chủ đề luyện tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Chủ đề luyện nói</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Quay lại
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm và lọc</h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ khóa tìm kiếm</label>
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm chủ đề..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trình độ</label>
                <select
                  value={filterLevel || ""}
                  onChange={(e) => setFilterLevel(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tất cả trình độ</option>
                  <option value="BEGINNER">Sơ cấp</option>
                  <option value="INTERMEDIATE">Trung cấp</option>
                  <option value="ADVANCED">Nâng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={filterCategory || ""}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 md:flex-none bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
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
                className="flex-1 md:flex-none bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded"
              >
                Xóa bộ lọc
              </button>
            </div>
          </form>
        </div>

        {/* Topics Grid */}
        {topics.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Không tìm thấy chủ đề nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{topic.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${getLevelColor(topic.level)}`}>
                    {getLevelLabel(topic.level)}
                  </span>
                </div>

                {topic.category && (
                  <span className="inline-block mb-3 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                    {topic.category}
                  </span>
                )}

                {topic.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>
                )}

                {topic.keywords && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Từ khóa:</p>
                    <div className="flex flex-wrap gap-1">
                      {topic.keywords.split(",").map((keyword: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                    Luyện tập chủ đề này
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
