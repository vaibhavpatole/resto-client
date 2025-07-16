// Modal.js
// Reusable Modal Component
import React from 'react';
import { X } from 'lucide-react';

// Added customModalClass to the props
const Modal = ({ show, title, children, onClose, onConfirm, confirmText = 'Confirm', showConfirm = true, customModalClass = '' }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0  bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            {/* LINE 8: The change is here. Dynamically combine default classes with customModalClass */}
            <div className={`bg-white  rounded-lg  shadow-lg p-6 max-w-xl w-full ${customModalClass}`}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="mb-6 text-gray-700">
                    {children}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-md text-gray-700 border border-gray-300 hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    {showConfirm && (
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Modal;