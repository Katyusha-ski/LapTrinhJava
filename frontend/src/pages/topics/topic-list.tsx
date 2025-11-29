import { useState, useEffect, useCallback, useMemo } from "react";
import { topicApi, type Topic } from "../../api/topic.api";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
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
const TOPIC_CATEGORIES = ["BUSINESS", "TRAVEL", "DAILY"] as const;
const categoryLabelMap: Record<string, string> = {
  BUSINESS: "Business",
  TRAVEL: "Travel",
  DAILY: "Daily Life",
};

export const TopicList = () => {
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [level, setLevel] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const loadTopics = useCallback(async () => {
    try {
      let data = await topicApi.list();
      if (!data.length) {
        data = await topicApi.listAll();
      }
      setAllTopics(data);
    } catch (err) {
      console.error("Failed to load topics:", err);
      setAllTopics([]);
    }
  }, []);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  const filteredTopics = useMemo(() => {
    return allTopics.filter((topic) => {
      const topicLevel = topic.level?.toUpperCase() ?? "";
      const topicCategory = topic.category?.toUpperCase() ?? "";
      const matchesLevel = !level || topicLevel === level;
      const matchesCategory = !category || topicCategory === category;
      return matchesLevel && matchesCategory;
    });
  }, [allTopics, level, category]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Conversation Topics</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Levels</option>
              {CEFR_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {levelLabelMap[lvl]}
                </option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {TOPIC_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryLabelMap[cat]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg">
              <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>
              <div className="flex justify-between text-sm">
                <span className={`${levelColorMap[topic.level ?? ""] ?? "bg-gray-100 text-gray-800"} px-2 py-1 rounded`}>
                  {levelLabelMap[topic.level ?? ""] || topic.level || "N/A"}
                </span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  {categoryLabelMap[topic.category?.toUpperCase() ?? ""] || topic.category || "Uncategorized"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicList;
