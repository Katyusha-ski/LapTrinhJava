import { Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import LandingPage from "./pages/landing/landing-page";
import Dashboard from "./pages/dashboard/dashboard";
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
import { SessionList } from "./pages/sessions/session-list";
import { TopicList } from "./pages/topics/topic-list";
import { PackageList } from "./pages/packages/package-list";
import { useAuth } from "./context/AuthContext";
import { useEffect } from "react";

function App() {
	const { token, isLoading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	
	console.log('🚀 App rendering - token:', token, 'isLoading:', isLoading, 'location:', location.pathname);

	// Auto-redirect when token changes
	useEffect(() => {
		if (!isLoading && token && (location.pathname === '/login' || location.pathname === '/register')) {
			console.log('🚀 Token detected, redirecting to dashboard');
			navigate('/dashboard', { replace: true });
		}
	}, [token, isLoading, location.pathname, navigate]);

	if (isLoading) {
		return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
	}

	return (
		<Routes>
			{/* Public Routes */}
			<Route path="/landing" element={<LandingPage />} />
			<Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
			<Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <Register />} />

			{/* Protected Routes */}
			<Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />} />
			<Route path="/onboarding" element={token ? <OnboardingWizard /> : <Navigate to="/login" replace />} />

			{/* Learner Routes */}
			<Route path="/learner/mentor-selection" element={token ? <MentorSelection /> : <Navigate to="/login" replace />} />
			<Route path="/learner/profile" element={token ? <LearnerProfile /> : <Navigate to="/login" replace />} />

			{/* Admin Routes */}
			<Route path="/admin/mentor-management" element={token ? <AdminMentorManagement /> : <Navigate to="/login" replace />} />
			<Route path="/admin/mentors" element={token ? <MentorList /> : <Navigate to="/login" replace />} />
			<Route path="/admin/learners" element={token ? <LearnerList /> : <Navigate to="/login" replace />} />

			{/* Shared Routes */}
			<Route path="/sessions" element={token ? <Sessions /> : <Navigate to="/login" replace />} />
			<Route path="/sessions/all" element={token ? <SessionList /> : <Navigate to="/login" replace />} />
			<Route path="/topics" element={token ? <Topics /> : <Navigate to="/login" replace />} />
			<Route path="/topics/all" element={token ? <TopicList /> : <Navigate to="/login" replace />} />
			<Route path="/packages" element={token ? <PackageList /> : <Navigate to="/login" replace />} />
			<Route path="/conversation" element={token ? <Conversation /> : <Navigate to="/login" replace />} />
			<Route path="/pronunciation" element={token ? <Pronunciation /> : <Navigate to="/login" replace />} />

			{/* Default Routes */}
			<Route path="/" element={<Navigate to={token ? "/dashboard" : "/landing"} replace />} />
			<Route path="*" element={<Navigate to={token ? "/dashboard" : "/landing"} replace />} />
		</Routes>
	);
}

export default App;