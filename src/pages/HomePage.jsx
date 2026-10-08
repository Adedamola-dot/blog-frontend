import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePosts, useCategories } from '../hooks/usePosts';
import PostList from '../components/posts/PostList';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

const HomePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Read filters from URL (so links are shareable)
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
    const limit = 6;

    // Local state for search input so we can debounce
    const [searchInput, setSearchInput] = useState(search);

    // Keep local input in sync if URL changes (e.g. user clicked a chip elsewhere)
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    // Debounce: update URL 300ms after typing stops
    useEffect(() => {
        if (searchInput === search) return;
        const id = setTimeout(() => {
            const params = new URLSearchParams(searchParams);
            if (searchInput.trim()) {
                params.set('search', searchInput.trim());
            } else {
                params.delete('search');
            }
            params.set('page', '1');
            setSearchParams(params, { replace: true });
        }, 300);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // Build API params
    const params = { page, limit };
    if (search) params.search = search;
    if (category) params.category = category;

    const { data, isLoading, isError, error, isFetching } = usePosts(params);
    const categories = useCategories();

    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) next.set(key, value);
        else next.delete(key);
        // Reset to page 1 only when changing a filter (not when paginating)
        if (key !== 'page') {
            next.set('page', '1');
        }
        setSearchParams(next);
    };

    const clearAll = () => {
        const next = new URLSearchParams();
        setSearchParams(next);
    };

    const hasFilters = !!(search || category);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Latest Posts</h1>
                <p className="text-gray-500 mt-1">
                    {data?.total || 0} post{data?.total === 1 ? '' : 's'}
                    {hasFilters ? ' matching your filters' : ' published'}
                </p>
            </header>

            {/* Search + filters bar */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 space-y-4">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search posts…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="input-field flex-1"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            onClick={() => setSearchInput('')}
                            className="text-gray-400 hover:text-gray-600 px-2"
                            title="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => updateParam('category', '')}
                            className={`text-xs px-3 py-1 rounded-full transition ${
                                !category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            All categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() =>
                                    updateParam('category', cat === category ? '' : cat)
                                }
                                className={`text-xs px-3 py-1 rounded-full transition ${
                                    cat === category
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {hasFilters && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            {/* Content */}
            {isLoading ? (
                <Spinner className="py-20" size="lg" />
            ) : isError ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                    <strong>Failed to load posts:</strong> {error.message}
                </div>
            ) : (
                <>
                    {data?.data?.length === 0 ? (
                        <EmptyState
                            title="No posts found"
                            message={
                                hasFilters
                                    ? 'Try a different search term or category.'
                                    : 'Check back soon.'
                            }
                            action={
                                hasFilters ? (
                                    <button
                                        onClick={clearAll}
                                        className="btn-secondary"
                                    >
                                        Clear filters
                                    </button>
                                ) : null
                            }
                        />
                    ) : (
                        <>
                            <PostList posts={data.data} />

                            {data?.pagination && data.pagination.totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-10">
                                    <Button
                                        variant="secondary"
                                        disabled={!data.pagination.hasPrevPage || isFetching}
                                        onClick={() =>
                                            updateParam('page', String(Math.max(1, page - 1)))
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-sm text-gray-600">
                                        Page {data.pagination.page} of{' '}
                                        {data.pagination.totalPages}
                                    </span>
                                    <Button
                                        variant="secondary"
                                        disabled={!data.pagination.hasNextPage || isFetching}
                                        onClick={() =>
                                            updateParam('page', String(page + 1))
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default HomePage;