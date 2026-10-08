import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const next = searchParams.get('next') || '/';

    const [serverError, setServerError] = useState('');
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm();

    const onSubmit = async (data) => {
        setServerError('');
        try {
            await login(data);
            navigate(next, { replace: true });
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                err?.message ||
                'Login failed. Please try again.';
            setServerError(message);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign in</h1>

                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        error={errors.email}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: 'Please enter a valid email'
                            }
                        })}
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                            }
                        })}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600 hover:underline">
                        Create one
                    </Link>
                </p>

                <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-500">
                    <p className="mb-1 font-medium">Test accounts (from seed):</p>
                    <p>Admin: admin@example.com / Admin123!</p>
                    <p>User: john@example.com / SecurePass123!</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;