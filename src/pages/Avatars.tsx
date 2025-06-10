
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AvatarLibrary from '@/components/avatar/AvatarLibrary';
import AvatarCreationWizard from '@/components/avatar/AvatarCreationWizard';

const Avatars = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<AvatarLibrary />} />
          <Route path="/create" element={<AvatarCreationWizard />} />
        </Routes>
      </div>
    </div>
  );
};

export default Avatars;
