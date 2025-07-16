// src/layouts/DevLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header/DevHeader';
import Footer from '../components/Footer';

export default function DevLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Header />
      <main className="flex-grow p-4">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
