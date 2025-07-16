import React, { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'; // Import FieldArray
import * as Yup from 'yup';
// import toast from 'react-hot-toast';
import { X, Image as ImageIcon, CheckCircle, CircleDot, PlusCircle, MinusCircle } from 'lucide-react'; // Added Lucide React icons

import { toast } from 'react-hot-toast';
import { getAllMenus, addMenu, editMenu, updateMenuStatus, deleteMenu, getAllCategories, addCategory, editCategory, deleteCategory } from '../../../services/apiService';
import { debounce } from 'lodash';




// Mock API service for demonstration purposes
// In a real application, replace this with your actual API calls.
const apiService = {
    // Menu Item APIs
    getAllMenus: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    data: [
                        { id: 'M1', category: 'Starters', item_name: 'Spring Rolls', portions: [{ type: 'Full', price: 8.99 }], image: 'https://placehold.co/60x60/E0E0E0/333333?text=SR', isAvailable: true, tags: 'Vegetarian, Fried' },
                        { id: 'M2', category: 'Main Course', item_name: 'Butter Chicken', portions: [{ type: 'Full', price: 15.50 }, { type: 'Half', price: 10.00 }], image: 'https://placehold.co/60x60/E0E0E0/333333?text=BC', isAvailable: true, tags: 'Chicken, Creamy' },
                        { id: 'M3', category: 'Drinks', item_name: 'Coca-Cola', portions: [{ type: 'Regular', price: 2.00 }], image: 'https://placehold.co/60x60/E0E0E0/333333?text=CC', isAvailable: false, tags: 'Beverage' },
                        { id: 'M4', category: 'Starters', item_name: 'Garlic Bread', portions: [{ type: 'Full', price: 6.00 }], image: 'https://placehold.co/60x60/E0E0E0/333333?text=GB', isAvailable: true, tags: 'Bread, Garlic' },
                        { id: 'M5', category: 'Desserts', item_name: 'Chocolate Lava Cake', portions: [{ type: 'Full', price: 9.50 }], image: 'https://placehold.co/60x60/E0E0E0/333333?text=CLC', isAvailable: true, tags: 'Dessert, Chocolate' },
                    ]
                });
            }, 500);
        });
    },
    addMenu: async (newItem) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Adding menu item:', newItem);
                resolve({ success: true, data: { ...newItem, id: `M${Math.floor(Math.random() * 1000)}`, isAvailable: true } });
            }, 500);
        });
    },
    editMenu: async (id, updatedItem) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Editing menu item ${id}:`, updatedItem);
                resolve({ success: true, data: { ...updatedItem, id: id } });
            }, 500);
        });
    },
    updateMenuStatus: async (id, newStatus) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Updating status for menu item ${id} to ${newStatus.isAvailable ? 'available' : 'unavailable'}`);
                resolve({ success: true, data: { id: id, isAvailable: newStatus.isAvailable } });
            }, 500);
        });
    },
    deleteMenu: async (id) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Deleting menu item ${id}`);
                resolve({ success: true, message: 'Menu item deleted successfully' });
            }, 500);
        });
    },

    // Category APIs (Mocked)
    getAllCategories: async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    data: [
                        { id: 'C1', name: 'Starters' },
                        { id: 'C2', name: 'Main Course' },
                        { id: 'C3', name: 'Drinks' },
                        { id: 'C4', name: 'Desserts' },
                    ]
                });
            }, 500);
        });
    },
    addCategory: async (newCategory) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log('Adding category:', newCategory);
                resolve({ success: true, data: { ...newCategory, id: `C${Math.floor(Math.random() * 1000)}` } });
            }, 500);
        });
    },
    editCategory: async (id, updatedCategory) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Editing category ${id}:`, updatedCategory);
                resolve({ success: true, data: { ...updatedCategory, id: id } });
            }, 500);
        });
    },
    deleteCategory: async (id) => {
        return new Promise(resolve => {
            setTimeout(() => {
                console.log(`Deleting category ${id}`);
                resolve({ success: true, message: 'Category deleted successfully' });
            }, 500);
        });
    }
};

