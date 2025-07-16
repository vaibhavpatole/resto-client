import React, { useState, useEffect, useMemo } from 'react';
import { Printer, Filter } from 'lucide-react';
import { getAllOrders } from '../../../services/apiService';
import toast from 'react-hot-toast';
import { PrintThisBill, parseItems } from '../../PrintAndConstant';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [filterTable, setFilterTable] = useState('');
    const [filterPaymentType, setFilterPaymentType] = useState('');
    const [filterStatus, setFilterStatus] = useState('completed');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders({ limit: 10, offset: 0 });
            setOrders(data);
        } catch (error) {
            toast.error(error.message || 'Could not load orders.');
            console.error('Error fetching orders:', error);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter(order => order.order_status === filterStatus && order?.payment_status === 'paid')
            .filter(order => {
                if (!selectedDate) return true;
                const orderDate = new Date(order.created_at);
                const selected = new Date(selectedDate);
                return (
                    orderDate.getFullYear() === selected.getFullYear() &&
                    orderDate.getMonth() === selected.getMonth() &&
                    orderDate.getDate() === selected.getDate()
                );
            })
            .filter(order => {
                return filterTable
                    ? order?.table_name?.toLowerCase().includes(filterTable.toLowerCase()) ||
                    order?.tableId?.toLowerCase().includes(filterTable.toLowerCase())
                    : true;
            })
            .filter(order => {
                return filterPaymentType
                    ? order?.payment_method?.toLowerCase() === filterPaymentType.toLowerCase()
                    : true;
            });
    }, [orders, selectedDate, filterTable, filterPaymentType, filterStatus]);




    // console.log(orders.filter(o => o.payment_status === 'due'))
    // const config = {
    //     taxRate: 0.10, // 10%
    //     serviceChargeRate: 0.05, // 5%
    //     hotelName: 'Restaurant POS', // Generic hotel name
    //     cashierRole: 'Cashier',
    // };


    const handleReprintInvoice = (order) => {
        PrintThisBill(order)

    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };





    // console.log(filteredOrders)
    return (
        <div className="p-6 bg-white rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Order History</h2>

            {/* Filters */}
            <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-100 flex flex-wrap gap-4 items-end">
                <div className="flex-grow">
                    <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                    <input type="date" id="dateFilter" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex-grow">
                    <label htmlFor="tableFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Table</label>
                    <input type="text" id="tableFilter" placeholder="e.g., Table 1 or T1" value={filterTable} onChange={(e) => setFilterTable(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="flex-grow">
                    <label htmlFor="paymentFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Payment Type</label>
                    <select id="paymentFilter" value={filterPaymentType} onChange={(e) => setFilterPaymentType(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="">All</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="flex-grow">
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                    <select id="statusFilter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500">
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Order List */}
            {filteredOrders.length === 0 ? (
                <p className="text-gray-500 italic text-lg">No orders found for the selected filters.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center mb-4 border-b pb-3">
                                <h3 className="text-lg font-bold text-gray-800">{order?.table_name} <span className="text-sm font-normal text-gray-600">({order?.order_id})</span></h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.order_status)}`}>
                                    {order.order_status?.toUpperCase()}
                                </span>
                            </div>
                            <p className="text-gray-700 mb-2 text-sm"><strong>Date:</strong> {new Date(order?.created_at).toLocaleDateString()}</p>
                            <p className="text-gray-700 mb-2 text-sm"><strong>Total:</strong> <span className="font-bold text-green-600">₹{order.total}</span></p>
                            {order?.payment_method && <p className="text-gray-700 mb-2 text-sm"><strong>Paid via:</strong> {order?.payment_method}</p>}
                            {order.cancelledReason && <p className="text-red-600 text-xs italic mb-2">Reason: {order.cancelledReason}</p>}
                            <ul className="mb-4 space-y-1 text-xs text-gray-600">
                                {parseItems(order.items).map(item => (
                                    <li key={item.id}>- {item?.item_name} x {item.quantity} (₹{(item.price * item.quantity)})</li>
                                ))}
                            </ul>
                            <div className="flex justify-end mt-4">
                                <button onClick={() => handleReprintInvoice(order)} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm">
                                    <Printer size={18} className="mr-2" /> Reprint Invoice
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
