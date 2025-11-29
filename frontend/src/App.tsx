import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import LandingPage from "./pages/landing/landing-page";
import { LearnerDashboard } from "./pages/learner/dashboard";
import { MentorDashboard } from "./pages/mentor/dashboard";
import { AdminDashboard } from "./pages/admin/dashboard";
import FeedbackManagement from "./pages/admin/feedback-management/feedback-management";
import SplashScreen from "./pages/splash/splash-screen";
import OnboardingWizard from "./pages/onboarding/onboarding-wizard";
import MentorSelection from "./pages/learner/mentor-selection/mentor-selection";
import AdminMentorManagement from "./pages/admin/mentor-management/mentor-management";
import { LearnerProfile } from "./pages/learner/profile";
import { Sessions } from "./pages/sessions";
import { Topics } from "./pages/topics";
import { Conversation } from "./pages/conversation";
import { Pronunciation } from "./pages/pronunciation";
import { MentorList } from "./pages/admin/mentor-management/mentor-list";
import { LearnerList } from "./pages/admin/learner-management/learner-list";
import TopicManagement from "./pages/admin/topic-management";
import { SessionList } from "./pages/sessions/session-list";
import { TopicList } from "./pages/topics/topic-list";
import { PackageList } from "./pages/packages/package-list";
import { useAuth } from "./context/AuthContext";
import type { FC, ReactElement } from "react";
import { useEffect } from "react";

function App() {
	const { token, isLoading, user } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	console.log('🚀 App rendering - token:', token, 'isLoading:', isLoading, 'location:', location.pathname);

	// Small helper component to restrict routes by role
	const ProtectedRoute: FC<{ element: ReactElement; requiredRoles?: string[] }> = ({ element, requiredRoles }) => {
		if (!token) return <Navigate to="/login" replace />;
		if (requiredRoles && requiredRoles.length > 0) {
			const hasRole = user?.roles?.some((r) => requiredRoles.includes(r));
			if (!hasRole) return <Navigate to="/dashboard" replace />;
		}
		return element;
	};

	const RoleDashboardRedirect: FC = () => {
		if (!token) {
			return <Navigate to="/login" replace />;
		}
		const roles = user?.roles || [];
		if (roles.includes('ADMIN')) {
			return <Navigate to="/admin" replace />;
		}
		if (roles.includes('MENTOR')) {
			return <Navigate to="/mentor" replace />;
		}
		return <Navigate to="/learner" replace />;
	};

	// Auto-redirect when token changes: redirect to role-based landing (/admin,/mentor,/learner)
	useEffect(() => {
		if (!isLoading && token && (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/')) {
			console.log('🚀 Token detected, redirecting based on roles');
			const roles = user?.roles || [];
			if (roles.includes('ADMIN')) {
				navigate('/admin', { replace: true });
			} else if (roles.includes('MENTOR')) {
				navigate('/mentor', { replace: true });
			} else {
				navigate('/learner', { replace: true });
			}
		}
	}, [token, isLoading, location.pathname, navigate, user]);

	if (isLoading) {
		return <SplashScreen />;
	}

	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
			<Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />

			{/* Protected Routes */}
			<Route path="/dashboard" element={token ? <RoleDashboardRedirect /> : <Navigate to="/login" replace />} />
			<Route path="/onboarding" element={token ? <OnboardingWizard /> : <Navigate to="/login" replace />} />

			{/* Role landing routes */}
			<Route path="/learner" element={<ProtectedRoute requiredRoles={["LEARNER"]} element={<LearnerDashboard />} />} />
			<Route path="/mentor" element={<ProtectedRoute requiredRoles={["MENTOR"]} element={<MentorDashboard />} />} />
			<Route path="/admin" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<AdminDashboard />} />} />

			{/* Learner Routes */}
			<Route path="/mentor-selection" element={<ProtectedRoute requiredRoles={["LEARNER"]} element={<MentorSelection />} />} />
			<Route path="/learner/mentor-selection" element={<ProtectedRoute requiredRoles={["LEARNER"]} element={<MentorSelection />} />} />
			<Route path="/learner/profile" element={<ProtectedRoute requiredRoles={["LEARNER"]} element={<LearnerProfile />} />} />

			{/* Admin Routes */}
			<Route path="/admin/mentor-management" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<AdminMentorManagement />} />} />
			<Route path="/admin/feedbacks" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<FeedbackManagement />} />} />
			<Route path="/admin/mentors" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<MentorList />} />} />
			<Route path="/admin/learners" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<LearnerList />} />} />
			<Route path="/admin/topic-management" element={<ProtectedRoute requiredRoles={["ADMIN"]} element={<TopicManagement />} />} />

			{/* Shared Routes */}
			<Route path="/sessions" element={token ? <Sessions /> : <Navigate to="/login" replace />} />
			<Route path="/sessions/all" element={token ? <SessionList /> : <Navigate to="/login" replace />} />
			<Route path="/learn" element={token ? <Topics /> : <Navigate to="/login" replace />} />
			<Route path="/topics" element={token ? <Topics /> : <Navigate to="/login" replace />} />
			<Route path="/topics/all" element={token ? <TopicList /> : <Navigate to="/login" replace />} />
			<Route path="/packages" element={token ? <PackageList /> : <Navigate to="/login" replace />} />
			<Route path="/conversation" element={token ? <Conversation /> : <Navigate to="/login" replace />} />
			<Route path="/pronunciation" element={token ? <Pronunciation /> : <Navigate to="/login" replace />} />

			{/* Default Routes */}
			<Route
				path="/"
				element={
					token ? (
						user?.roles?.includes('ADMIN') ? (
							<Navigate to={'/admin'} replace />
						) : user?.roles?.includes('MENTOR') ? (
							<Navigate to={'/mentor'} replace />
						) : (
							<Navigate to={'/learner'} replace />
						)
					) : (
						<Navigate to={'/landing'} replace />
					)
				}
			/>
			<Route
				path="*"
				element={
						token ? (
						user?.roles?.includes('ADMIN') ? (
							<Navigate to={'/admin'} replace />
						) : user?.roles?.includes('MENTOR') ? (
							<Navigate to={'/mentor'} replace />
						) : (
							<Navigate to={'/learner'} replace />
						)
					) : (
						<Navigate to={'/landing'} replace />
					)
				}
			/>
		</Routes>
	);
}

export default App;