// Validation schema for Menu Item Form
const menuItemValidationSchema = Yup.object({
    item_name: Yup.string()
        .trim()
        .min(2, 'Item name must be at least 2 characters')
        .max(50, 'Item name cannot exceed 50 characters')
        .required('Item Name is required'),
    category: Yup.string().required('Category is required'),
    // Validation for dynamic portions
    portions: Yup.array()
        .of(
            Yup.object().shape({
                type: Yup.string().required('Portion type is required'),
                price: Yup.number()
                    .min(0, 'Price cannot be negative')
                    .required('Price is required')
                    .typeError('Price must be a number'),
            })
        )
        .min(1, 'At least one portion (e.g., Full) and its price are required.')
        .required('Portions are required'),
    image: Yup.string()
        .url('Invalid URL format')
        .max(2000, 'Image URL is too long')
        .matches(/\.(jpeg|jpg|gif|png|webp)$/, { message: 'Image URL must end with .jpeg, .jpg, .gif, .png, or .webp', excludeEmptyString: true })
        .nullable(),
    isAvailable: Yup.boolean().required('Availability is required'),
    tags: Yup.string().nullable(), // New field for tags
});

//doller sign please give me 


// Validation schema for Category Form
const categoryValidationSchema = Yup.object({
    name: Yup.string().required('Category Name is required'),
});

// Custom Toggle Switch Component
const ToggleSwitch = ({ field, form, ...props }) => {
    const { name, value } = field;
    const { setFieldValue } = form;

    const handleToggle = () => {
        setFieldValue(name, !value);
    };

    return (
        <div
            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
            onClick={handleToggle}
            {...props}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
            <input type="checkbox" className="sr-only" {...field} checked={value} readOnly />
        </div>
    );
};


