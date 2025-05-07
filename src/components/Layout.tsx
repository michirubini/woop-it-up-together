
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'sonner';

const Layout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
};

export default Layout;
