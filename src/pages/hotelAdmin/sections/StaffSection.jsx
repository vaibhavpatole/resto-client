import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
// Assuming these services are correctly implemented and available at this path
import { getAllStaff, addStaff, editStaff, deactivateStaff, reactivateStaff } from '../../../services/apiService';
import toast from 'react-hot-toast';

// Mock API service for demonstration purposes
// In a real application, replace this with your actual API calls.
// const apiService = {
//   getAllStaff: async () => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         resolve({
//           data: [
//             { id: '1', name: 'John Doe', email: 'john.doe@example.com', status: 'Active' },
//             { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', status: 'Inactive' },
//             { id: '3', name: 'Peter Jones', email: 'peter.jones@example.com', status: 'Active' },
//             { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', status: 'Inactive' },
//           ]
//         });
//       }, 500);
//     });
//   },
//   addStaff: async (newStaff) => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         console.log('Adding staff:', newStaff);
//         resolve({ success: true, message: 'Staff added successfully' });
//       }, 500);
//     });
//   },
//   editStaff: async (id, updatedStaff) => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         console.log(`Editing staff ${id}:`, updatedStaff);
//         resolve({ success: true, message: 'Staff updated successfully' });
//       }, 500);
//     });
//   },
//   deactivateStaff: async (id) => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         console.log(`Deactivating staff ${id}`);
//         // Simulate changing status to Inactive
//         resolve({ success: true, message: 'Staff deactivated successfully' });
//       }, 500);
//     });
//   },
//   reactivateStaff: async (id) => {
//     return new Promise(resolve => {
//       setTimeout(() => {
//         console.log(`Reactivating staff ${id}`);
//         // Simulate changing status to Active
//         resolve({ success: true, message: 'Staff reactivated successfully' });
//       }, 500);
//     });
//   }
// };


// Validation schema for staff form using Yup
const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    // Password is required only when adding a new staff member (id is null)
    password: Yup.string().when('id', {
        is: (id) => !id,
        then: (schema) => schema.required('Password is required').min(6, 'Password must be at least 6 characters'),
        otherwise: (schema) => schema.notRequired(), // Password is optional for edits
    }),
    // Confirm password is required only when adding a new staff member
    cpassword: Yup.string().when('id', {
        is: (id) => !id,
        then: (schema) => schema.oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
        otherwise: (schema) => schema.notRequired(),
    }),
});

