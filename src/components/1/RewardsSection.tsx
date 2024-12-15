import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Zap, Clock, Timer } from 'lucide-react'
import { getPowerLevelColor } from './utils'
import { MAX_POWER_LEVEL } from './constants'
import { RainbowButton } from "../../components/ui/rainbow-button"
import { useBalance } from '../../context/BalanceContext'
import { useLootBox } from './hooks'

type RainbowButtonDemoProps = {
  onClick: () => void;
  disabled: boolean;
  isCoolingDown: boolean;
}

const RainbowButtonDemo: React.FC<RainbowButtonDemoProps> = ({ onClick, disabled, isCoolingDown }) => (
  <RainbowButton
    onClick={onClick}
    disabled={disabled}
    aria-label={isCoolingDown ? "Cooling down" : "Claim Rewards"}
  >
    {isCoolingDown ? (
      <>
        <Timer className="mr-2 h-4 w-4" aria-hidden="true" />
        <span>Cooling down</span>
      </>
    ) : (
      'Claim Rewards'
    )}
  </RainbowButton>
);

type MiningBlockProps = {
  delay: number;
  floatDuration?: number;
  glowDuration?: number;
  startY?: number;
  endY?: number;
  left?: number;
  maxOpacity?: number;
}

const MiningBlock: React.FC<MiningBlockProps> = React.memo(({
  delay,
  floatDuration = 30,
  glowDuration = 18,
  startY = 80,
  endY = -40,
  left = Math.random() * 80,
  maxOpacity = 0.8
}) => {
  const keyframes = useMemo(() => `
    @keyframes float${delay} {
      0% {
        transform: translateY(${startY}px) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: ${maxOpacity};
      }
      90% {
        opacity: ${maxOpacity};
      }
      100% {
        transform: translateY(${endY}px) rotate(90deg);
        opacity: 0;
      }
    }
  `, [delay, startY, endY, maxOpacity]);

  const style = useMemo(() => ({
    animation: `float${delay} ${floatDuration}s ease-in-out infinite ${delay}s, glow ${glowDuration}s ease-in-out infinite ${delay}s`,
    left: `${left}%`,
    opacity: maxOpacity
  }), [delay, floatDuration, glowDuration, left, maxOpacity]);

  return (
    <>
      <style>{keyframes}</style>
      <div className="mining-block" style={style} aria-hidden="true" />
    </>
  );
});

MiningBlock.displayName = 'MiningBlock';

type MiningProgressProps = {
  progress: number;
  onSpecialBlockFound: () => void;
}

const TOTAL_MINABLE_COINS = 100_000_000; // 100 million Cat0 coins
const MINED_COINS = 0; //
const MINING_STORAGE_KEY = 'mining_progress_state';
const MINING_START_TIME_KEY = 'mining_start_time';
const SPECIAL_BLOCK_INDEX_KEY = 'special_block_index';
const SPECIAL_BLOCK_MESSAGE_KEY = 'special_block_message';
const LAST_CLAIM_TIME_KEY = 'last_claim_time';
const CLAIM_COOLDOWN_MS = 50000; // 50 second cooldown between claims
const CLAIM_LOCK_KEY = 'claim_lock'; // New lock key for preventing double claims

