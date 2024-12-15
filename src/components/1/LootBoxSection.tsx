import React, { useState, useEffect } from 'react'
import { Package, Trophy, Info, Tag, Sparkles } from 'lucide-react'
import { LOOT_BOX_COST } from './constants'
import { LootBoxReward } from './types'

interface LootBoxSectionProps {
  lootBoxes: number
  jackpotAmount: number
  isOpeningLootBox: boolean
  lootBoxReward: LootBoxReward | null
  openLootBox: () => Promise<void>
  accountBalance: number
  isWalletConnected: boolean
  onLearnMore: () => void
}

const LoadingAnimation = () => {
  const [phase, setPhase] = useState(0);
  const [shakeClass, setShakeClass] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev + 1) % 4);
      setShakeClass('animate-shake');
      setTimeout(() => setShakeClass(''), 500);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getAnimationContent = () => {
    switch (phase) {
      case 0:
        return (
          <div className="flex items-center justify-center space-x-3">
            <span className="animate-bounce-slow text-xl">📦</span>
            <span className="text-white font-medium">Shaking box...</span>
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center space-x-3">
            <span className="animate-spin-slow text-xl">✨</span>
            <span className="text-white font-medium">Adding magic...</span>
            <span className="animate-spin-slow text-xl">✨</span>
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center space-x-3">
            <span className="animate-pulse text-xl">🎁</span>
            <span className="text-white font-medium">Almost there...</span>
            <span className="animate-pulse text-xl">🎁</span>
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center space-x-3">
            <span className="animate-bounce text-xl">🌟</span>
            <span className="text-white font-medium">Opening...</span>
            <span className="animate-bounce text-xl">🌟</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`transition-all duration-300 ${shakeClass}`}>
      {getAnimationContent()}
    </div>
  );
};

const RewardAnimation = ({ reward }: { reward: LootBoxReward }) => {
  const [showSparkles, setShowSparkles] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSparkles(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const getRewardContent = () => {
    switch (reward.type) {
      case 'jackpot':
        return (
          <div className="relative animate-float bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 p-8 rounded-2xl shadow-xl">
            <div className="absolute inset-0 animate-pulse-slow opacity-50 bg-yellow-300 rounded-2xl"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
            <p className="font-bold text-white text-2xl relative z-10 text-center">
              🎉 JACKPOT! 🎉
              <br />
              <span className="text-yellow-100 text-3xl mt-2 block">{reward.amount.toLocaleString()} Cat0!</span>
            </p>
          </div>
        );
      case 'tokens':
        return (
          <div className="animate-float bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 p-6 rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
            <p className="text-white text-xl text-center font-semibold">
              💰 {reward.amount.toLocaleString()} Cat0 tokens! ✨
            </p>
          </div>
        );
      case 'powerup':
        return (
          <div className="animate-float bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 p-6 rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
            <p className="text-white text-xl text-center font-semibold">
              ⚡ Power Level Up! 🚀
            </p>
          </div>
        );
      case 'giftcode':
        return (
          <div className="animate-float bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 p-6 rounded-xl shadow-lg">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)]"></div>
            <p className="text-white text-xl text-center font-semibold">
              🎁 Gift Code: {reward.code} 🎉
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      {showSparkles && (
        <div className="absolute -inset-4 animate-sparkle">
          <div className="absolute top-0 left-1/4 animate-float-delayed text-xl">✨</div>
          <div className="absolute top-1/4 right-0 animate-float text-xl">✨</div>
          <div className="absolute bottom-0 left-1/3 animate-float-fast text-xl">✨</div>
          <div className="absolute top-1/2 left-0 animate-float-slow text-xl">✨</div>
        </div>
      )}
      {getRewardContent()}
    </div>
  );
};

const RewardsDialog = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
    <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
      <div className="space-y-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Rewards System</h3>
        <p className="text-gray-600">
          Earn Cat0 tokens daily based on your power level. Increase your earnings by powering up and enabling auto-claim for convenience.
        </p>

        <h3 className="text-2xl font-bold mt-6 bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Loot Boxes</h3>
        <ul className="space-y-4">
          <li className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50">
            <span className="text-2xl">🏆</span>
            <div>
              <span className="font-semibold">Jackpot</span>
              <span className="text-yellow-600 ml-2">(0.1% chance)</span>
              <p className="text-gray-600">Win the entire jackpot!</p>
            </div>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50">
            <span className="text-2xl">💰</span>
            <div>
              <span className="font-semibold">Cat0 Tokens</span>
              <span className="text-blue-600 ml-2">(59.9% chance)</span>
              <p className="text-gray-600">Get 1,000 to 11,000 Cat0 tokens.</p>
            </div>
          </li>
          <li className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="font-semibold">Power-up Boost</span>
              <span className="text-green-600 ml-2">(15% chance)</span>
              <p className="text-gray-600">Increase your power level by 1.</p>
            </div>
          </li>
          <li className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50">
            <span className="text-2xl mt-1">🎁</span>
            <div>
              <span className="font-semibold">Gift Codes</span>
              <ul className="text-gray-600 mt-2 space-y-1.5">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>80% chance for a 25% bonus on your next purchase</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>50% chance for a 35% bonus on your next purchase</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>25% chance for a 45% bonus on your next purchase</span>
                </li>
              </ul>
            </div>
          </li>
        </ul>

        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mt-4">
          <p className="text-yellow-800 text-sm font-medium">
            10% of Cat0 token rewards from loot boxes are added to the jackpot! 🎯
          </p>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
      >
        Close
      </button>
    </div>
  </div>
);

