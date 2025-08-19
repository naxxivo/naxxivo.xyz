
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/admin/Sidebar';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 bg-gray-50 dark:bg-background">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;