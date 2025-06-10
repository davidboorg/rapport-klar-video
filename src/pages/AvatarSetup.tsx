
import React from 'react';
import Navbar from '@/components/Navbar';
import AvatarSetupWizard from '@/components/avatar/AvatarSetupWizard';

const AvatarSetup = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="py-8">
        <AvatarSetupWizard />
      </div>
    </div>
  );
};

export default AvatarSetup;
