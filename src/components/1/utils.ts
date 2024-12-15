import { EXCHANGE_RATES, TOKEN_DECIMALS, NETWORK_IDS, CONTRACT_AMOUNTS } from './constants'
import { SupportedCurrency, VipStatus } from './types'
import { ethers } from 'ethers'

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export const calculateCat0Amount = (amount: string, currency: SupportedCurrency, chainId?: number): string => {
  const parsedAmount = parseFloat(amount)
  if (isNaN(parsedAmount)) return '0'
  
  if (currency === 'BNB') {
    // 1 BNB = 60,000 Cat0, so multiply by 60,000
    return Math.floor(parsedAmount * 60000).toString()
  }

  if (currency === 'USDT') {
    try {
      // Handle USDT based on network
      if (chainId === NETWORK_IDS.BSC_MAINNET) {
        // BSC USDT (18 decimals)
        const usdtAmount = ethers.utils.parseUnits(amount, 18)
        const result = ethers.utils.formatUnits(usdtAmount.mul(100), 18)
        return Math.floor(parseFloat(result)).toString()
      } else if (chainId === NETWORK_IDS.ETH_MAINNET) {
        // ETH USDT (6 decimals)
        const usdtAmount = ethers.utils.parseUnits(amount, 6)
        const result = ethers.utils.formatUnits(usdtAmount.mul(100), 6)
        return Math.floor(parseFloat(result)).toString()
      }
    } catch (error) {
      console.error('Error calculating USDT amount:', error)
      return '0'
    }
  }
  
  // For other currencies, ensure whole numbers
  const result = Math.floor(parsedAmount / EXCHANGE_RATES[currency]).toString()
  return result
}

export const getCurrencyColor = (currency: SupportedCurrency): string => {
  switch (currency) {
    case 'ETH': return 'text-blue-500'
    case 'BTC': return 'text-orange-500'
    case 'USDT': return 'text-green-500'
    case 'BNB': return 'text-yellow-500'
    default: return 'text-gray-500'
  }
}

export const getPowerLevelColor = (powerLevel: number): string => {
  const colors = [
    'bg-yellow-500 hover:bg-yellow-600',
    'bg-yellow-600 hover:bg-yellow-700',
    'bg-orange-500 hover:bg-orange-600',
    'bg-orange-600 hover:bg-orange-700',
    'bg-purple-400 hover:bg-purple-500',
    'bg-purple-500 hover:bg-purple-600',
    'bg-purple-600 hover:bg-purple-700',
    'bg-red-500 hover:bg-red-600',
    'bg-red-600 hover:bg-red-700',
    'bg-red-700 hover:bg-red-800',
  ]
  
  const index = Math.min(powerLevel - 1, colors.length - 1)
  return colors[index]
}

export const getVipStatusColor = (vipStatus: VipStatus): string => {
  switch (vipStatus) {
    case 'Bronze': return 'bg-amber-600'
    case 'Silver': return 'bg-gray-400'
    case 'Gold': return 'bg-yellow-400'
    case 'Platinum': return 'bg-blue-400'
    case 'Diamond': return 'bg-purple-400'
    default: return 'bg-gray-500'
  }
}

// Helper function to validate currency
export const isSupportedCurrency = (currency: string): currency is SupportedCurrency => {
  return ['ETH', 'BTC', 'USDT', 'BNB'].includes(currency)
}

// Helper function to format balance with appropriate decimals
export const formatBalance = (balance: number, currency: SupportedCurrency, chainId?: number): string => {
  switch (currency) {
    case 'ETH':
    case 'BNB':
      return balance.toFixed(18) // Always use 18 decimals for ETH/BNB
    case 'BTC':
      return balance.toFixed(8) // Bitcoin typically uses 8 decimal places
    case 'USDT':
      // Use network-specific decimals for USDT
      if (chainId === NETWORK_IDS.BSC_MAINNET) {
        return balance.toFixed(18) // BSC USDT uses 18 decimals
      }
      return balance.toFixed(6) // ETH USDT uses 6 decimals
    default:
      return balance.toString()
  }
}

