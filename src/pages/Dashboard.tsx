
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/BergetAuthContext';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-slate-600">
            Manage your ReportFlow projects and create professional videos from your financial reports.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Recent Projects</h3>
            <p className="text-slate-600 text-sm">No projects yet. Create your first project to get started.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Account Info</h3>
            <p className="text-slate-600 text-sm">Company: {user.company}</p>
            <p className="text-slate-600 text-sm">Email: {user.email}</p>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">EU Compliance</h3>
            <p className="text-slate-600 text-sm">✅ GDPR Compliant</p>
            <p className="text-slate-600 text-sm">✅ EU Data Centers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
