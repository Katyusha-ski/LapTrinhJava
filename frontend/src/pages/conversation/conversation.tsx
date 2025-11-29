import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { conversationApi, type AIConversation } from "../../api/conversation.api";
import { learnerApi } from "../../api/learner.api";
import { sessionApi, type PracticeSession } from "../../api/session.api";
import { topicApi, type Topic } from "../../api/topic.api";
import { LearnerNavbar } from "../../components/layout";
import { useAuth } from "../../context/AuthContext";

export default function ConversationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuth();
  const [learnerId, setLearnerId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [sessionMessages, setSessionMessages] = useState<Record<number, AIConversation[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshingSessionId, setRefreshingSessionId] = useState<number | null>(null);
  const [showManualPanel, setShowManualPanel] = useState(false);

  const handleLogout = useCallback(() => {
    clearAuth();
    navigate("/landing", { replace: true });
  }, [clearAuth, navigate]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user?.id) {
        navigate("/login");
        return;
      }

      // allow mentor to view a specific learner's conversations via ?learnerId=
      const params = new URLSearchParams(location.search);
      const paramLearnerId = params.get("learnerId");
      let targetLearnerId: number | null = null;

      if (paramLearnerId) {
        targetLearnerId = Number(paramLearnerId);
      } else {
        const learner = await learnerApi.getByUserId(user.id);
        if (!learner) {
          setError("Không tìm thấy thông tin học viên");
          return;
        }
        targetLearnerId = learner.id;
      }

      setLearnerId(targetLearnerId);

      const sessionData = await sessionApi.getLearnerSessions(targetLearnerId as number);
      const normalizedSessions = Array.isArray(sessionData) ? sessionData : sessionData?.content || [];
      setSessions(normalizedSessions);

      const entries = await Promise.all(
        normalizedSessions.map(async (session: PracticeSession) => {
          try {
            const messages = await conversationApi.getBySession(session.id);
            return [session.id, messages] as const;
          } catch (err) {
            console.error("Failed to load session messages", session.id, err);
            return [session.id, []] as const;
          }
        })
      );
      setSessionMessages(Object.fromEntries(entries));

    } catch (err) {
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate, user?.id, location.search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRefreshSession = async (sessionId: number) => {
    setRefreshingSessionId(sessionId);
    try {
      const messages = await conversationApi.getBySession(sessionId);
      setSessionMessages((prev) => ({ ...prev, [sessionId]: messages }));
    } catch (err) {
      console.error("Không thể tải lại phiên", err);
      setError("Không thể tải lại hội thoại cho phiên này.");
    } finally {
      setRefreshingSessionId(null);
    }
  };

  const handleSessionCreated = useCallback((session: PracticeSession) => {
    setSessions((prev) => {
      const exists = prev.some((item) => item.id === session.id);
      if (exists) {
        return prev.map((item) => (item.id === session.id ? session : item));
      }
      return [session, ...prev];
    });
    setSessionMessages((prev) => {
      if (prev[session.id]) {
        return prev;
      }
      return { ...prev, [session.id]: [] };
    });
  }, []);

  const handleDeleteMessage = async (messageId: number, sessionId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tin nhắn này?")) {
      return;
    }
    try {
      await conversationApi.delete(messageId);
      await handleRefreshSession(sessionId);
    } catch (err) {
      console.error("Không thể xóa tin nhắn", err);
      setError("Không thể xóa tin nhắn. Vui lòng thử lại.");
    }
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const startA = a.startTime ? new Date(a.startTime).getTime() : 0;
      const startB = b.startTime ? new Date(b.startTime).getTime() : 0;
      return startB - startA;
    });
  }, [sessions]);

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
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-blue-100">
      <LearnerNavbar user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nhật ký hội thoại AI</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualPanel((prev) => !prev)}
              className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600"
            >
              {showManualPanel ? "Đóng hội thoại 1-1" : "+ Hội thoại 1-1"}
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

        {showManualPanel && (
          <ManualConversationPanel
            learnerId={learnerId}
            sessions={sessions}
            sessionMessages={sessionMessages}
            onSessionCreated={handleSessionCreated}
            onRefreshSession={handleRefreshSession}
          />
        )}

        {sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">Bạn chưa có phiên luyện nói nào để hiển thị hội thoại.</p>
            <p className="mt-2 text-sm text-gray-400">Hãy vào trang Chủ đề để bắt đầu một buổi luyện mới.</p>
            <button
              onClick={() => navigate("/topics")}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Đi đến trang Chủ đề
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm uppercase text-gray-500">Phiên #{session.id}</p>
                    <h3 className="text-xl font-semibold text-gray-900">{session.topicName || session.topic || "Chưa đặt tên"}</h3>
                    <p className="text-sm text-gray-500">{formatDateTime(session.startTime)}</p>
                    <p className="text-xs text-gray-400">Trạng thái: {session.status}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleRefreshSession(session.id)}
                      className="rounded bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
                      disabled={refreshingSessionId === session.id}
                    >
                      {refreshingSessionId === session.id ? "Đang tải..." : "Làm mới"}
                    </button>
                    <button
                      onClick={() => navigate("/topics")}
                      className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                    >
                      Luyện tiếp
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {(sessionMessages[session.id] || []).length === 0 ? (
                    <p className="text-sm text-gray-500">Chưa có tin nhắn nào được ghi lại cho phiên này.</p>
                  ) : (
                    sessionMessages[session.id]?.map((message) => (
                      <div key={message.id} className="rounded border border-gray-100 bg-gray-50 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className={`rounded px-2 py-1 font-semibold ${speakerBadge(message.speaker)}`}>
                            {message.speaker === "AI" ? "AI Mentor" : "Bạn"}
                          </span>
                          <span className="text-gray-500">{formatDateTime(message.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-800 whitespace-pre-line">{message.message}</p>
                        {message.correctedMessage && (
                          <p className="mt-2 text-sm text-emerald-700">
                            <strong>Gợi ý diễn đạt:</strong> {message.correctedMessage}
                          </p>
                        )}
                        {!!message.grammarErrors?.length && (
                          <div className="mt-2 text-sm text-rose-600">
                            <strong>Lỗi ngữ pháp:</strong>
                            <ul className="list-disc pl-5 text-xs text-rose-500">
                              {message.grammarErrors.slice(0, 3).map((err, idx) => (
                                <li key={`${message.id}-grammar-${idx}`}>{err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {!!message.vocabularySuggestions?.length && (
                          <div className="mt-2 text-sm text-indigo-600">
                            <strong>Từ vựng gợi ý:</strong> {message.vocabularySuggestions.join(", ")}
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <button
                            onClick={() => handleDeleteMessage(message.id, session.id)}
                            className="text-xs text-red-500 hover:text-red-600"
                          >
                            Xóa tin nhắn
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

interface ManualConversationPanelProps {
  learnerId: number | null;
  sessions: PracticeSession[];
  sessionMessages: Record<number, AIConversation[]>;
  onSessionCreated: (session: PracticeSession) => void;
  onRefreshSession: (sessionId: number) => Promise<void> | void;
}

const ManualConversationPanel = ({ learnerId, sessions, sessionMessages, onSessionCreated, onRefreshSession }: ManualConversationPanelProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("Chọn hoặc tạo một phiên rồi nhấn micro để luyện nói");
  const [aiAudioUrl, setAiAudioUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");
  const [pendingTopicId, setPendingTopicId] = useState<number | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!selectedSessionId && sessions.length) {
      const firstId = sessions[0].id;
      setSelectedSessionId(firstId);
      void onRefreshSession(firstId);
      setStatusText("Phiên đã sẵn sàng. Nhấn micro để luyện nói.");
    }
  }, [sessions, selectedSessionId, onRefreshSession]);

  useEffect(() => {
    let isMounted = true;
    const fetchTopics = async () => {
      try {
        setTopicsLoading(true);
        const list = await topicApi.listAll();
        if (!isMounted) return;
        setTopics(list);
        setPendingTopicId((prev) => prev ?? (list[0]?.id ?? null));
      } catch (err) {
        console.error("Không thể tải danh sách chủ đề", err);
        setError((prev) => prev ?? "Không thể tải danh sách chủ đề. Vui lòng thử lại.");
      } finally {
        if (isMounted) {
          setTopicsLoading(false);
        }
      }
    };
    void fetchTopics();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  const currentMessages = useMemo(() => {
    if (!selectedSessionId) return [];
    return sessionMessages[selectedSessionId] || [];
  }, [sessionMessages, selectedSessionId]);

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) {
      return topics;
    }
    const keyword = topicSearch.toLowerCase();
    return topics.filter((topic) => topic.title?.toLowerCase().includes(keyword));
  }, [topicSearch, topics]);

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (!selectedSessionId) {
        setError("Bạn cần chọn một phiên luyện để gửi ghi âm.");
        setStatusText("Chưa chọn phiên luyện");
        return;
      }
      try {
        setIsUploading(true);
        setError(null);
        setStatusText("Đang gửi lên AI để chấm điểm...");
        const response = await conversationApi.sendAudioMessage(selectedSessionId, audioBlob);
        setStatusText("AI đã phản hồi! Nghe lại âm thanh hoặc xem nhật ký bên dưới.");
        setAiAudioUrl(response.audioUrl || null);
        await onRefreshSession(selectedSessionId);
      } catch (err) {
        console.error("send audio error", err);
        setError("Không thể gửi bản ghi. Vui lòng thử lại.");
        setStatusText("Gửi thất bại, thử lại nhé");
      } finally {
        setIsUploading(false);
      }
    },
    [selectedSessionId, onRefreshSession]
  );

  const handleCreateSession = useCallback(async () => {
    if (!learnerId) {
      setError("Không tìm thấy mã học viên. Vui lòng tải lại trang và thử lại.");
      return;
    }
    if (!pendingTopicId) {
      setError("Vui lòng chọn một chủ đề để tạo phiên luyện.");
      return;
    }

    const chosenTopic = topics.find((topic) => topic.id === pendingTopicId);
    try {
      setCreatingSession(true);
      setError(null);
      setStatusText(
        chosenTopic?.title
          ? `Đang tạo phiên luyện với chủ đề "${chosenTopic.title}"...`
          : "Đang tạo phiên luyện mới..."
      );
      const payload = {
        learnerId,
        topicId: pendingTopicId,
        type: "AI_ASSISTED",
        startTime: formatDateForApi(new Date()),
      };
      const created = (await sessionApi.createSession(payload)) as PracticeSession;
      onSessionCreated(created);
      setSelectedSessionId(created.id);
      setStatusText("Phiên mới đã sẵn sàng. Nhấn micro để bắt đầu luyện nói!");
      setAiAudioUrl(null);
    } catch (err) {
      console.error("create session error", err);
      setError("Không thể tạo phiên luyện mới. Vui lòng thử lại.");
      setStatusText("Tạo phiên thất bại, thử lại nhé");
    } finally {
      setCreatingSession(false);
    }
  }, [learnerId, pendingTopicId, topics, onSessionCreated]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setStatusText("Đang ghi âm... Hãy nói tự nhiên!");
      const mediaDevices = navigator.mediaDevices;
      if (!mediaDevices?.getUserMedia) {
        throw new Error("Trình duyệt không hỗ trợ ghi âm.");
      }
      const stream = await mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current = [...chunksRef.current, event.data];
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          void sendAudio(blob);
        }
        chunksRef.current = [];
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("micro start error", err);
      setError(err instanceof Error ? err.message : "Không thể bật micro.");
      setStatusText("Không thể bắt đầu ghi âm");
    }
  }, [chunksRef, mediaRecorderRef, sendAudio]);

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    setIsRecording(false);
    setStatusText("Đang xử lý bản ghi...");
  }, []);

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      void startRecording();
    }
  };

  const formatTime = (value?: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase text-gray-500">Hội thoại bằng giọng nói</p>
          <h2 className="text-2xl font-semibold text-gray-900">
            {currentSession?.topicName || currentSession?.topic || "Chọn một phiên luyện"}
          </h2>
          {currentSession && (
            <p className="text-sm text-gray-400">
              Phiên #{currentSession.id} · {formatDateTime(currentSession.startTime)}
            </p>
          )}
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>AI sẽ phản hồi bằng giọng nói & chấm điểm nhanh.</p>
          <p>{statusText}</p>
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-500">Bước 1</p>
            <h3 className="text-lg font-semibold text-gray-900">Chọn chủ đề và tạo phiên AI</h3>
          </div>
          <p className="text-xs text-indigo-500">Bạn cần phiên luyện để AI hiểu rõ ngữ cảnh.</p>
        </div>
        {topicsLoading ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-indigo-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            Đang tải danh sách chủ đề...
          </div>
        ) : topics.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">Chưa có chủ đề nào khả dụng. Vui lòng quay lại sau.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-[2fr,auto]">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Chủ đề muốn luyện</label>
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder="Nhập từ khóa (ví dụ: Travel, Job Interview, Daily Routine)"
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <select
                value={pendingTopicId ?? ""}
                onChange={(e) => setPendingTopicId(e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              >
                <option value="">-- Chọn chủ đề --</option>
                {filteredTopics.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
              {filteredTopics.length === 0 && (
                <p className="text-xs text-rose-500">Không tìm thấy chủ đề nào khớp với từ khóa bạn nhập.</p>
              )}
            </div>
            <div className="flex items-end justify-end">
              <button
                onClick={() => void handleCreateSession()}
                disabled={creatingSession || !pendingTopicId || !learnerId}
                className="h-fit rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingSession ? "Đang tạo..." : "Tạo phiên AI mới"}
              </button>
            </div>
          </div>
        )}
        <p className="mt-3 text-xs text-gray-600">
          Phiên mới sẽ được lưu cùng chủ đề CEFR và dùng lại cho lần luyện kế tiếp.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <p className="text-gray-600">Bạn chưa có phiên luyện nào. Hãy chọn chủ đề và bấm "Tạo phiên AI mới" ở trên.</p>
          <p className="mt-2 text-sm text-gray-500">Sau khi tạo xong, bạn có thể bật micro để bắt đầu luyện ngay.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Chọn phiên luyện</label>
              <select
                value={selectedSessionId ?? ""}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setSelectedSessionId(value);
                  if (value) {
                    void onRefreshSession(value);
                    setStatusText("Phiên đã sẵn sàng. Nhấn micro để luyện nói.");
                  } else {
                    setStatusText("Chọn hoặc tạo một phiên rồi nhấn micro để luyện nói");
                  }
                  setAiAudioUrl(null);
                }}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Chọn phiên luyện --</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    Phiên #{session.id} · {session.topicName || session.topic || "Chưa đặt tên"}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-end gap-2">
              <button
                onClick={() => selectedSessionId && onRefreshSession(selectedSessionId)}
                disabled={!selectedSessionId || isUploading}
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Làm mới hội thoại
              </button>
              <button
                onClick={handleMicToggle}
                disabled={!selectedSessionId || isUploading}
                className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition focus:outline-none focus:ring-4 focus:ring-indigo-300 ${
                  isRecording ? "bg-rose-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-500"
                } disabled:cursor-not-allowed disabled:opacity-60`}
                title={isRecording ? "Nhấn để dừng" : "Nhấn để bắt đầu"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </button>
            </div>
          </div>

          {aiAudioUrl && (
            <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50 p-4">
              <p className="text-sm font-semibold text-indigo-800">AI Response Audio</p>
              <audio controls src={aiAudioUrl} className="mt-2 w-full" />
            </div>
          )}

          <div className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Nhật ký phiên hiện tại</h3>
            <div className="max-h-[360px] space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-4">
              {currentMessages.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có hội thoại nào cho phiên này. Bấm micro để bắt đầu.</p>
              ) : (
                currentMessages.map((message) => (
                  <div key={message.id} className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className={`rounded px-2 py-1 font-semibold ${speakerBadge(message.speaker)}`}>
                        {message.speaker === "AI" ? "AI Mentor" : "Bạn"}
                      </span>
                      <span className="text-gray-500">{formatTime(message.createdAt)}</span>
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
        </>
      )}
    </div>
  );
};

function formatDateForApi(date: Date) {
  return date.toISOString().split(".")[0];
}

function formatDateTime(value?: string | null) {
  if (!value) return "Không xác định";
  try {
    return new Date(value).toLocaleString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value || "Không xác định";
  }
}

function speakerBadge(speaker?: string | null) {
  if (speaker === "AI") return "bg-indigo-100 text-indigo-800";
  if (speaker === "USER") return "bg-emerald-100 text-emerald-800";
  return "bg-gray-100 text-gray-800";
}
