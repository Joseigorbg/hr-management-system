import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, isPublic }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isPublic) {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Rotas restritas que requerem role 'admin'
  const adminOnlyPaths = [
    '/employees',
    '/departments',
    '/positions',
    '/settings',
  ];
  const currentPath = window.location.pathname;

  // Verifica se a rota atual requer permissões de admin
  if (adminOnlyPaths.includes(currentPath) && user?.role !== 'admin') {
    return <Navigate to="/not-found" replace />;
  }

  return children;
};

export default ProtectedRoute;