import React from 'react'

export const SubscriptionSection = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Subscription Handling</h2>
            <p className="text-gray-600">View your current subscription status.</p>
            {/* Placeholder for subscription details */}
            <div className="bg-blue-50 p-6 rounded-lg shadow-sm mt-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">Current Plan: Premium</h3>
                <p className="text-gray-700 mb-2">Status: <span className="font-bold text-green-600">Active</span></p>
                <p className="text-gray-700 mb-4">Renews On: July 15, 2025</p>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-300 shadow-md">
                    Renew Now
                </button>
            </div>
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md relative mt-4" role="alert">
                <strong className="font-bold">Alert!</strong>
                <span className="block sm:inline ml-2">Your subscription expires in 14 days.</span>
            </div>
        </div>
    )
}

export default SubscriptionSection