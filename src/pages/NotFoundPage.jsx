import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Page not found.</p>
        <Link to="/" className="btn-primary">
            Back to Home
        </Link>
    </div>
);

export default NotFoundPage;