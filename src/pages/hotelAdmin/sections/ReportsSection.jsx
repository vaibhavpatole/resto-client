import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { getMonthlySales, getOrdersSummary, getTopSellingItems } from '../../../services/apiService';
import toast from 'react-hot-toast';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
// Mock API service for demonstration purposes
// In a real application, replace this with your actual API calls.

// Colors for Pie Chart cells
const PIE_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportsSection = () => {
    const [monthlySalesData, setMonthlySalesData] = useState([]);
    const [topSellingItemsData, setTopSellingItemsData] = useState([]);

    // State for date range filter for download
    const [downloadStartDate, setDownloadStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0]
    ); // Default to 7 days ago
    const [downloadEndDate, setDownloadEndDate] = useState(new Date().toISOString().split('T')[0]
    ); // Default to today

    // Function to fetch report data for charts
    const fetchChartData = async () => {
        try {
            const monthlySalesRes = await getMonthlySales();
            // console.log(monthlySalesRes.data)
            setMonthlySalesData(monthlySalesRes.data);

            const topSellingRes = await getTopSellingItems();
            setTopSellingItemsData(topSellingRes.data);

        } catch (error) {
            console.error('Error fetching chart reports:', error);
            // Implement user-friendly error display here
        }
    };

    // Function to handle downloading order summary



    const handleDownloadOrderSummary = async () => {
        try {
            // Basic validation for date range
            if (!downloadStartDate || !downloadEndDate) {
                toast.error('Please select both start and end dates for the summary download.');
                return;
            }
            if (new Date(downloadStartDate) > new Date(downloadEndDate)) {
                toast.error('Start date cannot be after end date.');
                return;
            }

            console.log(`Attempting to download order summary from ${downloadStartDate} to ${downloadEndDate}`);
            const response = await getOrdersSummary(downloadStartDate, downloadEndDate);

            const orders = response.data;

            if (!orders || !orders.length) {
                toast.error('No orders found in selected date range.');
                return;
            }


            const data = orders.map(order => {
                const date = new Date(order.created_at).toISOString().split('T')[0];
                return {
                    Date: date,
                    'Order ID': order.order_id,
                    Table: order.table_name,
                    'Customer Name': order.customer_name,
                    'Total Amount': `\u20B9${order.total}`,
                    'Payment Method': order.payment_method,
                    Status: order.order_status,
                    Discount: `\u20B9${order?.discount ? order.discount : 0}`,
                    'Service Charge': `\u20B9${order.service_charge}`,
                };
            });

            const workbook = XLSX.utils.book_new();
            // const worksheet = XLSX.utils.json_to_sheet(data, {
            //   header: Object.keys(data[0]),
            // });

            // Set styling options
            const worksheet = XLSX.utils.json_to_sheet(data);

            Object.keys(data[0]).forEach((header, index) => {
                const cell = XLSX.utils.encode_cell({ c: index, r: 0 });
                worksheet[cell].s = {
                    font: { bold: true },
                };
            });

            for (let row = 1; row <= data.length; row++) {
                Object.keys(data[0]).forEach((header, index) => {
                    const cell = XLSX.utils.encode_cell({ c: index, r: row });
                    if (worksheet[cell]) {
                        worksheet[cell].s = {
                            font: { bold: true },
                        };
                    }
                });
            }

            // Set column widths
            worksheet['!cols'] = [
                { wch: 15 }, // Date
                { wch: 20 }, // Order ID
                { wch: 10 }, // Table
                { wch: 20 }, // Customer Name
                { wch: 15 }, // Total Amount
                { wch: 15 }, // Payment Method
                { wch: 10 }, // Status
                { wch: 10 }, // Discount
                { wch: 15 }, // Service Charge
            ];

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

            // Save the workbook
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `order_summary_${downloadStartDate}_to_${downloadEndDate}.xlsx`);

            toast.success('Order summary downloaded successfully.');
            console.log('Order summary downloaded successfully.');
        } catch (error) {
            console.error('Error downloading order summary:', error);
            alert('Failed to download order summary. Please try again.');
        }
    };
    // Fetch chart data on component mount
    useEffect(() => {
        fetchChartData();
    }, []);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Reporting Dashboard</h2>
            <p className="text-gray-600 mb-6">Key insights into your hotel's performance.</p>

            {/* Order Summary Download Section */}
            <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                <h3 className="text-xl font-semibold text-blue-800 mb-4">Download Order Summary</h3>
                <div className="flex flex-wrap items-center gap-4">
                    <label htmlFor="downloadStartDate" className="text-gray-700 font-medium">From:</label>
                    <input
                        type="date"
                        id="downloadStartDate"
                        value={downloadStartDate}
                        onChange={(e) => setDownloadStartDate(e.target.value)}
                        className="p-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <label htmlFor="downloadEndDate" className="text-gray-700 font-medium">To:</label>
                    <input
                        type="date"
                        id="downloadEndDate"
                        value={downloadEndDate}
                        onChange={(e) => setDownloadEndDate(e.target.value)}
                        className="p-2 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                        onClick={handleDownloadOrderSummary}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
                    >
                        Download Excel
                    </button>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Sales Chart */}
                <div className="bg-white p-2 sm:p-4 md:p-6 rounded-lg shadow-lg border border-gray-200 w-full">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Monthly Sales Overview</h3>
                    <ResponsiveContainer width="100%" height={200} aspect={4 / 3}>
                        <BarChart data={monthlySalesData} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                            <XAxis dataKey="month" interval={0} angle={-60} textAnchor="end" tick={{ fill: '#6b7280', fontSize: 8, dx: 2, dy: 4 }} />
                            <YAxis tickFormatter={(value) => `$${value}`} tick={{ fill: '#6b7280', fontSize: 8 }} />
                            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Sales']} />
                            <Bar dataKey="sales" fill="#82ca9d" radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top-Selling Items Chart */}
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Top-Selling Items</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={topSellingItemsData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="sales"
                                nameKey="name"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {topSellingItemsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value, name) => [`${value} units`, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default ReportsSection;
