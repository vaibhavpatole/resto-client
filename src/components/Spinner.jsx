import React from 'react';

const Spinner = () => (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-dashed rounded-full animate-spin"></div>
    </div>
);

export default Spinner;
