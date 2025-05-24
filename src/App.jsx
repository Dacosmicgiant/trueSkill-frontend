import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import JobCreation from './pages/Jobs/JobCreation';
import JobList from './pages/Jobs/JobList';
import JobDetails from './pages/Jobs/JobDetails';
import CandidateList from './pages/Candidates/CandidateList';
import CandidateAnalysis from './pages/Candidates/CandidateAnalysis';
import CandidateComparison from './pages/Candidates/CandidateComparison';
import CandidateImport from './pages/Candidates/CandidateImport';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import CandidateDiscussion from './pages/Candidates/CandidateDiscussion';
import GroupDiscussionDemo from './pages/GroupDiscussionDemo';
import ShareableDiscussions from './pages/ShareableDiscussions';
import PublicDiscussion from './pages/PublicDiscussion';

// Candidate Routes
import CandidateJobMatches from './pages/Candidates/CandidateJobMatches';
import CandidateAddToJob from './pages/Candidates/CandidateAddToJob';
import RepoQuestions from './components/qa/QA';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected Route wrapper component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        
        <Route path='/QA' element={<RepoQuestions/>} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Dashboard Routes - Protected */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Jobs Routes */}
          <Route path="/jobs">
            <Route index element={<JobList />} />
            <Route path="create" element={<JobCreation />} />
            <Route path=":id" element={<JobDetails />} />
            <Route path="edit/:id" element={<JobCreation />} />
          </Route>

          {/* Candidate Routes */}
          <Route path="/candidates">
            <Route index element={<CandidateList />} />
            <Route path="import" element={<CandidateImport />} />
            <Route path="compare" element={<CandidateComparison />} />
            <Route path=":id" element={<CandidateAnalysis />} />
            <Route path=":id/job-matches" element={<CandidateJobMatches />} />
            <Route path=":id/jobs/add" element={<CandidateAddToJob />} />
            <Route path=":id/discussion" element={<CandidateDiscussion />} />
          </Route>

          {/* Group Discussion Routes */}
          <Route path="/group-discussion" element={<GroupDiscussionDemo />} />
          <Route path="/shareable-discussions" element={<ShareableDiscussions />} />
          
          <Route path="/settings" element={<Settings />} />
        </Route>
        
        {/* Public Discussion Route - Accessible without login */}
        <Route path="/public/discussion/:configId" element={<PublicDiscussion />} />

        {/* Redirect root to dashboard or login */}
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
