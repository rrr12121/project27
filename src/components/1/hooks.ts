import { useState, useEffect, useCallback, useRef } from 'react'
import { POWER_UP_COST_BASE, MAX_POWER_LEVEL, LOOT_BOX_COST, JACKPOT_CHANCE } from './constants'
import { LootBoxReward } from './types'
import { useBalance } from '../../context/BalanceContext'

// All localStorage keys
const REWARDS_STORAGE_KEY = 'cat0_rewards_earned'
const POWER_LEVEL_STORAGE_KEY = 'cat0_power_level'
const MULTIPLIER_STORAGE_KEY = 'cat0_multiplier'
const LAST_UPDATE_TIME_KEY = 'cat0_last_update_time'
const LAST_CLAIM_TIME_KEY = 'cat0_last_claim_time'
const COOLDOWN_PROGRESS_KEY = 'cat0_cooldown_progress'
const AUTO_CLAIM_ENABLED_KEY = 'cat0_auto_claim_enabled'
const AUTO_CLAIM_THRESHOLD_KEY = 'cat0_auto_claim_threshold'
const BONUS_CHANCE_KEY = 'cat0_bonus_chance'
const JACKPOT_AMOUNT_KEY = 'cat0_jackpot_amount'
const LAST_GIFT_CODE_WIN_TIME_KEY = 'cat0_last_gift_code_win_time'

const COOLDOWN_DURATION = 50 * 1000; // 50 seconds in milliseconds to match server
const MYSTERY_BOX_MAX_LEVEL = 10; // Maximum level that can be reached through mystery box power-ups

// Function to get wallet address
const getWalletAddress = async (): Promise<string | null> => {
  try {
    const ethereum = window.ethereum;
    if (typeof window !== 'undefined' && ethereum && typeof ethereum.request === 'function') {
      const accounts = await ethereum.request({ method: 'eth_accounts' }) as string[]
      return accounts && accounts[0] ? accounts[0].toLowerCase() : null
    }
    return null
  } catch (error) {
    console.error('Error getting wallet address:', error)
    return null
  }
}

export const useTimeLeft = () => {
  const [timeLeft, setTimeLeft] = useState(86400) // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return { timeLeft }
}

