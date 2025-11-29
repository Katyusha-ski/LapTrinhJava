import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Table, Button, Modal, Form, Input, Select, Tag, Popconfirm, Spin, Typography } from "antd";
import { userApi } from "../../../api/user.api";
import { DeleteOutlined } from "@ant-design/icons";
import { learnerApi, type LearnerProfile, type LearnerMutationRequest } from "../../../api/learner.api";
const { Option } = Select;
const { Title } = Typography;

const LearnerManagement: React.FC = () => {
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLearner, setEditingLearner] = useState<LearnerProfile | null>(null);
  const [formValues, setFormValues] = useState<LearnerMutationRequest>({
    userId: 0,
    englishLevel: "A1",
    learningGoals: "",
    mentorId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadLearners();
  }, []);

  const loadLearners = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await learnerApi.getAll(currentPage, pageSize);
      const data = Array.isArray(result) ? result : result.content || [];
      setLearners(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Không thể tải danh sách learners";
      setError(errorMessage);
      toast.error(errorMessage);
      setLearners([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingLearner(null);
    setFormValues({
      userId: 0,
      mentorId: null,
      englishLevel: "A1",
      learningGoals: "",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (learner: LearnerProfile) => {
    setEditingLearner(learner);
    setFormValues({
      userId: learner.userId,
      mentorId: learner.mentorId ?? null,
      englishLevel: learner.englishLevel || "A1",
      learningGoals: learner.learningGoals || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await learnerApi.delete(id);
      toast.success("Xóa learner thành công");
      loadLearners();
    } catch (error) {
      toast.error("Không thể xóa learner");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formValues.userId || !formValues.englishLevel) {
        toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
        return;
      }
      if (editingLearner) {
        await learnerApi.update(editingLearner.id, formValues);
        toast.success("Cập nhật learner thành công");
      } else {
        await learnerApi.create(formValues);
        toast.success("Tạo learner thành công");
      }
      setIsModalOpen(false);
      setFormValues({
        userId: 0,
        englishLevel: "A1",
        learningGoals: "",
      });
      loadLearners();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi lưu learner");
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFormValues({
      userId: 0,
      englishLevel: "A1",
      learningGoals: "",
      mentorId: null,
    });
    setEditingLearner(null);
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

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Full Name", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    { title: "English Level", dataIndex: "englishLevel", key: "englishLevel", render: (level: string) => <Tag color={getLevelColor(level)}>{level || "-"}</Tag> },
    { title: "Learning Goals", dataIndex: "learningGoals", key: "learningGoals", render: (goal: string) => goal || "-" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, learner: LearnerProfile) => (
        <>
          <Button type="primary" size="small" onClick={() => handleEdit(learner)} style={{ marginRight: 8 }}>Edit</Button>
          {learner.isActive ? (
            <Popconfirm
              title="Bạn có chắc chắn muốn vô hiệu hóa tài khoản user này?"
              onConfirm={async () => {
                try {
                  await userApi.setActive(learner.userId, false);
                  toast.success('Tài khoản đã bị vô hiệu hóa');
                  loadLearners();
                } catch (err) {
                  toast.error('Không thể thay đổi trạng thái tài khoản');
                }
              }}
              okText="Vô hiệu hóa"
              cancelText="Hủy"
            >
              <Button danger size="small" style={{ marginRight: 8 }}>Disable Account</Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bạn có chắc chắn muốn kích hoạt tài khoản user này?"
              onConfirm={async () => {
                try {
                  await userApi.setActive(learner.userId, true);
                  toast.success('Tài khoản đã được kích hoạt');
                  loadLearners();
                } catch (err) {
                  toast.error('Không thể thay đổi trạng thái tài khoản');
                }
              }}
              okText="Kích hoạt"
              cancelText="Hủy"
            >
              <Button type="primary" size="small" style={{ marginRight: 8, background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}>Enable</Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa learner này?"
            onConfirm={() => handleDelete(learner.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger size="small" icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 32 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2}>Learner Management</Title>
          <Button type="primary" onClick={handleCreate} icon={<span>+</span>}>
            Create New Learner
          </Button>
        </div>
        {error && (
          <div style={{ background: "#fff1f0", border: "1px solid #ffa39e", color: "#cf1322", padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <strong>Lỗi:</strong> {error}
          </div>
        )}
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #f0f1f2", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: "center" }}><Spin /> Đang tải danh sách learners...</div>
          ) : (
            <Table
              columns={columns}
              dataSource={learners}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize,
                total: learners.length,
                onChange: setCurrentPage,
                showSizeChanger: false,
              }}
            />
          )}
        </div>
      </div>
      <Modal
        title={editingLearner ? "Edit Learner" : "Create New Learner"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingLearner ? "Update" : "Create"}
      >
        <Form layout="vertical">
          <Form.Item label={<span>User ID <span style={{ color: "red" }}>*</span></span>} required>
            <Input
              type="number"
              placeholder="Enter user ID"
              value={formValues.userId}
              onChange={e => setFormValues({ ...formValues, userId: Number(e.target.value) })}
            />
          </Form.Item>
          <Form.Item label="Mentor ID">
            <Input
              type="number"
              placeholder="Enter mentor ID (optional)"
              value={formValues.mentorId ?? ""}
              onChange={e => setFormValues({ ...formValues, mentorId: e.target.value ? Number(e.target.value) : null })}
            />
          </Form.Item>
          <Form.Item label={<span>English Level <span style={{ color: "red" }}>*</span></span>} required>
            <Select
              value={formValues.englishLevel ?? "A1"}
              onChange={value => setFormValues({ ...formValues, englishLevel: value })}
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
          <Form.Item label="Learning Goals">
            <Input
              placeholder="Enter learning goals"
              value={formValues.learningGoals ?? ""}
              onChange={e => setFormValues({ ...formValues, learningGoals: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LearnerManagement;
