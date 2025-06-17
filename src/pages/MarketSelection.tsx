
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MarketSelector from '@/components/market/MarketSelector';

const MarketSelection = () => {
  const navigate = useNavigate();

  const handleMarketSelect = (market: 'ir' | 'board') => {
    // Store market selection in localStorage for persistence
    localStorage.setItem('selectedMarket', market);
    
    // Navigate to appropriate dashboard
    if (market === 'ir') {
      navigate('/ir-dashboard');
    } else {
      navigate('/board-dashboard');
    }
  };

  return <MarketSelector onMarketSelect={handleMarketSelect} />;
};

export default MarketSelection;
