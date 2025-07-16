import React, { useState, useEffect } from 'react';
import Modal from "../Modal";
import { Printer, CheckCircle, XCircle, CreditCard, ClipboardList, Receipt } from 'lucide-react';

import { updateTableStatusOfDuePayment, getAllOrders, updateOrderPaymentStatus, } from "../../../services/apiService";
import toast from 'react-hot-toast';

import { config, PrintThisBill, parseItems } from '../../PrintAndConstant';







const BillPayment = () => {
    const [billableOrders, setBillableOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [orders, setOrders] = useState(null);
    // const [tables, setTables] = useState([]);
    const [viewDuePayments, setViewDuePayments] = useState(false);
    useEffect(() => {
        // fetchMenus();
        // fetchTables();
        fetchOrders();



        // setBillableOrders((orders.filter(order =>
        //     (order.status === 'running' || order.status === 'ready' || order.status === 'served' || order.status === 'In Progress' || order.status === 'pending') && !order.paid
        // )))
    }, []);
    useEffect(() => {
        if (orders) {
            if (viewDuePayments) {
                setBillableOrders(orders.filter(order => order.payment_status === 'due'));
            } else {
                setBillableOrders(orders.filter(order => order.payment_status == 'pending'));
                setSelectedOrder(null);
            }
        }
    }, [orders, viewDuePayments]);




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

    const handleGenerateBill = (order) => {
        setSelectedOrder(order);
        setPaymentMethod(''); // Reset payment method when a new order is selected
    };

    const handleMarkAsPaid = async () => {
        if (!selectedOrder) {
            setConfirmationMessage('Please select an order to mark as paid.');
            setIsError(true);
            setShowConfirmationModal(true);
            return;
        }
        if (!paymentMethod) {
            setConfirmationMessage('Please select a payment method.');
            setIsError(true);
            setShowConfirmationModal(true);
            return;
        }

        try {

            await updateOrderPaymentStatus(selectedOrder?.order_id, paymentMethod);

            toast.success('Order marked as paid successfully')
            fetchOrders();
            setIsError(false);
            // setShowConfirmationModal(true);
            setSelectedOrder(null); // Clear selected order after payment
        } catch (error) {
            toast.error(error?.response?.data?.message)
            console.error('Error marking order as paid:', error);
        }

        // Update table status back to available
        // const table = tables.find(t => t.id === selectedOrder.tableId);
        // if (table) table.status = 'available';

        // setConfirmationMessage(`Order ${selectedOrder.id} marked as paid successfully via ${paymentMethod}.`);
    };
    const handleMakeTableAvailable = async (order) => {
        if (order) {
            try {
                if (order?.order_status !== "completed" && order?.payment_status === "due") {
                    await updateTableStatusOfDuePayment(order);
                    toast.success(`Table ${order?.table_name} is now available for other orders.`);
                    setIsError(false);
                    setSelectedOrder(null); // Clear selected order after payment
                } else {
                    toast.info(`Table ${order?.table_name} is already available.`);
                }
            } catch (error) {
                toast.error(error?.response?.data?.message);
            }
        }
    };



    // console.log(billableOrders)

    return (
        <div className="p-6 bg-white rounded-lg shadow-md h-full overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Bill & Payment</h2>
            <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-blue-800">Payment Due Orders ({orders?.filter(order => order.payment_status === 'due').length || 0})</h3>
                <button
                    onClick={() => setViewDuePayments(!viewDuePayments)}
                    className={`px-6 py-3 rounded-lg text-lg font-semibold shadow-md transition-all duration-200 ease-in-out ${viewDuePayments
                        ? 'bg-blue-100 text-blue-800 border border-blue-600 hover:bg-blue-200'
                        : 'bg-blue-600 text-white hover:bg-blue-800'
                        }`}
                    style={{
                        minWidth: '200px',
                        textAlign: 'center',
                    }}
                >
                    {viewDuePayments ? 'View All Billable Orders' : 'View Due Payments'}
                </button>
            </div>
            {/* Select Order Section */}
            <div className="mb-8 p-4 bg-blue-50 rounded-md border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <ClipboardList size={20} className="mr-2 text-blue-600" /> Select Order to Bill
                </h3>


                {billableOrders.length === 0 ? (
                    <p className="text-gray-500 italic">No orders to bill at the moment.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {billableOrders.map(order => (
                            <button
                                key={order.order_id}
                                onClick={() => handleGenerateBill(order)}
                                className={`p-3 rounded-md border transition-all duration-200 ease-in-out
          ${selectedOrder && selectedOrder.order_id === order.order_id
                                        ? 'border-blue-600 bg-blue-100 text-blue-800 shadow-sm'
                                        : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                    }`}
                                title={`Proceed With Order Id : ${order.order_id}`}
                            >
                                <p className="font-semibold text-md">{order.table_name}</p>
                                <p className="text-sm text-gray-500">Order ID: {order.order_id}</p>
                                <p className="text-sm text-gray-500">Payment Status : {order.payment_status}</p>
                                {order.payment_status === "due" &&
                                    <>
                                        <p className="text-sm text-gray-500">Customer Name : {order.customer_name}</p>
                                        <p className="text-sm text-gray-500">Customer Mobile : {order.customer_mobile}</p>
                                    </>
                                }
                                <p className="text-md font-bold text-blue-600">Total: ₹{order.total}</p>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Bill Details and Payment Section */}
            {selectedOrder && (
                <div className="p-6 bg-white rounded-lg shadow-md border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                        <Receipt size={20} className="mr-2 text-blue-600" /> Bill Details for {selectedOrder.tableName} ({selectedOrder.id})
                    </h3>
                    <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700">
                            <p className="font-semibold col-span-2 text-md border-b pb-2 mb-2">Items:</p>
                            {parseItems(selectedOrder.items).map(item => (
                                <React.Fragment key={item.id}>
                                    <p className="col-span-1 text-sm">{item.item_name} x {item.quantity}</p>
                                    <p className="col-span-1 text-right text-sm font-medium">₹
                                        {(item.price * item.quantity)}</p>
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="border-t pt-4 space-y-2 text-right">
                            <p className="text-md font-medium">Subtotal: <span className="font-bold text-blue-700">₹{selectedOrder.subtotal}</span></p>
                            {selectedOrder.discount > 0 && <p className="text-md font-medium text-red-600">Discount: <span className="font-bold">-${selectedOrder.discount}</span></p>}
                            <p className="text-md font-medium">Tax ({config.taxRate * 100}%): <span className="font-bold text-blue-700"> ₹{selectedOrder.tax}</span></p>
                            {/* <p className="text-md font-medium">Service Charge ({config.serviceChargeRate * 100}%): <span className="font-bold text-blue-700">${selectedOrder.serviceCharge}</span></p> */}
                            <p className="text-xl font-extrabold text-gray-900 mt-4">Grand Total: <span className="text-green-600">₹{selectedOrder.total}</span></p>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                            <CreditCard size={18} className="mr-2 text-gray-600" /> Select Payment Method
                        </h4>
                        <div className="flex flex-wrap gap-3">
                            {['Cash', 'UPI', 'Card', 'Other'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`px-4 py-2 rounded-md border transition-all duration-200 ease-in-out text-sm
                    ${paymentMethod === method
                                            ? 'border-blue-600 bg-blue-100 text-blue-800 shadow-sm'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'
                                        }`}
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                        {paymentMethod && <p className="mt-3 text-md text-blue-700 font-medium">Selected: <span className="font-bold">{paymentMethod}</span></p>}
                    </div>

                    <div className="flex justify-end space-x-4 mt-6">
                        {(selectedOrder?.payment_status === 'due' && selectedOrder?.order_status !== 'completed') && (
                            <button
                                onClick={() => handleMakeTableAvailable(selectedOrder, 'available')} // Add logic to make table available
                                className="flex items-center px-6 py-2.5 rounded-md bg-yellow-500 text-white text-md font-semibold hover:bg-yellow-600"
                            >
                                Make Table Available
                            </button>
                        )}
                        <button
                            onClick={() => PrintThisBill(selectedOrder)}
                            className="flex items-center px-5 py-2.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 text-md font-semibold"
                        >
                            <Printer size="18" className="mr-2" /> Print/Download Invoice
                        </button>
                        <button
                            onClick={handleMarkAsPaid}
                            className="flex items-center px-6 py-2.5 rounded-md bg-green-500 text-white text-md font-semibold hover:bg-green-600"
                        >
                            <CheckCircle size={20} className="mr-2" /> Mark as Paid
                        </button>
                    </div>
                </div>
            )}

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
export default BillPayment;