// Modal component for Add/Edit Staff Form
const StaffFormModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting }) => {
    return (
        // Modal background overlay
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {/* Modal content area */}
            <div className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {initialValues.id ? 'Edit Cashier' : 'Add New Cashier'}
                </h3>
                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize // Important for updating initialValues when editing
                >
                    {({ errors, touched, setFieldValue }) => (
                        <Form className="space-y-4">
                            {/* Name field */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter cashier's name"
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Email field */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <Field
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.email && touched.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter cashier's email"
                                />
                                <ErrorMessage name="email" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Password fields (only for new staff or if explicitly changing) */}
                            {!initialValues.id && ( // Only show password fields if adding new staff
                                <>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <Field
                                            type="password"
                                            id="password"
                                            name="password"
                                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.password && touched.password ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Enter password"
                                        />
                                        <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                    <div>
                                        <label htmlFor="cpassword" className="block text-sm font-medium text-gray-700 mb-1">
                                            Confirm Password
                                        </label>
                                        <Field
                                            type="password"
                                            id="cpassword"
                                            name="cpassword"
                                            className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.cpassword && touched.cpassword ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Confirm password"
                                        />
                                        <ErrorMessage name="cpassword" component="div" className="text-red-500 text-xs mt-1" />
                                    </div>
                                </>
                            )}

                            {/* Action buttons */}
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
                                    {isSubmitting ? 'Saving...' : initialValues.id ? 'Save Changes' : 'Add Cashier'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Confirmation Dialog component
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


const StaffSection = () => {
    const [staff, setStaff] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls the Add/Edit modal
    const [currentStaff, setCurrentStaff] = useState(null); // Staff member being edited
    const [isSubmittingForm, setIsSubmittingForm] = useState(false); // To disable form buttons during submission

    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false); // Controls confirmation dialog
    const [confirmAction, setConfirmAction] = useState({ // Stores info for the confirmation dialog
        id: null,
        type: null, // 'deactivate' or 'reactivate'
        message: '',
        confirmButtonClass: '',
        confirmButtonText: '',
    });

    // Initial values for the Formik form
    const initialFormValues = {
        name: currentStaff ? currentStaff.name : '',
        email: currentStaff ? currentStaff.email : '',
        password: '',
        cpassword: '',
        id: currentStaff ? currentStaff.id : null,
    };

    // Fetch staff data on component mount
    useEffect(() => {
        fetchStaff();
    }, []);

    // Function to fetch all staff members
    const fetchStaff = async () => {
        try {
            const response = await getAllStaff();
            setStaff(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
            // In a real app, you'd show a user-friendly error message
        }
    };

    // Handle form submission for adding or editing staff
    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        setIsSubmittingForm(true); // Disable buttons
        try {
            if (values.id) {
                await editStaff(values.id, values);
                toast.success('Staff updated successfully!');
            } else {
                await addStaff(values);
                toast.success('Staff added successfully!');
            }
            resetForm(); // Clear form fields
            setIsModalOpen(false); // Close the modal
            setCurrentStaff(null); // Reset current staff
            fetchStaff(); // Refresh staff list
        } catch (error) {
            console.error('Error submitting staff form:', error);
            toast.error(error?.response?.data?.message || 'Error submitting staff form. Please try again.')
            // Handle error, e.g., show a toast notification
        } finally {
            setSubmitting(false); // Re-enable Formik's submit button
            setIsSubmittingForm(false); // Re-enable custom buttons
        }
    };

    // Open modal for adding new staff
    const handleAddStaffClick = () => {
        setCurrentStaff(null); // Ensure no existing staff data is pre-filled
        setIsModalOpen(true);
    };

    // Open modal for editing existing staff
    const handleEdit = (staffMember) => {
        setCurrentStaff(staffMember);
        setIsModalOpen(true);
    };

    // Open confirmation dialog for deactivating staff
    const handleDeactivateClick = (staffMemberId) => {
        setConfirmAction({
            id: staffMemberId,
            type: 'deactivate',
            message: 'Are you sure you want to deactivate this staff member? Their access will be revoked.',
            confirmButtonClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            confirmButtonText: 'Deactivate',
        });
        setIsConfirmDialogOpen(true);
    };

    // Open confirmation dialog for reactivating staff
    const handleReactivateClick = (staffMemberId) => {
        setConfirmAction({
            id: staffMemberId,
            type: 'reactivate',
            message: 'Are you sure you want to reactivate this staff member? Their access will be restored.',
            confirmButtonClass: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
            confirmButtonText: 'Reactivate',
        });
        setIsConfirmDialogOpen(true);
    };

    // Handle the confirmed action (deactivate or reactivate)
    const handleConfirmAction = async () => {
        try {
            if (confirmAction.type === 'deactivate') {
                await deactivateStaff(confirmAction.id);
                toast.success('Staff deactivated successfully!');
            } else if (confirmAction.type === 'reactivate') {
                await reactivateStaff(confirmAction.id);
                toast.success('Staff reactivated successfully!');
            }
            fetchStaff(); // Refresh staff list after action
        } catch (error) {
            console.error(`Error ${confirmAction.type} staff:`, error);
            toast.error(error?.response?.data?.message || 'Error performing action. Please try again.');
            // Handle error, e.g., show a toast notification
        } finally {
            setIsConfirmDialogOpen(false); // Close confirmation dialog
            setConfirmAction({ id: null, type: null, message: '', confirmButtonClass: '', confirmButtonText: '' }); // Reset action
        }
    };
    // console.log(staff)

    return (
        <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)]"> {/* Added min-h for better layout */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Manage Hotel Staff (Cashiers)</h2>

            {/* Button to add new cashier */}
            <button
                className="mb-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={handleAddStaffClick}
            >
                Add New Cashier
            </button>

            {/* Staff List Table */}
            <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {staff.length > 0 ? (
                            staff.map((staffMember) => (
                                <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {staffMember.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {staffMember.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${staffMember.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                            {staffMember.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 mr-4 font-medium"
                                            onClick={() => handleEdit(staffMember)}
                                        >
                                            Edit
                                        </button>
                                        {staffMember.status === 'active' ? (
                                            <button
                                                className="text-red-600 hover:text-red-900 font-medium"
                                                onClick={() => handleDeactivateClick(staffMember.id)}
                                            >
                                                Deactivate
                                            </button>
                                        ) : (
                                            <button
                                                className="text-green-600 hover:text-green-900 font-medium"
                                                onClick={() => handleReactivateClick(staffMember.id)}
                                            >
                                                Reactivate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-4 text-center text-gray-500 text-sm">
                                    No staff members found. Add a new cashier to get started!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Staff Modal */}
            <StaffFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialValues={initialFormValues}
                onSubmit={handleSubmit}
                isSubmitting={isSubmittingForm}
            />

            {/* Confirmation Dialog for Deactivation/Reactivation */}
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

export default StaffSection;
