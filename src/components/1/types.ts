export type VipStatus = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

export type LootBoxReward = {
    type: 'giftcode';
    code: string;
} | {
    type: 'powerup';
    level: number;
} | {
    type: 'tokens';
    amount: number;
} | {
    type: 'jackpot';
    amount: number;
} | {
    type: 'none';
}

export type PurchaseResult = {
    success: true;
    hash: string;
    tokensReceived: string;
    approvalStatus?: {
        approved: boolean;
        error?: string;
    };
} | {
    success: false;
    error: string;
    approvalStatus?: {
        approved: boolean;
        error?: string;
    };
}

export type ClaimResult = {
    success: true;
    hash: string;
    amountClaimed: string;
} | {
    success: false;
    error: string;
}

export type ClaimingStatus = {
    isClaimingActive: boolean;
    hasUserClaimed: boolean;
    claimableAmount: string;
}

export interface BalanceContextType {
    balance: number;
    updateBalance: (newBalance: number, addToBalance?: boolean, isReward?: boolean) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    refreshBalance: () => Promise<void>;
}

export interface UserInfoProps {
    accountBalance: number;
    vipStatus: VipStatus;
    isLoading?: boolean;
    error?: string | null;
    claimingStatus?: ClaimingStatus;
    onClaimTokens?: () => Promise<void>;
}

export type SupportedCurrency = 'ETH' | 'USDT' | 'BNB' | 'BTC';

export type USDTNetwork = 'bep20' | 'erc20';

export interface PurchaseStatus {
    loading: boolean;
    error: string | null;
    success: string | null;
    isApproving?: boolean;
    approvalSuccess?: boolean;
}

export interface NetworkConfig {
    chainId: number;
    name: string;
    rpcUrl: string;
    tokenDecimals: {
        USDT: number;
    };
    gasLimits: {
        ETH?: number;
        BNB?: number;
        TOKEN: number;
        APPROVE: number;
    };
}

export interface ContractAddresses {
    PRESALE: string;
    USDT: string;
}

export type ContractAddressRecord = Record<number, ContractAddresses>;

export interface USDTConfig {
    decimals: number;
    minAmount: string;    // Amount in network-specific decimals (6 for ETH, 18 for BSC)
    maxAmount: string;    // Amount in network-specific decimals (6 for ETH, 18 for BSC)
    gasLimit: number;
    tokenName: string;    // Network-specific token name (USDT vs BSC-USD)
}

export type USDTConfigRecord = Record<number, USDTConfig>;

export interface ContractAmounts {
    MIN_STABLE_ETH: string;    // 1 USDT with 6 decimals
    MAX_STABLE_ETH: string;    // 100,000 USDT with 6 decimals
    MIN_STABLE_BSC: string;    // 1 USDT with 18 decimals
    MAX_STABLE_BSC: string;    // 100,000 USDT with 18 decimals
}

export type ExchangeRateRecord = Record<SupportedCurrency, number>;
export type MinAmountRecord = Record<SupportedCurrency, string>;

export interface PurchaseFormProps {
    purchaseAmount: string;
    setPurchaseAmount: (amount: string) => void;
    purchaseCurrency: SupportedCurrency;
    setPurchaseCurrency: React.Dispatch<React.SetStateAction<SupportedCurrency>>;
    handlePurchase: () => Promise<void>;
    isWalletConnected: boolean;
    onApplyGiftCode: (code: string) => boolean;
    giftCodeBonus: number;
    giftCode: string;
    purchaseStatus: PurchaseStatus;
    setPurchaseStatus: (status: PurchaseStatus) => void;
    setRaisedAmounts: React.Dispatch<React.SetStateAction<Record<SupportedCurrency, number>>>;
    refreshBalance: () => Promise<void>;
}

export interface RewardsSectionProps {
    rewardsEarned: number;
    setRewardsEarned: React.Dispatch<React.SetStateAction<number>>;
    powerLevel: number;
    setPowerLevel: React.Dispatch<React.SetStateAction<number>>;
    multiplier: number;
    setMultiplier: React.Dispatch<React.SetStateAction<number>>;
    bonusChance: number;
    setBonusChance: React.Dispatch<React.SetStateAction<number>>;
    cooldownProgress: number;
    claimRewards: () => Promise<void>;
    powerUp: () => Promise<void>;
    isWalletConnected: boolean;
    updateAccountBalance: (newBalance: number, addToBalance?: boolean, isReward?: boolean) => Promise<void>;
    address: string;
    fetchPowerLevel: () => Promise<void>;
}

export interface LootBoxSectionProps {
    lootBoxes: number;
    jackpotAmount: number;
    isOpeningLootBox: boolean;
    lootBoxReward: LootBoxReward | null;
    openLootBox: () => Promise<void>;
    accountBalance: number;
    isWalletConnected: boolean;
    onLearnMore: () => void;
}

export interface NavigationBarProps {
    activePage: 'home' | 'news' | 'staking' | '7aicat';
    setActivePage: (page: 'home' | 'news' | 'staking' | '7aicat') => void;
}

export interface Stage {
    id: number;
    price: number;
    tokens: number;
    raised: number;
    bonus: number;
    threshold: number;
}
