const EmptyState = ({ title = 'Nothing here', message, action }) => (
    <div className="text-center py-12 px-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        {message && <p className="text-gray-500 mb-4">{message}</p>}
        {action}
    </div>
);

export default EmptyState;