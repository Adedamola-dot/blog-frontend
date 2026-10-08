const Footer = () => (
    <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Blog — Built with React, Vite, Express &amp; MongoDB
        </div>
    </footer>
);

export default Footer;