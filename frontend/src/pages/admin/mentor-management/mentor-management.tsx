import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Table, Button, Modal, Form, Input, Tag, Popconfirm, Spin, Typography } from "antd";
import { mentorApi } from "../../../api/mentor.api";
import { userApi } from "../../../api/user.api";
import type { Mentor } from "../../../types/mentor";
const { Title } = Typography;

const MentorManagement: React.FC = () => {
	const [mentors, setMentors] = useState<Mentor[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
	const [formValues, setFormValues] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
		phone: "",
		avatarUrl: "",
		bio: "",
		experienceYears: 0,
		skills: "",
		specialization: "",
		hourlyRate: 0,
		isAvailable: true,
	});
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	useEffect(() => {
		loadMentors();
	}, []);

	const loadMentors = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await mentorApi.getAll(currentPage, pageSize);
			const list = Array.isArray(data) ? data : (data as any).content || [];
			setMentors(list);
		} catch (error) {
			setError("Không thể tải danh sách mentors");
			toast.error("Không thể tải danh sách mentors");
			setMentors([]);
		} finally {
			setLoading(false);
		}
	};

	const handleCreate = () => {
		setEditingMentor(null);
		setFormValues({
			fullName: "",
			username: "",
			email: "",
			password: "",
			phone: "",
			avatarUrl: "",
			bio: "",
			experienceYears: 0,
			skills: "",
			specialization: "",
			hourlyRate: 0,
			isAvailable: true,
		});
		setIsModalOpen(true);
	};

	const handleEdit = (mentor: Mentor) => {
		setEditingMentor(mentor);
		setFormValues({
			fullName: mentor.fullName || "",
			username: "",
			email: "",
			password: "",
			phone: "",
			avatarUrl: mentor.avatarUrl || "",
			bio: mentor.bio || "",
			experienceYears: mentor.experienceYears || 0,
			skills: mentor.skills ? mentor.skills.join(", ") : "",
			specialization: "",
			hourlyRate: mentor.hourlyRate || 0,
			isAvailable: mentor.isAvailable ?? true,
		});
		setIsModalOpen(true);
	};

	const handleDelete = async (id: number) => {
		try {
			await mentorApi.delete(id);
			toast.success("Xóa mentor thành công");
			loadMentors();
		} catch (error) {
			toast.error("Không thể xóa mentor");
		}
	};

	const handleSubmit = async () => {
		try {
			let userId = null;
			if (!editingMentor) {
				// Gọi API tạo user trước
				const userPayload = {
					fullName: formValues.fullName,
					username: formValues.username,
					email: formValues.email,
					password: formValues.password,
					phone: formValues.phone,
					avatarUrl: formValues.avatarUrl,
				};
				// Giả sử có userApi.create trả về userId
				// Bạn cần import userApi ở đầu file
				const userRes = await userApi.create(userPayload);
				userId = userRes.id;
			} else {
				userId = editingMentor.userId;
			}
			const mentorPayload = {
				userId,
				specialty: formValues.specialization,
				yearsExperience: formValues.experienceYears,
				qualifications: formValues.skills,
				hourlyRate: formValues.hourlyRate,
				bio: formValues.bio,
				isAvailable: formValues.isAvailable,
			};
			if (editingMentor) {
				await mentorApi.update(editingMentor.id, mentorPayload);
				toast.success("Cập nhật mentor thành công");
			} else {
				await mentorApi.create(mentorPayload);
				toast.success("Tạo mentor thành công");
			}
			setIsModalOpen(false);
			setFormValues({
				fullName: "",
				username: "",
				email: "",
				password: "",
				phone: "",
				avatarUrl: "",
				bio: "",
				experienceYears: 0,
				skills: "",
				specialization: "",
				hourlyRate: 0,
				isAvailable: true,
			});
			loadMentors();
		} catch (error) {
			toast.error("Có lỗi xảy ra khi lưu mentor");
		}
	};

	const handleCancel = () => {
		setIsModalOpen(false);
		setFormValues({
			fullName: "",
			username: "",
			email: "",
			password: "",
			phone: "",
			avatarUrl: "",
			bio: "",
			experienceYears: 0,
			skills: "",
			specialization: "",
			hourlyRate: 0,
			isAvailable: true,
		});
		setEditingMentor(null);
	};

	const columns = [
		{ title: "ID", dataIndex: "id", key: "id" },
		{ title: "Full Name", dataIndex: "fullName", key: "fullName" },
		{ title: "Skills", dataIndex: "skills", key: "skills", render: (skills: string[]) => skills.map((s, idx) => <Tag key={idx}>{s}</Tag>) },
		{ title: "Bio", dataIndex: "bio", key: "bio", render: (bio: string) => bio || "-" },
		{
			title: "Actions",
			key: "actions",
			render: (_: any, mentor: Mentor) => (
				<>
					<Button type="primary" size="small" onClick={() => handleEdit(mentor)} style={{ marginRight: 8 }}>Edit</Button>
					<Popconfirm
						title="Bạn có chắc chắn muốn xóa mentor này?"
						onConfirm={() => handleDelete(mentor.id)}
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
					<Title level={2}>Mentor Management</Title>
					<Button type="primary" onClick={handleCreate} icon={<span>+</span>}>
						Create New Mentor
					</Button>
				</div>
				{error && (
					<div style={{ background: "#fff1f0", border: "1px solid #ffa39e", color: "#cf1322", padding: 16, borderRadius: 8, marginBottom: 24 }}>
						<strong>Lỗi:</strong> {error}
					</div>
				)}
				<div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px #f0f1f2", overflow: "hidden" }}>
					{loading ? (
						<div style={{ padding: 32, textAlign: "center" }}><Spin /> Đang tải danh sách mentors...</div>
					) : (
						<Table
							columns={columns}
							dataSource={mentors}
							rowKey="id"
							pagination={{
								current: currentPage,
								pageSize,
								total: mentors.length,
								onChange: setCurrentPage,
								showSizeChanger: false,
							}}
						/>
					)}
				</div>
			</div>
			<Modal
				title={editingMentor ? "Edit Mentor" : "Create New Mentor"}
				open={isModalOpen}
				onCancel={handleCancel}
				onOk={handleSubmit}
				okText={editingMentor ? "Update" : "Create"}
			>
				<Form layout="vertical">
					<Form.Item label={<span>Full Name <span style={{ color: "red" }}>*</span></span>} required>
						<Input
							placeholder="Enter full name"
							value={formValues.fullName}
							onChange={e => setFormValues({ ...formValues, fullName: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label={<span>Username <span style={{ color: "red" }}>*</span></span>} required>
						<Input
							placeholder="Enter username"
							value={formValues.username}
							onChange={e => setFormValues({ ...formValues, username: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label={<span>Email <span style={{ color: "red" }}>*</span></span>} required>
						<Input
							type="email"
							placeholder="Enter email"
							value={formValues.email}
							onChange={e => setFormValues({ ...formValues, email: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label={<span>Password <span style={{ color: "red" }}>*</span></span>} required>
						<Input.Password
							placeholder="Enter password"
							value={formValues.password}
							onChange={e => setFormValues({ ...formValues, password: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label="Phone">
						<Input
							placeholder="Enter phone number"
							value={formValues.phone}
							onChange={e => setFormValues({ ...formValues, phone: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label="Avatar URL">
						<Input
							placeholder="Enter avatar URL"
							value={formValues.avatarUrl}
							onChange={e => setFormValues({ ...formValues, avatarUrl: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label="Bio">
						<Input.TextArea
							rows={3}
							placeholder="Enter bio"
							value={formValues.bio}
							onChange={e => setFormValues({ ...formValues, bio: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label={<span>Experience Years <span style={{ color: "red" }}>*</span></span>} required>
						<Input
							type="number"
							placeholder="Enter years of experience"
							value={formValues.experienceYears}
							onChange={e => setFormValues({ ...formValues, experienceYears: Number(e.target.value) })}
						/>
					</Form.Item>
					<Form.Item label="Skills">
						<Input
							placeholder="Enter skills (comma separated)"
							value={formValues.skills}
							onChange={e => setFormValues({ ...formValues, skills: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label="Specialization">
						<Input
							placeholder="Enter specialization"
							value={formValues.specialization}
							onChange={e => setFormValues({ ...formValues, specialization: e.target.value })}
						/>
					</Form.Item>
					<Form.Item label={<span>Hourly Rate <span style={{ color: "red" }}>*</span></span>} required>
						<Input
							type="number"
							placeholder="Enter hourly rate"
							value={formValues.hourlyRate}
							onChange={e => setFormValues({ ...formValues, hourlyRate: Number(e.target.value) })}
						/>
					</Form.Item>
					<Form.Item label="Available">
						<Input
							type="checkbox"
							checked={formValues.isAvailable}
							onChange={e => setFormValues({ ...formValues, isAvailable: e.target.checked })}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default MentorManagement;
