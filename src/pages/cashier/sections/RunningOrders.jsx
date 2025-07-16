import Modal from "../Modal";
import { Plus, Minus, CheckCircle, XCircle, Clock, } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast'
import { getAllMenus, getAllTables, getAllOrders, addItemsToOrder, updateOrderStatus } from "../../../services/apiService";

import { useMemo } from "react";
import debounce from "lodash/debounce";
import { parseItems } from '../../PrintAndConstant'

const RunningOrders = () => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);

    const [showAddItemModal, setShowAddItemModal] = useState(false);
    const [orderToEdit, setOrderToEdit] = useState(null);
    const [selectedMenuItems, setSelectedMenuItems] = useState([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [orders, setOrders] = useState(null);
    const [menus, setMenus] = useState([]);
    // const [tables, setTables] = useState([]);
    const [localReason, setLocalReason] = useState("");

    const [searchTerm, setSearchTerm] = useState('');

    const filteredMenus = menus.filter(item => {
        const search = searchTerm.toLowerCase();
        return item.item_name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
    });

    useEffect(() => {
        fetchMenus();
        // fetchTables();
        fetchOrders();
    }, []);

    const runningOrders = orders?.filter(order => ['running', 'ready', 'served', 'In Progress', 'pending',].includes(order.order_status)) || [];
    // console.log(orders)
    const handleCancelClick = (order) => {
        setOrderToCancel(order);
        setShowCancelModal(true);
    };

    const confirmCancelOrder = () => {
        if (orderToCancel && localReason.trim()) {
            handleUpdateOrderStatus(orderToCancel?.order_id, 'cancelled', localReason);
            // const table = tables.find(t => t.id === orderToCancel.tableId);
            // if (table) table.status = 'available';

            // setConfirmationMessage(`Order ${orderToCancel.id} cancelled successfully.`);
            setIsError(false);
            setShowConfirmationModal(true);
            setShowCancelModal(false);
            setOrderToCancel(null);

            setLocalReason('');

        } else {
            setConfirmationMessage('Please provide a reason to cancel the order.');
            setIsError(true);
            setShowConfirmationModal(true);
        }
    };

    const handleAddItemClick = (order) => {
        setOrderToEdit(order);
        setSelectedMenuItems([]);
        setShowAddItemModal(true);
    };

    const handleMenuItemSelect = (item) => {
        setSelectedMenuItems(prev => {
            const existingItem = prev.find(i => i.id === item.id && i.portionType === item.portionType);
            if (existingItem) {
                return prev.map(i => i.id === item.id && i.portionType === item.portionType ? { ...i, quantity: i.quantity + 1 } : i);
            }
            // Assuming the first portion type is the default
            const selectedPortion = item.portions[0];
            return [...prev, { ...item, portionType: selectedPortion.type, price: selectedPortion.price, quantity: 1, notes: '' }];
        });
    };

    const updateSelectedMenuItemQuantity = (itemId, change) => {
        setSelectedMenuItems(prev => {
            return prev.map(item =>
                item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
            ).filter(item => item.quantity > 0);
        });
    };

    const confirmAddItems = async () => {
        if (orderToEdit && selectedMenuItems.length > 0) {
            try {
                const response = await addItemsToOrder(orderToEdit?.order_id, selectedMenuItems);
                toast.success(response?.data?.message)
                fetchOrders();
                console.log('order edited successfully : ', response.data);

                setConfirmationMessage(`Items added to order ${orderToEdit?.order_id} successfully.`);
                setIsError(false);
                // setShowConfirmationModal(true);
                setShowAddItemModal(false);
                setOrderToEdit(null);
                setSelectedMenuItems([]);
            } catch (error) {
                toast.error(error?.response?.data?.message)
                console.error('Error adding items to order:', error)
            }


        } else {
            setConfirmationMessage('Please select items to add.');
            setIsError(true);
            setShowConfirmationModal(true);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {

        try {
            const response = await updateOrderStatus(orderId, newStatus);
            toast.success(response?.data?.message);
            fetchOrders(); // Refresh orders to reflect the status change
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update order status.');
            console.error('Error updating order status:', error);
        }

    }





    const debouncedChangeHandler = useMemo(() =>
        debounce((value) => {
            setLocalReason(value);
        }, 300), []); // adjust delay if needed

    const handleInputChange = (e) => {
        debouncedChangeHandler(e.target.value);
    };

    const handleConfirm = () => {
        if (localReason.trim()) {
            onSubmit(localReason);
        }
    };

    const fetchMenus = async () => {
        try {
            const response = await getAllMenus();
            setMenus(response.data);
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Error fetching menus. Please try again.');
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getAllOrders({ limit: 50, offset: 0 });  // Pagination support
            setOrders(data);
        } catch (error) {
            toast.error(error.message || 'Could not load orders.');
            console.error('Error fetching orders:', error);
        }
    };


    // const fetchTables = async () => {
    //     try {
    //         const response = await getAllTables();
    //         setTables(response.data);
    //     } catch (error) {
    //         console.error('Error fetching tables:', error);
    //     }
    // };





    // console.log(menus)

    return (
        <div className="p-6 bg-white rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Manage Running Orders</h2>

            {runningOrders.length === 0 ? (
                <p className="text-gray-500 italic text-lg">No running orders at the moment.</p>
            ) : runningOrders.length === 1 ? (
                <div className="flex justify-center">
                    <div key={runningOrders[0].order_id} className="bg-blue-50 p-6 rounded-md shadow-sm border border-blue-100 w-full md:w-1/2 lg:w-1/3">
                        <div className="flex justify-between items-center mb-4 border-b pb-3">
                            <h3 className="text-lg font-bold text-blue-800">{runningOrders[0]?.table_name} <span className="text-sm font-normal text-gray-600">({runningOrders[0]?.order_id})</span></h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                    ${runningOrders[0]?.order_status === 'running' || runningOrders[0]?.order_status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                    runningOrders[0]?.order_status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'}`}>
                                {runningOrders[0]?.order_status.toUpperCase()}
                            </span>
                        </div>
                        <ul className="mb-4 space-y-2 text-gray-700">
                            {runningOrders.map(order => (
                                parseItems(order.items).map(item => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <span>{item.item_name} x {item.quantity}</span>
                                        <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))
                            ))}
                        </ul>
                        <p className="text-lg font-bold text-gray-800 mb-4">Total: ₹{runningOrders[0]?.total}</p>
                        <div className="flex flex-wrap gap-3 mt-4">
                            <button
                                onClick={() => handleAddItemClick(runningOrders[0])}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                            >
                                <Plus size={18} className="mr-2" /> Add Items
                            </button>
                            {/* <button
                                onClick={() => handleUpdateOrderStatus(runningOrders[0].order_id, 'ready')}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                            >
                                <Clock size={18} className="mr-2" /> Mark Ready
                            </button>
                            <button
                                onClick={() => handleUpdateOrderStatus(runningOrders[0].order_id, 'served')}
                                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                            >
                                <CheckCircle size={18} className="mr-2" /> Mark Served
                            </button> */}
                            <button
                                onClick={() => handleCancelClick(runningOrders[0])}
                                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                            >
                                <XCircle size={18} className="mr-2" /> Cancel Order
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runningOrders.map(order => (
                        <div key={order.order_id} className="bg-blue-50 p-6 rounded-md shadow-sm border border-blue-100">
                            <div className="flex justify-between items-center mb-4 border-b pb-3">
                                <h3 className="text-lg font-bold text-blue-800">{order?.table_name} <span className="text-sm font-normal text-gray-600">({order?.order_id})</span></h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                        ${order?.order_status === 'running' || order?.order_status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                                        order?.order_status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                            'bg-green-100 text-green-800'}`}>
                                    {order?.order_status.toUpperCase()}
                                </span>
                            </div>
                            <ul className="mb-4 space-y-2 text-gray-700">
                                {parseItems(order.items).map(item => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <span>{item.item_name} x {item.quantity}</span>
                                        <span> ₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-lg font-bold text-gray-800 mb-4">Total: ₹{order?.total}</p>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <button
                                    onClick={() => handleAddItemClick(order)}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                >
                                    <Plus size={18} className="mr-2" /> Add Items
                                </button>
                                {/* <button
                                    onClick={() => handleUpdateOrderStatus(order.order_id, 'ready')}
                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                                >
                                    <Clock size={18} className="mr-2" /> Mark Ready
                                </button>
                                <button
                                    onClick={() => handleUpdateOrderStatus(order.order_id, 'served')}
                                    className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                                >
                                    <CheckCircle size={18} className="mr-2" /> Mark Served
                                </button> */}
                                <button
                                    onClick={() => handleCancelClick(order)}
                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                                >
                                    <XCircle size={18} className="mr-2" /> Cancel Order
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Cancel Order Modal */}
            <Modal
                show={showCancelModal}
                title="Cancel Order"
                onClose={() => setShowCancelModal(false)}
                onConfirm={confirmCancelOrder}
                confirmText="Confirm Cancel"
            >
                <p className="mb-4">Why do you want to cancel the order?</p>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 text-sm"
                    rows="3"
                    placeholder="Enter reason"
                    onChange={handleInputChange}
                ></textarea>
                <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
                    onClick={handleConfirm}
                >
                    Confirm Cancel
                </button>

            </Modal>

            {/* Add Item Modal */}
            <Modal
                show={showAddItemModal}
                title={`Add Items to Order ${orderToEdit?.id}`}
                onClose={() => setShowAddItemModal(false)}
                onConfirm={confirmAddItems}
                confirmText="Add Items"
            >
                <div className="max-h-80 overflow-y-auto pr-2">
                    <h4 className="font-semibold text-lg mb-3">Select Menu Items:</h4>
                    <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md mb-4"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        {filteredMenus.map(item => (
                            <div key={item.id} className="flex flex-col justify-between items-center p-2 border border-gray-200 rounded-md bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-800">{item?.item_name}</p>
                                    <img src={item.image} alt={item.item_name} className="w-full h-40 object-cover mb-2" />
                                </div>
                                {item.portions.map(portion => (
                                    <button
                                        key={portion.type}
                                        onClick={() => handleMenuItemSelect({ ...item, portionType: portion.type, price: portion.price })}
                                        className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mb-2"
                                    >
                                        Add {portion.type} ({portion.price})
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    {selectedMenuItems.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <h4 className="font-semibold text-lg mb-3">Selected Items:</h4>
                            <ul className="space-y-2">
                                {selectedMenuItems.map(item => (
                                    <li key={item.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-md">
                                        <p className="font-medium">{item?.item_name}</p>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => updateSelectedMenuItemQuantity(item.id, -1)}
                                                className="p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-200"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="font-bold text-md">{item.quantity}</span>
                                            <button
                                                onClick={() => updateSelectedMenuItemQuantity(item.id, 1)}
                                                className="p-1.5 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal
                show={showConfirmationModal}
                title={isError ? 'Error' : 'Success'}
                onClose={() => setShowConfirmationModal(false)}
                showConfirm={false}
            >
                <div className={`flex items-center ${isError ? 'text-red-600' : 'text-green-600'}`}>
                    {isError ? <XCircle size={24} className="mr-2" /> : <CheckCircle size={24} className="mr-2" />}
                    <p>{confirmationMessage}</p>
                </div>
            </Modal>
        </div>
    );


};

export default RunningOrders;