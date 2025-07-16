import React, { useState, useEffect } from 'react'; // Import useEffect
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../redux/slices/authSlice';
// Mock registerPortalUser for demonstration purposes,
// as the path to '../../services/authService' cannot be resolved in this environment.
// In your actual development environment, you should use your imported service:
import { registerPortalUser, getTotalNumberOfPortalUsers, getAllPortalUsers } from '../../services/apiService';


// Mock API calls for dashboard data
const fetchDashboardData = async () => {
    return new Promise(resolve => {
        setTimeout(async () => {
            // console.log((await getAllPortalUsers()).data?.filter(u => u.status === 'active'));
            // console.log((await getTotalNumberOfPortalUsers()).data)
            const allUsers = (await getAllPortalUsers()).data;
            const systemUsageLogs = allUsers.map((user, index) => {
                const timestamp = new Date(user.createdAt).toLocaleString();
                return {
                    id: `HOTEL-${user.id}`, // Unique ID for log
                    description: `New Hotel '${user.hotel_name}' registered by ${user.owner_name}.`,
                    timestamp: timestamp,
                };
            });
            resolve({
                totalHotels: (await getTotalNumberOfPortalUsers()).data,
                activeSubscriptions: (await getAllPortalUsers()).data?.filter(u => u.status === 'active').length,
                expiredContracts: 15,
                subscriptionPlans: [
                    { name: 'Basic Tier', price: '$99/month', features: 'Core functionalities, basic support', limit: 'Up to 5' },
                    { name: 'Standard Plus', price: '$199/month', features: 'All core features, priority support', limit: 'Up to 20' },
                    { name: 'Enterprise Pro', price: '$399/month', features: 'Advanced analytics, dedicated account manager', limit: 'Unlimited' },
                ],
                systemUsageLogs: systemUsageLogs
            });
        }, 800);
    });
};


