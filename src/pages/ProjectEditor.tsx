
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/BergetAuthContext';

const ProjectEditor = () => {
  const { id } = useParams();
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Editor</h1>
          <p className="text-slate-600">
            Edit project: {id}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Project Editor Coming Soon</h3>
          <p className="text-slate-600">
            The project editor will be available soon. You'll be able to edit scripts, generate videos, and manage your project content here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