const MiningProgress: React.FC<MiningProgressProps> = React.memo(({ progress, onSpecialBlockFound }) => {
  const gridSize = 20;
  const totalBlocks = gridSize * gridSize;
  const completedBlocks = Math.floor((progress / 100) * totalBlocks);
  const [specialBlockIndex, setSpecialBlockIndex] = useState<number | null>(() => {
    const savedIndex = localStorage.getItem(SPECIAL_BLOCK_INDEX_KEY);
    return savedIndex ? parseInt(savedIndex) : null;
  });
  const [specialBlockMessage, setSpecialBlockMessage] = useState<string>(() => {
    return localStorage.getItem(SPECIAL_BLOCK_MESSAGE_KEY) || '';
  });

  const generateSpecialBlockIndex = useCallback(() => {
    const minRow = Math.floor(gridSize * 0.2);
    const maxRow = Math.floor(gridSize * 0.8);
    const minCol = Math.floor(gridSize * 0.2);
    const maxCol = Math.floor(gridSize * 0.8);
    const row = minRow + Math.floor(Math.random() * (maxRow - minRow));
    const col = minCol + Math.floor(Math.random() * (maxCol - minCol));
    return row * gridSize + col;
  }, [gridSize]);

  useEffect(() => {
    if (progress === 0) {
      const newIndex = generateSpecialBlockIndex();
      setSpecialBlockIndex(newIndex);
      const message = 'A special Cat0-X block has appeared! Find it to earn 1 Cat0 coins.';
      setSpecialBlockMessage(message);
      localStorage.setItem(SPECIAL_BLOCK_INDEX_KEY, newIndex.toString());
      localStorage.setItem(SPECIAL_BLOCK_MESSAGE_KEY, message);
    }
  }, [progress, generateSpecialBlockIndex]);

  const getBlockColor = useCallback((index: number): string => {
    if (index === specialBlockIndex) {
      return 'bg-pink-500 special-block';
    }
    if (index > completedBlocks) return 'bg-gray-200';
    const colorProgress = (index / totalBlocks) * 100;
    if (colorProgress < 33) return 'bg-green-500';
    if (colorProgress < 66) return 'bg-yellow-500';
    return 'bg-orange-500';
  }, [completedBlocks, totalBlocks, specialBlockIndex]);

  const getBlockSize = useCallback((index: number): string => {
    if (index === specialBlockIndex) {
      return 'transform scale-110 z-10';
    }
    if (index % 37 === 0) return 'col-span-2 row-span-2';
    if (index % 23 === 0) return 'col-span-2';
    if (index % 17 === 0) return 'row-span-2';
    return '';
  }, [specialBlockIndex]);

  const getBlockContent = useCallback((index: number): string => {
    return index === specialBlockIndex ? '' : '';
  }, [specialBlockIndex]);

  useEffect(() => {
    if (specialBlockIndex !== null && completedBlocks >= specialBlockIndex) {
      onSpecialBlockFound();
      const message = 'You found the Cat0-X block! +10 Cat0 coins added to your rewards.';
      setSpecialBlockMessage(message);
      localStorage.setItem(SPECIAL_BLOCK_MESSAGE_KEY, message);
      setSpecialBlockIndex(null);
      localStorage.removeItem(SPECIAL_BLOCK_INDEX_KEY);
      setTimeout(() => {
        setSpecialBlockMessage('');
        localStorage.removeItem(SPECIAL_BLOCK_MESSAGE_KEY);
      }, 3000);
    }
  }, [completedBlocks, specialBlockIndex, onSpecialBlockFound]);

  const blocks = useMemo(() => (
    Array.from({ length: totalBlocks }).map((_, index) => (
      <div
        key={index}
        className={`${getBlockColor(index)} ${getBlockSize(index)} transition-all duration-300 rounded-sm flex items-center justify-center text-xs text-white relative`}
        style={{ minHeight: '8px' }}
        role="presentation"
      >
        {getBlockContent(index)}
      </div>
    ))
  ), [totalBlocks, getBlockColor, getBlockSize, getBlockContent]);

  return (
    <div className="mt-4 bg-gray-100 p-4 rounded-lg">
      <style>
        {`
          @keyframes special-block-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
              transform: scale(1.1);
            }
            50% {
              box-shadow: 0 0 0 10px rgba(236, 72, 153, 0);
              transform: scale(1.15);
            }
          }

          .special-block {
            animation: special-block-pulse 2s ease-in-out infinite;
            border: 2px solid rgba(255, 255, 255, 0.5);
            position: relative;
            z-index: 10;
          }

          .special-block::before {
            content: '';
            position: absolute;
            inset: -2px;
            background: radial-gradient(circle at center, rgba(236, 72, 153, 0.3), transparent 70%);
            border-radius: inherit;
            z-index: -1;
          }
        `}
      </style>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold text-gray-700">Mining Progress</h4>
        <div className="text-xs text-gray-600">
          Supply: {TOTAL_MINABLE_COINS.toLocaleString()} Cat0
        </div>
      </div>
      {specialBlockMessage && (
        <div className="mb-2 text-sm text-purple-600 font-medium">
          {specialBlockMessage}
        </div>
      )}
      <div
        className="grid grid-cols-20 gap-0.5 w-full aspect-square bg-gray-300 p-0.5 rounded"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {blocks}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress: {Math.floor(progress)}%</span>
          <span>{completedBlocks}/{totalBlocks} blocks mined</span>
        </div>
      </div>
    </div>
  );
});

