// src/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/AdminHeader';
import Footer from '../components/Footer';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-gray-900">
      <Header />
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
