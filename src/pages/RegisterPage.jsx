import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegisterPage = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        setServerError('');
        try {
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                passwordConfirm: data.passwordConfirm
            });
            navigate('/', { replace: true });
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                err?.message ||
                'Registration failed. Please try again.';
            setServerError(message);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create account</h1>

                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded mb-4">
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Name"
                        type="text"
                        placeholder="Jane Doe"
                        autoComplete="name"
                        error={errors.name}
                        {...register('name', {
                            required: 'Name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters'
                            },
                            maxLength: {
                                value: 50,
                                message: 'Name must be 50 characters or less'
                            }
                        })}
                    />

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
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        error={errors.password}
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 8,
                                message: 'Password must be at least 8 characters'
                            },
                            validate: {
                                hasLower: (v) =>
                                    /[a-z]/.test(v) || 'Must contain a lowercase letter',
                                hasUpper: (v) =>
                                    /[A-Z]/.test(v) || 'Must contain an uppercase letter',
                                hasNumber: (v) =>
                                    /\d/.test(v) || 'Must contain a number',
                                hasSymbol: (v) =>
                                    /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/]/.test(v) ||
                                    'Must contain a special character'
                            }
                        })}
                    />

                    <Input
                        label="Confirm password"
                        type="password"
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                        error={errors.passwordConfirm}
                        {...register('passwordConfirm', {
                            required: 'Please confirm your password',
                            validate: (v) =>
                                v === password || 'Passwords do not match'
                        })}
                    />

                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Creating account…' : 'Create account'}
                    </Button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:underline">
                        Sign in
                    </Link>
                </p>

                <p className="text-xs text-gray-500 mt-4">
                    Password must contain: 8+ characters, uppercase, lowercase,
                    number, and a special character.
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;