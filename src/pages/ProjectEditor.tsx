
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProjectEditor = () => {
  const { projectId } = useParams();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-200">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Project Editor
          </h1>
          <p className="text-slate-200">
            Edit project: {projectId}
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Project Editor Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-200">
              The project editor will be available soon. You'll be able to edit scripts, generate videos, and manage your project content here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEditor;
