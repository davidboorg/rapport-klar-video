
import React from 'react';
import Navbar from '@/components/Navbar';
import IRDashboard from '@/components/ir/IRDashboard';

const IRDashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <IRDashboard />
      </div>
    </div>
  );
};

export default IRDashboardPage;
