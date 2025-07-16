// src/layouts/CashierLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/CashierHeader';
import Footer from '../components/Footer';

export default function CashierLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-800">
      <Header />
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
