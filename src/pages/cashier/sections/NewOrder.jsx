import { useState, useEffect, useRef } from "react";
import { Plus, Minus, CheckCircle, XCircle, ShoppingCart, Utensils, Menu, Search, DollarSign, Table, Users, CircleCheck, CircleX } from 'lucide-react';
import Modal from "../Modal";
import toast from 'react-hot-toast';
import { addOrder, getAllMenus, getAllTables, getTopSellingItems, } from "../../../services/apiService";
// Removed ReactToPrint import

// Utility function to calculate order totals
const calculateOrderTotals = (items, discount) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAfterDiscount = subtotal - discount;
    // Ensure tax and service charge are calculated on the discounted subtotal
    const tax = totalAfterDiscount * config.taxRate;
    const serviceCharge = totalAfterDiscount * config.serviceChargeRate;
    const total = totalAfterDiscount + tax + serviceCharge; // Include service charge in total
    return { subtotal, tax, total, serviceCharge };
};

const config = {
    taxRate: 0.10,
    serviceChargeRate: 0.05,
    hotelName: 'Restaurant POS',
    cashierRole: 'Cashier',
};

const NewOrder = () => {
    const [selectedTable, setSelectedTable] = useState(null);
    const [cart, setCart] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [menus, setMenus] = useState([]);
    const [tables, setTables] = useState([]);

    // States for added features
    const [showTablesModal, setShowTablesModal] = useState(false);
    const [menuSearchTerm, setMenuSearchTerm] = useState('');
    const [menuFilterCategory, setMenuFilterCategory] = useState('Select Category'); // Default to 'Select Category'
    const [menuCategories, setMenuCategories] = useState([]);

    // State for debounced search term
    const [debouncedMenuSearchTerm, setDebouncedMenuSearchTerm] = useState('');

    // New states for Payment Due, default to 'paid'
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [customerName, setCustomerName] = useState('');
    const [customerMobile, setCustomerMobile] = useState('');
    const [topSellingItemsData, setTopSellingItemsData] = useState([]);
    // Removed componentRef as print functionality is removed

    useEffect(() => {
        if (menus.length === 0) {
            fetchMenus();
        }
        if (tables.length === 0) {

            fetchTables();
        }
        if (topSellingItemsData.length === 0) {

            getTopSellingItems().then(res => setTopSellingItemsData(res.data));
        }

    }, []);

    // console.log(topSellingItemsData)

    // Debounce effect for search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedMenuSearchTerm(menuSearchTerm);
        }, 500); // 500ms debounce delay

        return () => {
            clearTimeout(handler);
        };
    }, [menuSearchTerm]);

    const fetchMenus = async () => {
        try {
            const response = await getAllMenus();
            setMenus(response.data);
            const categories = [...new Set(response.data.map(item => item.category))];
            setMenuCategories(['Select Category', 'All', ...categories]);
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Error fetching menus. Please try again.');
        }
    };

    const fetchTables = async () => {
        try {
            const response = await getAllTables();
            setTables(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
        }
    };

    const handleAddToCart = (item, portionType) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id && cartItem.portionType === portionType);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id && cartItem.portionType === portionType ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            const selectedPortion = item.portions.find(portion => portion.type === portionType);
            return [...prevCart, { ...item, portionType, price: selectedPortion.price, quantity: 1 }];
        });
        toast.success(`${item.item_name} (${portionType}) added to cart!`);
    };

    const updateCartQuantity = (itemId, change) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item =>
                item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
            ).filter(item => item.quantity > 0);

            if (change === -1 && updatedCart.find(item => item.id === itemId)?.quantity === 0) {
                toast.error(`Item ${updatedCart.find(item => item.id === itemId)?.item_name} removed from cart.`);
            } else if (change === 1) {
                toast.success(`Item ${updatedCart.find(item => item.id === itemId)?.item_name} quantity increased.`);
            }
            return updatedCart;
        });
    };

    const updateCartItemNotes = (itemId, notes) => {
        setCart(prevCart =>
            prevCart.map(item =>
                item.id === itemId ? { ...item, notes: notes } : item
            )
        );
    };

    const handlePlaceOrder = async () => {
        if (!selectedTable) {
            toast.error('Please select a table before placing an order.');
            return;
        }
        if (cart.length === 0) {
            toast.error('Cart is empty. Please add items to the order.');
            return;
        }
        if (paymentStatus === 'due' && (!customerName.trim() || !customerMobile.trim())) {
            toast.error('Please enter customer name and mobile for due payment.');
            return;
        }


        const { subtotal, tax, total, serviceCharge } = calculateOrderTotals(cart, discount);
        try {
            if (selectedTable.status !== 'available') {
                toast.error('Table is not available for ordering.');
                return;
            }
            const newOrder = {
                order_id: `ORD${Date.now()}`,
                // Conditionally set customer name and mobile based on payment status
                customer_name: paymentStatus === 'due' ? customerName.trim() : 'Walk-in Customer',
                customer_mobile: paymentStatus === 'due' ? customerMobile.trim() : '',
                table_name: selectedTable?.table_number,
                items: cart.map(item => ({
                    id: item.id,
                    item_name: item.item_name,
                    price: item.price,
                    quantity: item.quantity,
                    notes: item.notes || ''
                })),
                subtotal: subtotal,
                tax: tax,
                total: total,
                // Set order status based on payment status
                order_status: paymentStatus, // 'pending_payment' for due, 'completed' for paid
                paid: paymentStatus === 'due' ? false : true, // 'paid' or 'due'
                payment_status: paymentStatus,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                discount: discount,
                service_charge: serviceCharge,
            };
            await addOrder(newOrder);
            toast.success('Order placed successfully!');
            fetchTables();
            resetForm();
        } catch (error) {
            console.error('Error adding order:', error);
            toast.error('Error adding order. Please try again.');
        }
    };

    const resetForm = () => {
        setSelectedTable(null);
        setCart([]);
        setDiscount(0);
        setMenuSearchTerm('');
        setDebouncedMenuSearchTerm(''); // Reset debounced term too
        setMenuFilterCategory('Select Category'); // Reset to default 'Select Category'
        setPaymentStatus('pending'); // Reset payment status to 'paid'
        setCustomerName(''); // Reset customer info
        setCustomerMobile(''); // Reset customer info
    };

    const { subtotal, tax, total, serviceCharge } = calculateOrderTotals(cart, discount);

    let filteredMenus = menus.filter((item) => {
        const search = debouncedMenuSearchTerm.trim().toLowerCase();
        const category = menuFilterCategory;

        // If 'Select Category' is chosen and no search term, show top-selling items
        if (category === 'Select Category' && !search) {
            return topSellingItemsData.some(top => top.name.toLowerCase() === item.item_name.toLowerCase());
        }

        const matchesSearch = item.item_name.toLowerCase().includes(search) || item.category.toLowerCase().includes(search);
        const matchesCategory = category === 'All' || item.category === category;

        // If there's a search term
        if (search) {
            if (category === 'All' || category === 'Select Category') {
                // If 'All' or 'Select Category' is chosen, search globally
                return matchesSearch;
            } else {
                // If a specific category is chosen, search within that category
                return matchesSearch && matchesCategory;
            }
        }

        // If no search term, filter by category
        if (category === 'All') {
            return true; // Show all items
        }

        // Only category filter applies
        return matchesCategory;
    });




    // console.log('menus : ', menus)
    // console.log('topseling items : ', topSellingItemsData)
    // useEffect(() => {
    //     const lowerTop = topSellingItemsData.map(item => item.name.trim().toLowerCase());
    //     const lowerMenu = menus.map(item => item.item_name.trim().toLowerCase());

    //     const matchedItems = lowerTop.filter(item => lowerMenu.includes(item));
    //     const unmatchedItems = lowerTop.filter(item => !lowerMenu.includes(item));

    //     console.log('Matched items:', matchedItems);
    //     console.log('Unmatched items:', unmatchedItems);
    //     console.log('menus items data : ', menus[0])

    // }, [topSellingItemsData]);

    // const matchedItemNames = menus.filter(menu =>
    //     topSellingItemsData.some(top => top.name.toLowerCase() === menu.item_name.toLowerCase())
    // ).map(menu => menu.item_name.toLowerCase());

    // const missingItems = topSellingItemsData.filter(top => !matchedItemNames.includes(top.name.toLowerCase()));

    // console.log('Missing items:', missingItems);
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            const topMatch = filteredMenus[0];
            if (topMatch) {
                handleAddToCart(topMatch);
                toast.success(`${topMatch.item_name} added from search!`);
                setMenuSearchTerm('');
            } else {
                toast.error("No matching item to add.");
            }
        }

    };



    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 border-b-4 border-blue-500 pb-4 text-center">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">New Order</span>
            </h2>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Table Selection & Menu Items */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Table Selection */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-5 flex items-center">
                            <Utensils size={24} className="mr-3 text-blue-600" /> Select Table
                        </h3>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
                            {selectedTable ? (
                                <div className="flex items-center text-lg font-semibold text-blue-700 bg-blue-50 px-4 py-2 rounded-lg shadow-inner">
                                    <Table size={20} className="mr-2 text-blue-500" />
                                    Selected: <span className="ml-2 font-extrabold">{selectedTable?.table_number}</span>
                                    <span className="ml-4 text-gray-600 text-sm">Capacity: {selectedTable?.capacity}</span>
                                </div>
                            ) : (
                                <p className="text-lg text-gray-600 italic">No table selected.</p>
                            )}
                            <button
                                onClick={() => setShowTablesModal(true)}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-lg font-semibold"
                            >
                                <Utensils size={20} className="mr-2" /> {selectedTable ? 'Change Table' : 'Select Table'}
                            </button>
                        </div>
                    </div>

                    {/* Table Selection Modal */}
                    <Modal
                        show={showTablesModal}
                        title="Select a Table"
                        onClose={() => setShowTablesModal(false)}
                        showConfirm={false}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2 ">
                            {tables.map(table => (
                                <button
                                    key={table.id}
                                    onClick={() => {
                                        setSelectedTable(table);
                                        setShowTablesModal(false);
                                        toast.success(`Table ${table.table_number} selected!`);
                                    }}
                                    disabled={table.status !== 'available' && selectedTable?.id !== table.id}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ease-in-out flex flex-col items-center justify-center
                                     ${table.status === 'available' ? 'bg-green-50 border-green-500 hover:bg-green-100' : 'bg-red-50 border-red-500 cursor-not-allowed opacity-70'}
                                        ${selectedTable && selectedTable.id === table.id ? 'border-blue-600 bg-blue-100 text-blue-800 shadow-md scale-105' : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50'}`}
                                >
                                    <Table size={28} className="mb-2" />
                                    <p className="font-bold text-lg">{table?.table_number}</p>
                                    <p className="text-sm text-gray-500">Cap: {table.capacity}</p>
                                    <p className="text-xs font-semibold mt-1" style={{ color: table.status === 'available' ? '#10B981' : '#EF4444' }}>
                                        {table.status.toUpperCase()}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </Modal>

                    {/* Menu Items */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                            <Menu size={24} className="mr-3 text-gray-600" /> Add Menu Items
                        </h3>

                        {/* Menu Search and Filter */}
                        <div className="mb-6 flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <input
                                    type="text"
                                    placeholder="Search menu items or categories..."
                                    value={menuSearchTerm}
                                    onChange={(e) => setMenuSearchTerm(e.target.value)} // Updates immediately
                                    onKeyDown={handleSearchKeyDown} // Add this line
                                    className="w-full p-3 pl-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                                />
                                <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            </div>
                            <select
                                value={menuFilterCategory}
                                onChange={(e) => setMenuFilterCategory(e.target.value)}
                                className="block w-[150px] md:w-auto p-2 md:p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                            >
                                {menuCategories.map(category => (
                                    <option key={category} value={category}>
                                        {category === 'All' ? 'All Categories' : category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                            {filteredMenus.length === 0 ? (
                                <p className="text-gray-500 italic col-span-full text-center py-8">No menu items found matching your criteria.</p>
                            ) : (
                                filteredMenus.map(item => (
                                    <div key={item.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg mb-1">{item.item_name}</p>
                                            <p className="text-sm text-gray-500 mb-2">{item.category}</p>
                                            <img src={item.image} alt={item.item_name} className="w-full h-40 object-cover mb-2" />
                                            {item.portions.map(portion => (
                                                <button
                                                    key={portion.type}
                                                    onClick={() => handleAddToCart(item, portion.type)}
                                                    className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center text-md font-semibold shadow-md"
                                                >
                                                    Add {portion.type} (
                                                    ₹{portion.price.toFixed(2)})
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Cart & Totals */}
                <div className="lg:w-1/3 space-y-6">
                    {/* Order Cart */}
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200 h-full flex flex-col">
                        <h3 className="text-xl font-bold text-blue-800 mb-5 flex items-center">
                            <ShoppingCart size={24} className="mr-3 text-blue-600" /> Order Cart
                        </h3>
                        {cart.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-8">No items in cart yet. Add some delicious food!</p>
                        ) : (
                            <>
                                <div className="flex-grow overflow-y-auto pr-2 mb-4 space-y-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex flex-col p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-800 text-md">{item?.item_name}</p>
                                                    <p className="text-sm text-gray-600"> ₹{item.price.toFixed(2)}</p>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, -1)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                                                    >
                                                        <Minus size={16} />
                                                    </button>
                                                    <span className="font-bold text-lg text-gray-800 w-8 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateCartQuantity(item.id, 1)}
                                                        className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Notes (e.g., no onions)"
                                                value={item.notes || ''}
                                                onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                                                className="mt-2 w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Order Totals */}
                                <div className="mt-auto border-t-2 border-blue-300 pt-6 space-y-3">
                                    <div className="flex justify-between items-center text-md font-medium text-gray-700">
                                        <span>Subtotal:</span>
                                        <span className="font-bold text-blue-700">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="discount" className="text-gray-700 text-md font-medium">Discount (₹):</label>
                                        <input
                                            type="number"
                                            id="discount"
                                            value={discount}
                                            onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value || '0')))}
                                            className="w-32 p-2 border border-gray-300 rounded-md text-right text-md shadow-sm"
                                            min="0"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center text-md font-medium text-gray-700">
                                        <span>Tax ({config.taxRate * 100}%):</span>
                                        <span className="font-bold text-blue-700">₹{tax.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-md font-medium text-gray-700">
                                        <span>Service Charge ({config.serviceChargeRate * 100}%):</span>
                                        <span className="font-bold text-blue-700">₹{serviceCharge.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-extrabold text-gray-900 pt-2">
                                        <span>Total:</span>
                                        <span className="text-green-600">₹{total.toFixed(2)}</span>
                                    </div>

                                    {/* Payment Status Selection */}
                                    <div className="mt-4 border-t pt-4">
                                        <h6 className="font-bold text-gray-800 mb-2 flex items-center">
                                            <DollarSign size={13} className="mr-2 text-blue-600" /> Payment Status
                                        </h6>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center cursor-pointer">
                                                <span className="text-gray-700 mr-3">Due Payment:</span>
                                                <input
                                                    type="checkbox"
                                                    checked={paymentStatus === 'due'}
                                                    onChange={() =>
                                                        setPaymentStatus(prev => (prev === 'due' ? 'pending' : 'due'))
                                                    }
                                                    className="form-checkbox h-5 w-5 text-blue-600"
                                                />
                                            </label>
                                        </div>


                                        {/* Customer Info for Due Payments */}
                                        {paymentStatus === 'due' && (
                                            <div className="mt-4 space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Customer Name"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <input
                                                    type="tel"
                                                    placeholder="Customer Mobile"
                                                    value={customerMobile}
                                                    onChange={(e) => setCustomerMobile(e.target.value)}
                                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Action Buttons (below the two columns) */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <button
                    onClick={resetForm}
                    className="px-6 py-3 rounded-full bg-gray-200 text-gray-800 hover:bg-gray-300 text-lg font-semibold shadow-md transition-all duration-300"
                >
                    Clear Order
                </button>
                <button
                    onClick={handlePlaceOrder}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white text-lg font-semibold hover:from-blue-600 hover:to-blue-700 shadow-lg transition-all duration-300"
                >
                    Place Order
                </button>
            </div>

            {/* Confirmation Modal */}
            <Modal
                show={showConfirmationModal}
                title={isError ? 'Error' : 'Success'}
                onClose={() => setShowConfirmationModal(false)}
                showConfirm={false}
            >
                <div className={`flex items-center text-lg ${isError ? 'text-red-600' : 'text-green-600'} p-4`}>
                    {isError ? <XCircle size={28} className="mr-3" /> : <CheckCircle size={28} className="mr-3" />}
                    <p className="font-medium">{confirmationMessage}</p>
                </div>
            </Modal>
        </div>
    );
};

export default NewOrder;