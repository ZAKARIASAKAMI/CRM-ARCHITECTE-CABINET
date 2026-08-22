import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "layouts/admin";
import AuthLayout from "layouts/auth";
import ProtectedRoute from "components/ProtectedRoute";
import { isAuthenticated } from "services/auth";

const RtlLayout = lazy(() => import("layouts/rtl"));

const RootRedirect = () => {
  return (
    <Navigate
      to={isAuthenticated() ? "/admin/default" : "/auth/sign-in"}
      replace
    />
  );
};

const App = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />
        <Route
          path="admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route path="rtl/*" element={<RtlLayout />} />
        <Route path="/" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
};

export default App;
