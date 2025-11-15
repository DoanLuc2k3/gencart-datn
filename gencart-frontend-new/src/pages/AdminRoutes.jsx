import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminUsers from './admin/AdminUsers';
import AdminCategories from './admin/AdminCategories';

const AdminRoutes = () => {
  return (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="products" element={<AdminProducts />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="categories" element={<AdminCategories />} />
    </>
  );
};

export default AdminRoutes;
