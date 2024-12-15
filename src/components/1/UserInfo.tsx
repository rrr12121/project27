import React from 'react'
import { EXCHANGE_RATES } from './constants'
import { getVipStatusColor } from './utils'
import { UserInfoProps } from './types'
import ConnectWalletButton from '../ConnectWalletButton'
import { AlertCircle, Gift } from 'lucide-react'

const UserInfo: React.FC<UserInfoProps> = ({ 
  accountBalance, 
  vipStatus, 
  isLoading = false, 
  error = null,
  claimingStatus,
  onClaimTokens
}) => {
  // Calculate USDT value with proper formatting and validation
  const usdtValue = React.useMemo(() => {
    const calculated = (accountBalance * EXCHANGE_RATES.USDT)
    return isNaN(calculated) ? '0.00' : calculated.toFixed(2)
  }, [accountBalance])

  const formattedUsdtValue = React.useMemo(() => 
    parseFloat(usdtValue).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: 'decimal'
    })
  , [usdtValue])

  const formattedBalance = React.useMemo(() => 
    Math.floor(accountBalance).toLocaleString('en-US')
  , [accountBalance])

  const formattedClaimableAmount = React.useMemo(() => {
    if (!claimingStatus?.claimableAmount) return '0'
    const amount = parseFloat(claimingStatus.claimableAmount)
    return Math.floor(amount).toLocaleString('en-US')
  }, [claimingStatus?.claimableAmount])

  return (
    <div 
      className="bg-gray-100 p-6 rounded-xl space-y-4 shadow-sm transition-all duration-300 hover:shadow-md"
      role="region"
      aria-label="User Balance Information"
    >
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
          Your Cat0 Balance 
          <span className="animate-pulse">✨</span>
        </h3>

        {isLoading ? (
          <div className="space-y-3" role="status" aria-label="Loading balance information">
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
              <div className="h-6 bg-gray-200 rounded-lg w-48 mt-3"></div>
            </div>
          </div>
        ) : error ? (
          <div 
            className="flex items-center gap-2 text-red-500 p-3 bg-red-50 rounded-lg"
            role="alert"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        ) : (
          <>
            <div className="group">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 group-hover:scale-105 mb-4">
                {formattedBalance} Cat0
              </p>
              
              <div className="flex items-center">
                <div className="inline-flex items-center bg-[#E8F8F2] px-4 py-2 rounded-2xl">
                  <div className="flex items-baseline">
                    <span className="text-[#00B85D] font-bold text-lg tracking-tight">
                     = ${formattedUsdtValue}
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      USDT
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Claiming Section */}
            {claimingStatus && (
              <div className="mt-6 space-y-3">
                {claimingStatus.isClaimingActive && !claimingStatus.hasUserClaimed && parseFloat(claimingStatus.claimableAmount) > 0 && (
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-purple-600" />
                        <span className="font-semibold text-purple-800">Claimable Tokens</span>
                      </div>
                      <span className="text-lg font-bold text-purple-700">{formattedClaimableAmount} Cat0</span>
                    </div>
                    <button
                      onClick={onClaimTokens}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Claim Tokens
                    </button>
                  </div>
                )}
                {claimingStatus.isClaimingActive && claimingStatus.hasUserClaimed && (
                  <div className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Tokens successfully claimed!</span>
                  </div>
                )}
                {!claimingStatus.isClaimingActive && parseFloat(claimingStatus.claimableAmount) > 0 && (
                  <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Claiming phase not active yet. Please wait.</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col items-start space-y-3 pt-2">
        <div 
          className={`${getVipStatusColor(vipStatus)} text-white px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 shadow-sm hover:shadow-md`}
          role="status"
          aria-label={`VIP Status: ${vipStatus}`}
        >
          {vipStatus} VIP
        </div>

        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default React.memo(UserInfo)