// Modal component for Add/Edit Menu Item Form
const MenuItemFormModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting, categories }) => {
    const isEditMode = !!initialValues.id;
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');

    useEffect(() => {
        setImagePreviewUrl(initialValues.image);
    }, [initialValues.image]);

    if (!isOpen) return null;


    //use only femus 20
    const portionTypes = ['Full', 'Half', 'Single Serve', 'Single Piece', 'Full Bread', 'Quarter', 'Small', 'Medium', 'Large', 'Regular', 'Plate', 'Glass', 'Bowl', 'Combo', 'Family', 'Single', 'Dozen', 'Piece', 'Scoop', 'Slice', 'Cup', 'Bottle', 'Can', 'Mug', 'Jug', 'Pint', 'Liter', 'Gallon', 'Mini', 'Jumbo', 'Kids', 'Adult', 'Set', 'Thali', 'Platter', 'Bucket', 'Basket', 'Tray', 'Box', 'Pack', 'Bundle', 'Pair', 'Grilled', 'Roasted', 'Fried', 'Baked', 'Steamed', 'Each', 'Per Person', 'Per Serving', 'Per Portion', '1 pc', '2 pc', '3 pc', '4pc'];

    // const portionTypes = ['Full', 'Half', 'Quarter', 'Small', 'Medium', 'Large', 'Regular', 'Plate', 'Glass', 'Bowl', 'Combo', 'Family', 'Single', 'Dozen', 'Piece', 'Scoop', 'Slice', 'Cup', 'Bottle', 'Can', 'Mug', 'Jug', 'Pint', 'Liter', 'Gallon', 'Small Plate', 'Large Plate', 'Half Plate', 'Full Plate', 'Mini', 'Jumbo', 'Kids', 'Adult', 'Set', 'Thali', 'Platter', 'Bucket', 'Basket', 'Tray', 'Box', 'Pack', 'Bundle', 'Dozen', 'Pair', 'Each', 'Per Person', 'Per Gram', 'Per Kilo', 'Per Pound', 'Per Ounce', 'Per Dozen', 'Per Piece', 'Per Serving', 'Per Portion', 'Per Bottle', 'Per Can', 'Per Glass', 'Per Cup', 'Per Mug', 'Per Jug', 'Per Pint', 'Per Liter', 'Per Gallon', 'Per Slice', 'Per Scoop', 'Per Bowl', 'Per Plate', 'Per Dish', 'Per Item', 'Per Order', 'Per Day', 'Per Week', 'Per Month', 'Per Year', 'Per Hour', 'Per Minute', 'Per Second', 'Per Unit', 'Per Meter', 'Per Centimeter', 'Per Millimeter', 'Per Kilometer', 'Per Mile', 'Per Yard', 'Per Foot', 'Per Inch', 'Per Square Meter', 'Per Square Foot', 'Per Cubic Meter', 'Per Cubic Foot', 'Per Acre', 'Per Hectare', 'Per Gallon', 'Per Liter', 'Per Milliliter', 'Per Centiliter', 'Per Deciliter', 'Per Kiloliter', 'Per Megaliter', 'Per Gigaliter', 'Per Terabyte', 'Per Gigabyte', 'Per Megabyte', 'Per Kilobyte', 'Per Byte', 'Per Bit', 'Per Second', 'Per Minute', 'Per Hour', 'Per Day', 'Per Week', 'Per Month', 'Per Year', 'Per Decade', 'Per Century', 'Per Millennium', 'Per Unit', 'Per Item', 'Per Piece', 'Per Dozen', 'Per Pack', 'Per Box', 'Per Carton', 'Per Crate', 'Per Bag', 'Per Roll', 'Per Sheet', 'Per Ream', 'Per Bundle', 'Per Set', 'Per Pair', 'Per Couple', 'Per Group', 'Per Team', 'Per Class', 'Per Section'];

    return (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white p-8 rounded-lg shadow-xl max-w-md w-full transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {initialValues.id ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
                <Formik
                    initialValues={initialValues}
                    validationSchema={menuItemValidationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ errors, touched, values, setFieldValue }) => (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Item Name <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    type="text"
                                    id="item_name"
                                    name="item_name"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.item_name && touched.item_name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Chicken Tikka Masala"
                                />
                                <ErrorMessage name="item_name" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <Field
                                    as="select"
                                    id="category"
                                    name="category"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.category && touched.category ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Select a Category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </Field>
                                <ErrorMessage name="category" component="div" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Dynamic Portions and Prices */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Portions & Prices <span className="text-red-500">*</span>
                                </label>
                                <FieldArray name="portions">
                                    {({ push, remove }) => (
                                        <div>
                                            {values.portions.map((portion, index) => (
                                                <div key={index} className="flex items-center space-x-3 mb-3">
                                                    <div className="flex-1">
                                                        <label htmlFor={`portions.${index}.type`} className="sr-only">Portion Type</label>
                                                        <Field
                                                            as="select"
                                                            id={`portions.${index}.type`}
                                                            name={`portions.${index}.type`}
                                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.portions?.[index]?.type && touched.portions?.[index]?.type ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                        >
                                                            <option value="">Select Type</option>
                                                            {portionTypes.map(type => (
                                                                <option key={type} value={type}>{type}</option>
                                                            ))}
                                                        </Field>
                                                        <ErrorMessage name={`portions.${index}.type`} component="p" className="mt-1 text-xs text-red-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label htmlFor={`portions.${index}.price`} className="sr-only">Price</label>
                                                        <Field
                                                            type="number"
                                                            id={`portions.${index}.price`}
                                                            name={`portions.${index}.price`}
                                                            step="0.01"
                                                            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.portions?.[index]?.price && touched.portions?.[index]?.price ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                            placeholder="Price"
                                                        />
                                                        <ErrorMessage name={`portions.${index}.price`} component="p" className="mt-1 text-xs text-red-600" />
                                                    </div>
                                                    {values.portions.length > 1 && ( // Allow removing if more than one portion
                                                        <button
                                                            type="button"
                                                            onClick={() => remove(index)}
                                                            className="p-2 text-red-500 hover:text-red-700 transition duration-200 rounded-full"
                                                            aria-label="Remove portion"
                                                        >
                                                            <MinusCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => push({ type: '', price: 0 })}
                                                className="flex items-center text-blue-600 hover:text-blue-800 transition duration-200 mt-2 text-sm font-medium"
                                            >
                                                <PlusCircle className="w-4 h-4 mr-1" /> Add Another Portion
                                            </button>
                                            {errors.portions && touched.portions && typeof errors.portions === 'string' && (
                                                <p className="mt-1 text-sm text-red-600">{errors.portions}</p>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>
                            </div>

                            {/* Image URL & Preview */}
                            <div>
                                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL (Optional)
                                </label>
                                <Field
                                    type="text"
                                    id="image"
                                    name="image"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.image && touched.image ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., http://example.com/dish.jpg"
                                    onChange={(e) => {
                                        setFieldValue('image', e.target.value);
                                        setImagePreviewUrl(e.target.value);
                                    }}
                                />
                                <ErrorMessage name="image" component="div" className="text-red-500 text-xs mt-1" />
                                {imagePreviewUrl && !errors.image && (
                                    <div className="mt-3 flex items-center space-x-3">
                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-700 text-sm">Image Preview:</span>
                                        <img
                                            src={imagePreviewUrl}
                                            alt="Image Preview"
                                            className="w-20 h-20 object-cover rounded-md border border-gray-200 shadow-sm"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/E2E8F0/64748B?text=Error'; }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Tags/Allergens */}
                            <div>
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags / Allergens (comma-separated, Optional)
                                </label>
                                <Field
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    className={`w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${errors.tags && touched.tags ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Gluten-free, Vegan, Nuts"
                                />
                                <ErrorMessage name="tags" component="p" className="mt-1 text-sm text-red-600" />
                            </div>

                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between">
                                <label htmlFor="isAvailable" className="block text-sm font-medium text-gray-700">
                                    Available
                                </label>
                                <Field
                                    name="isAvailable"
                                    component={ToggleSwitch}
                                />
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
                                    {isSubmitting ? 'Saving...' : initialValues.id ? 'Save Changes' : 'Add Item'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Modal component for Add/Edit Category Form
const CategoryFormModal = ({ isOpen, onClose, initialValues, onSubmit, isSubmitting }) => {
    return (
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-white p-8 rounded-lg shadow-xl max-w-sm w-full transform transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    {initialValues.id ? 'Edit Category' : 'Add New Category'}
                </h3>
                <Formik
                    initialValues={initialValues}
                    validationSchema={categoryValidationSchema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ errors, touched }) => (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
                                </label>
                                <Field
                                    type="text"
                                    id="name"
                                    name="name"
                                    className={`block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="e.g., Starters, Desserts"
                                />
                                <ErrorMessage name="name" component="div" className="text-red-500 text-xs mt-1" />
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
                                    {isSubmitting ? 'Saving...' : initialValues.id ? 'Save Changes' : 'Add Category'}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Reusable Confirmation Dialog component
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


const MenuSection = () => {
    const [menus, setMenus] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
    const [currentMenuItem, setCurrentMenuItem] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All'); // 'All' or category name
    const [searchQuery, setSearchQuery] = useState('');
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmActionDetails, setConfirmActionDetails] = useState({
        id: null,
        type: null, // 'delete_item', 'toggle_item_status', 'delete_category'
        message: '',
        confirmButtonClass: '',
        confirmButtonText: '',
    });
    const [filteredMenusState, setFilteredMenus] = useState(menus);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchMenuItems();
    }, [pageNumber]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, loading]);

    // Fetch menus and categories on component mount
    useEffect(() => {
        // fetchMenuItems();
        fetchCategories();
    }, []);

    const fetchMenuItems = async (action = 'normal') => {
        setLoading(true);
        try {
            if (action === 'all') {
                const response = await getAllMenus(); // Use apiService
                const menuItems = response.data;
                setMenus(menuItems);
                return;
            }

            const response = await getAllMenus(); // Use apiService
            const menuItems = response.data;
            const start = (pageNumber - 1) * 10;
            const end = start + 10;
            const currentPageItems = menuItems.slice(start, end);

            if (currentPageItems.length < 10 || end >= menuItems.length) {
                setHasMore(false);
            }

            setMenus(prevMenus => [...prevMenus, ...currentPageItems]);
        } catch (error) {
            console.error('Error fetching menus:', error);
            toast.error('Error fetching menus. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories(); // Use apiService
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error fetching categories. Please try again.');
        }
    };

    const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const scrollTop = document.documentElement.scrollTop;

        if (scrollTop + clientHeight >= scrollHeight * 0.9 && hasMore && !loading) {
            setPageNumber(prevPageNumber => prevPageNumber + 1);
        }
    };

    // --- Menu Item Handlers ---
    const handleAddMenuItemClick = () => {
        setCurrentMenuItem(null);
        setIsMenuItemModalOpen(true);
    };

    const handleEditMenuItemClick = (menuItem) => {
        setCurrentMenuItem(menuItem);
        setIsMenuItemModalOpen(true);
    };


    const handleSubmitMenuItemForm = async (values, { setSubmitting, resetForm }) => {
        try {
            if (values.id) {
                await editMenu(values.id, values); // Use apiService
                toast.success('Menu item updated successfully!');
            } else {
                await addMenu(values); // Use apiService
                toast.success('Menu item added successfully!');
            }
            resetForm();
            setIsMenuItemModalOpen(false);
            setCurrentMenuItem(null);
            fetchMenuItems('all'); // Refresh menu list
        } catch (error) {
            console.error('Error submitting menu item form:', error);
            toast.error('Error submitting menu item form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };


    const handleToggleMenuItemStatusClick = (menuItem) => {
        const newStatus = !menuItem.isAvailable; // Toggle the boolean status
        setConfirmActionDetails({
            id: menuItem.id,
            type: 'toggle_item_status',
            message: `Are you sure you want to set "${menuItem.item_name}" as ${newStatus ? 'available' : 'unavailable'}?`,
            confirmButtonClass: newStatus ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500' : 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
            confirmButtonText: newStatus ? 'Enable' : 'Disable',
        });
        setIsConfirmDialogOpen(true);
    };

    const handleDeleteMenuItemClick = (menuItemId, itemName) => {
        setConfirmActionDetails({
            id: menuItemId,
            type: 'delete_item',
            message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
            confirmButtonClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            confirmButtonText: 'Delete',
        });
        setIsConfirmDialogOpen(true);
        fetchMenuItems()
    };

    // --- Category Handlers ---
    const handleAddCategoryClick = () => {
        setCurrentCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleEditCategoryClick = (category) => {
        setCurrentCategory(category);
        setIsCategoryModalOpen(true);
    };


    const handleSubmitCategoryForm = async (values, { setSubmitting, resetForm }) => {
        try {
            if (values.id) {
                await editCategory(values.id, values); // Use apiService
                toast.success('Category updated successfully!');
            } else {
                await addCategory(values); // Use apiService
                toast.success('Category added successfully!');
            }
            resetForm();
            setIsCategoryModalOpen(false);
            setCurrentCategory(null);
            fetchCategories(); // Refresh category list
        } catch (error) {
            console.error('Error submitting category form:', error);
            toast.error('Error submitting category form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    const handleDeleteCategoryClick = (categoryId, categoryName) => {
        setConfirmActionDetails({
            id: categoryId,
            type: 'delete_category',
            message: `Are you sure you want to delete the category "${categoryName}"? All associated menu items might also be affected. This action cannot be undone.`,
            confirmButtonClass: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
            confirmButtonText: 'Delete Category',
        });
        setIsConfirmDialogOpen(true);
    };

    // --- Universal Confirmation Handler ---

    const handleConfirmAction = async () => {
        try {
            if (confirmActionDetails.type === 'toggle_item_status') {
                const itemToUpdate = menus.find(m => m.id === confirmActionDetails.id);
                const newAvailabilityStatus = !itemToUpdate.isAvailable; // Toggle the boolean status
                await updateMenuStatus(confirmActionDetails.id, { isAvailable: newAvailabilityStatus }); // Use apiService
                fetchMenuItems(); // Re-fetch to get updated status
                toast.success(`Menu item status updated to ${newAvailabilityStatus ? 'available' : 'unavailable'}!`);
            } else if (confirmActionDetails.type === 'delete_item') {
                await deleteMenu(confirmActionDetails.id); // Use apiService
                fetchMenuItems(); // Re-fetch to remove deleted item
                toast.success('Menu item deleted successfully!');
            } else if (confirmActionDetails.type === 'delete_category') {
                await deleteCategory(confirmActionDetails.id); // Use apiService
                fetchCategories(); // Re-fetch categories
                fetchMenuItems(); // Re-fetch menus
                toast.success('Category deleted successfully!');
            }
        } catch (error) {
            console.error(`Error performing ${confirmActionDetails.type} action:`, error);
            toast.error(`Error performing ${confirmActionDetails.type} action. Please try again.`);
        } finally {
            setIsConfirmDialogOpen(false);
            setConfirmActionDetails({ id: null, type: null, message: '', confirmButtonClass: '', confirmButtonText: '' });
        }
    };
    const handleSearch = debounce((query) => {
        const filteredMenus = menus.filter(menu =>
            menu.item_name.toLowerCase().includes(query.toLowerCase()) ||
            menu.category.toLowerCase().includes(query.toLowerCase()) ||
            menu.tags?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredMenus(filteredMenus);
    }, 500);

    // Filtered menu items based on selected category
    const filteredMenus = selectedCategoryFilter === 'All'
        ? menus.filter(menu =>
            menu.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            menu.tags?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : menus.filter(menu =>
            menu.category === selectedCategoryFilter && (
                menu.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                menu.tags?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    return (
        <div className="p-6 bg-white rounded-lg shadow-md min-h-[calc(100vh-180px)]">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Menu Management</h2>
            <p className="text-gray-600 mb-6">Organize your menu by categories and manage individual food items.</p>

            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-xl text-gray-800">
                    Menu Items {selectedCategoryFilter !== 'All' && `(${selectedCategoryFilter})`}
                </h3>
                <div className="flex gap-2">
                    <input
                        type="search"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            handleSearch(e.target.value);
                        }}
                        placeholder="Search menu items..."
                        className="px-4 py-2 border border-gray-300 rounded-md"
                    />
                    {/* <button
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 text-sm font-medium shadow-md"
                        onClick={handleAddMenuItemClick}
                    >
                        Add New Item
                    </button> */}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Categories Section */}
                <div className="md:w-1/3 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-xl text-gray-800">Categories</h3>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 text-sm font-medium shadow-sm"
                            onClick={handleAddCategoryClick}
                        >
                            Add Category
                        </button>
                    </div>
                    <ul className="space-y-2">
                        <li
                            className={`flex justify-between items-center p-3 rounded-md cursor-pointer transition-colors duration-150
                ${selectedCategoryFilter === 'All' ? 'bg-indigo-100 text-indigo-800 font-semibold shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
                            onClick={() => setSelectedCategoryFilter('All')}
                        >
                            All Items <span className="text-sm font-normal">{menus.length} items</span>
                        </li>
                        {categories.map((cat) => {
                            const itemCount = menus.filter(menu => menu.category === cat.name).length;
                            return (
                                <li
                                    key={cat.id}
                                    className={`flex justify-between items-center p-3 rounded-md cursor-pointer group transition-colors duration-150
                    ${selectedCategoryFilter === cat.name ? 'bg-indigo-100 text-indigo-800 font-semibold shadow-sm' : 'bg-white hover:bg-gray-100 text-gray-700'}`}
                                    onClick={() => setSelectedCategoryFilter(cat.name)}
                                >
                                    <span>{cat.name} <span className="text-sm font-normal">({itemCount} items)</span></span>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleEditCategoryClick(cat); }}
                                            className="text-blue-500 hover:text-blue-700 text-sm"
                                            title="Edit Category"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCategoryClick(cat.id, cat.name); }}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                            title="Delete Category"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                        {categories.length === 0 && (
                            <li className="text-center text-gray-500 text-sm py-4">No categories added yet.</li>
                        )}
                    </ul>
                </div>

                {/* Menu Items Section */}
                <div className="md:w-2/3 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-xl text-gray-800">
                            Menu Items {selectedCategoryFilter !== 'All' && `(${selectedCategoryFilter})`}
                        </h3>
                        <button
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 text-sm font-medium shadow-md"
                            onClick={handleAddMenuItemClick}
                        >
                            Add New Item
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredMenus.length > 0 ? (
                            filteredMenus.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-200">
                                    <img
                                        src={item.image || `https://placehold.co/80x80/E0E0E0/333333?text=${item.item_name.substring(0, 2).toUpperCase()}`}
                                        alt={item.item_name}
                                        className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-200"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/E0E0E0/333333?text=${item.item_name.substring(0, 2).toUpperCase()}`; }} // Fallback image
                                    />
                                    <h4 className="font-bold text-lg text-gray-900 mb-1">{item.item_name}</h4>
                                    <div className="text-gray-700 text-sm mb-2">
                                        {/* FIX: Added optional chaining here */}
                                        {item.portions?.map((p, index) => (
                                            <p key={index}>{p.type}:  ₹{p.price.toFixed(2)}</p>
                                        ))}
                                    </div>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold mb-3
                    ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                    {item.tags && (
                                        <p className="text-xs text-gray-500 mb-3">Tags: {item.tags}</p>
                                    )}
                                    <div className="flex flex-wrap justify-center gap-2 w-full">
                                        <button
                                            className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition duration-200 text-sm"
                                            onClick={() => handleEditMenuItemClick(item)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={`flex-1 px-3 py-1.5 rounded-md font-medium text-sm
                        ${item.isAvailable ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                            onClick={() => handleToggleMenuItemStatusClick(item)}
                                        >
                                            {item.isAvailable ? 'Disable' : 'Enable'}
                                        </button>
                                        <button
                                            className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-md font-medium hover:bg-red-600 transition duration-200 text-sm"
                                            onClick={() => handleDeleteMenuItemClick(item.id, item.item_name)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-gray-500 text-lg">
                                No menu items found for this category.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MenuItemFormModal
                isOpen={isMenuItemModalOpen}
                onClose={() => setIsMenuItemModalOpen(false)}
                initialValues={currentMenuItem ? {
                    id: currentMenuItem.id,
                    item_name: currentMenuItem.item_name,
                    category: currentMenuItem.category,
                    portions: currentMenuItem.portions?.length > 0 ? currentMenuItem.portions : [{ type: 'Full', price: 0 }],
                    image: currentMenuItem.image,
                    isAvailable: currentMenuItem.isAvailable,
                    tags: currentMenuItem.tags || '',
                } : {
                    id: '',
                    item_name: '',
                    category: selectedCategoryFilter === 'All' ? '' : selectedCategoryFilter,
                    portions: [{ type: 'Full', price: 0 }],
                    image: '',
                    isAvailable: true,
                    tags: '',
                }
                }
                onSubmit={handleSubmitMenuItemForm}
                isSubmitting={false} // Formik handles its own submitting state
                categories={categories}
            />

            <CategoryFormModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                initialValues={currentCategory || { name: '', id: null }}
                onSubmit={handleSubmitCategoryForm}
                isSubmitting={false} // Formik handles its own submitting state
            />

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleConfirmAction}
                message={confirmActionDetails.message}
                confirmButtonClass={confirmActionDetails.confirmButtonClass}
                confirmButtonText={confirmActionDetails.confirmButtonText}
            />
        </div>
    );
};

export default MenuSection;
