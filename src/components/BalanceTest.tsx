import React from 'react';
import { useBalance } from '../context/BalanceContext';
import { useAccount } from 'wagmi';

export const BalanceTest: React.FC = () => {
  const { balance, isLoading, error, updateBalance, refreshBalance } = useBalance();
  const { address } = useAccount();

  const handleAddBalance = async () => {
    if (!address) {
      console.error('No wallet connected');
      return;
    }
    // Add 100 to current balance
    await updateBalance(balance + 100);
  };

  if (!address) {
    return (
      <div className="p-4 border rounded-lg shadow-lg max-w-sm mx-auto mt-4">
        <p className="text-gray-600">Please connect your wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-lg max-w-sm mx-auto mt-4">
      <h2 className="text-xl font-bold mb-4">Your Cat0 Balance</h2>
      
      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
          {error}
          <button 
            onClick={refreshBalance}
            className="ml-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <p className="text-2xl font-bold mb-4">{balance} Cat0</p>
      )}

      <div className="space-y-2">
        <button
          onClick={handleAddBalance}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Add 100 Cat0'}
        </button>
        <button
          onClick={refreshBalance}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Refresh Balance'}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Connected Address: {address}
      </div>
    </div>
  );
};
