import React from 'react'

export const SettingsSection = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hotel Settings</h2>
            <p className="text-gray-600">Update your hotel's general information.</p>
            {/* Placeholder for hotel settings form */}
            <form className="mt-6 space-y-4">
                <div>
                    <label htmlFor="hotelName" className="block text-sm font-medium text-gray-700">Hotel Name</label>
                    <input type="text" id="hotelName" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="Grand Hotel" />
                </div>
                <div>
                    <label htmlFor="hotelLogo" className="block text-sm font-medium text-gray-700">Hotel Logo</label>
                    <input type="file" id="hotelLogo" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                </div>
                <div>
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
                        <span className="ml-2 text-gray-700">Enable QR Ordering (Future Support)</span>
                    </label>
                </div>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 shadow-md">
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default SettingsSection