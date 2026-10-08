import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './ui/Spinner';

// Wraps protected routes. If not authenticated, redirects to /login
// with ?next=<original path> so we can bounce back after login.
// If `adminOnly` is true, also requires role === 'admin'.

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Spinner className="py-20" size="lg" />;
    }

    if (!isAuthenticated) {
        const next = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?next=${next}`} replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;