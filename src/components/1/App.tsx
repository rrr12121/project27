import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import PurchaseTokens from './PurchaseTokens'
import { NavigationBarProps } from './types'

const PurchaseTokensWrapper: React.FC<{ initialPage: NavigationBarProps['activePage'] }> = ({ initialPage }) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState<NavigationBarProps['activePage']>(initialPage);

  const handleSetActivePage = (page: NavigationBarProps['activePage']) => {
    setActivePage(page);
    navigate(`/${page === 'home' ? '' : page}`);
  };

  return (
    <PurchaseTokens 
      activePage={activePage}
      setActivePage={handleSetActivePage}
    />
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<PurchaseTokensWrapper initialPage="home" />}
        />
        <Route 
          path="/news" 
          element={<PurchaseTokensWrapper initialPage="news" />}
        />
        <Route 
          path="/staking" 
          element={<PurchaseTokensWrapper initialPage="staking" />}
        />
        <Route 
          path="/7aicat" 
          element={<PurchaseTokensWrapper initialPage="7aicat" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