MiningProgress.displayName = 'MiningProgress';

type RewardsSectionProps = {
  rewardsEarned: number;
  setRewardsEarned: React.Dispatch<React.SetStateAction<number>>;
  powerLevel: number;
  setPowerLevel: (level: number) => void;
  multiplier: number;
  setMultiplier: (multiplier: number) => void;
  bonusChance: number;
  setBonusChance: (callback: (prevChance: number) => number) => void;
  cooldownProgress: number;
  claimRewards: () => Promise<void>;
  powerUp: () => Promise<void>;
  isWalletConnected: boolean;
  updateAccountBalance: (newBalance: number, addToBalance?: boolean, isReward?: boolean) => Promise<void>;
  address: string;
  fetchPowerLevel: (address: string) => Promise<void>;
}

const RewardsSection: React.FC<RewardsSectionProps> = ({
  rewardsEarned,
  setRewardsEarned,
  powerLevel,
  setPowerLevel,
  multiplier,
  setMultiplier,
  bonusChance,
  setBonusChance,
  cooldownProgress,
  claimRewards,
  powerUp,
  isWalletConnected,
  updateAccountBalance,
  address,
  fetchPowerLevel
}) => {
  const { refreshBalance } = useBalance();
  const [hasClaimedRewards, setHasClaimedRewards] = useState(false);
  const [miningProgress, setMiningProgress] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem(MINING_STORAGE_KEY);
    const startTime = localStorage.getItem(MINING_START_TIME_KEY);

    if (savedState && startTime) {
      const elapsedTime = (Date.now() - parseInt(startTime)) / 1000; // Convert to seconds
      const progressPerSecond = Math.floor((0.02 * powerLevel * multiplier) / 2); // Divide by 2 because our interval is 500ms
      const calculatedProgress = Math.floor(parseFloat(savedState) + (elapsedTime * progressPerSecond));
      return Math.min(100, calculatedProgress);
    }
    return 0;
  });
  const [specialBlockFound, setSpecialBlockFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isCoolingDown = cooldownProgress < 100;
  const isAllBlocksMined = miningProgress >= 100;

  const { lootBoxes, jackpotAmount, isOpeningLootBox, lootBoxReward, purchaseLootBox, openLootBox } = useLootBox(
    rewardsEarned,
    updateAccountBalance,
    setPowerLevel,
    setMultiplier,
    setBonusChance,
    fetchPowerLevel
  );

  const canClaim = useCallback(() => {
    // Check if there's an active claim in progress
    const claimLock = localStorage.getItem(CLAIM_LOCK_KEY);
    if (claimLock) {
      const lockTime = parseInt(claimLock);
      // If the lock is older than 1 minute, clear it (prevents stuck locks)
      if (Date.now() - lockTime > 60000) {
        localStorage.removeItem(CLAIM_LOCK_KEY);
      } else {
        return false;
      }
    }

    const lastClaimTime = localStorage.getItem(LAST_CLAIM_TIME_KEY);
    if (!lastClaimTime) return true;
    
    const timeSinceLastClaim = Date.now() - parseInt(lastClaimTime);
    return timeSinceLastClaim >= CLAIM_COOLDOWN_MS;
  }, []);

  const isButtonDisabled = !isWalletConnected || (hasClaimedRewards && isCoolingDown) || !isAllBlocksMined || isProcessing || !canClaim();

  // Save mining progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(MINING_STORAGE_KEY, Math.floor(miningProgress).toString());
  }, [miningProgress]);

  // Initialize or update start time when mining begins
  useEffect(() => {
    if (miningProgress === 0) {
      localStorage.setItem(MINING_START_TIME_KEY, Date.now().toString());
    }
  }, [miningProgress]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When page becomes visible recalculate progress based on elapsed time
        const startTime = localStorage.getItem(MINING_START_TIME_KEY);
        const savedProgress = localStorage.getItem(MINING_STORAGE_KEY);

        if (startTime && savedProgress) {
          const elapsedTime = (Date.now() - parseInt(startTime)) / 1000;
          const progressPerSecond = Math.floor((0.02 * powerLevel * multiplier) / 2);
          const calculatedProgress = parseFloat(savedProgress) + (elapsedTime * progressPerSecond);
          setMiningProgress(Math.min(100, calculatedProgress));

          // Update start time for next calculation
          localStorage.setItem(MINING_START_TIME_KEY, Date.now().toString());
          localStorage.setItem(MINING_STORAGE_KEY, Math.min(100, calculatedProgress).toString());
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [powerLevel, multiplier]);

  const handleSpecialBlockFound = useCallback(() => {
    setRewardsEarned(prev => prev + 1);
    setSpecialBlockFound(true);
    setTimeout(() => {
      setSpecialBlockFound(false);
    }, 3000);
  }, [setRewardsEarned]);

  useEffect(() => {
    if (cooldownProgress >= 100) {
      setHasClaimedRewards(false);
    }
  }, [cooldownProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMiningProgress(prev => {
        if (prev >= 100) return 100;
        const newProgress = Math.min(100, prev + (0.02 * powerLevel * multiplier));
        localStorage.setItem(MINING_STORAGE_KEY, newProgress.toString());
        return newProgress;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [powerLevel, multiplier]);

  const handleClaimRewards = useCallback(async () => {
    // First check if we can claim before setting any state
    if (!address || !canClaim() || hasClaimedRewards || isCoolingDown || !isAllBlocksMined || !isWalletConnected) {
      return;
    }

    try {
      // Set processing state and claim lock
      setIsProcessing(true);
      localStorage.setItem(CLAIM_LOCK_KEY, Date.now().toString());
      localStorage.setItem(LAST_CLAIM_TIME_KEY, Date.now().toString());

      // Store reward amount before resetting
      const amountToClaim = rewardsEarned;

      // Reset rewards immediately before server request
      setRewardsEarned(0);
      setHasClaimedRewards(true);
      setMiningProgress(0);
      localStorage.setItem(MINING_STORAGE_KEY, '0');
      localStorage.setItem(MINING_START_TIME_KEY, Date.now().toString());
      localStorage.removeItem(SPECIAL_BLOCK_INDEX_KEY);
      localStorage.removeItem(SPECIAL_BLOCK_MESSAGE_KEY);

      // Send claim request to server
      const response = await fetch(`/api/claim-rewards/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountToClaim
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to claim rewards');
      }

      const data = await response.json();
      
      if (data.success) {
        // Call claimRewards to handle cooldown
        await claimRewards();
        
        // Force balance refresh immediately after claiming rewards
        await refreshBalance();
      } else {
        throw new Error('Failed to claim rewards');
      }
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      // Remove claim time and lock on error to allow retrying
      localStorage.removeItem(LAST_CLAIM_TIME_KEY);
      localStorage.removeItem(CLAIM_LOCK_KEY);
      throw error;
    } finally {
      setIsProcessing(false);
      localStorage.removeItem(CLAIM_LOCK_KEY);
    }
  }, [
    address,
    canClaim,
    hasClaimedRewards,
    isCoolingDown,
    isAllBlocksMined,
    isWalletConnected,
    rewardsEarned,
    claimRewards,
    refreshBalance,
    setRewardsEarned
  ]);

  const miningBlocks = useMemo(() => [
    { delay: 0, startY: 100, endY: -50 },
    { delay: 6, startY: 90, endY: -40 },
    { delay: 12, startY: 80, endY: -30 },
    { delay: 18, startY: 70, endY: -20 },
    { delay: 24, startY: 60, endY: -10 }
  ], []);

  const dailyRewards = useMemo(() => (200 * powerLevel * multiplier).toFixed(2), [powerLevel, multiplier]);
  const nextLevelCost = useMemo(() => 5000 * powerLevel, [powerLevel]);

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 relative overflow-hidden"
      role="region"
      aria-label="Rewards Section"
    >
      <style>
        {`
          .mining-block {
            position: absolute;
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, #FFD700, #FFA500);
            border-radius: 4px;
            z-index: 1;
            will-change: transform, opacity;
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px #FFD700; }
            50% { box-shadow: 0 0 20px #FFD700; }
          }

          .mining-container {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }

          .grid-cols-20 {
            grid-template-columns: repeat(20, minmax(0, 1fr));
          }

          .rewards-value {
            position: relative;
            display: inline-block;
          }

          .rewards-value::after {
            content: '';
            position: absolute;
            inset: -10px;
            background: radial-gradient(circle, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0) 70%);
            animation: reward-pulse 2s ease-in-out infinite;
            border-radius: 50%;
            z-index: -1;
            will-change: transform, opacity;
          }

          @keyframes reward-pulse {
            0%, 100% { transform: scale(0.95); opacity: 0.5; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }

          @keyframes special-reward-message {
            0% { opacity: 0; transform: translateY(-10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(10px); }
          }

          .special-reward-message {
            animation: special-reward-message 3s ease-out forwards;
          }
        `}
      </style>

      <div className="mining-container">
        {miningBlocks.map((block, index) => (
          <MiningBlock key={index} {...block} />
        ))}
      </div>

      <h3 className="text-lg font-semibold text-gray-700 relative z-10">Rewards Earned</h3>
      <div className="flex justify-between items-center relative z-10">
        <div>
          <p className="text-2xl font-bold text-green-500 rewards-value">
            {rewardsEarned.toFixed(3)} Cat0
          </p>
          {specialBlockFound && (
            <p className="text-sm text-pink-500 font-medium special-reward-message mt-1">
              +1 Cat0 from Cat0-X block!
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500">+{dailyRewards} Cat0/day</p>
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-sm">
          <span>Cooldown</span>
          <span>
            {!isAllBlocksMined ? 'Mining in progress...' :
             (!hasClaimedRewards ? 'Ready' : (isCoolingDown ? 'Cooling down' : 'Ready'))}
          </span>
        </div>
        <div
          className="w-full bg-gray-200 rounded-full h-2.5"
          role="progressbar"
          aria-valuenow={!hasClaimedRewards ? 100 : cooldownProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="bg-black h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${!hasClaimedRewards ? 100 : cooldownProgress}%` }}
          />
        </div>
      </div>

      <div className={`${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''} relative z-10`}>
        <RainbowButtonDemo
          onClick={handleClaimRewards}
          disabled={isButtonDisabled}
          isCoolingDown={isCoolingDown && hasClaimedRewards}
        />
      </div>

      <div className="space-y-2 relative z-10">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold">
            Power Level: {powerLevel >= MAX_POWER_LEVEL ? MAX_POWER_LEVEL : powerLevel} / {MAX_POWER_LEVEL}
          </span>
          <button
            className={`${getPowerLevelColor(powerLevel)} text-white px-4 py-2 rounded-md flex items-center mt-2 transition-colors duration-300`}
            onClick={powerUp}
            disabled={!isWalletConnected || powerLevel >= MAX_POWER_LEVEL}
            aria-label={`Power Up ${powerLevel < MAX_POWER_LEVEL ? `(Cost: ${nextLevelCost} Cat0)` : '(Maximum level reached)'}`}
          >
            <Zap className="mr-2 h-4 w-4" aria-hidden="true" /> Power Up
          </button>
        </div>
        {powerLevel < MAX_POWER_LEVEL && (
          <p className="text-sm text-gray-600">
            Next level: {nextLevelCost} Cat0 Coins
          </p>
        )}
        {powerLevel >= MAX_POWER_LEVEL && (
          <p className="text-sm text-green-600">Maximum level reached!</p>
        )}
      </div>

      <MiningProgress progress={miningProgress} onSpecialBlockFound={handleSpecialBlockFound} />
    </div>
  )
}

export default React.memo(RewardsSection)
