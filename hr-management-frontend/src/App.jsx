import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'sonner';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Positions from './pages/Positions';
import PerformanceEvaluations from './pages/PerformanceEvaluations';
import Admissions from './pages/Admissions';
import Calendar from './pages/Calendar';
import Training from './pages/Training';
import Supporter from './pages/Supporter';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import DebugRoutes from './pages/DebugRoutes';
import EditSupporter from './pages/EditSupporter';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import NotFoundPage from './pages/NotFoundPage';
import TrainingDetails from './pages/TrainingDetails';
import Groups from './pages/Groups';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster position="top-right" />
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<ProtectedRoute isPublic={true}><Landing /></ProtectedRoute>} />
            <Route path="/login" element={<ProtectedRoute isPublic={true}><Login /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ProtectedRoute isPublic={true}><ForgotPassword /></ProtectedRoute>} />

            {/* Rotas protegidas */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/departments" element={<Departments />} />
                      <Route path="/positions" element={<Positions />} />
                      <Route path="/debug-routes" element={<DebugRoutes />} />
                      <Route path="/performance-evaluations" element={<PerformanceEvaluations />} />
                      <Route path="/admissions" element={<Admissions />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/training" element={<Training />} />
                      <Route path="/training/:id" element={<TrainingDetails />} /> {/* Rota dinâmica para detalhes */}
                      <Route path="/supporter" element={<Supporter />} />
                      <Route path="/edit-apoiador/:id" element={<EditSupporter />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/groups" element={<Groups />} />
                      <Route path="/not-found" element={<NotFoundPage />} />
                      <Route path="*" element={<Navigate to="/not-found" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;