import React, { useState, useEffect } from 'react'
import { ChevronRight, AlertCircle, AlertTriangle, Twitter, Send, Youtube } from 'lucide-react'
import { useTimeLeft, useRewards, useLootBox } from './hooks'
import { formatTime, formatBalanceForServer, validateUSDTAmount, formatUSDTAmount } from './utils'
import { NETWORK_IDS } from './constants'
import { VipStatus, PurchaseResult, SupportedCurrency, NavigationBarProps } from './types'
import UserInfo from './UserInfo'
import PurchaseForm from './PurchaseForm'
import RewardsSection from './RewardsSection'
import LootBoxSection from './LootBoxSection'
import { useAccount, useConnect, useSigner, useNetwork } from 'wagmi'
import { RainbowButton } from "../../components/ui/rainbow-button"
import ProgressBar from '../progress-bar'
import { useBalance } from '../../context/BalanceContext'
import NewsPage from '../news-page'
import Staking from '../Staking'
import CatCoinMediaGeneratorAlpha from '../media-generator-alpha'
import { purchaseWithBNB, purchaseWithETH, purchaseWithUSDT } from './contracts'

const NavigationBar: React.FC<NavigationBarProps> = ({ activePage, setActivePage }) => {
  return (
    <nav className="bg-white border-b border-gray-200 mb-2">
      <div className="max-w-4xl mx-auto px-4">
        <ul className="flex space-x-8">
          <li>
            <button
              className={`font-semibold py-4 block ${activePage === 'home' ? 'text-purple-600 border-b-2 border-purple-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActivePage('home')}
            >
              Home
            </button>
          </li>
          <li>
            <button
              className={`font-semibold py-4 block ${activePage === 'news' ? 'text-purple-600 border-b-2 border-purple-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActivePage('news')}
            >
              News
            </button>
          </li>
          <li>
            <button
              className={`font-semibold py-4 block ${activePage === 'staking' ? 'text-purple-600 border-b-2 border-purple-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActivePage('staking')}
            >
              7AI
            </button>
          </li>
          <li>
            <button
              className={`font-semibold py-4 block ${activePage === '7aicat' ? 'text-purple-600 border-b-2 border-purple-600 -mb-px' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActivePage('7aicat')}
            >
              7AICAT
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}

const SocialMediaBar: React.FC = () => {
  return (
    <nav className="bg-gradient-to-r from-purple-500 to-pink-500 py-2">
      <div className="max-w-4xl mx-auto px-4">
        <ul className="flex justify-center items-center space-x-6">
          <li>
            <a
              href="https://twitter.com/Cat0Token"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors duration-200 flex items-center"
            >
              <Twitter className="w-5 h-5 mr-2" />
              <span className="font-medium">Twitter</span>
            </a>
          </li>
          <li>
            <a
              href="https://t.me/Cat0TokenOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-blue-200 transition-colors duration-200 flex items-center"
            >
              <Send className="w-5 h-5 mr-2" />
              <span className="font-medium">Telegram</span>
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/channel/Cat0TokenOfficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-red-200 transition-colors duration-200 flex items-center"
            >
              <Youtube className="w-5 h-5 mr-2" />
              <span className="font-medium">YouTube</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export const RainbowButtonDemo = () => {
  return <RainbowButton>Presale </RainbowButton>;
}

const stages = [
  { id: 1, price: 0.01, tokens: 150000000, raised: 1500000, bonus: 7, threshold: 15 },
  { id: 2, price: 0.011, tokens: 160000000, raised: 1760000, bonus: 6, threshold: 32 },
  { id: 3, price: 0.012, tokens: 140000000, raised: 1680000, bonus: 5, threshold: 50 },
  { id: 4, price: 0.013, tokens: 130000000, raised: 1690000, bonus: 4, threshold: 67 },
  { id: 5, price: 0.014, tokens: 110000000, raised: 1540000, bonus: 3, threshold: 82 },
  { id: 6, price: 0.015, tokens: 100000000, raised: 1500000, bonus: 2, threshold: 95 },
  { id: 7, price: 0.016, tokens: 70000000, raised: 1120000, bonus: 1, threshold: 100 },
]

const PurchaseTokens: React.FC<NavigationBarProps> = ({ activePage, setActivePage }) => {
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [purchaseCurrency, setPurchaseCurrency] = useState<SupportedCurrency>('ETH')
  const { balance, updateBalance, refreshBalance, isLoading: balanceLoading, error: balanceError } = useBalance()
  const [vipStatus, setVipStatus] = useState<VipStatus>('Bronze')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [giftCodeBonus, setGiftCodeBonus] = useState(0)
  const [giftCode, setGiftCode] = useState('')
  const [totalRaised, setTotalRaised] = useState(0)
  const targetAmount = 1000000000
  const [currentStage, setCurrentStage] = useState(1)
  const [raisedAmounts, setRaisedAmounts] = useState<Record<SupportedCurrency, number>>({
    ETH: 500,
    USDT: 600,
    BNB: 200,
    BTC: 0
  })
  const [purchaseStatus, setPurchaseStatus] = useState<{
    loading: boolean;
    error: string | null;
    success: string | null;
  }>({
    loading: false,
    error: null,
    success: null,
  })

  const { address } = useAccount()
  const { connect } = useConnect()
  const { data: signer } = useSigner()
  const { chain } = useNetwork()

  const { timeLeft } = useTimeLeft()
  const { 
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
    fetchPowerLevel
  } = useRewards(balance, updateBalance)

  const { 
    lootBoxes, 
    jackpotAmount, 
    isOpeningLootBox, 
    lootBoxReward, 
    purchaseLootBox, 
    openLootBox 
  } = useLootBox(
    balance,
    updateBalance,
    setPowerLevel,
    setMultiplier,
    setBonusChance,
    fetchPowerLevel
  )

  useEffect(() => {
    const fetchVipStatus = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/power-level/${address}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              setVipStatus(data.powerLevel.vipStatus);
            }
          }
        } catch (error) {
          console.error('Error fetching VIP status:', error);
        }
      }
    };

    fetchVipStatus();
  }, [balance, address]);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch('/api/progress');
        const data = await response.json();
        if (data.success) {
          setTotalRaised(data.data.amountRaised);
          setCurrentStage(data.data.currentStage);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();

    const interval = setInterval(fetchProgress, 30000);

    return () => clearInterval(interval);
  }, []);

const handlePurchaseResult = async (result: PurchaseResult) => {
    if (result.success) {
      try {
        const formattedBalance = formatBalanceForServer(
          purchaseAmount, 
          purchaseCurrency, 
          giftCodeBonus,
          chain?.id
        )
        
        const response = await fetch(`/api/balance/${address}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            balance: formattedBalance,
            addToBalance: true,
            currency: purchaseCurrency,
            giftCodeBonus: giftCodeBonus,
            chainId: chain?.id,
            price: parseFloat(purchaseAmount)
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update balance');
        }

        const data = await response.json();
        
        if (data.success) {
          const progressResponse = await fetch('/api/progress');
          const progressData = await progressResponse.json();
          if (progressData.success) {
            setTotalRaised(progressData.data.amountRaised);
            setCurrentStage(progressData.data.currentStage);
          }

          // Format amount with proper decimals for display
          const displayAmount = purchaseCurrency === 'USDT' && chain?.id
            ? formatUSDTAmount(purchaseAmount, chain.id)
            : purchaseAmount;

          setRaisedAmounts(prev => ({
            ...prev,
            [purchaseCurrency]: prev[purchaseCurrency] + parseFloat(displayAmount)
          }))
          
          setGiftCodeBonus(0)
          setGiftCode('')

          await refreshBalance();

          // Fetch updated VIP status after balance update
          const powerLevelResponse = await fetch(`/api/power-level/${address}`);
          if (powerLevelResponse.ok) {
            const powerLevelData = await powerLevelResponse.json();
            if (powerLevelData.success) {
              setVipStatus(powerLevelData.powerLevel.vipStatus);
            }
          }

          setPurchaseStatus({
            loading: false,
            error: null,
            success: `Successfully purchased ${formattedBalance.toLocaleString()} Cat0 tokens`
          })
        } else {
          throw new Error('Server update failed');
        }
      } catch (error) {
        setPurchaseStatus({
          loading: false,
          error: 'Failed to update balance. Please try again.',
          success: null
        })
      }
    } else {
      setPurchaseStatus({
        loading: false,
        error: result.error || 'Transaction failed. Please try again.',
        success: null
      })
      throw new Error(result.error)
    }
  }

  // ... rest of the code remains exactly the same ...

  const handlePurchase = async () => {
    if (!address) {
      setPurchaseStatus({
        loading: false,
        error: 'Please connect your wallet first',
        success: null
      })
      return
    }

    // Validate USDT amount for current network
    if (purchaseCurrency === 'USDT' && chain?.id) {
      if (!validateUSDTAmount(purchaseAmount, chain.id)) {
        setPurchaseStatus({
          loading: false,
          error: `Invalid USDT amount. Amount must be between 1 and 100,000 USDT with proper decimals for ${chain.id === NETWORK_IDS.BSC_MAINNET ? 'BSC' : 'ETH'} network.`,
          success: null
        })
        return
      }
    }

    console.log(`Purchasing ${purchaseAmount} Cat0 with ${purchaseCurrency}`)
    console.log('Gift code bonus:', giftCodeBonus)
    
    try {
      setPurchaseStatus({
        loading: true,
        error: null,
        success: null
      })

      let result: PurchaseResult;

      switch (purchaseCurrency) {
        case 'ETH':
          if (!signer) throw new Error('No signer available');
          result = await purchaseWithETH(purchaseAmount, signer);
          await handlePurchaseResult(result);
          break;

        case 'USDT':
          if (!signer) throw new Error('No signer available');
          result = await purchaseWithUSDT(purchaseAmount, signer);
          await handlePurchaseResult(result);
          break;

        case 'BNB':
          if (!signer) throw new Error('No signer available');
          result = await purchaseWithBNB(purchaseAmount, signer);
          await handlePurchaseResult(result);
          break;

    case 'BTC':
      const btcFormattedBalance = formatBalanceForServer(
        purchaseAmount, 
        purchaseCurrency, 
        giftCodeBonus,
        chain?.id
      )
      
      console.log('Sending BTC amount:', purchaseAmount);
      
      try {
        const response = await fetch(`/api/balance/${address}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            balance: btcFormattedBalance,
            addToBalance: true,
            currency: purchaseCurrency,
            giftCodeBonus: giftCodeBonus,
            chainId: chain?.id,
            price: Number(purchaseAmount)
          })
        });

        // Log the request body for verification
        console.log('Request body:', {
          balance: btcFormattedBalance,
          addToBalance: true,
          currency: purchaseCurrency,
          giftCodeBonus: giftCodeBonus,
          chainId: chain?.id,
          price: Number(purchaseAmount)
        });

        if (!response.ok) {
          throw new Error('Failed to update balance');
        }

        const data = await response.json();
        
        if (data.success) {
          const progressResponse = await fetch('/api/progress');
          const progressData = await progressResponse.json();
          if (progressData.success) {
            setTotalRaised(progressData.data.amountRaised);
            setCurrentStage(progressData.data.currentStage);
          }

          setRaisedAmounts(prev => ({
            ...prev,
            BTC: prev.BTC + Number(purchaseAmount)
          }))
          
          setGiftCodeBonus(0)
          setGiftCode('')

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
        setPurchaseStatus({
          loading: false,
          error: 'Failed to process BTC payment. Please try again.',
          success: null
        });
        throw error;
      }
      break;

        default:
          throw new Error(`Unsupported currency: ${purchaseCurrency}`);
      }
    } catch (error: any) {
      console.error('Purchase failed:', error)
      setPurchaseStatus({
        loading: false,
        error: error.message || 'Transaction failed. Please try again.',
        success: null
      })
    }
  }

  const handleOpenLootBox = async () => {
    if (!address) {
      console.log('Attempting to connect wallet before opening loot box')
      connect()
      return
    }

    if (balance < 5000) {
      console.log('Insufficient balance to open loot box')
      return
    }

    try {
      // First purchase a loot box and check if successful
      const purchased = await purchaseLootBox()
      if (!purchased) {
        console.log('Failed to purchase loot box')
        return
      }
      
      // Then open the box and get reward
      const reward = await openLootBox()
      console.log('Loot Box Reward:', reward)

      if (reward) {
        switch (reward.type) {
          case 'tokens':
            console.log(`Received ${reward.amount} tokens`)
            break
          case 'jackpot':
            console.log(`Won jackpot of ${reward.amount} tokens`)
            break
          case 'powerup':
            console.log('Received a power-up')
            break
          case 'giftcode':
            console.log('Received gift code:', reward.code)
            handleApplyGiftCode(reward.code)
            break
          case 'none':
            console.log('No reward received')
            break
        }
      }
    } catch (error) {
      console.error('Error opening loot box:', error)
    }
  }

  const handleApplyGiftCode = (code: string) => {
    switch (code.toUpperCase()) {
      case '7AI25':
        setGiftCodeBonus(0.25)
        break
      case '7AI35':
        setGiftCodeBonus(0.35)
        break
      case '7AI45':
        setGiftCodeBonus(0.45)
        break
      case 'CVB':
        setGiftCodeBonus(0.07)
        break
      default:
        console.log("Invalid gift code")
        return false
    }
    setGiftCode(code)
    return true
  }

  useEffect(() => {
    if (lootBoxReward && lootBoxReward.type === 'powerup') {
      setPowerLevel(prevLevel => Math.min(prevLevel + 1, 10))
    }
  }, [lootBoxReward, setPowerLevel])

  const handleLearnMore = () => {
    setIsDialogOpen(true)
  }

  const paymentMethods = [
    { name: 'ETH' as SupportedCurrency, amount: raisedAmounts.ETH, color: 'bg-blue-500' },
    { name: 'BTC' as SupportedCurrency, amount: raisedAmounts.BTC, color: 'bg-orange-500' },
    { name: 'USDT' as SupportedCurrency, amount: raisedAmounts.USDT, color: 'bg-green-500' },
    { name: 'BNB' as SupportedCurrency, amount: raisedAmounts.BNB, color: 'bg-yellow-500' }
  ]

  const renderMainContent = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <UserInfo
            accountBalance={balance}
            vipStatus={vipStatus}
            isLoading={balanceLoading}
            error={balanceError}
          />
          <div className="w-full flex flex-col justify-center items-center">
            {!address && (
              <div className="w-full mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-r-md shadow-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-yellow-600" />
                  <div>
                    <h4 className="font-semibold mb-1">Wallet Connection Required</h4>
                    <p className="text-sm">
                      To participate in the Cat0 presale and access all features, please connect your wallet. This allows you to:
                    </p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>Purchase Cat0 tokens</li>
                      <li>Participate in loot box openings</li>
                      <li>Track your VIP status and benefits</li>
                    </ul>
                    <p className="text-sm mt-2">
                      Click the "Connect Wallet" button above to get started and join the Cat0 community!
                    </p>
                  </div>
                </div>
              </div>
            )}
            {purchaseStatus.error && (
              <div className="w-full mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-md shadow-md">
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
                  </div>
                </div>
              </div>
            )}
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-blue-500 rounded-lg blur"></div>
              <div className="relative bg-white bg-opacity-90 text-3xl font-extrabold py-2 px-4 rounded-lg animate-pulse">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-500">
                  Presale is live
                </span>
              </div>
            </div>
            <div className="relative group mb-8">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div className="relative px-7 py-4 bg-white ring-1 ring-gray-900/5 rounded-lg leading-none flex items-top justify-start space-x-6">
                <img src="/7AI.png" alt="7AI" className="w-64 h-64 object-contain" />
              </div>
            </div>

            <ProgressBar
              paymentMethods={paymentMethods}
              totalRaised={totalRaised}
              targetAmount={targetAmount}
              currentStage={currentStage}
              estimatedTime={formatTime(timeLeft)}
              stages={stages}
            />
          </div>
          <div className="md:hidden">
            <PurchaseForm
              purchaseAmount={purchaseAmount}
              setPurchaseAmount={setPurchaseAmount}
              purchaseCurrency={purchaseCurrency}
              setPurchaseCurrency={setPurchaseCurrency}
              handlePurchase={handlePurchase}
              isWalletConnected={!!address}
              onApplyGiftCode={handleApplyGiftCode}
              giftCodeBonus={giftCodeBonus}
              giftCode={giftCode}
              purchaseStatus={purchaseStatus}
              setPurchaseStatus={setPurchaseStatus}
              setRaisedAmounts={setRaisedAmounts}
              refreshBalance={refreshBalance}
            />
          </div>
          <div className="md:hidden">
            <LootBoxSection
              lootBoxes={lootBoxes}
              jackpotAmount={jackpotAmount}
              isOpeningLootBox={isOpeningLootBox}
              lootBoxReward={lootBoxReward}
              openLootBox={handleOpenLootBox}
              accountBalance={balance}
              isWalletConnected={!!address}
              onLearnMore={handleLearnMore}
            />
          </div>
        </div>
        <div className="space-y-6">
          <RewardsSection
            rewardsEarned={rewardsEarned}
            setRewardsEarned={setRewardsEarned}
            powerLevel={powerLevel}
            setPowerLevel={setPowerLevel}
            multiplier={multiplier}
            setMultiplier={setMultiplier}
            bonusChance={bonusChance}
            setBonusChance={setBonusChance}
            cooldownProgress={cooldownProgress}
            claimRewards={claimRewards}
            powerUp={powerUp}
            isWalletConnected={!!address}
            updateAccountBalance={updateBalance}
            address={address || ''}
            fetchPowerLevel={fetchPowerLevel}
          />

          <div className="hidden md:block">
            <PurchaseForm
              purchaseAmount={purchaseAmount}
              setPurchaseAmount={setPurchaseAmount}
              purchaseCurrency={purchaseCurrency}
              setPurchaseCurrency={setPurchaseCurrency}
              handlePurchase={handlePurchase}
              isWalletConnected={!!address}
              onApplyGiftCode={handleApplyGiftCode}
              giftCodeBonus={giftCodeBonus}
              giftCode={giftCode}
              purchaseStatus={purchaseStatus}
              setPurchaseStatus={setPurchaseStatus}
              setRaisedAmounts={setRaisedAmounts}
              refreshBalance={refreshBalance}
            />
          </div>
          <div className="hidden md:block">
            <LootBoxSection
              lootBoxes={lootBoxes}
              jackpotAmount={jackpotAmount}
              isOpeningLootBox={isOpeningLootBox}
              lootBoxReward={lootBoxReward}
              openLootBox={handleOpenLootBox}
              accountBalance={balance}
              isWalletConnected={!!address}
              onLearnMore={handleLearnMore}
            />
          </div>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-0">
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-6">
          <h1 className="text-3xl font-bold">Cat0 Presale</h1>
        </div>
        <NavigationBar activePage={activePage} setActivePage={setActivePage} />
        <SocialMediaBar />
        <div className="p-6">
          {activePage === 'home' && renderMainContent()}
          {activePage === 'news' && <NewsPage />}
          {activePage === 'staking' && <Staking />}
          {activePage === '7aicat' && <CatCoinMediaGeneratorAlpha />}
        </div>
        <div className="bg-gradient-to-r from-pink-200 to-blue-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-pink-500 h-5 w-4" />
            <p className="text-sm text-gray-700">
              Next price increase in: <span className="font-bold text-pink-600">{formatTime(timeLeft)}</span>
            </p>
          </div>
          <button className="text-blue-600 flex items-center">
            View Tokenomics <ChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">Rewards System</h3>
            <p className="mb-4">Earn Cat0 tokens daily based on your power level.</p>
            <h3 className="text-xl font-semibold mb-2">Loot Boxes</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>Jackpot (0.1% chance): Win the entire jackpot!</li>
              <li>Cat0 Tokens (59.9% chance): Get 1,000 to 11,000 Cat0 tokens.</li>
              <li>Power-up Boost (15% chance): Increase your power level by 1.</li>
              <li>Gift Codes:
                <ul className="list-circle pl-5">
                  <li>80% chance for a 25% bonus on your next purchase.</li>
                  <li>50% chance for a 35% bonus on your next purchase.</li>
                  <li>25% chance for a 45% bonus on your next purchase.</li>
                </ul>
              </li>
            </ul>
            <p className="mb-4">10% of Cat0 token rewards from loot boxes are added to the jackpot!</p>
            <button
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-md"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PurchaseTokens;
