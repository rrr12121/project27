import React, { useState } from 'react';
import './App.css';
import Roadmap from './components/Roadmap';
import RecentTransactionsNew from './components/RecentTransactionsNew';
import SecurityFeatures from './components/security-features';
import { RainbowKitProvider } from './components/RainbowKitProvider';
import AnimatedBackground from './components/AnimatedBackground';
import PurchaseTokens from './components/1/PurchaseTokens';
import Whitepaper from './components/Whitepaper';
import CatCoinMediaGeneratorAlpha from './components/media-generator-alpha';
import { BalanceProvider } from './context/BalanceContext';
import TeamShowcase from './components/team-showcase';
import Tokenomics from './components/tokenomics';
import { NavigationBarProps } from './components/1/types';

function App() {
  const [activePage, setActivePage] = useState<NavigationBarProps['activePage']>('home');

  return (
    <RainbowKitProvider>
      <BalanceProvider>
        <div className="relative min-h-screen overflow-hidden">
          <AnimatedBackground />
          <div className="relative z-10">
            <main className="container mx-auto px-4 py-8 space-y-8">
              <PurchaseTokens activePage={activePage} setActivePage={setActivePage} />
              {activePage === 'home' && (
                <>
                  <RecentTransactionsNew />
                  <Roadmap />
                  <Whitepaper />
                  <SecurityFeatures />
                  <TeamShowcase />
                  <Tokenomics />
                </>
              )}
            </main>
          </div>
        </div>
      </BalanceProvider>
    </RainbowKitProvider>
  );
}

export default App;
