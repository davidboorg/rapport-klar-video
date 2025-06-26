
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AvatarLibrary from '@/components/avatar/AvatarLibrary';
import AvatarCreationWizard from '@/components/avatar/AvatarCreationWizard';

const Avatars = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tr from-indigo-400/15 to-pink-400/10 rounded-full blur-2xl opacity-60 animate-pulse" />
      </div>
      
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AvatarLibrary />} />
          <Route path="/create" element={<AvatarCreationWizard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Avatars;
