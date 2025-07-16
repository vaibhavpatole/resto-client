import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { toast } from 'react-hot-toast';

const Login = () => {
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            role: '',
        },
        validationSchema: Yup.object({
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().min(6, 'Min 6 chars').required('Required'),
            role: Yup.string().oneOf(['developer', 'hotel_admin', 'cashier'], 'Invalid role').required('Required'),
        }),
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const user = await dispatch(loginUser(values)).unwrap();
                console.log(user);

                toast.success(`Welcome, ${user.name}!`);
            } catch (error) {
                toast.error(error);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-200 flex items-center justify-center dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 px-4 py-8 font-inter overflow-hidden relative">

            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob dark:bg-purple-600"></div>
            <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000 dark:bg-pink-600"></div>
            <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000 dark:bg-blue-600"></div>

            <style>
                {`
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
                `}
            </style>

            <div className="relative z-10 bg-white dark:bg-gray-800 shadow-2xl p-10 rounded-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300 animate-fade-in-up">
                <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-900 dark:text-white bg-clip-text bg-gradient-to-r from-purple-700 to-indigo-700">
                    Unlock Your Access
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">Sign in to continue to your dashboard</p>

                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.email}
                            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="your.email@example.com"
                        />
                        {formik.touched.email && formik.errors.email && (
                            <p className="text-sm text-red-500 mt-1">{formik.errors.email}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">Password</label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            className="w-full px-5 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            placeholder="••••••••"
                        />
                        {formik.touched.password && formik.errors.password && (
                            <p className="text-sm text-red-500 mt-1">{formik.errors.password}</p>
                        )}
                    </div>

                    <div className="mb-8">
                        <label className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2">Select Your Role</label>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['developer', 'hotel_admin', 'cashier'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => formik.setFieldValue('role', role)}
                                    className={`min-w-[100px] py-2 px-4 rounded-lg font-semibold text-sm transition-transform hover:scale-105 ${formik.values.role === role ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-200'}`}
                                >
                                    {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                            ))}
                        </div>
                        {formik.touched.role && formik.errors.role && (
                            <p className="text-sm text-red-500 mt-1 text-center">{formik.errors.role}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-transform transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {formik.isSubmitting ? 'Logging In...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;