// Helper function to get minimum amount for a currency
export const getMinAmount = (currency: SupportedCurrency, chainId?: number): string => {
  switch (currency) {
    case 'ETH':
      return '0.01'
    case 'BNB':
      return '0.01'
    case 'BTC':
      return '0.0001'
    case 'USDT':
      if (chainId === NETWORK_IDS.BSC_MAINNET) {
        return '1' // 1 USDT on BSC
      }
      return '1' // 1 USDT on ETH
    default:
      return '0'
  }
}

// Helper function to validate amount against currency limits
export const isValidAmount = (amount: string, currency: SupportedCurrency, chainId?: number): boolean => {
  try {
    const parsedAmount = ethers.utils.parseUnits(
      amount,
      currency === 'USDT' ? getUSDTDecimals(chainId || NETWORK_IDS.ETH_MAINNET) : 18
    )

    let minAmount, maxAmount
    
    if (currency === 'USDT') {
      if (chainId === NETWORK_IDS.BSC_MAINNET) {
        minAmount = ethers.BigNumber.from(CONTRACT_AMOUNTS.MIN_STABLE_BSC)
        maxAmount = ethers.BigNumber.from(CONTRACT_AMOUNTS.MAX_STABLE_BSC)
      } else {
        minAmount = ethers.BigNumber.from(CONTRACT_AMOUNTS.MIN_STABLE_ETH)
        maxAmount = ethers.BigNumber.from(CONTRACT_AMOUNTS.MAX_STABLE_ETH)
      }
    } else if (currency === 'ETH' || currency === 'BNB') {
      minAmount = ethers.utils.parseEther('0.01')
      maxAmount = ethers.utils.parseEther('100')
    } else {
      return parseFloat(amount) >= parseFloat(getMinAmount(currency))
    }

    return parsedAmount.gte(minAmount) && parsedAmount.lte(maxAmount)
  } catch (error) {
    console.error('Error validating amount:', error)
    return false
  }
}

// Helper function to format balance for server updates
export const formatBalanceForServer = (amount: string, currency: SupportedCurrency, giftCodeBonus: number = 0, chainId?: number): number => {
  const calculatedAmount = calculateCat0Amount(amount, currency, chainId)
  // Parse the calculated amount and ensure it's a valid number
  const parsedAmount = parseFloat(calculatedAmount)
  if (isNaN(parsedAmount)) {
    throw new Error('Invalid amount calculation')
  }
  // Apply gift code bonus if present and return whole number
  const bonusMultiplier = 1 + giftCodeBonus
  return Math.floor(parsedAmount * bonusMultiplier)
}

// Helper function to get network name
export const getNetworkName = (chainId: number): string => {
  switch (chainId) {
    case NETWORK_IDS.ETH_MAINNET:
      return 'Ethereum'
    case NETWORK_IDS.BSC_MAINNET:
      return 'BSC'
    default:
      return 'Unknown Network'
  }
}

// Helper function to get USDT decimals for network
export const getUSDTDecimals = (chainId: number): number => {
  return chainId === NETWORK_IDS.BSC_MAINNET ? 18 : 6
}

// Helper function to format USDT amount with proper decimals
export const formatUSDTAmount = (amount: string, chainId: number): string => {
  try {
    const decimals = getUSDTDecimals(chainId)
    const parsedAmount = ethers.utils.parseUnits(amount, decimals)
    return ethers.utils.formatUnits(parsedAmount, decimals)
  } catch (error) {
    console.error('Error formatting USDT amount:', error)
    return '0'
  }
}

// Helper function to validate USDT amount for network
export const validateUSDTAmount = (amount: string, chainId: number): boolean => {
  try {
    const decimals = getUSDTDecimals(chainId)
    const parsedAmount = ethers.utils.parseUnits(amount, decimals)
    
    // Use network-specific min/max amounts
    const minAmount = ethers.BigNumber.from(
      chainId === NETWORK_IDS.BSC_MAINNET ? CONTRACT_AMOUNTS.MIN_STABLE_BSC : CONTRACT_AMOUNTS.MIN_STABLE_ETH
    )
    const maxAmount = ethers.BigNumber.from(
      chainId === NETWORK_IDS.BSC_MAINNET ? CONTRACT_AMOUNTS.MAX_STABLE_BSC : CONTRACT_AMOUNTS.MAX_STABLE_ETH
    )

    return parsedAmount.gte(minAmount) && parsedAmount.lte(maxAmount)
  } catch (error) {
    console.error('Error validating USDT amount:', error)
    return false
  }
}