const LootBoxSection: React.FC<LootBoxSectionProps> = ({
  lootBoxes,
  jackpotAmount,
  isOpeningLootBox,
  lootBoxReward,
  openLootBox,
  accountBalance,
  isWalletConnected,
  onLearnMore
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showRewardsInfo, setShowRewardsInfo] = useState(false);

  const handleOpenClick = async () => {
    if (isProcessing || isOpeningLootBox) return;
    
    setIsProcessing(true);
    setShowSparkles(true);
    try {
      await openLootBox();
    } catch (error) {
      console.error('Error opening loot box:', error);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setShowSparkles(false), 3000);
    }
  };

  return (
    <>
      <div className="bg-[#1A1B1E] rounded-2xl p-5 border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-500/20 p-1.5 rounded">
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-yellow-500 font-bold">Mystery Box</span>
          </div>
          <button 
            onClick={() => setShowRewardsInfo(true)}
            className="text-gray-500 hover:text-gray-400 transition-colors"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Jackpot Section */}
        <div className="bg-[#2A2B2E] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500 h-5 w-5" />
              <div>
                <div className="text-gray-400 text-sm">Jackpot Prize</div>
                <div className="text-white font-bold">{jackpotAmount.toLocaleString()} Cat0</div>
              </div>
            </div>
            <div className="bg-yellow-500/10 px-2 py-1 rounded">
              <span className="text-yellow-500 text-xs font-medium">0.1% chance</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          className={`
            relative w-full bg-[#2A2B2E] rounded-xl p-4
            ${!isWalletConnected || accountBalance < 5000 || isProcessing || isOpeningLootBox 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-[#3A3B3E] cursor-pointer'
            }
            transition-colors duration-200
          `}
          onClick={handleOpenClick}
          disabled={!isWalletConnected || accountBalance < 5000 || isProcessing || isOpeningLootBox}
        >
          {isProcessing || isOpeningLootBox ? (
            <LoadingAnimation />
          ) : (
            <div className="space-y-3">
              {/* Button Content */}
              <div className="flex items-center justify-center gap-2">
                <Package className="w-5 h-5 text-white" />
                <span className="text-white font-medium">Open Mystery Box</span>
              </div>
              
              {/* Price Tag */}
              <div className="flex items-center justify-center gap-1.5 bg-pink-500 rounded-full py-1 px-3 w-fit mx-auto">
                <Tag className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-sm">5,000 Cat0</span>
              </div>
            </div>
          )}
        </button>

        {/* Reward Display */}
        {lootBoxReward && lootBoxReward.type !== 'none' && (
          <div className="mt-4 animate-fadeIn">
            <RewardAnimation reward={lootBoxReward} />
          </div>
        )}
      </div>

      {/* Info Modal */}
      {showRewardsInfo && (
        <RewardsDialog onClose={() => setShowRewardsInfo(false)} />
      )}
    </>
  )
}

export default React.memo(LootBoxSection)
