import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth.api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ProfilePage = () => {
    const { user, refreshUser } = useAuth();
    const [tab, setTab] = useState('profile'); // 'profile' | 'password'

    return (
        <div className="max-w-2xl mx-auto px-4 py-10">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
                <p className="text-gray-500 mt-1">Manage your account details and security.</p>
            </header>

            <div className="bg-white border border-gray-200 rounded-lg">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setTab('profile')}
                        className={`flex-1 py-3 text-sm font-medium transition ${
                            tab === 'profile'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setTab('password')}
                        className={`flex-1 py-3 text-sm font-medium transition ${
                            tab === 'password'
                                ? 'text-primary-600 border-b-2 border-primary-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Change Password
                    </button>
                </div>

                <div className="p-6">
                    {tab === 'profile' && (
                        <ProfileTab user={user} refreshUser={refreshUser} />
                    )}
                    {tab === 'password' && <PasswordTab />}
                </div>
            </div>
        </div>
    );
};

// ---------------- Profile tab ----------------

const ProfileTab = ({ user, refreshUser }) => {
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty }
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            bio: user?.bio || ''
        }
    });

   const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    try {
        const trimmed = {
            name: data.name.trim(),
            bio: data.bio.trim()
        };
        await authApi.updateProfile(trimmed);
        const freshUser = await refreshUser();

        // Re-sync the form with the saved values so isDirty goes false
        reset({
            name: freshUser?.name ?? trimmed.name,
            bio: freshUser?.bio ?? trimmed.bio
        });

        setSuccess('Profile updated successfully.');
    } catch (err) {
        const msg =
            err?.response?.data?.error ||
            err?.response?.data?.details?.[0]?.message ||
            'Failed to update profile.';
        setServerError(msg);
    }
};

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                    {serverError}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
                    {success}
                </div>
            )}

            <Input
                label="Email"
                type="email"
                value={user?.email || ''}
                disabled
                className="opacity-60"
            />
            <p className="text-xs text-gray-500 -mt-3">
                Email cannot be changed here.
            </p>

            <Input
                label="Name"
                type="text"
                error={errors.name}
                {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                })}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio <span className="text-gray-400 font-normal">(max 500 chars)</span>
                </label>
                <textarea
                    rows={4}
                    placeholder="Tell readers a bit about yourself."
                    className="input-field"
                    {...register('bio', {
                        maxLength: { value: 500, message: 'Bio cannot exceed 500 characters' }
                    })}
                />
                {errors.bio && (
                    <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? 'Saving…' : 'Save changes'}
                </Button>
                {!isDirty && (
                    <span className="text-sm text-gray-400">
                        No changes yet
                    </span>
                )}
            </div>
        </form>
    );
};

// ---------------- Password tab ----------------

const PasswordTab = () => {
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm();

    const newPassword = watch('newPassword');

    const onSubmit = async (data) => {
        setServerError('');
        setSuccess('');
        try {
            await authApi.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                newPasswordConfirm: data.newPasswordConfirm
            });
            setSuccess(
                'Password changed successfully. Other sessions have been logged out.'
            );
            reset();
        } catch (err) {
            const msg =
                err?.response?.data?.error ||
                err?.response?.data?.details?.[0]?.message ||
                'Failed to change password.';
            setServerError(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                    {serverError}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded">
                    {success}
                </div>
            )}

            <Input
                label="Current password"
                type="password"
                autoComplete="current-password"
                error={errors.currentPassword}
                {...register('currentPassword', {
                    required: 'Current password is required'
                })}
            />

            <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                error={errors.newPassword}
                {...register('newPassword', {
                    required: 'New password is required',
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
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={errors.newPasswordConfirm}
                {...register('newPasswordConfirm', {
                    required: 'Please confirm the new password',
                    validate: (v) =>
                        v === newPassword || 'Passwords do not match'
                })}
            />

            <p className="text-xs text-gray-500">
                Password must contain: 8+ characters, uppercase, lowercase,
                number, and a special character.
            </p>

            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Changing…' : 'Change password'}
            </Button>
        </form>
    );
};

export default ProfilePage;