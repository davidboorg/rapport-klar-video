
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/BergetAuthContext';

const Projects = () => {
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Your Projects</h1>
          <p className="text-slate-600">
            Manage your financial report video projects.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No Projects Yet</h3>
          <p className="text-slate-600 mb-4">
            Create your first project to start generating professional videos from your financial reports.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default Projects;