// Enhanced CreateHotelPage component
const CreateHotelPage = ({ onClose }) => {
    const validationSchema = Yup.object({
        hotel_name: Yup.string()
            .min(3, 'Hotel name must be at least 3 characters')
            .max(100, 'Hotel name cannot exceed 100 characters')
            .required('Hotel name is required'),
        owner_name: Yup.string()
            .min(3, 'Owner name must be at least 3 characters')
            .max(100, 'Owner name cannot exceed 100 characters')
            .required('Owner name is required'),
        state: Yup.string()
            .min(2, 'State name must be at least 2 characters')
            .max(50, 'State name cannot exceed 50 characters')
            .required('State is required'),
        email: Yup.string()
            .email('Invalid email address')
            .required('Contact Email is required'),
        mobile: Yup.string()
            .matches(/^\d{10}$/, 'Phone must be exactly 10 digits (e.g., 9876543210)') // Indian phone number format
            .required('Contact Phone is required'),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .required('Password is required'),
        confirm_password: Yup.string() // New confirm password field validation
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password is required'),
        subscription_plan: Yup.string()
            .oneOf(['basic', 'standard', 'premium'], 'Invalid subscription plan selected')
            .required('Subscription plan is required'),
    });

    const formik = useFormik({
        initialValues: {
            hotel_name: '',
            owner_name: '',
            state: '',
            email: '',
            mobile: '',
            password: '',
            confirm_password: '', // New confirm password field
            subscription_plan: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            try {
                const response = await registerPortalUser(values); // Call the actual service function
                console.log(response);

                toast.success(response.data.message || 'Hotel registered successfully!');
                resetForm();
                onClose(); // Close the modal on successful submission
            } catch (error) {
                console.error("Failed to register hotel:", error);
                // Handle cases where error.response might not exist (e.g., network error)
                const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create hotel. Please try again.';
                toast.error(errorMessage); // Display error to user using toast
            } finally {
                setSubmitting(false);
            }
        },
    });

    const planOptions = [
        {
            value: 'basic',
            title: 'Basic Tier',
            description: 'Essential tools to kickstart your operations.',
            bg: 'bg-blue-50 dark:bg-blue-900/20', // Lighter background for unselected, with dark mode
            text: 'text-blue-700 dark:text-blue-300',
        },
        {
            value: 'standard',
            title: 'Standard Plus',
            description: 'Advanced features for scalable growth and management.',
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-700 dark:text-green-300',
        },
        {
            value: 'premium',
            title: 'Enterprise Pro',
            description: 'Full suite with AI analytics and dedicated support.',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            text: 'text-purple-700 dark:text-purple-300',
        },
    ];

    const inputFields = [
        { id: 'hotel_name', type: 'text', label: 'Hotel Name', placeholder: 'e.g., The Leela Palace' },
        { id: 'owner_name', type: 'text', label: 'Owner Name', placeholder: 'e.g., Rajesh Kumar' },
        { id: 'state', type: 'text', label: 'State', placeholder: 'e.g., Maharashtra' },
        { id: 'email', type: 'email', label: 'Contact Email', placeholder: 'e.g., info@hotelx.com' },
        { id: 'mobile', type: 'tel', label: 'Contact Phone', placeholder: 'e.g., 9876543210' },
        { id: 'password', type: 'password', label: 'Password', placeholder: '••••••••' },
        { id: 'confirm_password', type: 'password', label: 'Confirm Password', placeholder: '••••••••' }, // Added confirm password field
    ];

    return (
        // Reduced padding and removed animation classes
        <div className="relative z-10 bg-white dark:bg-gray-800 shadow-2xl p-6 md:p-8 rounded-3xl w-full max-w-lg md:max-w-xl lg:max-w-2xl border border-gray-100 dark:border-gray-700">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Close"
            >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-gray-900 dark:text-white bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
                Register New Hotel
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
                Fill in the details to onboard a new property.
            </p>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
                {/* Mapping through input fields to render them dynamically */}
                {inputFields.map(field => (
                    <div key={field.id} className={field.id === 'hotel_name' || field.id === 'owner_name' || field.id === 'state' ? 'md:col-span-2' : ''}>
                        <label htmlFor={field.id} className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">
                            {field.label}
                        </label>
                        <input
                            id={field.id}
                            name={field.id}
                            type={field.type}
                            value={formik.values[field.id]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            placeholder={field.placeholder}
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ease-in-out placeholder-gray-400 dark:placeholder-gray-500
                dark:bg-gray-700 dark:text-white dark:border-gray-600
                ${formik.touched[field.id] && formik.errors[field.id] ? 'border-red-500 ring-red-500' : 'border-gray-300 hover:border-indigo-400'}
              `}
                            aria-describedby={`${field.id}-error`}
                        />
                        {/* Display validation error message */}
                        {formik.touched[field.id] && formik.errors[field.id] ? (
                            <div id={`${field.id}-error`} className="text-red-500 text-xs mt-1 flex items-center">
                                <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                {formik.errors[field.id]}
                            </div>
                        ) : null}
                    </div>
                ))}

                {/* Subscription Plan Options */}
                <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-1">
                        Choose a Subscription Plan
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {planOptions.map(plan => (
                            <label
                                key={plan.value}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-300 ease-in-out shadow-sm
                  ${formik.values.subscription_plan === plan.value
                                        ? 'border-indigo-600 bg-indigo-500 text-white shadow-lg transform scale-105'
                                        : `border-gray-300 ${plan.bg} ${plan.text} dark:border-gray-600`
                                    }
                `}
                            >
                                <input
                                    type="radio"
                                    name="subscription_plan"
                                    value={plan.value}
                                    checked={formik.values.subscription_plan === plan.value}
                                    onChange={formik.handleChange}
                                    className="hidden" // Hide the default radio button
                                />
                                <h4 className="text-lg font-bold mb-1">{plan.title}</h4>
                                <p className={`text-center text-xs ${formik.values.subscription_plan === plan.value ? 'text-white opacity-90' : 'text-gray-600 dark:text-gray-300'}`}>{plan.description}</p>
                            </label>
                        ))}
                    </div>
                    {/* Display validation error for subscription plan */}
                    {formik.touched.subscription_plan && formik.errors.subscription_plan ? (
                        <div id="subscription_plan-error" className="text-red-500 text-xs mt-1 flex items-center justify-center text-center">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                            {formik.errors.subscription_plan}
                        </div>
                    ) : null}
                </div>

                {/* Submit Button */}
                <div className="md:col-span-2 flex justify-center mt-5">
                    <button
                        type="submit"
                        className="inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-green-600 text-white font-extrabold py-2.5 px-6 rounded-lg shadow-md hover:from-teal-600 hover:to-green-700 transition duration-300 ease-in-out transform hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 text-base"
                        disabled={formik.isSubmitting} // Disable button while submitting
                    >
                        {formik.isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Hotel...
                            </span>
                        ) : (
                            <>
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Create Hotel
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};


// DeveloperDashboard component
const DeveloperDashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState(null); // State to hold dashboard data

    // Fetch dashboard data on component mount
    useEffect(() => {
        const getData = async () => {
            try {
                const data = await fetchDashboardData();
                setDashboardData(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
                toast.error("Failed to load dashboard data.");
            }
        };
        getData();
    }, []); // Empty dependency array means this runs once on mount

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const dispatch = useDispatch();

    const handlelogoutUser = async () => {
        try {
            await dispatch(logoutUser()).unwrap();
            // Optionally, redirect to login page or home page
            // window.location.href = '/login';
        } catch (err) {
            console.error('logoutUser failed:', err);
        }
    };

    if (!dashboardData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
                <div className="flex flex-col items-center text-gray-700 dark:text-gray-300">
                    <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg">Loading dashboard data...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">

            {/* Removed Tailwind CSS CDN and Font Link scripts as per your configuration */}
            <style>
                {/* Removed all animation keyframes as per your request */}
                {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
            </style>

            {/* logoutUser Button */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={handlelogoutUser}
                    className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 text-base"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3h5a3 3 0 013 3v1"></path></svg>
                    logout
                </button>
            </div>

            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-8 text-center bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                Developer Overview
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-10 text-md lg:text-lg">
                Comprehensive insights into your SaaS operations.
            </p>

            {/* Overview Cards - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
                    <p className="text-md opacity-90 mb-2">Total Hotels</p>
                    <p className="text-5xl font-extrabold">{dashboardData.totalHotels}</p> {/* Dynamic data */}
                    <span className="text-sm opacity-80 mt-2">All registered properties</span>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
                    <p className="text-md opacity-90 mb-2">Active Subscriptions</p>
                    <p className="text-5xl font-extrabold">{dashboardData.activeSubscriptions}</p> {/* Dynamic data */}
                    <span className="text-sm opacity-80 mt-2">Currently operational</span>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-pink-600 text-white p-6 rounded-xl shadow-lg flex flex-col justify-between transform hover:scale-105 transition-transform duration-300">
                    <p className="text-md opacity-90 mb-2">Expired Contracts</p>
                    <p className="text-5xl font-extrabold">{dashboardData.expiredContracts}</p> {/* Dynamic data */}
                    <span className="text-sm opacity-80 mt-2">Awaiting renewal</span>
                </div>
            </div>

            {/* Subscription Plans - Enhanced Table */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-600 pb-3">Subscription Plans</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                    <table className="min-w-full bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-900">
                            <tr className="text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Plan Name</th>
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Price</th>
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Features</th>
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Hotels Limit</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-200 text-sm font-light divide-y divide-gray-100 dark:divide-gray-700">
                            {dashboardData.subscriptionPlans.map((plan, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                                    <td className="py-4 px-6 whitespace-nowrap font-medium">{plan.name}</td>
                                    <td className="py-4 px-6 whitespace-nowrap">{plan.price}</td>
                                    <td className="py-4 px-6">{plan.features}</td>
                                    <td className="py-4 px-6">{plan.limit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* API Suggestion: Fetch subscription plans from backend */}
                {/*
          // Example API Endpoint: GET /api/admin/subscription-plans
          // Response: [{ name: 'Basic Tier', price: '$99/month', features: '...', limit: '...' }]
        */}
            </div>

            {/* System Usage Logs - Enhanced Table */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-2xl shadow-lg mb-12">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-600 pb-3">System Usage Logs</h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-600">
                    <table className="min-w-full bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-100 dark:bg-gray-900">
                            <tr className="text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal">
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Log ID</th>
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Event Description</th>
                                <th className="py-4 px-6 text-left font-bold tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-200 text-sm font-light divide-y divide-gray-100 dark:divide-gray-700">
                            {dashboardData.systemUsageLogs.map((log, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                                    <td className="py-4 px-6 whitespace-nowrap font-medium">{log.id}</td>
                                    <td className="py-4 px-6">{log.description}</td>
                                    <td className="py-4 px-6 whitespace-nowrap">{log.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* API Suggestion: Fetch system usage logs from backend */}
                {/*
          // Example API Endpoint: GET /api/admin/usage-logs
          // Response: [{ id: 'LOG-001', description: '...', timestamp: '...' }]
        */}
            </div>

            {/* Create Hotel Button - Now opens modal */}
            <div className="flex justify-center">
                <button
                    onClick={openModal}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-extrabold py-3 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-800 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 text-lg"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Create New Hotel
                </button>
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70 px-4 py-8 overflow-y-auto">
                    <div className="relative w-full max-w-2xl mx-auto">
                        <CreateHotelPage onClose={closeModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperDashboard;
