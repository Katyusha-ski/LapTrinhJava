import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { pronunciationApi, type PronunciationScore, type SubmitPronunciationRequest } from "../../api/pronunciation.api";
import { learnerApi } from "../../api/learner.api";
import { authApi } from "../../api/auth.api";

export default function PronunciationPage() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<PronunciationScore[]>([]);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [newScore, setNewScore] = useState<SubmitPronunciationRequest>({
    word: "",
    scorePercentage: 0,
    sessionId: undefined,
    recordingUrl: "",
  });

  useEffect(() => {
    loadScores();
  }, []);

  const loadScores = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = authApi.getLocalUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const learner = await learnerApi.getByUserId(user.id);
      if (!learner) {
        setError("Không tìm thấy thông tin học viên");
        return;
      }

      // Load scores
      const scoreData = await pronunciationApi.getScoresByLearner(learner.id);
      setScores(Array.isArray(scoreData) ? scoreData : scoreData.content || []);

      // Load average score
      const avgData = await pronunciationApi.getAverageScore(learner.id);
      if (avgData && typeof avgData === 'object' && 'averageScore' in avgData) {
        setAverageScore((avgData as any).averageScore);
      }
    } catch (err) {
      setError("Không thể tải điểm phát âm. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (newScore.scorePercentage < 0 || newScore.scorePercentage > 100) {
        setError("Điểm phải từ 0 đến 100");
        return;
      }

      await pronunciationApi.submit(newScore);
      setNewScore({
        word: "",
        scorePercentage: 0,
        sessionId: undefined,
        recordingUrl: "",
      });
      setShowForm(false);
      await loadScores();
    } catch (err) {
      setError("Không thể lưu điểm phát âm. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleDeleteScore = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa điểm này?")) {
      return;
    }

    try {
      setError(null);
      await pronunciationApi.delete(id);
      await loadScores();
    } catch (err) {
      setError("Không thể xóa điểm phát âm. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    if (score >= 40) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Tốt";
    if (score >= 40) return "Trung bình";
    return "Cần cải thiện";
  };

  if (loading) {
    return (
      <div className="page-gradient flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p>Đang tải điểm phát âm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-gradient py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Luyện phát âm</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              + Thêm điểm phát âm
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Quay lại
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Tổng số từ luyện tập</p>
            <p className="text-3xl font-bold text-blue-600">{scores.length}</p>
          </div>

          {averageScore !== null && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm font-medium text-gray-600 mb-2">Điểm trung bình</p>
              <div className="flex items-center gap-2">
                <p className="text-3xl font-bold text-green-600">{averageScore.toFixed(1)}%</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(averageScore)}`}>
                  {getScoreLabel(averageScore)}
                </span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm font-medium text-gray-600 mb-2">Luyện tập gần đây</p>
            <p className="text-lg font-semibold text-gray-900">
              {scores.length > 0
                ? new Date(scores[0].createdAt || new Date()).toLocaleDateString("vi-VN")
                : "Chưa bắt đầu"}
            </p>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thêm điểm phát âm</h2>
            <form onSubmit={handleSubmitScore} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Từ tiếng Anh</label>
                  <input
                    type="text"
                    value={newScore.word}
                    onChange={(e) => setNewScore((prev) => ({ ...prev, word: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập từ cần luyện tập"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Điểm phát âm (0-100)</label>
                  <input
                    type="number"
                    value={newScore.scorePercentage}
                    onChange={(e) => setNewScore((prev) => ({ ...prev, scorePercentage: parseInt(e.target.value) || 0 }))}
                    min="0"
                    max="100"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID buổi học (không bắt buộc)</label>
                  <input
                    type="number"
                    value={newScore.sessionId || ""}
                    onChange={(e) => setNewScore((prev) => ({ ...prev, sessionId: e.target.value ? parseInt(e.target.value) : undefined }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ID buổi học"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL bản ghi âm (không bắt buộc)</label>
                  <input
                    type="url"
                    value={newScore.recordingUrl || ""}
                    onChange={(e) => setNewScore((prev) => ({ ...prev, recordingUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Lưu điểm phát âm
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scores List */}
        {scores.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Chưa có điểm phát âm nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Thêm điểm đầu tiên
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Từ tiếng Anh</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Điểm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Đánh giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ngày luyện tập</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{score.word}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score.scorePercentage || 0)}`}>
                        {score.scorePercentage}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {getScoreLabel(score.scorePercentage || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {score.createdAt
                        ? new Date(score.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })
                        : "Không xác định"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <button
                        onClick={() => handleDeleteScore(score.id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
