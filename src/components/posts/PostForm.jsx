import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';

// Reusable form for creating and editing posts.
// Parent controls submit behavior and initial values.

const PostForm = ({ initialValues, onSubmit, submitLabel, loading, serverError }) => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm({
        defaultValues: initialValues || {
            title: '',
            content: '',
            excerpt: '',
            status: 'draft',
            categories: '',
            tags: '',
            featuredImage: ''
        }
    });

    const status = watch('status');

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded">
                    {serverError}
                </div>
            )}

            <Input
                label="Title"
                type="text"
                placeholder="An unforgettable title"
                error={errors.title}
                {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' },
                    maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
                })}
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                </label>
                <textarea
                    rows={12}
                    placeholder="Write your post here. Line breaks become paragraphs."
                    className="input-field font-mono text-sm"
                    {...register('content', {
                        required: 'Content is required',
                        minLength: { value: 10, message: 'Content must be at least 10 characters' }
                    })}
                />
                {errors.content && (
                    <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                    rows={3}
                    placeholder="Short summary shown on the home page. Leave blank to auto-generate from content."
                    className="input-field"
                    {...register('excerpt', {
                        maxLength: { value: 500, message: 'Excerpt cannot exceed 500 characters' }
                    })}
                />
                {errors.excerpt && (
                    <p className="text-red-600 text-sm mt-1">{errors.excerpt.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                </label>
                <select
                    className="input-field"
                    {...register('status')}
                >
                    <option value="draft">Draft — only you can see it</option>
                    <option value="published">Published — visible to everyone</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Current: <strong>{status}</strong>
                </p>
            </div>

            <Input
                label="Categories (comma-separated)"
                type="text"
                placeholder="Technology, Programming"
                error={errors.categories}
                {...register('categories')}
            />

            <Input
                label="Tags (comma-separated)"
                type="text"
                placeholder="nodejs, express, tutorial"
                error={errors.tags}
                {...register('tags')}
            />

            <Input
                label="Featured image URL (optional)"
                type="text"
                placeholder="https://example.com/image.jpg"
                error={errors.featuredImage}
                {...register('featuredImage')}
            />

            <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting || loading}>
                    {isSubmitting || loading ? 'Saving…' : submitLabel}
                </Button>
                <span className="text-sm text-gray-500">
                    {status === 'published'
                        ? 'This will be visible to everyone.'
                        : 'Only you can see this until you publish.'}
                </span>
            </div>
        </form>
    );
};

export default PostForm;