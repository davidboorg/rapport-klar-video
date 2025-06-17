
import React from 'react';
import Navbar from '@/components/Navbar';
import BoardDashboard from '@/components/board/BoardDashboard';

const BoardDashboardPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BoardDashboard />
      </div>
    </div>
  );
};

export default BoardDashboardPage;
