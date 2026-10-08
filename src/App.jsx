import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPostsPage from './pages/MyPostsPage';
import PostFormPage from './pages/PostFormPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminStatsPage from './pages/AdminStatsPage';
import NotFoundPage from './pages/NotFoundPage';


const ComingSoon = ({ name }) => (
    <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
        <p className="text-gray-500 mt-2">Coming in the next stage.</p>
    </div>
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
            retry: 1
        }
    }
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route element={<Layout />}>
                            {/* Public */}
                            <Route index element={<HomePage />} />
                            <Route path="post/:slug" element={<PostDetailPage />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="register" element={<RegisterPage />} />

                            {/* Protected: author */}
                            <Route
                                path="my-posts"
                                element={
                                    <ProtectedRoute>
                                        <MyPostsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="my-posts/new"
                                element={
                                    <ProtectedRoute>
                                        <PostFormPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="my-posts/edit/:id"
                                element={
                                    <ProtectedRoute>
                                        <PostFormPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="profile"
                                element={
                                    <ProtectedRoute>
                                        <ProfilePage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Protected: admin */}
                            <Route
                                path="admin/users"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminUsersPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="admin/stats"
                                element={
                                    <ProtectedRoute adminOnly>
                                        <AdminStatsPage />
                                    </ProtectedRoute>
                                }
                            />

                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;