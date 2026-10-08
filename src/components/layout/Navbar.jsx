import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
        isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100'
    }`;

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="text-xl font-bold text-primary-600">
                        Blog
                    </Link>

                    <div className="flex items-center gap-2">
                        <NavLink to="/" end className={navClass}>
                            Home
                        </NavLink>

                        {isAuthenticated && (
                            <>
                                <NavLink to="/my-posts" className={navClass}>
                                    My Posts
                                </NavLink>
                                <NavLink to="/my-posts/new" className={navClass}>
                                    Write
                                </NavLink>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <NavLink to="/admin/users" className={navClass}>
                                    Users
                                </NavLink>
                                <NavLink to="/admin/stats" className={navClass}>
                                    Stats
                                </NavLink>
                            </>
                        )}

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                                <Link
                                    to="/profile"
                                    className="text-sm text-gray-700 hover:text-primary-600"
                                >
                                    {user.name}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-500 hover:text-red-600"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                                <NavLink to="/login" className={navClass}>
                                    Login
                                </NavLink>
                                <Link to="/register" className="btn-primary text-sm">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;