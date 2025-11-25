import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { conversationApi, type AIConversation, type CreateConversationRequest } from "../../api/conversation.api";
import { topicApi, type Topic } from "../../api/topic.api";
import { learnerApi } from "../../api/learner.api";
import { authApi } from "../../api/auth.api";

export default function ConversationPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newConversation, setNewConversation] = useState<CreateConversationRequest>({
    topicId: undefined,
    conversationContent: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = authApi.getLocalUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Load conversations
      const learner = await learnerApi.getByUserId(user.id);
      if (learner) {
        const convData = await conversationApi.getByLearner(learner.id);
        setConversations(Array.isArray(convData) ? convData : convData.content || []);
      }

      // Load topics
      const topicData = await topicApi.list();
      setTopics(Array.isArray(topicData) ? topicData : topicData.content || []);
    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

      await conversationApi.create(newConversation);
      setNewConversation({ topicId: undefined, conversationContent: "" });
      setShowCreateForm(false);
      await loadData();
    } catch (err) {
      setError("Không thể tạo cuộc hội thoại. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cuộc hội thoại này?")) {
      return;
    }

    try {
      setError(null);
      await conversationApi.delete(id);
      await loadData();
    } catch (err) {
      setError("Không thể xóa cuộc hội thoại. Vui lòng thử lại.");
      console.error(err);
    }
  };

  const getQualityColor = (score?: number) => {
    if (!score) return "bg-gray-100 text-gray-800";
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Đang tải cuộc hội thoại...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Luyện hội thoại AI</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              + Cuộc hội thoại mới
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

        {/* Create Form */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Bắt đầu cuộc hội thoại mới</h2>
            <form onSubmit={handleCreateConversation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chủ đề (không bắt buộc)</label>
                <select
                  value={newConversation.topicId || ""}
                  onChange={(e) =>
                    setNewConversation((prev) => ({
                      ...prev,
                      topicId: e.target.value ? parseInt(e.target.value) : undefined,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn chủ đề (không bắt buộc)</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung cuộc hội thoại</label>
                <textarea
                  value={newConversation.conversationContent}
                  onChange={(e) =>
                    setNewConversation((prev) => ({
                      ...prev,
                      conversationContent: e.target.value,
                    }))
                  }
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Viết nội dung cuộc hội thoại của bạn..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Gửi cuộc hội thoại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewConversation({ topicId: undefined, conversationContent: "" });
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Chưa có cuộc hội thoại nào</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Tạo cuộc hội thoại đầu tiên
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <div key={conv.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cuộc hội thoại #{conv.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {conv.createdAt
                        ? new Date(conv.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Không xác định"}
                    </p>
                  </div>
                  {conv.qualityScore && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getQualityColor(conv.qualityScore)}`}>
                      Điểm: {conv.qualityScore.toFixed(1)}%
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  {conv.topicId && (
                    <p className="text-sm text-gray-600">
                      <strong>Chủ đề ID:</strong> {conv.topicId}
                    </p>
                  )}

                  {conv.conversationContent && (
                    <div className="p-4 bg-gray-50 rounded border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Nội dung:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{conv.conversationContent}</p>
                    </div>
                  )}

                  {conv.feedbackFromAI && (
                    <div className="p-4 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-900 mb-2">Phản hồi AI:</p>
                      <p className="text-sm text-blue-700">{conv.feedbackFromAI}</p>
                    </div>
                  )}

                  {conv.duration && (
                    <p className="text-sm text-gray-600">
                      <strong>Thời lượng:</strong> {conv.duration} giây
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleDeleteConversation(conv.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Xóa
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
