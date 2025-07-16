import React, { useEffect, useState } from 'react';
import { FaMoneyBillWave, FaUtensils, FaChair } from 'react-icons/fa';
import { dashboard_overview } from '../../../services/apiService';

const DashboardCard = ({ title, value, icon: Icon, color }) => (
    <div className={`p-5 rounded-xl shadow-md border-l-8 ${color?.bg} ${color?.border}`}>
        <div className="flex items-center justify-between mb-2">
            <div>
                <h3 className={`text-sm font-medium ${color?.text}`}>{title}</h3>
                <p className={`text-3xl font-bold mt-1 ${color?.value}`}>{value}</p>
            </div>
            <Icon className={`text-4xl ${color?.icon}`} />
        </div>
    </div>
);

const DashboardSection = () => {
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await dashboard_overview();
                setOverview(res?.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
                setLoading(false);
            }
        };

        fetchDashboardData();

        const interval = setInterval(fetchDashboardData, 30000);

        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;


    // console.log(overview?.dailyIncome)
    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-2"> Dashboard Overview</h2>
            <p className="text-gray-600 mb-6">Live stats from your hotel backend</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <DashboardCard
                    title="Daily Income"
                    value={`₹ ${overview?.dailyIncome}`}
                    icon={FaMoneyBillWave}
                    color={{
                        bg: "bg-blue-50",
                        border: "border-blue-500",
                        text: "text-blue-700",
                        value: "text-blue-900",
                        icon: "text-blue-500",
                    }}
                />
                <DashboardCard
                    title="Active Orders"
                    value={overview?.activeOrders}
                    icon={FaUtensils}
                    color={{
                        bg: "bg-green-50",
                        border: "border-green-500",
                        text: "text-green-700",
                        value: "text-green-900",
                        icon: "text-green-500",
                    }}
                />
                <DashboardCard
                    title="Available Tables"
                    value={`${overview?.availableTables} / ${overview?.totalTables}`}
                    icon={FaChair}
                    color={{
                        bg: "bg-yellow-50",
                        border: "border-yellow-500",
                        text: "text-yellow-700",
                        value: "text-yellow-900",
                        icon: "text-yellow-500",
                    }}
                />
            </div>
        </div>
    );
};

export default DashboardSection;