import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { getAllTables, addTable, editTable, updateTableAvailabilityStatus, deleteTable } from '../../../services/apiService';


// Validation schema for table form using Yup
const validationSchema = Yup.object({
    table_number: Yup.string().required('Table Number is required'),
    capacity: Yup.number()
        .required('Capacity is required')
        .min(1, 'Capacity must be at least 1')
        .integer('Capacity must be an integer'),
});

// Modal component for Add/Edit Table Form
const TableFormModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting }) => {
    return (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {initialValues.id ? 'Edit Table' : 'Add New Table'}
                </h3>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="table_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Table Number
                                </label>
                                <Field
                                    type="text"
                                    id="table_number"
                                    name="table_number"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.table_number && touched.table_number ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., T1, Table 5"
                                />
                                <ErrorMessage name="table_number" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div>
                                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacity
                                </label>
                                <Field
                                    type="number"
                                    id="capacity"
                                    name="capacity"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.capacity && touched.capacity ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., 4"
                                />
                                <ErrorMessage name="capacity" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-5 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Saving...' : initialValues.id ? 'Save Changes' : 'Add Table'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Confirmation Dialog component (reused from StaffSection, but included for self-containment)
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, message, confirmButtonClass, confirmButtonText }) => {
    return (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white p-8 rounded-lg shadow-xl max-w-sm w-full transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Action</h3>
                <p className="text-gray-700 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`px-5 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out ${confirmButtonClass}`}
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};


const TablesSection = () => {
    const [tables, setTables] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls the Add/Edit modal
    const [currentTable, setCurrentTable] = useState(null); // Table being edited
    const [isSubmittingForm, setIsSubmittingForm] = useState(false); // To disable form buttons during submission

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Controls confirmation dialog
    const [confirmAction, setConfirmAction] = useState({ // Stores info for the confirmation dialog
        id: null,
        type: null, // 'status_toggle' or 'delete'
        message: '',
        confirmButtonClass: '',
        confirmButtonText: '',
    });

    // Initial values for the Formik form
    const initialFormValues = {
        table_number: currentTable ? currentTable.table_number : '',
        capacity: currentTable ? currentTable.capacity : '',
        id: currentTable ? currentTable.id : null,
    };

    // Fetch tables data on component mount
    useEffect(() => {
        fetchTables();
    }, []);

    // Function to fetch all tables
    const fetchTables = async () => {
        try {
            const response = await getAllTables();
            setTables(response.data);
        } catch (error) {
            console.error('Error fetching tables:', error);
            // In a real app, you'd show a user-friendly error message
        }
    };

    // Handle form submission for adding or editing tables

    const handleSubmitTableForm = async (values, { setSubmitting, resetForm }) => {
        setIsSubmittingForm(true);
        try {
            if (values.id) {
                // Edit existing table
                const response = await editTable(values.id, {
                    table_number: values.table_number,
                    capacity: values.capacity
                });
                setTables(tables.map((table) => (table.id === values.id ? response.data : table)));
                toast.success('Table updated successfully!');
            } else {
                // Add new table
                const response = await addTable({
                    table_number: values.table_number,
                    capacity: values.capacity
                });
                setTables([...tables, response.data]);
                toast.success('Table added successfully!');

            }
            resetForm();
            setIsModalOpen(false);
            setCurrentTable(null);
        } catch (error) {
            console.log('Error submitting table form:', error);
            toast.error(error?.response?.data?.message || 'Error submitting table form. Please try again.');
        } finally {
            setSubmitting(false);
            setIsSubmittingForm(false);
        }
    };

    // Open modal for adding new table
    const handleAddTableClick = () => {
        setCurrentTable(null); // Clear any previous edit data
        setIsModalOpen(true);
    };

    // Open modal for editing existing table
    const handleEditTableClick = (table) => {
        setCurrentTable(table);
        setIsModalOpen(true);
    };

    // Open confirmation dialog for updating table status
    const handleUpdateStatusClick = (tableId, currentStatus) => {
        const newStatus = currentStatus === 'available' ? 'disabled' : 'available'; // Simplified toggle
        setConfirmAction({
            id: tableId,
            type: 'status_toggle',
            message: `Are you sure you want to change the status of table ${tableId} to '${newStatus}'?`,
            confirmButtonClass: newStatus === 'available' ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
            confirmButtonText: newStatus === 'available' ? 'Enable' : 'Disable',
        });
        setIsConfirmDialogOpen(true);
    };

    // Open confirmation dialog for deleting a table
    const handleDeleteClick = (tableId) => {
        setConfirmAction({
            id: tableId,
            type: 'delete',
            message: `Are you sure you want to delete table ${tableId}? This action cannot be undone.`,
            confirmButtonClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            confirmButtonText: 'Delete',
        });
        setIsConfirmDialogOpen(true);
    };

    // Handle the confirmed action (status toggle or delete)
    const handleConfirmAction = async () => {
        try {
            if (confirmAction.type === 'status_toggle') {
                const tableToUpdate = tables.find(t => t.id === confirmAction.id);
                const newStatus = tableToUpdate.status === 'available' ? 'disabled' : 'available';
                const response = await updateTableAvailabilityStatus(confirmAction.id, { status: newStatus });
                setTables(tables.map(table => (table.id === confirmAction.id ? { ...table, status: response.data.status } : table)));
                toast.success(`Table status updated to ${newStatus}!`);
            } else if (confirmAction.type === 'delete') {
                await deleteTable(confirmAction.id);
                setTables(tables.filter(table => table.id !== confirmAction.id));
                toast.success('Table deleted successfully!');
            }
        } catch (error) {
            console.error(`Error performing ${confirmAction.type} action:`, error);
            toast.error(error?.response?.data?.message || 'Error performing action. Please try again.');
        } finally {
            setIsConfirmDialogOpen(false);
            setConfirmAction({ id: null, type: null, message: '', confirmButtonClass: '', confirmButtonText: '' });
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Tables</h2>

            {/* Button to add new table */}
            <button
                className="mb-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleAddTableClick}
            >
                Add New Table
            </button>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tables.length > 0 ? (
                    tables.map((table) => (
                        <div
                            key={table.id}
                            className={`relative bg-white p-6 rounded-xl shadow-lg border-t-4
                ${table.status === 'available' ? 'border-green-500' :
                                    table.status === 'occupied' ? 'border-yellow-500' :
                                        'border-gray-400'}
                hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xl font-bold text-gray-900">{table.table_number}</h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${table.status === 'available' ? 'bg-green-100 text-green-800' :
                                        table.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">Capacity: <span className="font-semibold">{table.capacity}</span></p>

                            <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition duration-200 text-sm"
                                    onClick={() => handleEditTableClick(table)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`flex-1 px-4 py-2 rounded-md font-medium text-sm
                    ${table.status === 'available' ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                    onClick={() => handleUpdateStatusClick(table.id, table.status)}
                                >
                                    {table.status === 'available' ? 'Disable' : 'Enable'}
                                </button>
                                <button
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition duration-200 text-sm"
                                    onClick={() => handleDeleteClick(table.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-gray-500 text-lg">
                        No tables found. Click "Add New Table" to get started!
                    </div>
                )}
            </div>

            {/* Add/Edit Table Modal */}
            <TableFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialValues={initialFormValues}
                onSubmit={handleSubmitTableForm}
                isSubmitting={isSubmittingForm}
            />

            {/* Confirmation Dialog for Status Change/Deletion */}
            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleConfirmAction}
                message={confirmAction.message}
                confirmButtonClass={confirmAction.confirmButtonClass}
                confirmButtonText={confirmAction.confirmButtonText}
            />
        </div>
    );
};

export default TablesSection;
