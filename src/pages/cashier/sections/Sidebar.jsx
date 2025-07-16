import {
    DollarSign,
    History,
    BookOpen,
    User,
    Menu,
    X,
    Plus,
    ClipboardList,
    UtensilsCrossed,
    ChevronsLeft,
    ChevronsRight
} from 'lucide-react';

// Define nav items configuration
const navItems = [
    { name: 'New Order', icon: <Plus size={20} />, tab: 'newOrder' },
    { name: 'Running Orders', icon: <ClipboardList size={20} />, tab: 'runningOrders' },
    { name: 'Bill & Payment', icon: <DollarSign size={20} />, tab: 'billPayment' },
    { name: 'Order History', icon: <History size={20} />, tab: 'orderHistory' },
    { name: 'View Menu', icon: <BookOpen size={20} />, tab: 'viewMenu' },
    { name: 'Profile', icon: <User size={20} />, tab: 'profile' },
];

// Sidebar component
const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, toggleSidebar, isSidebarCollapsed, toggleSidebarCollapse }) => {
    // Determine if we're on a mobile device based on screen width
    const isMobile = () => window.innerWidth < 1024;

    // Handle navigation item click
    const handleNavItemClick = (tab) => {
        setActiveTab(tab);
        if (isMobile()) toggleSidebar();
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white md:hidden hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all shadow-md"
                aria-label="Toggle menu"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 bg-slate-900 text-gray-200 p-4 space-y-6 
          transform transition-transform duration-300 ease-in-out z-40 shadow-2xl
          md:border-r md:border-slate-700
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full'}
          md:translate-x-0 ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'}
        `}
            >
                <div className={`flex items-center justify-between pt-4 pb-6 border-b border-slate-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                    {!isSidebarCollapsed && (
                        <>
                            <div className="flex items-center">
                                <UtensilsCrossed className="text-blue-400 mr-3" size={32} />
                                <h2 className="text-2xl font-bold tracking-wider text-white">
                                    RestoPOS
                                </h2>
                            </div>
                        </>
                    )}
                    {isSidebarCollapsed && (
                        <UtensilsCrossed className="text-blue-400" size={32} />
                    )}
                    <button
                        onClick={toggleSidebarCollapse}
                        className={`hidden md:block p-2 rounded-md ${isSidebarCollapsed ? 'bg-blue-600 text-white' : 'bg-slate-700 text-white'} hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-all ${isSidebarCollapsed ? 'mt-4' : ''}`}
                        aria-label="Toggle sidebar collapse"
                    >
                        {isSidebarCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>
                <nav className="flex-1">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.tab}>
                                <button
                                    onClick={() => handleNavItemClick(item.tab)}
                                    className={`
                    flex items-center w-full px-4 py-2.5 rounded-lg text-md font-medium 
                    transition-colors duration-200
                    ${activeTab === item.tab
                                            ? 'bg-blue-600 text-white shadow-inner'
                                            : 'hover:bg-slate-700/50 text-gray-300'
                                        }
                    ${isSidebarCollapsed && 'md:justify-center'}
                  `}
                                    title={item.name}
                                >
                                    <span className={`opacity-80 ${isSidebarCollapsed ? 'md:mr-0' : 'mr-4'}`}>{item.icon}</span>
                                    {!isSidebarCollapsed && item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 md:hidden"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </>
    );
};

export default Sidebar;