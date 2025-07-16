import { Package, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const ViewMenu = ({ menu }) => {
    // Extract unique categories from the menu
    const categories = [...new Set(menu.map((item) => item.category))];

    // Placeholder image for items without an image or broken links
    const PLACEHOLDER_IMAGE = 'https://placehold.co/400x250/E0E7FF/5B21B6?text=No+Image';

    return (
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-100 to-blue-200 rounded-xl shadow-2xl h-full overflow-y-auto border border-blue-300">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-indigo-800 mb-12 border-b-4 border-indigo-400 pb-4 text-center tracking-tight drop-shadow-lg">
                Our Delicious Menu
            </h2>

            {categories.length === 0 && (
                <div className="text-center text-gray-600 text-lg py-10">
                    <p>No menu items available at the moment. Please check back later!</p>
                </div>
            )}

            {categories.map((category) => {
                const itemsInCategory = menu.filter((item) => item.category === category);
                return (
                    <div
                        key={category}
                        className="mb-16 p-4 sm:p-6 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-blue-200 transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-2xl hover:border-indigo-300 group"
                    >
                        <h3 className="text-xl sm:text-2xl font-bold text-indigo-700 mb-8 pb-3 border-b-2 border-indigo-300 flex items-center">
                            <Package size={28} className="mr-3 text-indigo-600" /> {category}
                            <ChevronRight size={24} className="ml-auto text-indigo-400 group-hover:translate-x-1 transition-transform duration-200" />
                        </h3>
                        {itemsInCategory.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No items in this category yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
                                {itemsInCategory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 flex flex-col justify-between
                               hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 ease-in-out
                               relative overflow-hidden group"
                                    >
                                        {/* Image with fallback */}
                                        <img
                                            src={item.image || PLACEHOLDER_IMAGE}
                                            alt={item.item_name}
                                            className="w-full h-40 object-cover mb-3 rounded-lg border border-gray-100 transform group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.onerror = null; // Prevent infinite loop
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                        <div className="flex-grow">
                                            <p className="font-extrabold text-gray-900 text-xl mb-1">{item.item_name}</p>
                                            <div className="flex items-center text-base mb-3"> {/* Increased availability text size */}
                                                {item?.isAvailable ? (
                                                    <>
                                                        <CheckCircle size={20} className="mr-1 text-green-600" /> {/* Increased icon size */}
                                                        <span className="text-green-700 font-semibold">In Stock</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={20} className="mr-1 text-red-500" /> {/* Increased icon size */}
                                                        <span className="text-red-600 font-semibold">Out of Stock</span>
                                                    </>
                                                )}
                                            </div>
                                            {item.portions.map((portion) => (
                                                <p key={portion.type} className="text-2xl font-black text-indigo-800 mb-1"> {/* Changed color to indigo-800 and font-black */}
                                                    ₹{portion.price.toFixed(2)}{' '}
                                                    <span className="text-base font-medium text-gray-600">({portion.type})</span> {/* Slightly darker gray for portion type */}
                                                </p>
                                            ))}
                                        </div>
                                        {/* Overlay for out of stock items */}
                                        {!item.isAvailable && (
                                            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg z-10"> {/* Added z-10 */}
                                                <span className="text-white text-3xl font-black tracking-widest uppercase rotate-45 transform -translate-y-1/2 -translate-x-1/2"> {/* Increased font size */}
                                                    SOLD OUT
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
export default ViewMenu;