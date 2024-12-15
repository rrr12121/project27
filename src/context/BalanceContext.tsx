import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';

interface BalanceContextType {
  balance: number;
  isLoading: boolean;
  error: string | null;
  updateBalance: (newBalance: number, addToBalance?: boolean, isReward?: boolean) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};

interface BalanceProviderProps {
  children: ReactNode;
}

interface BalanceResponse {
  success: boolean;
  balance: number;
  error?: string;
}

const POLLING_INTERVAL = 60000; // 60 seconds in milliseconds

export const BalanceProvider: React.FC<BalanceProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/balance/${address}`, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not ok:', text);
        throw new Error('Failed to fetch balance');
      }

      const data: BalanceResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch balance');
      }

      setBalance(data.balance);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      console.error('Error fetching balance:', err);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const updateBalance = async (newBalance: number, addToBalance?: boolean, isReward?: boolean) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/balance/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ 
          balance: newBalance,
          addToBalance: addToBalance,
          isReward: isReward
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response not ok:', text);
        throw new Error('Failed to update balance');
      }

      const data: BalanceResponse = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update balance');
      }

      // Update local balance state
      setBalance(data.balance);
      
      // Refresh balance to ensure consistency
      await fetchBalance();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update balance';
      setError(errorMessage);
      console.error('Error updating balance:', err);
      throw err; // Re-throw to handle in components
    } finally {
      setIsLoading(false);
    }
  };

  // Set up polling for balance updates
  useEffect(() => {
    if (address) {
      // Initial fetch
      fetchBalance();

      // Set up polling every 60 seconds
      const intervalId = setInterval(fetchBalance, POLLING_INTERVAL);

      return () => clearInterval(intervalId);
    } else {
      setBalance(0);
      setError(null);
    }
  }, [address, fetchBalance]);

  return (
    <BalanceContext.Provider 
      value={{ 
        balance, 
        isLoading, 
        error, 
        updateBalance,
        refreshBalance: fetchBalance
      }}
    >
      {children}
    </BalanceContext.Provider>
  );
};
