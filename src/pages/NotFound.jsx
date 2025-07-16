import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-center">
        <h1 className="text-6xl font-bold text-indigo-600">404</h1>
        <p className="text-xl mt-2 text-gray-700 dark:text-gray-300">Page Not Found</p>
        <Link to="/" className="mt-4 text-indigo-500 hover:underline">
            Go Home
        </Link>
    </div>
);

export default NotFound;
