import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe, Menu, X, LogOut, User } from 'lucide-react'; // Using lucide-react for icons

// Header Component
export default function Header({
    isDarkMode,
    setIsDarkMode,
    activeSection,
    setActiveSection,
}) {
    const [language, setLanguage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('language') || 'en';
        }
        return 'en';
    });
    const [currentTime, setCurrentTime] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Navigation items
    const navItems = [
        { name: 'Home', href: 'home', nameMr: 'मुख्यपृष्ठ' },
        { name: 'Running Tables', href: 'running-tables', nameMr: 'चालू टेबल्स' },
        { name: 'Orders', href: 'orders', nameMr: 'ऑर्डर' },
        { name: 'Reports', href: 'reports', nameMr: 'अहवाल' },
        { name: 'Items', href: 'items', nameMr: 'आयटम्स' },
        { name: 'Categories', href: 'categories', nameMr: 'श्रेणी' },
        { name: 'Tables', href: 'tables', nameMr: 'टेबल्स' },
        { name: 'Subscription', href: 'subscription', nameMr: 'सदस्यता' },
    ];

    // Save language preference
    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    // Effect to update current time
    useEffect(() => {
        const updateTime = () => {
            setCurrentTime(new Date().toLocaleString(language === 'en' ? 'en-US' : 'mr-IN', {
                weekday: 'short', // Shorter weekday
                year: 'numeric',
                month: 'short',   // Shorter month
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                hour12: true,
            }));
        };

        updateTime(); // Initial call
        const timerId = setInterval(updateTime, 1000); // Update every second

        return () => clearInterval(timerId); // Cleanup on component unmount
    }, [language]); // Re-run effect if language changes

    // Toggle language
    const toggleLanguage = () => {
        setLanguage(prevLang => (prevLang === 'en' ? 'mr' : 'en'));
    };

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
    };

    // Handle logout (placeholder)
    const handleLogout = () => {
        console.log("User logged out!");
        // displayMessage(language === 'en' ? "Successfully logged out!" : "यशस्वीरित्या बाहेर पडले!");
        // Add actual authentication logout logic here later
    };

    return (
        <header className="fixed top-0 left-0 w-full z-50">
            {/* Top Layer */}
            <div className={`py-2 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-100 border-blue-200'}`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    {/* Utility Features */}
                    <div className="flex items-center space-x-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(prevMode => !prevMode)}
                            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-200 text-blue-600 hover:bg-blue-300'} transition-all duration-300`}
                            aria-label={language === 'en' ? 'Toggle Theme' : 'थीम बदला'}
                            title={language === 'en' ? 'Toggle Theme' : 'थीम बदला'}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-blue-200 text-blue-600 hover:bg-blue-300'} transition-all duration-2`}> <span className="ml-1 text-xs font-semibold">{language === 'en' ? 'MR' : 'EN'}</span>
                        </button>

                        {/* Current Date & Time */}
                        <span className={`relative px-3 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-blue-300' : 'bg-blue-50 text-blue-700'} text-xs font-semibold whitespace-nowrap`}>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {currentTime}
                        </span>
                    </div>

                    {/* User Info and Logout */}
                    <div className="flex items-center space-x-3">
                        <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${isDarkMode ? 'bg-green-700 text-green-300' : 'bg-green-100 text-green-700'} font-medium text-sm`}>
                            <User size={18} />
                            <span>Vaibhav - Admin</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className={`flex items-center px-5 py-2.5 ${isDarkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 hover:bg-red-500'} text-white font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-200`}
                            title={language === 'en' ? 'Logout' : 'बाहेर पडा'}
                        >
                            <LogOut size={16} className="mr-2" />
                            {language === 'en' ? 'Logout' : 'बाहेर पडा'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Layer */}
            <div className={`shadow-xl border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-100'}`}>
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    {/* Logo/Brand Name */}
                    <div className="flex items-center space-x-2">
                        <span className={`text-xl md:text-2xl font-extrabold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            {language === 'en' ? 'Vaibhav\'s Dashboard' : 'वैभवचे डॅशबोर्ड'}
                        </span>
                    </div>

                    {/* Desktop Navigation & Utilities */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {/* Navigation Links */}
                        <ul className="flex space-x-2 lg:space-x-4">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <button
                                        onClick={() => setActiveSection(item.href)}
                                        className={`relative px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ease-in-out
                      ${activeSection === item.href
                                                ? `${isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} shadow-md transform scale-105`
                                                : `${isDarkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} hover:bg-blue-50 dark:hover:bg-gray-700/50`
                                            }
                    `}
                                    >
                                        {language === 'en' ? item.name : item.nameMr}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Mobile Hamburger Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className={`md:hidden p-2 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
                        aria-label={language === 'en' ? 'Open Mobile Menu' : 'मोबाइल मेनू उघडा'}
                        title={language === 'en' ? 'Open Mobile Menu' : 'मोबाइल मेनू उघडा'}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={`md:hidden fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} bg-opacity-95 flex flex-col items-center justify-center z-40 animate-slide-in-right`}>
                    <button
                        onClick={toggleMobileMenu}
                        className={`absolute top-4 right-4 p-3 rounded-lg ${isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors duration-200`}
                        aria-label={language === 'en' ? 'Close Mobile Menu' : 'मोबाइल मेनू बंद करा'}
                        title={language === 'en' ? 'Close Mobile Menu' : 'मोबाइल मेनू बंद करा'}
                    >
                        <X size={32} />
                    </button>
                    <nav className="flex flex-col space-y-8 text-center w-full max-w-sm px-4">
                        <ul className="flex flex-col space-y-6">
                            {navItems.map((item) => (
                                <li key={item.href}>
                                    <button
                                        onClick={() => { toggleMobileMenu(); setActiveSection(item.href); }}
                                        className={`block text-3xl font-extrabold py-3 px-4 rounded-xl transition-all duration-300 ease-in-out
                      ${activeSection === item.href
                                                ? `${isDarkMode ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'} shadow-lg`
                                                : `${isDarkMode ? 'text-gray-200' : 'text-gray-800'} hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700/50`
                                            }
                    `}
                                    >
                                        {language === 'en' ? item.name : item.nameMr}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            )}
        </header>
    );
}