import React, { useState, useEffect } from 'react'
import { ArrowRight, Gift, X, Copy, Clock, ExternalLink, AlertTriangle, Coins, Info, CheckCircle2, Bitcoin } from 'lucide-react'
import { calculateCat0Amount, getCurrencyColor, formatBalanceForServer } from './utils'
import { MIN_AMOUNTS, NETWORK_IDS } from './constants'
import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi'
import { mainnet, bsc } from 'wagmi/chains'
import { PurchaseFormProps, SupportedCurrency } from './types'

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  purchaseAmount,
  setPurchaseAmount,
  purchaseCurrency,
  setPurchaseCurrency,
  handlePurchase,
  isWalletConnected,
  onApplyGiftCode,
  giftCodeBonus,
  giftCode,
  purchaseStatus,
  setPurchaseStatus,
  setRaisedAmounts,
  refreshBalance
}) => {
  const [localGiftCode, setLocalGiftCode] = useState('')
  const [giftCodeMessage, setGiftCodeMessage] = useState('')
  const [giftCodeError, setGiftCodeError] = useState('')
  const { chain } = useNetwork()
  const { switchNetwork, isLoading: isSwitchingNetwork, error: switchNetworkError } = useSwitchNetwork()
  const [isSwapInfoModalOpen, setIsSwapInfoModalOpen] = useState(false)
  const [isBTCModalOpen, setIsBTCModalOpen] = useState(false)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [purchaseAmountError, setPurchaseAmountError] = useState<string | null>(null)
  const [btcAddress] = useState('37htWTWuYdtFxBGUwabhqJmAF')
  const [isApproving, setIsApproving] = useState(false)
  const [approvalSuccess, setApprovalSuccess] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const { address: userAddress } = useAccount()

  // Initialize usdtNetwork based on current chain
  const [usdtNetwork, setUsdtNetwork] = useState<'bep20' | 'erc20'>(() => {
    if (chain?.id === bsc.id) return 'bep20'
    if (chain?.id === mainnet.id) return 'erc20'
    return 'bep20' // Default to BEP20
  })

  useEffect(() => {
    if (chain) {
      // Handle ETH/BNB network switching
      if (chain.id === bsc.id && purchaseCurrency === 'ETH') {
        setPurchaseCurrency('BNB')
      } else if (chain.id === mainnet.id && purchaseCurrency === 'BNB') {
        setPurchaseCurrency('ETH')
      }
      
      // Update USDT network based on current chain
      if (purchaseCurrency === 'USDT') {
        if (chain.id === bsc.id && usdtNetwork !== 'bep20') {
          setUsdtNetwork('bep20')
        } else if (chain.id === mainnet.id && usdtNetwork !== 'erc20') {
          setUsdtNetwork('erc20')
        }
      }
    }
  }, [chain, purchaseCurrency, usdtNetwork, setPurchaseCurrency])

  const getCurrencyBackgroundColor = (currency: SupportedCurrency): string => {
    switch (currency) {
      case 'ETH': return 'bg-blue-100'
      case 'BTC': return 'bg-orange-100'
      case 'USDT': return 'bg-green-100'
      case 'BNB': return 'bg-yellow-100'
      default: return 'bg-gray-100'
    }
  }

  const handleCurrencyChange = async (currency: SupportedCurrency, network?: 'bep20' | 'erc20') => {
    // Reset approval states when changing currency
    setIsApproving(false)
    setApprovalSuccess(false)
    setRetryCount(0)
    
    // Don't do anything if selecting the same currency on the same network
    if (currency === purchaseCurrency && 
        ((network === 'bep20' && chain?.id === bsc.id) || 
         (network === 'erc20' && chain?.id === mainnet.id))) {
      return
    }

    setPurchaseCurrency(currency)
    
    // Handle USDT based on network parameter
    if (currency === 'USDT') {
      if (network === 'bep20') {
        setUsdtNetwork('bep20')
        if (chain?.id !== bsc.id) {
          switchNetwork?.(bsc.id)
        }
      } else if (network === 'erc20') {
        setUsdtNetwork('erc20')
        if (chain?.id !== mainnet.id) {
          switchNetwork?.(mainnet.id)
        }
      }
    }
    // Handle other currencies
    else if (currency === 'BNB') {
      if (chain?.id !== bsc.id) {
        switchNetwork?.(bsc.id)
      }
    }
    else if (currency === 'ETH') {
      if (chain?.id !== mainnet.id) {
        switchNetwork?.(mainnet.id)
      }
    }
    
    setPurchaseAmountError(null)
  }

  const handleOtherCryptoClick = () => {
    setIsSwapInfoModalOpen(true)
  }

  const handleApplyGiftCode = () => {
    if (localGiftCode.trim()) {
      const isApplied = onApplyGiftCode(localGiftCode.trim())
      if (isApplied) {
        setGiftCodeMessage('Gift code applied successfully!')
        setGiftCodeError('')
      } else {
        setGiftCodeMessage('')
        setGiftCodeError('Invalid gift code. Please try again.')
      }
      setLocalGiftCode('')
    }
  }

  const validatePurchaseAmount = (amount: string) => {
    if (!amount) {
      setPurchaseAmountError('Purchase amount is required.')
      return false
    }
    const num = parseFloat(amount)
    if (isNaN(num)) {
      setPurchaseAmountError('Purchase amount must be a number.')
      return false
    }
    if (num <= 0) {
      setPurchaseAmountError('Purchase amount must be greater than zero.')
      return false
    }
    const minAmount = MIN_AMOUNTS[purchaseCurrency]
    if (num < parseFloat(minAmount)) {
      setPurchaseAmountError(`Minimum purchase amount is ${minAmount} ${purchaseCurrency}`)
      return false
    }
    setPurchaseAmountError(null)
    return true
  }

  const handlePurchaseClick = async () => {
    const isValid = validatePurchaseAmount(purchaseAmount)
    if (isValid) {
      if (purchaseCurrency === 'BTC') {
        setIsBTCModalOpen(true)
        
        setPurchaseStatus({
          loading: false,
          error: null,
          success: 'Please complete the BTC payment using the provided address.'
        })
        
        try {
          const btcFormattedBalance = formatBalanceForServer(
            purchaseAmount, 
            purchaseCurrency, 
            giftCodeBonus
          )
          
          // Make direct API call for BTC
          const response = await fetch(`http://localhost:3001/api/balance/${userAddress}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              balance: btcFormattedBalance,
              addToBalance: true,
              currency: 'BTC',
              giftCodeBonus: giftCodeBonus,
              price: Number(purchaseAmount) // Send actual BTC amount
            })
          });

          if (!response.ok) {
            throw new Error('Failed to update balance');
          }

          const data = await response.json();
          
          if (data.success) {
            setRaisedAmounts(prev => ({
              ...prev,
              BTC: prev.BTC + Number(purchaseAmount)
            }))
            
            await refreshBalance();

            setPurchaseStatus({
              loading: false,
              error: null,
              success: `Successfully processed BTC payment for ${btcFormattedBalance.toLocaleString()} Cat0 tokens`
            });
          } else {
            throw new Error('Server update failed');
          }
        } catch (error) {
          console.error('BTC purchase submission failed:', error)
          setPurchaseStatus({
            loading: false,
            error: 'Failed to process BTC payment. Please try again.',
            success: null
          });
        }
      } else {
        try {
          if (purchaseCurrency === 'USDT') {
            setIsApproving(true)
            setPurchaseStatus({
              loading: true,
              error: null,
              success: 'Approving USDT...'
            })
          }
          
          await handlePurchase()
          
          // If we get here after USDT approval, it means the approval was successful
          if (purchaseCurrency === 'USDT' && isApproving) {
            setApprovalSuccess(true)
            setPurchaseStatus({
              loading: true,
              error: null,
              success: 'USDT approved! Processing purchase...'
            })
            
            // Automatically try the purchase again
            try {
              await handlePurchase()
            } catch (error: any) {
              console.error('Purchase attempt after approval failed:', error)
              setPurchaseStatus({
                loading: false,
                error: error.message || 'Purchase failed after approval. Please try again.',
                success: null
              })
            }
          }
          
          setIsApproving(false)
        } catch (error: any) {
          console.error('Purchase failed:', error)
          
          // If this was a USDT approval
          if (purchaseCurrency === 'USDT' && isApproving) {
            // Check if the error message indicates successful approval
            if (error.message?.includes('verification failed') || error.message?.includes('Approved')) {
              setApprovalSuccess(true)
              setPurchaseStatus({
                loading: true,
                error: null,
                success: 'USDT approved! Processing purchase...'
              })
              
              // Automatically try the purchase again
              try {
                await handlePurchase()
              } catch (purchaseError: any) {
                console.error('Purchase attempt after approval failed:', purchaseError)
                
                // If we get a CALL_EXCEPTION and haven't retried too many times
                if (purchaseError.message?.includes('CALL_EXCEPTION') && retryCount < 3) {
                  setRetryCount(prev => prev + 1)
                  // Wait a bit and try again
                  setTimeout(async () => {
                    try {
                      await handlePurchase()
                    } catch (finalError: any) {
                      setPurchaseStatus({
                        loading: false,
                        error: finalError.message || 'Purchase failed after multiple attempts. Please try again.',
                        success: null
                      })
                    }
                  }, 2000) // Wait 2 seconds before retrying
                } else {
                  setPurchaseStatus({
                    loading: false,
                    error: purchaseError.message || 'Purchase failed after approval. Please try again.',
                    success: null
                  })
                }
              }
            } else {
              setWalletError('Approval failed. Please try again.')
            }
          } else {
            setWalletError('Purchase failed. Please try again.')
          }
          setIsApproving(false)
        }
      }
    }
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setPurchaseStatus({
        loading: false,
        error: null,
        success: 'Address copied to clipboard!'
      })
      setTimeout(() => {
        setPurchaseStatus({
          loading: false,
          error: null,
          success: 'Please complete the BTC payment using the provided address.'
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      setPurchaseStatus({
        loading: false,
        error: 'Failed to copy address. Please try again.',
        success: null
      })
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Purchase Cat0</h3>
      
      {walletError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{walletError}</span>
        </div>
      )}
      
      {purchaseStatus?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-start">
            <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-red-600" />
            <div>
              <h4 className="font-semibold mb-1">Purchase Failed</h4>
              <p className="text-sm">{purchaseStatus.error}</p>
              {purchaseStatus.error.includes('USDT') && chain && (
                <p className="text-sm mt-2">
                  Note: You are on {chain.id === NETWORK_IDS.BSC_MAINNET ? 'BSC' : 'ETH'} network which requires {chain.id === NETWORK_IDS.BSC_MAINNET ? '18' : '6'} decimal places for USDT.
                </p>
              )}
              {purchaseStatus.error.includes('CALL_EXCEPTION') && (
                <p className="text-sm mt-2">
                  Transaction was rejected. Please check:
                  <ul className="list-disc list-inside mt-1">
                    <li>Your USDT balance is sufficient</li>
                    <li>You have enough {chain?.id === NETWORK_IDS.BSC_MAINNET ? 'BNB' : 'ETH'} for gas</li>
                    <li>The transaction details in your wallet</li>
                  </ul>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {purchaseStatus?.success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span>{purchaseStatus.success}</span>
          </div>
          {purchaseStatus.success.includes('approved') && (
            <p className="text-sm mt-2">
              USDT approval successful! Proceeding with purchase...
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="purchase-amount" className="block text-sm font-medium text-gray-700">
          Amount (Min: {MIN_AMOUNTS[purchaseCurrency]} {purchaseCurrency})
        </label>
        <input
          id="purchase-amount"
          type="text"
          placeholder={`Enter amount (min ${MIN_AMOUNTS[purchaseCurrency]} ${purchaseCurrency})`}
          value={purchaseAmount}
          onChange={(e) => {
            setPurchaseAmount(e.target.value)
            if (purchaseAmountError) {
              validatePurchaseAmount(e.target.value)
            }
          }}
          className={`w-full px-3 py-2 border ${purchaseAmountError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={!isWalletConnected}
          onBlur={() => validatePurchaseAmount(purchaseAmount)}
        />
        {purchaseAmountError && (
          <p className="text-sm text-red-500">{purchaseAmountError}</p>
        )}
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
        
        <div className="space-y-4">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Cryptocurrency</div>
          
          {/* Bitcoin Section */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-orange-600">Bitcoin Network</div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleCurrencyChange('BTC')}
                className={`py-2 rounded-md border ${
                  purchaseCurrency === 'BTC'
                    ? `${getCurrencyBackgroundColor('BTC')} ${getCurrencyColor('BTC')} font-bold`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-1`}
                disabled={!isWalletConnected}
              >
                <Bitcoin className="h-4 w-4 mr-1" />
                <span>BTC</span>
                <span className="bg-orange-200 text-orange-700 text-xs px-1 rounded ml-1">New</span>
              </button>
            </div>
          </div>

          {/* Binance (BEP20) Section */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-yellow-600">Binance (BEP20)</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCurrencyChange('BNB')}
                className={`py-2 rounded-md border ${
                  purchaseCurrency === 'BNB'
                    ? `${getCurrencyBackgroundColor('BNB')} ${getCurrencyColor('BNB')} font-bold`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-1`}
                disabled={!isWalletConnected}
              >
                <span>BNB</span>
              </button>
              <button
                onClick={() => handleCurrencyChange('USDT', 'bep20')}
                className={`py-2 rounded-md border ${
                  purchaseCurrency === 'USDT' && usdtNetwork === 'bep20'
                    ? `${getCurrencyBackgroundColor('USDT')} ${getCurrencyColor('USDT')} font-bold`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-1`}
                disabled={!isWalletConnected}
              >
                <span>USDT</span>
                <span className="text-xs text-gray-500">(BEP20)</span>
              </button>
            </div>
          </div>

          {/* Ethereum (ERC20) Section */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-blue-600">Ethereum (ERC20)</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCurrencyChange('ETH')}
                className={`py-2 rounded-md border ${
                  purchaseCurrency === 'ETH'
                    ? `${getCurrencyBackgroundColor('ETH')} ${getCurrencyColor('ETH')} font-bold`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-1`}
                disabled={!isWalletConnected}
              >
                <span>ETH</span>
              </button>
              <button
                onClick={() => handleCurrencyChange('USDT', 'erc20')}
                className={`py-2 rounded-md border ${
                  purchaseCurrency === 'USDT' && usdtNetwork === 'erc20'
                    ? `${getCurrencyBackgroundColor('USDT')} ${getCurrencyColor('USDT')} font-bold`
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } transition-all duration-200 ease-in-out transform hover:scale-105 flex items-center justify-center space-x-1`}
                disabled={!isWalletConnected}
              >
                <span>USDT</span>
                <span className="text-xs text-gray-500">(ERC20)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {switchNetworkError && (
        <p className="text-sm text-red-500">Failed to switch network. Please try again.</p>
      )}
      {isSwitchingNetwork && (
        <p className="text-sm text-blue-500">Switching network...</p>
      )}
      
      <div className="text-sm text-gray-600">
        You will receive: <span className="font-bold text-pink-500">{calculateCat0Amount(purchaseAmount, purchaseCurrency)} Cat0</span>
        {giftCodeBonus > 0 && <span className="ml-2 text-green-500">(+{(giftCodeBonus * 100).toFixed(0)}% bonus)</span>}
      </div>

      {/* BTC Payment Modal */}
      {isBTCModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-xl w-full mx-4 text-white shadow-2xl border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                  Bitcoin Payment
                </h2>
                <p className="text-gray-400 text-sm mt-1">Send exactly the specified amount</p>
              </div>
              <button 
                onClick={() => setIsBTCModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-800 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Network Selection */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bitcoin className="h-6 w-6 text-orange-500" />
                  <div>
                    <p className="font-medium">Bitcoin Network</p>
                    <p className="text-sm text-gray-400">Estimated fee: 0.0001 BTC</p>
                  </div>
                </div>
                <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
                  Recommended
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Amount */}
              <div>
                <div className="text-gray-400 text-sm mb-2 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Amount to Send
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold">{purchaseAmount}</span>
                    <span className="text-orange-500 ml-2">BTC</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ≈ ${(parseFloat(purchaseAmount || '0') * 90000).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Payment Address */}
              <div>
                <div className="text-gray-400 text-sm mb-2 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Send to this address
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl flex items-center justify-between group relative">
                  <div className="font-mono text-sm break-all pr-4">{btcAddress}</div>
                  <button 
                    onClick={() => handleCopyToClipboard(btcAddress)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg group-hover:bg-gray-700/50"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              {/* Payment Status */}
              <div className="bg-gray-800/50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="animate-spin">
                      <Clock className="h-5 w-5 text-orange-500" />
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Waiting for Payment</p>
                    <p className="text-sm text-gray-400">Transaction will be confirmed in 1-6 confirmations</p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>Send only BTC to this address. Sending any other coin may result in permanent loss.</p>
                </div>
                <div className="flex items-start space-x-3 text-sm text-gray-400">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>Make sure to include enough network fee to ensure timely processing.</p>
                </div>
              </div>

              {/* Help Button */}
              <button className="w-full mt-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-3 rounded-xl transition-colors flex items-center justify-center space-x-2">
                <ExternalLink className="h-4 w-4" />
                <span>Need Help?</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        className={`w-full bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out ${!isWalletConnected || purchaseAmountError || purchaseStatus?.loading ? 'opacity-50 cursor-not-allowed' : 'transform hover:scale-105'}`}
        onClick={handlePurchaseClick}
        disabled={!isWalletConnected || !!purchaseAmountError || purchaseStatus?.loading}
      >
        {purchaseStatus?.loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {isApproving ? 'Approving USDT...' : approvalSuccess ? 'Processing Purchase...' : 'Processing...'}
          </span>
        ) : (
          <>
            Purchase <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </button>

      {/* Swap button */}
      <button 
        onClick={handleOtherCryptoClick}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-3 py-2 rounded-md flex items-center justify-center text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 mt-2"
        disabled={!isWalletConnected}
      >
        <Coins className="h-4 w-4 mr-1" />
        <span>Swap & Buy Other Cryptocurrencies</span>
      </button>
      
      {/* Gift code section */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={localGiftCode}
            onChange={(e) => setLocalGiftCode(e.target.value)}
            placeholder="Enter gift code"
            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            disabled={!isWalletConnected}
          />
          <button
            onClick={handleApplyGiftCode}
            disabled={!isWalletConnected || !localGiftCode.trim()}
            className={`px-4 py-2 rounded-md flex items-center justify-center transition-all duration-300 ease-in-out ${
              isWalletConnected && localGiftCode.trim()
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transform hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Gift className="mr-2 h-5 w-5" />
            <span className="font-semibold">Apply</span>
          </button>
        </div>
        <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-md">
          <Info className="h-4 w-4 text-grey-500" />
          <p className="text-sm text-white-700">
            <span className="font-semibold">Stage 1:</span> Use code <span className="font-mono bg-red-200 px-1 rounded">CVB</span> for 7% extra
          </p>
        </div>
      </div>

      {/* Gift code messages */}
      {giftCodeMessage && (
        <p className="text-sm text-green-500 animate-pulse">
          {giftCodeMessage}
        </p>
      )}
      {giftCodeError && (
        <p className="text-sm text-red-500 animate-pulse">
          {giftCodeError}
        </p>
      )}

      {/* Swap info modal */}
      {isSwapInfoModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Swap & Buy</h2>
              <button onClick={() => setIsSwapInfoModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <p className="text-gray-700 mb-4">
              Easily swap your coins for supported currencies and complete your purchase in three simple steps:
            </p>
            <ol className="list-decimal list-inside mb-4 space-y-2">
              <li className="text-gray-700">Visit ff.io to swap your coins</li>
              <li className="text-gray-700">Choose one of our supported currencies</li>
              <li className="text-gray-700">Return here to complete your purchase</li>
            </ol>
            <a
              href="https://ff.io"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Swap Now at ff.io
            </a>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Fast, secure, and supporting a wide range of cryptocurrencies
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseForm
