import React, { useEffect, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useNetwork, useAccount } from 'wagmi';
import { Wallet, ChevronDown, AlertTriangle, Loader2 } from 'lucide-react';

interface ConnectWalletButtonProps {
  className?: string;
}

const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({ className = '' }) => {
  const { chain } = useNetwork();
  const { isConnecting } = useAccount();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Handle WebSocket reconnection
  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && connectionError) {
        setIsReconnecting(true);
        // Attempt to reconnect
        reconnectTimeout = setTimeout(() => {
          setConnectionError(null);
          setIsReconnecting(false);
        }, 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [connectionError]);

  // Handle WebSocket errors
  useEffect(() => {
    const handleWebSocketError = (event: Event) => {
      if (event instanceof CloseEvent) {
        setConnectionError('WebSocket connection lost. Attempting to reconnect...');
      }
    };

    window.addEventListener('websocketerror', handleWebSocketError);
    return () => window.removeEventListener('websocketerror', handleWebSocketError);
  }, []);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain: rainbowChain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const isReady = mounted && authenticationStatus !== 'loading';
        const isConnected =
          isReady &&
          account &&
          rainbowChain &&
          (!authenticationStatus || authenticationStatus === 'authenticated');

        return (
          <div
            {...(!isReady && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {/* Connection Error Alert */}
            {connectionError && (
              <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-bounce">
                <AlertTriangle className="h-5 w-5" />
                <span>{connectionError}</span>
              </div>
            )}

            {isConnected ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                {/* Network Selection Button */}
                <button
                  onClick={openChainModal}
                  type="button"
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:shadow-md relative group"
                >
                  {rainbowChain.hasIcon && (
                    <div className="relative">
                      <img
                        alt={rainbowChain.name ?? 'Chain icon'}
                        src={rainbowChain.iconUrl}
                        className="w-5 h-5 rounded-full transition-transform duration-300 group-hover:scale-110"
                      />
                      {isReconnecting && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                        </div>
                      )}
                    </div>
                  )}
                  <span className="text-sm font-medium">{rainbowChain.name}</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>

                {/* Account Button */}
                <button
                  onClick={openAccountModal}
                  type="button"
                  className="w-full sm:w-auto flex items-center justify-between sm:justify-start space-x-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-3 py-2 transition-all duration-300 ease-in-out hover:shadow-md group"
                >
                  <div className={`w-2 h-2 rounded-full ${connectionError ? 'bg-red-400' : 'bg-green-400'} ${isReconnecting ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-medium transition-all duration-300 group-hover:text-pink-600">
                    {account.displayName.slice(0, 4)}...{account.displayName.slice(-4)}
                  </span>
                  {account.displayBalance && (
                    <span className="text-xs text-gray-600 transition-all duration-300 group-hover:text-purple-600">
                      {account.displayBalance}
                    </span>
                  )}
                  <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
                </button>
              </div>
            ) : (
              <button 
                onClick={openConnectModal} 
                type="button" 
                disabled={isConnecting || isReconnecting}
                className={`
                  bg-gradient-to-r from-pink-500 to-purple-600
                  hover:from-pink-600 hover:to-purple-700
                  text-white font-bold py-2 px-4 rounded-lg
                  shadow-lg transition-all duration-300 ease-in-out
                  transform hover:-translate-y-1 hover:scale-105
                  flex items-center justify-center
                  overflow-hidden group
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${className}
                `}
              >
                {isConnecting || isReconnecting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isReconnecting ? 'Reconnecting...' : 'Connecting...'}</span>
                  </div>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="relative">
                      <span className="block transition-all duration-300 group-hover:-translate-y-full">
                        Connect Wallet
                      </span>
                      <span className="absolute top-full left-0 block transition-all duration-300 group-hover:-translate-y-full">
                        Let's Go!
                      </span>
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletButton;
