import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LearnerNavbar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";
import { topicApi, type Topic } from "../../api/topic.api";
import { sessionApi, type PracticeSession } from "../../api/session.api";
import { learnerApi } from "../../api/learner.api";
import { conversationApi, type AIConversation } from "../../api/conversation.api";

const levelLabelMap: Record<string, string> = {
  A1: "A1 · Beginner",
  A2: "A2 · Elementary",
  B1: "B1 · Intermediate",
  B2: "B2 · Upper-Int",
  C1: "C1 · Advanced",
  C2: "C2 · Proficient",
};

const levelColorMap: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-800",
  A2: "bg-lime-100 text-lime-800",
  B1: "bg-blue-100 text-blue-800",
  B2: "bg-indigo-100 text-indigo-800",
  C1: "bg-purple-100 text-purple-800",
  C2: "bg-rose-100 text-rose-800",
};

const TopicPracticePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { topicId } = useParams<{ topicId: string }>();
  const { user, clearAuth } = useAuth();
  const initialTopic = (location.state as { topic?: Topic } | undefined)?.topic ?? null;

  const [topic, setTopic] = useState<Topic | null>(initialTopic);
  const [loading, setLoading] = useState(!initialTopic);
  const [error, setError] = useState<string | null>(null);

  const loadTopic = useCallback(async () => {
    if (!topicId) {
      setError("Không tìm thấy chủ đề để luyện.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await topicApi.get(Number(topicId));
      setTopic(data);
    } catch (err) {
      console.error("loadTopic error", err);
      const message = err instanceof Error ? err.message : "Không thể tải chủ đề này. Vui lòng thử lại.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (!topic) {
      void loadTopic();
    }
  }, [topic, loadTopic]);

  const getLevelLabel = useCallback((level?: string | null) => levelLabelMap[level ?? ""] || level || "Không xác định", []);
  const getLevelColor = useCallback((level?: string | null) => levelColorMap[level ?? ""] ?? "bg-gray-100 text-gray-800", []);

  const handleLogout = () => {
    clearAuth();
    navigate("/landing");
  };

  const pageShell = (content: ReactNode) => (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <div className="py-8 px-4">
        <div className="mx-auto max-w-5xl">{content}</div>
      </div>
    </div>
  );

  if (loading) {
    return pageShell(
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-500" />
          <p className="text-gray-600">Đang tải thông tin chủ đề...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return pageShell(
      <div className="rounded-2xl bg-white p-8 text-center shadow">
        <p className="mb-4 text-gray-700">{error || "Chủ đề không tồn tại hoặc đã bị xóa."}</p>
        <button
          onClick={() => navigate("/topics")}
          className="rounded bg-blue-500 px-6 py-2 font-semibold text-white transition hover:bg-blue-600"
        >
          Quay lại danh sách chủ đề
        </button>
      </div>
    );
  }

  return pageShell(
    <SpeakingPracticePanel
      topic={topic}
      onBack={() => navigate("/topics")}
      getLevelColor={getLevelColor}
      getLevelLabel={getLevelLabel}
      userId={user?.id ?? null}
    />
  );
};

interface SpeakingPracticePanelProps {
  topic: Topic;
  onBack: () => void;
  getLevelColor: (level?: string | null) => string;
  getLevelLabel: (level?: string | null) => string;
  userId: number | null;
}

const SpeakingPracticePanel = ({ topic, onBack, getLevelColor, getLevelLabel, userId }: SpeakingPracticePanelProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Nhấn micro để luyện nói, AI sẽ phản hồi ngay sau đó.");
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [scores, setScores] = useState<{ pronunciation?: number | null; fluency?: number | null; accuracy?: number | null }>({});
  const [conversationLog, setConversationLog] = useState<AIConversation[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [learnerId, setLearnerId] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const fetchConversationLog = useCallback(async (targetSessionId: number) => {
    try {
      const messages = await conversationApi.getBySession(targetSessionId);
      setConversationLog(messages);
    } catch (err) {
      console.error("Không thể tải nhật ký hội thoại", err);
    }
  }, []);

  const prepareSession = useCallback(async () => {
    if (!userId || !topic.id) {
      return;
    }
    try {
      setSessionLoading(true);
      setSessionError(null);
      let effectiveLearnerId = learnerId;
      if (!effectiveLearnerId) {
        const learner = await learnerApi.getByUserId(userId);
        if (!learner?.id) {
          throw new Error("Không tìm thấy thông tin học viên");
        }
        effectiveLearnerId = learner.id;
        setLearnerId(learner.id);
      }

      const sessionPayload = await sessionApi.getLearnerSessions(effectiveLearnerId);
      const list = Array.isArray(sessionPayload) ? sessionPayload : sessionPayload?.content || [];
      let activeSession = list.find((item: PracticeSession) => item.topicId === topic.id);

      if (!activeSession) {
        activeSession = (await sessionApi.createSession({
          learnerId: effectiveLearnerId,
          topicId: topic.id,
          type: "AI_ASSISTED",
          startTime: formatDateForApi(new Date()),
        })) as PracticeSession;
      }

      setSessionId(activeSession.id);
      setStatusText("Phiên đã sẵn sàng. Nhấn micro để luyện nói với AI.");
      await fetchConversationLog(activeSession.id);
    } catch (err) {
      console.error("Không thể chuẩn bị phiên luyện", err);
      const message = err instanceof Error ? err.message : "Không thể chuẩn bị phiên luyện. Vui lòng thử lại.";
      setSessionError(message);
    } finally {
      setSessionLoading(false);
    }
  }, [fetchConversationLog, learnerId, topic.id, userId]);

  useEffect(() => {
    if (!userId) {
      setSessionError("Bạn cần đăng nhập để dùng tính năng luyện nói với AI.");
      setSessionLoading(false);
      return;
    }
    void prepareSession();
  }, [prepareSession, userId]);

  const sendAudioToAI = useCallback(
    async (audioBlob: Blob) => {
      if (!sessionId) {
        setError("Chưa có phiên luyện sẵn sàng. Vui lòng chờ hệ thống chuẩn bị.");
        return;
      }
      try {
        setIsUploading(true);
        setError(null);
        setStatusText("Đang gửi lên AI để phân tích...");
        const response = await conversationApi.sendAudioMessage(sessionId, audioBlob);
        setAiResponse(response.aiResponse || null);
        setFeedback(response.feedback || null);
        setAiAudioUrl(response.audioUrl || null);
        setScores({
          pronunciation: response.pronunciationScore,
          fluency: response.fluencyScore,
          accuracy: response.accuracyScore,
        });
        await fetchConversationLog(sessionId);
        setStatusText("AI đã phản hồi! Nhấn micro để luyện thêm.");
      } catch (err) {
        console.error("send audio error", err);
        setError("Không thể gửi bản ghi. Vui lòng thử lại.");
        setStatusText("Gửi thất bại, thử lại nhé.");
      } finally {
        setIsUploading(false);
      }
    },
    [sessionId, fetchConversationLog]
  );

  const cleanupStream = (recorder: MediaRecorder | null) => {
    const stream = recorder?.stream;
    stream?.getTracks().forEach((track) => track.stop());
  };

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
    setStatusText("Đang xử lý bản ghi...");
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      if (!sessionId || sessionLoading) {
        throw new Error("Phiên luyện chưa sẵn sàng. Vui lòng đợi trong giây lát.");
      }
      if (isUploading) {
        throw new Error("Vui lòng đợi AI phản hồi xong trước khi ghi tiếp.");
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ ghi âm hoặc chưa cấp quyền microphone.");
      }
      if (typeof MediaRecorder === "undefined") {
        throw new Error("Trình duyệt không hỗ trợ MediaRecorder.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        cleanupStream(recorder);
        if (audioChunksRef.current.length) {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          if (lastRecordingUrl) {
            URL.revokeObjectURL(lastRecordingUrl);
          }
          setLastRecordingUrl(URL.createObjectURL(audioBlob));
          void sendAudioToAI(audioBlob);
        }
      };

      recorder.start();
      setStatusText("Đang ghi âm... Hãy nói tự nhiên!");
      setIsRecording(true);
    } catch (err) {
      console.error("microphone error", err);
      const message = err instanceof Error ? err.message : "Không thể truy cập microphone. Vui lòng kiểm tra quyền trình duyệt.";
      setError(message);
    }
  }, [lastRecordingUrl, sessionId, sessionLoading, isUploading, sendAudioToAI]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (sessionLoading || isUploading || !sessionId) {
        return;
      }
      void startRecording();
    }
  };

  useEffect(() => {
    return () => {
      stopRecording();
      if (lastRecordingUrl) {
        URL.revokeObjectURL(lastRecordingUrl);
      }
    };
  }, [lastRecordingUrl, stopRecording]);

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase text-gray-500">Đang luyện nói</p>
          <h2 className="text-2xl font-bold text-gray-900">{topic.title}</h2>
          <span className={`mt-2 inline-block rounded px-2 py-1 text-xs font-semibold ${getLevelColor(topic.level)}`}>
            {getLevelLabel(topic.level)}
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleToggleRecording}
            disabled={sessionLoading || isUploading || !sessionId}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
              isRecording ? "bg-rose-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            title={isRecording ? "Dừng ghi âm" : "Bắt đầu luyện nói"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </button>
          <button
            onClick={() => {
              stopRecording();
              onBack();
            }}
            className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-700 transition hover:bg-gray-300"
          >
            Thoát
          </button>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl bg-white/80 p-6">
        <p className="text-gray-700">
          Nhấn nút micro để bắt đầu luyện nói. Khi dừng, bản ghi sẽ được gửi lên AI để phản hồi bằng giọng nói kèm chấm
          điểm phát âm/độ trôi chảy.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600">
          <li>Giữ thiết bị cách miệng khoảng 15cm để thu âm rõ.</li>
          <li>Nói bám sát chủ đề và sử dụng từ vựng phù hợp trình độ CEFR.</li>
          <li>Ấn "Thoát" để quay lại danh sách chủ đề và chọn bài khác.</li>
        </ul>

        {sessionError && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{sessionError}</div>
        )}
        {error && <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-700">Trạng thái phiên:</p>
          <p className={`text-lg font-bold ${isRecording ? "text-rose-500" : "text-gray-700"}`}>
            {sessionLoading ? "Đang chuẩn bị phiên luyện..." : statusText}
          </p>
          {isUploading && <p className="text-sm text-indigo-500">AI đang xử lý bản ghi của bạn...</p>}
        </div>

        {lastRecordingUrl && !isRecording && (
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="mb-2 text-sm font-semibold text-gray-700">Bản ghi gần nhất:</p>
            <audio controls src={lastRecordingUrl} className="w-full" />
          </div>
        )}

        {aiResponse && (
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-indigo-700">AI Mentor phản hồi</p>
              {aiAudioUrl && <audio controls src={aiAudioUrl} className="ml-4 w-48" />}
            </div>
            <p className="mt-2 text-gray-800 whitespace-pre-line">{aiResponse}</p>
            {feedback && <p className="mt-2 text-sm text-indigo-600">{feedback}</p>}
            {(scores.pronunciation || scores.fluency || scores.accuracy) && (
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
                {scores.pronunciation !== undefined && scores.pronunciation !== null && (
                  <span className="rounded bg-white px-3 py-1 shadow">Pronunciation: {scores.pronunciation}%</span>
                )}
                {scores.fluency !== undefined && scores.fluency !== null && (
                  <span className="rounded bg-white px-3 py-1 shadow">Fluency: {scores.fluency}%</span>
                )}
                {scores.accuracy !== undefined && scores.accuracy !== null && (
                  <span className="rounded bg-white px-3 py-1 shadow">Accuracy: {scores.accuracy}%</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl bg-white/80 p-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Nhật ký hội thoại</h3>
          <p className="text-xs text-gray-500">AI lưu lại mỗi lượt nói để bạn xem lại.</p>
        </div>
        <div className="max-h-[360px] space-y-3 overflow-y-auto">
          {conversationLog.length === 0 ? (
            <p className="text-sm text-gray-500">Chưa có hội thoại nào. Bấm micro để bắt đầu.</p>
          ) : (
            conversationLog.map((message) => (
              <div key={message.id} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className={`rounded px-2 py-1 font-semibold ${speakerBadge(message.speaker)}`}>
                    {message.speaker === "AI" ? "AI Mentor" : "Bạn"}
                  </span>
                  <span className="text-gray-500">{formatDateTime(message.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-line">{message.message}</p>
                {message.correctedMessage && (
                  <p className="mt-1 text-xs text-emerald-600">Gợi ý: {message.correctedMessage}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicPracticePage;

function formatDateForApi(date: Date) {
  return date.toISOString().split(".")[0];
}

function formatDateTime(value?: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return value;
  }
}

function speakerBadge(speaker?: string | null) {
  if (speaker === "AI") return "bg-indigo-100 text-indigo-800";
  if (speaker === "USER") return "bg-emerald-100 text-emerald-700";
  return "bg-gray-100 text-gray-700";
}
