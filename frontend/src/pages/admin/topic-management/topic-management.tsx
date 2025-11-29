import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Table, Button, Modal, Form, Input, Select, Tag, Popconfirm, Spin, Typography } from "antd";
import { topicApi, type Topic, type CreateTopicRequest, type UpdateTopicRequest } from "../../../api/topic.api";
const { Option } = Select;
const { Title } = Typography;

const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formValues, setFormValues] = useState<CreateTopicRequest>({
    title: "",
    description: "",
    category: "",
    level: "A1",
    keywords: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await topicApi.list();
      const data = Array.isArray(result) ? result : result.content || [];
      setTopics(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách topics";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error loading topics:", error);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTopic(null);
    setFormValues({
      title: "",
      description: "",
      category: "",
      level: "A1",
      keywords: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormValues({
      title: topic.title,
      description: topic.description || "",
      category: topic.category || "",
      level: topic.level || "A1",
      keywords: topic.keywords || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await topicApi.delete(id);
      toast.success("Xóa topic thành công");
      loadTopics();
    } catch (error) {
      toast.error("Không thể xóa topic");
      console.error(error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!formValues.title || !formValues.category || !formValues.level) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }
      
      if (editingTopic) {
        // Update
        const updateData: UpdateTopicRequest = {
          title: formValues.title,
          description: formValues.description,
          category: formValues.category,
          level: formValues.level,
          keywords: formValues.keywords,
        };
        await topicApi.update(editingTopic.id, updateData);
        toast.success("Cập nhật topic thành công");
      } else {
        // Create
        await topicApi.create(formValues);
        toast.success("Tạo topic thành công");
      }
      
      setIsModalOpen(false);
      setFormValues({
        title: "",
        description: "",
        category: "",
        level: "A1",
        keywords: "",
      });
      loadTopics();
    } catch (error) {
      console.error("Validation failed or API error:", error);
      toast.error("Có lỗi xảy ra khi lưu topic");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormValues({
      title: "",
      description: "",
      category: "",
      level: "A1",
      keywords: "",
    });
    setEditingTopic(null);
  };

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      A1: "green",
      A2: "green",
      B1: "blue",
      B2: "blue",
      C1: "purple",
      C2: "purple",
    };
    return colors[level] || "default";
  };

  // Ant Design Table columns
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Title", dataIndex: "title", key: "title" },
    { title: "Description", dataIndex: "description", key: "description", render: (desc: string) => desc || "-" },
    { title: "Category", dataIndex: "category", key: "category", render: (cat: string) => cat || "-" },
    { title: "Level", dataIndex: "level", key: "level", render: (level: string) => <Tag color={getLevelColor(level)}>{level || "-"}</Tag> },
    { title: "Keywords", dataIndex: "keywords", key: "keywords", render: (keywords: string) => keywords ? keywords.split(",").slice(0,2).map((kw, idx) => <Tag key={idx}>{kw.trim()}</Tag>) : "-" },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt", render: (date: string) => date ? new Date(date).toLocaleDateString("vi-VN") : "-" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, topic: Topic) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(topic)} style={{ marginRight: 8 }}>Edit</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa topic này?"
            onConfirm={() => handleDelete(topic.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger size="small">Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Conversation Topic Management</Title>
          <Button type="primary" onClick={handleCreate} icon={<span>+</span>}>
            Create New Topic
          </Button>
        </div>

        {error && (
          <div style={{ background: "#fff1f0", border: "1px solid #ffa39e", color: "#cf1322", padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #f0f1f2", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center" }}><Spin /> Đang tải danh sách topics...</div>
          ) : (
            <Table
              columns={columns}
              dataSource={topics}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize,
                total: topics.length,
                onChange: setCurrentPage,
                showSizeChanger: false,
              }}
            />
          )}
        </div>
      </div>

      {/* Modal for Create/Edit */}
      <Modal
        title={editingTopic ? "Edit Topic" : "Create New Topic"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingTopic ? "Update" : "Create"}
      >
        <Form layout="vertical">
          <Form.Item label={<span>Title <span style={{ color: "red" }}>*</span></span>} required>
            <Input
              placeholder="Enter topic title"
              value={formValues.title}
              onChange={e => setFormValues({ ...formValues, title: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Enter topic description"
              value={formValues.description}
              onChange={e => setFormValues({ ...formValues, description: e.target.value })}
            />
          </Form.Item>
          <Form.Item label={<span>Category <span style={{ color: "red" }}>*</span></span>} required>
            <Select
              value={formValues.category}
              onChange={value => setFormValues({ ...formValues, category: value })}
              placeholder="Select category"
            >
              <Option value="">Select category</Option>
              <Option value="Daily Life">Daily Life</Option>
              <Option value="Travel">Travel</Option>
              <Option value="Business">Business</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Education">Education</Option>
              <Option value="Technology">Technology</Option>
            </Select>
          </Form.Item>
          <Form.Item label={<span>English Level <span style={{ color: "red" }}>*</span></span>} required>
            <Select
              value={formValues.level}
              onChange={value => setFormValues({ ...formValues, level: value })}
              placeholder="Select level"
            >
              <Option value="A1">A1 - Beginner</Option>
              <Option value="A2">A2 - Elementary</Option>
              <Option value="B1">B1 - Intermediate</Option>
              <Option value="B2">B2 - Upper Intermediate</Option>
              <Option value="C1">C1 - Advanced</Option>
              <Option value="C2">C2 - Proficiency</Option>
            </Select>
          </Form.Item>
          <Form.Item label={<span>Keywords <span style={{ fontSize: 12, color: "#888" }}>(cách nhau bởi dấu phẩy)</span></span>}>
            <Input
              placeholder="keyword1, keyword2, keyword3"
              value={formValues.keywords}
              onChange={e => setFormValues({ ...formValues, keywords: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TopicManagement;
