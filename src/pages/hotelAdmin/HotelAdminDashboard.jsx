import React, { useState } from 'react';
import DashboardSection from './sections/DashboardSection';
import StaffSection from './sections/StaffSection';
import TablesSection from './sections/TablesSection';
import MenuSection from './sections/MenuSection';
import OrdersSection from './sections/OrdersSection';
import ReportsSection from './sections/ReportsSection';
import SubscriptionSection from './sections/SubscriptionSection';
import SettingsSection from './sections/SettingsSection';
import ProfileSection from './sections/ProfileSection';
// import CleanupSection from './sections/CleanupSection';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';

import { useSelector } from 'react-redux';
const HotelAdminDashboard = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const user = useSelector((state) => state.auth.user);
    // console.log('user', user)
    const navItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
        { id: 'staff', name: 'Manage Staff', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> },
        { id: 'tables', name: 'Manage Tables', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3zM12 3v18"></path></svg> },
        { id: 'menu', name: 'Menu Management', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> },
        // { id: 'orders', name: 'Order & Billing', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg> },
        { id: 'reports', name: 'Reporting Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"></path><path d="M12 20V4"></path><path d="M6 20v-6"></path></svg> },
        { id: 'subscription', name: 'Subscription Handling', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5.34"></path><polygon points="18 2 22 6 12 16 8 12 18 2"></polygon></svg> },
        // { id: 'settings', name: 'Hotel Settings', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> },
        { id: 'profile', name: 'Password Change', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
        // { id: 'cleanup', name: 'System Cleanup', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg> },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'dashboard': return <DashboardSection />;
            case 'staff': return <StaffSection />;
            case 'tables': return <TablesSection />;
            case 'menu': return <MenuSection />;
            case 'orders': return <OrdersSection />;
            case 'reports': return <ReportsSection />;
            case 'subscription': return <SubscriptionSection />;
            // case 'settings': return <SettingsSection />;
            case 'profile': return <ProfileSection />;
            // case 'cleanup': return <CleanupSection />;
            default: return null;
        }
    };


    const dispatch = useDispatch();

    const handlelogoutUser = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            // Optionally, redirect to login page or home page
            // window.location.href = '/login';
        } catch (err) {
            console.error('logoutUser failed:', err);
        }
    };

    const roleIcons = {
        hotel_admin: '👑',
        cashier: '💸',
        developer: '💻'
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 font-sans text-gray-900">
            <aside className="w-full lg:w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col rounded-br-lg rounded-bl-lg lg:rounded-br-none lg:rounded-bl-none lg:rounded-tr-lg">
                <div className="text-2xl font-bold text-center py-4 border-b border-gray-700 mb-6">🛡️ Hotel Admin</div>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button onClick={() => setActiveSection(item.id)} className={`flex items-center w-full px-4 py-2 rounded-md transition duration-200 ease-in-out ${activeSection === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </button>
                            </li>
                        ))}
                        <li>  <button className="flex items-center w-full px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200 ease-in-out" onClick={handlelogoutUser}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="17 16 22 12 17 8"></polyline><line x1="22" y1="12" x2="10" y2="12"></line></svg>
                            Logout
                        </button></li>
                    </ul>
                </nav>
                {/* <div className="mt-auto pt-6 border-t border-gray-700">
                    <button className="flex items-center w-full px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200 ease-in-out" onClick={handlelogoutUser}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="17 16 22 12 17 8"></polyline><line x1="22" y1="12" x2="10" y2="12"></line></svg>
                        Logout
                    </button>
                </div> */}
            </aside>
            <main className="flex-1 p-4 md:p-8 overflow-auto">
                <header className="bg-white shadow-md rounded-lg p-4 mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        {navItems.find(item => item.id === activeSection)?.name || 'Dashboard'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-700 font-medium">
                            {roleIcons[user?.role]}{' '}{user?.role?.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                    </div>
                </header>
                {renderContent()}
            </main>
        </div>
    );
};

export default HotelAdminDashboard;
