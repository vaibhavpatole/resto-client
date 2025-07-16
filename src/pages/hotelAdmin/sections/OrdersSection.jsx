import React from 'react'

export const OrdersSection = () => {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order & Billing Overview</h2>
            <p className="text-gray-600">View all orders, filter them, and export summaries.</p>
            {/* Placeholder for order table and filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <input type="date" className="p-2 border border-gray-300 rounded-md" />
                <select className="p-2 border border-gray-300 rounded-md">
                    <option>All Payment Methods</option>
                    <option>Cash</option>
                    <option>Card</option>
                </select>
                <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-300 shadow-md">
                    Export Summary
                </button>
            </div>
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Table</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#ORD001</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">T5</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$55.00</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Card</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-07-01</td>
                        </tr>
                        {/* More order rows */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


export default OrdersSection