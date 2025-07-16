import React from 'react'

export const CleanupSection = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">System Cleanup</h2>
            <p className="text-gray-600">Perform optional system maintenance tasks.</p>
            {/* Placeholder for cleanup actions */}
            <div className="mt-6 space-y-4">
                <button className="w-full px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition duration-300 shadow-md">
                    Clear Test Orders
                </button>
                <button className="w-full px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 shadow-md">
                    Reset Menu to Default Template
                </button>
                <p className="text-sm text-gray-500 mt-2">
                    <span className="font-semibold text-red-600">Warning:</span> These actions are irreversible. Use with caution.
                </p>
            </div>
        </div>
    )
}


export default CleanupSection