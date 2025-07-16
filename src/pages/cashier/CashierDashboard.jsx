import React, { useState, useEffect } from 'react';
import { Home, List, DollarSign, History, BookOpen, User, Menu, X, Search, Plus, Minus, Printer, Download, CheckCircle, XCircle, Clock, Utensils, CreditCard, QrCode, ClipboardList, Package, Receipt, Calendar, Filter, Eye, Lock, LogOut, ShoppingCart, Settings } from 'lucide-react';
import { logoutUser } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import NewOrder from './sections/NewOrder';
import RunningOrders from './sections/RunningOrders';
import BillPayment from './sections/BillingPayments';
import OrderHistory from './sections/OrderHistory';
import ViewMenu from './sections/ViewMenu';
import Profile from './sections/ProfileSettings';
import Sidebar from './sections/Sidebar';

// import Modal from './Modal';
import { getAllMenus, getAllTables, getAllOrders } from '../../services/apiService';
import toast from 'react-hot-toast';
// import { toast } from 'react-hot-toast';



// Global state for orders (simulating a database)
let mockOrders = [
    {
        id: 'ord001',
        tableId: 't2',
        tableName: 'Table 2',
        items: [
            { id: 'm3', name: 'Chicken Biryani', price: 12.99, quantity: 1, notes: '' },
            { id: 'm8', name: 'Coca Cola', price: 2.00, quantity: 2, notes: '' },
        ],
        status: 'running', // running, ready, served, completed, cancelled
        discount: 0,
        subtotal: 16.99,
        tax: 1.70, // 10% tax
        serviceCharge: 0.85, // 5% service charge
        total: 19.54,
        paymentMethod: null,
        paid: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        cancelledReason: null,
    },
    {
        id: 'ord002',
        tableId: 't4',
        tableName: 'Table 4',
        items: [
            { id: 'm4', name: 'Paneer Butter Masala', price: 10.50, quantity: 1, notes: 'Less spicy' },
            { id: 'm2', name: 'Garlic Bread', price: 4.50, quantity: 1, notes: '' },
        ],
        status: 'running',
        discount: 0,
        subtotal: 15.00,
        tax: 1.50,
        serviceCharge: 0.75,
        total: 17.25,
        paymentMethod: null,
        paid: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        cancelledReason: null,
    },
    {
        id: 'ord003',
        tableId: 't1',
        tableName: 'Table 1',
        items: [
            { id: 'm1', name: 'Spring Rolls', price: 5.99, quantity: 2, notes: '' },
            { id: 'm9', name: 'Fresh Lime Soda', price: 3.50, quantity: 2, notes: 'No sugar' },
        ],
        status: 'completed',
        discount: 1.00, // $1 discount
        subtotal: 11.98 + 7.00, // 18.98
        tax: 1.80,
        serviceCharge: 0.90,
        total: 20.68,
        paymentMethod: 'Cash',
        paid: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        cancelledReason: null,
    },
    {
        id: 'ord004',
        tableId: 't3',
        tableName: 'Table 3',
        items: [
            { id: 'm5', name: 'Veg Noodles', price: 8.75, quantity: 3, notes: '' },
            { id: 'm7', name: 'Ice Cream', price: 3.00, quantity: 3, notes: 'Vanilla' },
        ],
        status: 'cancelled',
        discount: 0,
        subtotal: 26.25 + 9.00, // 35.25
        tax: 3.53,
        serviceCharge: 1.76,
        total: 40.54,
        paymentMethod: null,
        paid: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        cancelledReason: 'Customer changed mind',
    },
];

// Configuration for taxes and service charges
const config = {
    taxRate: 0.10, // 10%
    serviceChargeRate: 0.05, // 5%
    hotelName: 'Restaurant POS', // Generic hotel name
    cashierRole: 'Cashier',
};

// Utility function to calculate order totals
const calculateOrderTotals = (items, discount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAfterDiscount = subtotal - discount;
    const tax = totalAfterDiscount * config.taxRate;
    const serviceCharge = totalAfterDiscount * config.serviceChargeRate;
    const total = totalAfterDiscount + tax + serviceCharge;
    return { subtotal, tax, serviceCharge, total };
};



// Sidebar Navigation Component


// Dashboard Header Component
const DashboardHeader = ({ hotelName, role, userId, onLogout }) => {
    return (
        <header className="bg-white p-6 shadow-md flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{hotelName}</h1>
                <span className="text-lg text-blue-600 font-semibold px-3 py-1 bg-blue-50 rounded-full">
                    {role}
                </span>
            </div>
            <div className="flex items-center space-x-4">
                {userId && (
                    <span className="text-sm text-gray-600 hidden md:block">
                        User ID: <span className="font-mono text-gray-700">{userId}</span>
                    </span>
                )}
                <button
                    onClick={onLogout}
                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                    <LogOut size={18} className="mr-2" />
                    Logout
                </button>
            </div>
        </header>
    );
};

// Main CashierDashboard Component
const CashierDashboard = () => {
    const [activeTab, setActiveTab] = useState('newOrder');
    const [orders, setOrders] = useState(mockOrders); // Use local state for orders
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [menus, setMenus] = useState([]);
    const [tables, setTables] = useState([]);
    useEffect(() => {
        fetchMenus();
        // fetchCategories();

        fetchTables();
        fetchOrders();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await getAllMenus();
            setMenus(response.data);
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Error fetching menus. Please try again.');
        }
    };


    // Function to fetch all tables
    const fetchTables = async () => {
        try {
            const response = await getAllTables();
            setTables(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
            // In a real CashierDashboard, you'd show a user-friendly error message
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await getAllOrders();
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            // In a real CashierDashboard, you'd show a user-friendly error message
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
            toast.error('Logout failed. Please try again.');
        }
    };


    const updateOrderStatus = (orderId, newStatus, cancelledReason = null) => {
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId
                    ? { ...order, status: newStatus, cancelledReason: cancelledReason, updatedAt: new Date().toISOString() }
                    : order
            )
        );
    };

    // const updateOrderPaymentStatus = (orderId, paymentMethod) => {
    //     setOrders(prevOrders =>
    //         prevOrders.map(order =>
    //             order.id === orderId
    //                 ? { ...order, status: 'completed', paid: true, paymentMethod: paymentMethod, updatedAt: new Date().toISOString() }
    //                 : order
    //         )
    //     );
    // };




    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };
    // console.log('menus : ', menus)
    // console.log('type of orders : ', typeof orders)
    // console.log('tables : ', tables)
    // //')
    // console.log('categories : ', categories)
    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                toggleSidebarCollapse={toggleSidebarCollapse}
                isSidebarCollapsed={isSidebarCollapsed}
            />

            <div className={`flex-1 flex flex-col ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} overflow-hidden`}>
                <DashboardHeader
                    hotelName={config.hotelName}
                    role={config.cashierRole}
                    onLogout={handlelogoutUser}
                />
                <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
                    {activeTab === 'newOrder' && <NewOrder />}
                    {activeTab === 'runningOrders' && <RunningOrders />}
                    {activeTab === 'billPayment' && <BillPayment />}
                    {activeTab === 'orderHistory' && <OrderHistory orders={orders} />}
                    {activeTab === 'viewMenu' && <ViewMenu menu={menus} />}
                    {activeTab === 'profile' && <Profile hotelName={config.hotelName} role={config.cashierRole} onLogout={handlelogoutUser} />}
                </main>
            </div>
        </div>
    );
}

export default CashierDashboard;
