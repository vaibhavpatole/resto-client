// src/components/HotelAdmin/Sidebar.jsx
import React from 'react';

const Sidebar = ({ navItems, activeSection, setActiveSection }) => {
    return (
        <aside className="w-full lg:w-64 bg-gray-800 text-white shadow-lg p-4 flex flex-col rounded-br-lg rounded-bl-lg lg:rounded-br-none lg:rounded-bl-none lg:rounded-tr-lg">
            <div className="text-2xl font-bold text-center py-4 border-b border-gray-700 mb-6">
                🛡️ Hotel Admin
            </div>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <button
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center w-full px-4 py-2 rounded-md transition duration-200 ease-in-out
                  ${activeSection === item.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            >
                                <span className="mr-3">{item.icon}</span>
                                {item.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="mt-auto pt-6 border-t border-gray-700">
                <button className="flex items-center w-full px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200 ease-in-out">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="17 16 22 12 17 8"></polyline>
                        <line x1="22" y1="12" x2="10" y2="12"></line>
                    </svg>
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
