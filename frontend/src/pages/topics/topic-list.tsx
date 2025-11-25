import { useState, useEffect } from 'react';

// Inline types to avoid import issues
interface Topic {
  id: number;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  keywords?: string | null;
  createdAt?: string | null;
  createdBy?: number | null;
}

// Inline API to avoid import issues  
const topicApi = {
  list: async (page?: number, size?: number) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const response = await fetch(`http://localhost:8080/api/topics?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  getByLevel: async (level: string, page?: number, size?: number) => {
    const params = new URLSearchParams({ level });
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const response = await fetch(`http://localhost:8080/api/topics?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },
  getByCategory: async (category: string, page?: number, size?: number) => {
    const params = new URLSearchParams({ category });
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const response = await fetch(`http://localhost:8080/api/topics?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
};

export const TopicList = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [level, setLevel] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadTopics();
  }, [level, category]);

  const loadTopics = async () => {
    try {
      let data;
      if (level) data = await topicApi.getByLevel(level, 1, 10);
      else if (category) data = await topicApi.getByCategory(category, 1, 10);
      else data = await topicApi.list(1, 10);
      
      const list = Array.isArray(data) ? data : (data as any).content || [];
      setTopics(list);
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Conversation Topics</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={level}
              onChange={(e) => {
                setLevel(e.target.value);
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Levels</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              <option value="BUSINESS">Business</option>
              <option value="TRAVEL">Travel</option>
              <option value="DAILY">Daily Life</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg">
              <h3 className="font-semibold text-lg mb-2">{topic.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{topic.description}</p>
              <div className="flex justify-between text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{topic.level}</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">{topic.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopicList;
