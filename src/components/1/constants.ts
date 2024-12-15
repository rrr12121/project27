import { ExchangeRateRecord, MinAmountRecord, NetworkConfig, ContractAddressRecord } from './types'

// Network IDs
export const NETWORK_IDS = {
    ETH_MAINNET: 1,
    BSC_MAINNET: 56
}

// Contract addresses per network
export const CONTRACT_ADDRESSES: ContractAddressRecord = {
    [NETWORK_IDS.ETH_MAINNET]: {
        PRESALE: '0x48F12ae315Dd637725Fe463a1aba4EAF74272bb3', // CATPresale on Ethereum
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',    // USDT on Ethereum
    },
    [NETWORK_IDS.BSC_MAINNET]: {
        PRESALE: '0x1600a96476b62Ca12Bf7B6c88E389cB61198c524', // CATPresale on BSC
        USDT: '0x55d398326f99059ff775485246999027b3197955',    // Binance-Peg BSC-USD (BSC-USD) with 18 decimals
    }
}

// Network RPC URLs
export const RPC_URLS = {
    [NETWORK_IDS.ETH_MAINNET]: 'https://mainnet.infura.io/v3/your-infura-id',
    [NETWORK_IDS.BSC_MAINNET]: 'https://bsc-dataseed.binance.org'
}

// Network Names
export const NETWORK_NAMES = {
    [NETWORK_IDS.ETH_MAINNET]: 'Ethereum Mainnet',
    [NETWORK_IDS.BSC_MAINNET]: 'Binance Smart Chain'
}

// Network Configurations
export const NETWORK_CONFIG: Record<number, NetworkConfig> = {
    [NETWORK_IDS.ETH_MAINNET]: {
        chainId: NETWORK_IDS.ETH_MAINNET,
        name: 'Ethereum Mainnet',
        rpcUrl: RPC_URLS[NETWORK_IDS.ETH_MAINNET],
        tokenDecimals: {
            USDT: 6
        },
        gasLimits: {
            ETH: 65000,
            TOKEN: 85000,
            APPROVE: 46000
        }
    },
    [NETWORK_IDS.BSC_MAINNET]: {
        chainId: NETWORK_IDS.BSC_MAINNET,
        name: 'Binance Smart Chain',
        rpcUrl: RPC_URLS[NETWORK_IDS.BSC_MAINNET],
        tokenDecimals: {
            USDT: 18
        },
        gasLimits: {
            BNB: 65000,
            TOKEN: 85000,
            APPROVE: 100000 // Higher gas limit for BSC USDT approvals
        }
    }
}

// Exchange rates (price per CAT0 token)
export const EXCHANGE_RATES: ExchangeRateRecord = {
    ETH: 0.00000333333,    // 1 CAT0 = 0.00000333333 ETH (at $3000 ETH price, makes 1 CAT0 = $0.01)
    USDT: 0.01,            // 1 CAT0 = 0.01 USDT ($0.01)
    BNB: 0.0000166667,     // 1 CAT0 = 0.0000166667 BNB (at $300 BNB price, makes 1 CAT0 = $0.01)
    BTC: 0.00000011111     // 1 CAT0 = 0.00000011111 BTC (at $90k BTC price, makes 1 CAT0 = $0.01)
}

// Minimum purchase amounts
export const MIN_AMOUNTS: MinAmountRecord = {
    ETH: '0.01',     // 0.01 ETH minimum
    USDT: '1',       // 1 USDT minimum
    BNB: '0.01',     // 0.01 BNB minimum
    BTC: '0.0001'    // 0.0001 BTC minimum
}

// Maximum purchase amounts
export const MAX_AMOUNTS: MinAmountRecord = {
    ETH: '100',      // 100 ETH maximum
    USDT: '100000',  // 100,000 USDT maximum
    BNB: '100',      // 100 BNB maximum
    BTC: '1'         // 1 BTC maximum
}

// Smart contract constants (matching the Solidity contract)
export const MIN_ETH_PURCHASE = '10000000000000000'    // 0.01 ETH in wei
export const MAX_ETH_PURCHASE = '100000000000000000000' // 100 ETH in wei

// Token decimals per network
export const TOKEN_DECIMALS = {
    [NETWORK_IDS.ETH_MAINNET]: {
        USDT: 6
    },
    [NETWORK_IDS.BSC_MAINNET]: {
        USDT: 18  // BSC-USD uses 18 decimals
    }
}

// Gas limits per network
export const GAS_LIMITS = {
    [NETWORK_IDS.ETH_MAINNET]: {
        ETH: 65000,
        TOKEN: 85000,
        APPROVE: 46000
    },
    [NETWORK_IDS.BSC_MAINNET]: {
        BNB: 65000,
        TOKEN: 85000,
        APPROVE: 100000 // Higher gas limit for BSC USDT approvals
    }
}

// USDT-specific constants
export const USDT_CONFIG = {
    [NETWORK_IDS.ETH_MAINNET]: {
        decimals: 6,
        minAmount: '1000000',      // 1 USDT with 6 decimals (1 * 10**6)
        maxAmount: '100000000000', // 100,000 USDT with 6 decimals (100,000 * 10**6)
        gasLimit: 46000,
        tokenName: 'USDT'
    },
    [NETWORK_IDS.BSC_MAINNET]: {
        decimals: 18,
        minAmount: '1000000000000000000',      // 1 BSC-USD with 18 decimals
        maxAmount: '100000000000000000000000', // 100,000 BSC-USD with 18 decimals
        gasLimit: 100000,
        tokenName: 'BSC-USD'
    }
}

// Contract contribution amounts
export const CONTRACT_AMOUNTS = {
    MIN_STABLE_ETH: '1000000',           // 1 USDT with 6 decimals (1 * 10**6)
    MAX_STABLE_ETH: '100000000000',      // 100,000 USDT with 6 decimals (100,000 * 10**6)
    MIN_STABLE_BSC: '1000000000000000000',      // 1 USDT with 18 decimals
    MAX_STABLE_BSC: '100000000000000000000000'  // 100,000 USDT with 18 decimals
}

// Other constants
export const MAX_POWER_LEVEL = 10
export const POWER_UP_COST_BASE = 5000
export const LOOT_BOX_COST = 5000
export const JACKPOT_CHANCE = 0.001 // 0.1% chance to win the jackpot
