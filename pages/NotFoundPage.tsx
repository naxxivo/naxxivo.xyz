
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-extrabold text-primary font-display">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-text-primary mt-4">Page Not Found</h2>
      <p className="text-gray-600 dark:text-text-muted mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="mt-8 bg-primary text-background dark:text-white font-semibold py-3 px-8 rounded-full hover:bg-yellow-600 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFoundPage;