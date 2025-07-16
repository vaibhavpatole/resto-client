import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { updateUserPassword } from '../../../services/apiService';

const ProfileSection = () => {
    const initialValues = {
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    };

    const validationSchema = Yup.object({
        currentPassword: Yup.string().required('Current password is required'),
        newPassword: Yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
        confirmNewPassword: Yup.string().required('Confirm new password is required').oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
    });

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        // Call API to update password
        console.log(values);
        try {
            await updateUserPassword(values);
            toast.success('Password updated successfully');
            setSubmitting(false);
            resetForm();

        } catch (error) {
            toast.error(error.response.data.message || 'Failed to update password');
            setSubmitting(false);

        }
    };



    return (
        <div className="max-w-md mx-auto p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Update Password</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form className="space-y-4">
                        <div className="flex flex-col">
                            <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <Field
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage name="currentPassword" component="p" className="text-red-600 text-sm mt-1" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <Field
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage name="newPassword" component="p" className="text-red-600 text-sm mt-1" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="confirmNewPassword" className="text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <Field
                                type="password"
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <ErrorMessage name="confirmNewPassword" component="p" className="text-red-600 text-sm mt-1" />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 shadow-md w-full sm:w-auto">
                            Update Password
                        </button>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ProfileSection;