export const useRewards = (accountBalance: number, updateBalance: (newBalance: number, addToBalance?: boolean) => Promise<void>) => {
  const { refreshBalance } = useBalance();
  const [rewardsEarned, setRewardsEarned] = useState(() => {
    const saved = localStorage.getItem(REWARDS_STORAGE_KEY)
    return saved ? parseFloat(saved) : 0
  })
  const [powerLevel, setPowerLevel] = useState(() => {
    const saved = localStorage.getItem(POWER_LEVEL_STORAGE_KEY)
    return saved ? parseInt(saved) : 1
  })
  const [multiplier, setMultiplier] = useState(() => {
    const saved = localStorage.getItem(MULTIPLIER_STORAGE_KEY)
    return saved ? parseFloat(saved) : 1
  })
  const [lastUpdateTime, setLastUpdateTime] = useState(() => {
    const saved = localStorage.getItem(LAST_UPDATE_TIME_KEY)
    return saved ? parseInt(saved) : Date.now()
  })
  const [lastClaimTime, setLastClaimTime] = useState(() => {
    const saved = localStorage.getItem(LAST_CLAIM_TIME_KEY)
    return saved ? parseInt(saved) : Date.now()
  })
  const [cooldownProgress, setCooldownProgress] = useState(() => {
    const saved = localStorage.getItem(COOLDOWN_PROGRESS_KEY)
    if (saved) {
      return parseFloat(saved)
    }
    const lastClaim = localStorage.getItem(LAST_CLAIM_TIME_KEY)
    if (lastClaim) {
      const elapsed = Date.now() - parseInt(lastClaim)
      return Math.min(100, (elapsed / COOLDOWN_DURATION) * 100)
    }
    return 100
  })
  const [autoClaimEnabled, setAutoClaimEnabled] = useState(() => {
    const saved = localStorage.getItem(AUTO_CLAIM_ENABLED_KEY)
    return saved ? saved === 'true' : false
  })
  const [autoClaimThreshold, setAutoClaimThreshold] = useState(() => {
    const saved = localStorage.getItem(AUTO_CLAIM_THRESHOLD_KEY)
    return saved ? parseInt(saved) : 100
  })
  const [bonusChance, setBonusChance] = useState(() => {
    const saved = localStorage.getItem(BONUS_CHANCE_KEY)
    return saved ? parseFloat(saved) : 0
  })
  const [giftCodeBonus, setGiftCodeBonus] = useState(0)
  const [isClaimingRewards, setIsClaimingRewards] = useState(false)

  const rewardsRef = useRef({ rewardsEarned, autoClaimEnabled, autoClaimThreshold, cooldownProgress })

  // Update ref when values change
  useEffect(() => {
    rewardsRef.current = { rewardsEarned, autoClaimEnabled, autoClaimThreshold, cooldownProgress }
  }, [rewardsEarned, autoClaimEnabled, autoClaimThreshold, cooldownProgress])

  // Add effect to fetch power level on mount and when wallet changes
  useEffect(() => {
    const initializePowerLevel = async () => {
      const address = await getWalletAddress();
      if (address) {
        try {
          const response = await fetch(`/api/power-level/${address}`);
          if (!response.ok) {
            throw new Error('Failed to fetch power level');
          }
          const data = await response.json();
          if (data.success) {
            setPowerLevel(data.powerLevel.level);
            setMultiplier(data.powerLevel.multiplier);
            localStorage.setItem(POWER_LEVEL_STORAGE_KEY, data.powerLevel.level.toString());
            localStorage.setItem(MULTIPLIER_STORAGE_KEY, data.powerLevel.multiplier.toString());
          }
        } catch (error) {
          console.error('Error fetching power level:', error);
        }
      }
    };

    initializePowerLevel();

    // Listen for wallet changes
    const ethereum = window.ethereum;
    if (ethereum && typeof ethereum.on === 'function' && typeof ethereum.removeListener === 'function') {
      const handleAccountsChanged = () => {
        initializePowerLevel();
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        if (ethereum && typeof ethereum.removeListener === 'function') {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(REWARDS_STORAGE_KEY, rewardsEarned.toString())
  }, [rewardsEarned])

  useEffect(() => {
    localStorage.setItem(POWER_LEVEL_STORAGE_KEY, powerLevel.toString())
  }, [powerLevel])

  useEffect(() => {
    localStorage.setItem(MULTIPLIER_STORAGE_KEY, multiplier.toString())
  }, [multiplier])

  useEffect(() => {
    localStorage.setItem(LAST_UPDATE_TIME_KEY, lastUpdateTime.toString())
  }, [lastUpdateTime])

  useEffect(() => {
    localStorage.setItem(LAST_CLAIM_TIME_KEY, lastClaimTime.toString())
  }, [lastClaimTime])

  useEffect(() => {
    localStorage.setItem(COOLDOWN_PROGRESS_KEY, cooldownProgress.toString())
  }, [cooldownProgress])

  useEffect(() => {
    localStorage.setItem(AUTO_CLAIM_ENABLED_KEY, autoClaimEnabled.toString())
  }, [autoClaimEnabled])

  useEffect(() => {
    localStorage.setItem(AUTO_CLAIM_THRESHOLD_KEY, autoClaimThreshold.toString())
  }, [autoClaimThreshold])

  useEffect(() => {
    localStorage.setItem(BONUS_CHANCE_KEY, bonusChance.toString())
  }, [bonusChance])

  const updateRewards = useCallback(() => {
    const now = Date.now()
    const baseReward = 200 // Cat0 Coins per day
    const elapsedTime = (now - lastUpdateTime) / (1000 * 60 * 60 * 24) // in days
    // Multiply by 1000 and divide by 1000 to maintain 3 decimal precision during calculation
    const newRewards = Math.round((rewardsEarned + (baseReward * powerLevel * multiplier * elapsedTime)) * 1000) / 1000
    setRewardsEarned(newRewards)
    setLastUpdateTime(now)
  }, [rewardsEarned, powerLevel, multiplier, lastUpdateTime])

  const updateCooldown = useCallback(() => {
    const now = Date.now()
    const elapsed = now - lastClaimTime
    const progress = Math.min(100, (elapsed / COOLDOWN_DURATION) * 100)
    setCooldownProgress(progress)
    localStorage.setItem(COOLDOWN_PROGRESS_KEY, progress.toString())
  }, [lastClaimTime])

  const applyGiftCode = (code: string) => {
    if (code === 'CVB') {
      setGiftCodeBonus(0.07) // 7% bonus
      return true
    }
    return false
  }

  // Add function to fetch power level from server
  const fetchPowerLevel = useCallback(async (address: string) => {
    try {
      const response = await fetch(`/api/power-level/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch power level');
      }
      const data = await response.json();
      if (data.success) {
        setPowerLevel(data.powerLevel.level);
        setMultiplier(data.powerLevel.multiplier);
        localStorage.setItem(POWER_LEVEL_STORAGE_KEY, data.powerLevel.level.toString());
        localStorage.setItem(MULTIPLIER_STORAGE_KEY, data.powerLevel.multiplier.toString());
      }
    } catch (error) {
      console.error('Error fetching power level:', error);
    }
  }, []);

  const claimRewards = useCallback(async () => {
    // Prevent multiple simultaneous claims
    if (isClaimingRewards) {
      return;
    }

    // First check if cooldown is active
    const now = Date.now();
    const timeSinceLastClaim = now - lastClaimTime;
    const cooldownPeriod = COOLDOWN_DURATION; // 50 seconds in milliseconds

    if (timeSinceLastClaim < cooldownPeriod) {
      const timeRemaining = Math.ceil((cooldownPeriod - timeSinceLastClaim) / 1000);
      throw new Error(`Cooldown active. You can claim again in ${timeRemaining} seconds`);
    }

    // Then check if we have rewards to claim
    if (rewardsRef.current.rewardsEarned > 0) {
      let claimedAmount = rewardsRef.current.rewardsEarned;

      try {
        setIsClaimingRewards(true);

        // Get wallet address
        const address = await getWalletAddress();
        if (!address) {
          throw new Error('No wallet connected');
        }

        // Call the claim-rewards endpoint
        const response = await fetch(`/api/claim-rewards/${address}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            amount: claimedAmount
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to claim rewards');
        }

        const data = await response.json();
        console.log('Claimed rewards:', claimedAmount);

        if (data.success && data.resetRewards) {
          // Reset rewards after successful claim
          setRewardsEarned(0);
          localStorage.setItem(REWARDS_STORAGE_KEY, '0');

          const now = Date.now();
          setLastClaimTime(now);
          setCooldownProgress(0);
          localStorage.setItem(LAST_CLAIM_TIME_KEY, now.toString());
          localStorage.setItem(COOLDOWN_PROGRESS_KEY, '0');
        }

        // Force balance refresh
        await refreshBalance();
      } catch (error) {
        console.error('Failed to claim rewards:', error);
        throw error;
      } finally {
        setIsClaimingRewards(false);
      }
    }
  }, [refreshBalance, lastClaimTime, isClaimingRewards]);

  // Power up function with server integration
  const powerUp = async () => {
    const cost = POWER_UP_COST_BASE * powerLevel; // Cost increases with each level
    if (accountBalance >= cost && powerLevel < MAX_POWER_LEVEL) {
      try {
        const address = await getWalletAddress();
        if (!address) {
          throw new Error('No wallet connected');
        }

        // First update server power level
        const response = await fetch(`/api/power-level/${address}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            level: powerLevel + 1,
            multiplier: multiplier + 0.1
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to power up');
        }

        const data = await response.json();
        if (data.success) {
          // Then deduct the cost using negative amount and addToBalance=true
          // This ensures proper transaction recording
          await updateBalance(-cost, true);
          
          // Update local state
          setPowerLevel(data.powerLevel.level);
          setMultiplier(data.powerLevel.multiplier);
          setBonusChance(prevChance => Math.min(prevChance + 0.05, 0.5));
          localStorage.setItem(POWER_LEVEL_STORAGE_KEY, data.powerLevel.level.toString());
          localStorage.setItem(MULTIPLIER_STORAGE_KEY, data.powerLevel.multiplier.toString());
          await refreshBalance();
        }
      } catch (error) {
        console.error('Failed to power up:', error);
      }
    } else {
      console.log("Not enough Cat0 Coins to power up or maximum level reached");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      updateRewards()
      updateCooldown()
      const { autoClaimEnabled, rewardsEarned, autoClaimThreshold } = rewardsRef.current
      
      // Check if auto-claim is enabled and we have enough rewards
      if (autoClaimEnabled && rewardsEarned >= autoClaimThreshold) {
        // Check cooldown before attempting to claim
        const now = Date.now();
        const timeSinceLastClaim = now - lastClaimTime;
        const cooldownPeriod = COOLDOWN_DURATION;

        // Only attempt to claim if cooldown period has passed and not already claiming
        if (timeSinceLastClaim >= cooldownPeriod && !isClaimingRewards) {
          claimRewards().catch(error => {
            console.error('Auto-claim failed:', error);
          });
        }
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [updateRewards, updateCooldown, claimRewards, lastClaimTime, isClaimingRewards])

  const toggleAutoClaim = () => {
    setAutoClaimEnabled(prev => !prev)
  }

  return {
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
    fetchPowerLevel,
    toggleAutoClaim,
    autoClaimEnabled,
    autoClaimThreshold,
    setAutoClaimThreshold,
    applyGiftCode,
    giftCodeBonus
  }
}

export const useLootBox = (
  accountBalance: number, 
  updateBalance: (newBalance: number, addToBalance?: boolean) => Promise<void>,
  setPowerLevel: (level: number) => void,
  setMultiplier: (multiplier: number) => void,
  setBonusChance: (callback: (prevChance: number) => number) => void,
  fetchPowerLevel: (address: string) => Promise<void>
) => {
  const { refreshBalance } = useBalance();
  const [lootBoxes, setLootBoxes] = useState(0)
  const [isOpeningLootBox, setIsOpeningLootBox] = useState(false)
  const [lootBoxReward, setLootBoxReward] = useState<LootBoxReward | null>(null)
  const [jackpotAmount, setJackpotAmount] = useState(() => {
    const saved = localStorage.getItem(JACKPOT_AMOUNT_KEY)
    return saved ? parseInt(saved) : 1000000
  })
  const [lastGiftCodeWinTime, setLastGiftCodeWinTime] = useState(() => {
    const saved = localStorage.getItem(LAST_GIFT_CODE_WIN_TIME_KEY)
    return saved ? parseInt(saved) : 0
  })

  useEffect(() => {
    localStorage.setItem(JACKPOT_AMOUNT_KEY, jackpotAmount.toString())
  }, [jackpotAmount])

  useEffect(() => {
    localStorage.setItem(LAST_GIFT_CODE_WIN_TIME_KEY, lastGiftCodeWinTime.toString())
  }, [lastGiftCodeWinTime])

  const purchaseLootBox = async () => {
    if (accountBalance >= LOOT_BOX_COST) {
      try {
        await updateBalance(-LOOT_BOX_COST, true)
        setLootBoxes(prevBoxes => prevBoxes + 1)
        setJackpotAmount(prevAmount => {
          const newAmount = prevAmount + Math.floor(LOOT_BOX_COST * 0.1)
          localStorage.setItem(JACKPOT_AMOUNT_KEY, newAmount.toString())
          return newAmount
        })
        // Force balance refresh
        await refreshBalance();
        return true
      } catch (error) {
        console.error('Failed to purchase loot box:', error)
        return false
      }
    } else {
      console.log("Not enough Cat0 Coins to purchase a loot box")
      return false
    }
  }

  const openLootBox = async (): Promise<LootBoxReward> => {
    setIsOpeningLootBox(true)
    setLootBoxReward(null) // Reset previous reward

    // Simulate opening animation time
    await new Promise(resolve => setTimeout(resolve, 3000))

    try {
      const rewardType = Math.random()
      let reward: LootBoxReward

      if (rewardType < 0.001) { // 0.1% chance for jackpot
        reward = {
          type: 'jackpot',
          amount: jackpotAmount
        }
        await updateBalance(jackpotAmount, true)
        setJackpotAmount(1000000)
        localStorage.setItem(JACKPOT_AMOUNT_KEY, '1000000')
      } else if (rewardType < 0.6) { // 59.9% chance for tokens
        const tokenAmount = Math.floor(Math.random() * 10000) + 1000
        reward = {
          type: 'tokens',
          amount: tokenAmount
        }
        await updateBalance(tokenAmount, true)
        setJackpotAmount(prevAmount => {
          const newAmount = prevAmount + Math.floor(tokenAmount * 0.1)
          localStorage.setItem(JACKPOT_AMOUNT_KEY, newAmount.toString())
          return newAmount
        })
      } else if (rewardType < 0.75) { // 15% chance for powerup
        // Handle powerup reward through server API
        const address = await getWalletAddress();
        if (!address) {
          throw new Error('No wallet connected');
        }

        // Get current power level from server
        const powerResponse = await fetch(`/api/power-level/${address}`);
        if (!powerResponse.ok) {
          throw new Error('Failed to fetch power level');
        }
        const powerData = await powerResponse.json();
        const currentLevel = powerData.powerLevel.level;
        const currentMultiplier = powerData.powerLevel.multiplier;

        // Check if current level is already at or above the mystery box max level
        if (currentLevel >= MYSTERY_BOX_MAX_LEVEL) {
          // If at max level, give tokens instead
          const tokenAmount = Math.floor(Math.random() * 10000) + 1000;
          reward = {
            type: 'tokens',
            amount: tokenAmount
          }
          await updateBalance(tokenAmount, true)
          setJackpotAmount(prevAmount => {
            const newAmount = prevAmount + Math.floor(tokenAmount * 0.1)
            localStorage.setItem(JACKPOT_AMOUNT_KEY, newAmount.toString())
            return newAmount
          })
        } else {
          // Update power level on server - only increment by 1
          const response = await fetch(`/api/power-level/${address}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              level: currentLevel + 1, // Only increment by 1
              multiplier: currentMultiplier + 0.1
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to power up');
          }

          const data = await response.json();
          if (data.success) {
            // Update local state with new power level
            setPowerLevel(data.powerLevel.level);
            setMultiplier(data.powerLevel.multiplier);
            setBonusChance(prevChance => Math.min(prevChance + 0.05, 0.5));
            localStorage.setItem(POWER_LEVEL_STORAGE_KEY, data.powerLevel.level.toString());
            localStorage.setItem(MULTIPLIER_STORAGE_KEY, data.powerLevel.multiplier.toString());

            // Fetch updated power level to ensure sync
            await fetchPowerLevel(address);

            reward = {
              type: 'powerup',
              level: data.powerLevel.level
            }
          } else {
            throw new Error('Failed to apply powerup');
          }
        }
      } else { // 25% chance for gift codes
        const currentTime = Date.now()
        const oneDayInMs = 24 * 60 * 60 * 1000

        if (currentTime - lastGiftCodeWinTime >= oneDayInMs) {
          const giftCodeRandom = Math.random()
          let code: string
          if (giftCodeRandom < 0.5) { // 80% chance for 25% bonus
            code = '7AI25'
          } else if (giftCodeRandom < 0.8) { // 50% chance for 35% bonus
            code = '7AI35'
          } else { // 25% chance for 45% bonus
            code = '7AI45'
          }
          reward = {
            type: 'giftcode',
            code: code
          }
          setLastGiftCodeWinTime(currentTime)
          localStorage.setItem(LAST_GIFT_CODE_WIN_TIME_KEY, currentTime.toString())
        } else {
          const tokenAmount = Math.floor(Math.random() * 11000) + 500
          reward = {
            type: 'tokens',
            amount: tokenAmount
          }
          await updateBalance(tokenAmount, true)
          setJackpotAmount(prevAmount => {
            const newAmount = prevAmount + Math.floor(tokenAmount * 0.1)
            localStorage.setItem(JACKPOT_AMOUNT_KEY, newAmount.toString())
            return newAmount
          })
        }
      }

      setLootBoxReward(reward)
      // Force balance refresh after reward
      await refreshBalance();
      return reward
    } catch (error) {
      console.error('Error opening loot box:', error)
      return { type: 'none' }
    } finally {
      setIsOpeningLootBox(false)
    }
  }

  return {
    lootBoxes,
    jackpotAmount,
    isOpeningLootBox,
    lootBoxReward,
    purchaseLootBox,
    openLootBox
  }
}
