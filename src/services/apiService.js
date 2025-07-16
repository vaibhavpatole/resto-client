import API from '../utils/axiosSecure';
// -------------------------{Authentication Api's}------------------------------------

// Get current user info
export const whoami = async () => {
    try {
        return await API.get('/auth/whoami');
    } catch (error) {
        throw error;
    }
};

// Login user
export const login = async (data) => {
    try {
        return await API.post('/auth/login', data, {
            withCredentials: true,
        });
    } catch (error) {
        throw error;
    }
};

// Logout user
export const logout = async () => {
    try {
        return await API.post('/auth/logout');
    } catch (error) {
        throw error;
    }
};

export const updateUserPassword = async (data) => {
    try {
        return await API.patch('/auth/update-password', data);
    } catch (error) {
        throw error;
    }
};





// ----------------------{Hotel Admin Api's}---------------------------
// Register portal user (by developer)
export const registerPortalUser = async (data) => {
    try {
        return await API.post('/auth/registerportaluser', data);
    } catch (error) {
        throw error;
    }
};

// Register cashier (by hotel admin)
export const registerCashier = async (data) => {
    try {
        return await API.post(`/auth/register-cashier/${data?.hotel_id}`, data);
    } catch (error) {
        throw error;
    }
};

// Remove cashier (by hotel admin)
export const removeCashier = async (data) => {
    try {
        return await API.delete('/auth/remove-cashier', { data });
    } catch (error) {
        throw error;
    }
};

// ----------------------{Hotel Admin Api's}---------------------------

export const getStaffInformation = async () => {
    try {
        return await API.get('/hotel_admin/get-staff-information');
    } catch (error) {
        throw error;
    }
};

export const dashboard_overview = async () => {
    try {
        return await API.get('/hotel_admin/dashboard-overview')
    } catch (error) {
        throw error;
    }
};

// Get all staff
export const getAllStaff = async () => {
    try {
        return await API.get('/hotel_admin/staff');
    } catch (error) {
        throw error;
    }
};

// Add new staff
export const addStaff = async (data) => {
    try {
        return await API.post('/hotel_admin/staff', data);
    } catch (error) {
        throw error;
    }
};

// Edit staff
export const editStaff = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/staff/${id}`, data);
    } catch (error) {
        throw error;
    }
};

// Deactivate staff
export const deactivateStaff = async (id) => {
    try {
        return await API.delete(`/hotel_admin/staff/${id}`);
    } catch (error) {
        throw error;
    }
};

export const reactivateStaff = async (id) => {
    try {
        return await API.put(`/hotel_admin/staff/${id}/reactivate`);
    } catch (error) {
        throw error;
    }
};

export const getAllTables = async () => {
    try {
        return await API.get('/hotel_admin/tables');
    } catch (error) {
        throw error;
    }
};

export const addTable = async (data) => {
    try {
        return await API.post('/hotel_admin/tables', data);
    } catch (error) {
        throw error;
    }
};

export const editTable = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/tables/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const updateTableAvailabilityStatus = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/tables/${id}/status`, data);
    } catch (error) {
        throw error;
    }
};
export const deleteTable = async (id) => {
    try {
        return await API.delete(`/hotel_admin/tables/${id}`);
    }
    catch (error) {
        throw error;
    }
}

export const getAllMenus = async () => {
    try {
        return await API.get('/hotel_admin/menus');
    } catch (error) {
        throw error;
    }
};

export const addMenu = async (data) => {
    try {
        return await API.post('/hotel_admin/menus', data);
    } catch (error) {
        throw error;
    }
};

export const editMenu = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/menus/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const updateMenuStatus = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/menus/${id}/status`, data);
    } catch (error) {
        throw error;
    }
};
export const deleteMenu = async (id) => {
    try {

        return await API.delete(`/hotel_admin/menus/${id}`);
    } catch (error) {
        throw error;
    }
};



export const getAllCategories = async () => {
    try {
        return await API.get('/hotel_admin/categories');
    } catch (error) {
        throw error;
    }
};

export const addCategory = async (data) => {

    try {
        return await API.post('/hotel_admin/categories', data);
    } catch (error) {
        throw error;
    }
};

export const editCategory = async (id, data) => {
    try {
        return await API.put(`/hotel_admin/categories/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteCategory = async (id) => {
    try {
        return await API.delete(`/hotel_admin/categories/${id}`);
    } catch (error) {
        throw error;
    }
};


export const getOrdersSummary = async (startDate, endDate) => {
    //we need to pass start date and end date.
    try {
        return await API.get(`/hotel_admin/orders-summary?startDate=${startDate}&endDate=${endDate}`);
    } catch (error) {

        throw error;
    }
};

export const getMonthlySales = async () => {
    try {
        return await API.get('/hotel_admin/monthly-sales');
    } catch (error) {
        throw error;
    }
};

export const getTopSellingItems = async () => {
    try {
        return await API.get('/hotel_admin/top-selling-items');
    } catch (error) {
        throw error;
    }
};




// --------------------------{Hotel Cashier Api's }-------------------------------------
export const getAllOrders = async (params = {}) => {
    try {
        const response = await API.get('/cashier/orders', { params });
        return response.data;
    } catch (error) {
        console.error('API error in getAllOrders:', error);
        throw error?.response?.data || { message: 'Failed to fetch orders' };
    }
};


export const addOrder = async (data) => {
    try {
        return await API.post('/cashier/orders', data);
    } catch (error) {
        throw error;
    }
};

export const editOrder = async (id, data) => {
    try {
        return await API.put(`/cashier/orders/${id}`, data);
    } catch (error) {
        throw error;
    }
};

export const deleteOrder = async (id) => {
    try {
        return await API.delete(`/cashier/orders/${id}`);
    } catch (error) {
        throw error;
    }
};


export const addItemsToOrder = async (orderId, items) => {

    try {
        return await API.post(`/cashier/orders/${orderId}/items`, items);

    } catch (error) {
        throw error
    }

};

export const updateOrderStatus = async (orderId, status, cancelReason) => {
    try {
        return await API.patch(`/cashier/orders/${orderId}/status`, { status, cancelReason });

    } catch (error) {
        throw error

    }

};

export const updateOrderPaymentStatus = async (orderId, paymentStatus) => {
    try {
        return await API.patch(`/cashier/orders/${orderId}/payment-status`, { paymentStatus });

    } catch (error) {
        throw error

    }

}

export const updateTableStatus = async (table_number, newStatus) => {
    try {
        return await API.patch(`/cashier/tables/${table_number}/status`, { newStatus });

    } catch (error) {
        throw error

    }
}

export const updateTableStatusOfDuePayment = async (order) => {
    try {
        return await API.patch(`/cashier/order-tables/status`, { order });

    } catch (error) {
        throw error

    }
}

export const getTableStatus = async (table_number) => {
    try {
        return await API.get(`/cashier/tables/${table_number}/status`);
    } catch (error) {
        throw error

    }
}

// --------------------{Portal Developer Api's}-----------------------------

export const getAllPortalUsers = async () => {
    try {
        return await API.get('/devloper/portal-users');
    } catch (error) {
        throw error;
    }
};

export const getTotalNumberOfPortalUsers = async () => {
    try {
        return await API.get('/devloper/total-number-of-portal-users');
    } catch (error) {
        throw error;
    }

}

export default API;