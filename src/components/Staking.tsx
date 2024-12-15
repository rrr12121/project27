import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"
import { AlertCircle, ArrowUpRight, ArrowDownRight, Coins, TrendingUp, Lock, Unlock, Zap, Cpu, AlertTriangle, Eye, Brain, Lightbulb, FileText, Shield, Clock, Info as InfoIcon, Crown } from 'lucide-react'
import { Check } from 'lucide-react'
import { Dialog, DialogTrigger, DialogContent } from "./ui/dialog"
import { useBalance } from '../context/BalanceContext'

type VipStatus = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'

const getVipStatus = (balance: number): VipStatus => {
  if (balance >= 500000) return 'Diamond'
  if (balance >= 250000) return 'Platinum'
  if (balance >= 100000) return 'Gold'
  if (balance >= 50000) return 'Silver'
  return 'Bronze'
}

const getVipColor = (status: VipStatus): string => {
  switch (status) {
    case 'Diamond': return 'text-blue-500'
    case 'Platinum': return 'text-gray-400'
    case 'Gold': return 'text-yellow-500'
    case 'Silver': return 'text-gray-500'
    default: return 'text-amber-800'
  }
}

interface StakingOption {
  minStake: number;
  apy: number;
}

interface StakingHistory {
  crypto: string;
  amount: number;
  period: number;
  estimatedReward: number;
  date: string;
}

interface RiskLevel {
  maxRisk: number;
  color: string;
  breakdown: {
    volatility: number;
    marketCap: number;
    liquidity: number;
    regulatory: number;
  };
}

const riskLevels: Record<string, RiskLevel> = {
  low: { maxRisk: 30, color: 'text-green-500', breakdown: { volatility: 20, marketCap: 40, liquidity: 30, regulatory: 10 } },
  medium: { maxRisk: 70, color: 'text-yellow-500', breakdown: { volatility: 35, marketCap: 25, liquidity: 25, regulatory: 15 } },
  high: { maxRisk: 100, color: 'text-red-500', breakdown: { volatility: 50, marketCap: 15, liquidity: 20, regulatory: 15 } }
}

const stakingOptions: Record<string, StakingOption> = {
  Cat0: { minStake: 1, apy: 5.5 },
}

const newsFeed = [
  { title: "Bitcoin Surges Past $73,000", sentiment: "positive", impact: "high", description: "Bitcoin's price increase could lead to increased interest in crypto investments." },
  { title: "Ethereum 2.0 Upgrade Nears Completion", sentiment: "positive", impact: "medium", description: "The upgrade could improve Ethereum's scalability and reduce transaction fees." },
  { title: "Regulatory Concerns Grow for Crypto Exchanges", sentiment: "negative", impact: "high", description: "Increased regulation may affect the operations of major exchanges." },
  { title: "DeFi Total Value Locked Reaches New All-Time High", sentiment: "positive", impact: "medium", description: "Growing DeFi adoption could present new staking opportunities." },
  { title: "Major Bank Announces Crypto Custody Service", sentiment: "positive", impact: "low", description: "This move might increase institutional adoption of cryptocurrencies." },
]

const usePortfolioSimulation = (autoInvestEnabled: boolean, riskLevel: string) => {
  const { balance } = useBalance()
  const [portfolioAllocation, setPortfolioAllocation] = useState({
    Cat0: 100,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      if (autoInvestEnabled) {
        const maxChange = riskLevels[riskLevel].maxRisk / 10
        setPortfolioAllocation(prev => ({
          Cat0: Math.max(0, Math.min(100, prev.Cat0 + (Math.random() - 0.5) * maxChange)),
        }))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [autoInvestEnabled, riskLevel])

  return { balance, portfolioAllocation }
}

const useStaking = () => {
  const [stakingPeriod, setStakingPeriod] = useState(30)
  const [stakeAmount, setStakeAmount] = useState(stakingOptions.Cat0.minStake)
  const [estimatedRewards, setEstimatedRewards] = useState(0)
  const [stakingHistory, setStakingHistory] = useState<StakingHistory[]>([])

  useEffect(() => {
    const apy = stakingOptions.Cat0.apy
    const annualReward = stakeAmount * (apy / 100)
    const reward = (annualReward * stakingPeriod) / 365
    setEstimatedRewards(reward)
  }, [stakeAmount, stakingPeriod])

  const handleStake = () => {
    if (stakeAmount >= stakingOptions.Cat0.minStake) {
      const newStake = {
        crypto: 'Cat0',
        amount: stakeAmount,
        period: stakingPeriod,
        estimatedReward: estimatedRewards,
        date: new Date().toISOString(),
      }
      setStakingHistory(prev => [newStake, ...prev])
      console.log(`Staking ${stakeAmount} Cat0 for ${stakingPeriod} days`)
    } else {
      console.log(`Minimum stake amount not met`)
    }
  }

  const handleWithdraw = (stakeIndex: number) => {
    console.log(`Withdrawing stake at index ${stakeIndex}`)
    setStakingHistory(prev => prev.filter((_, index) => index !== stakeIndex))
  }

  return {
    stakingPeriod,
    setStakingPeriod,
    stakeAmount,
    setStakeAmount,
    estimatedRewards,
    stakingHistory,
    handleStake,
    handleWithdraw
  }
}

const useUnstaking = () => {
  const [unstakeWallet, setUnstakeWallet] = useState('')
  const [unstakeNetwork, setUnstakeNetwork] = useState('ETH/BNB')
  const [unstakeMessage, setUnstakeMessage] = useState('')
  const [unstakeCompletionTime, setUnstakeCompletionTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (unstakeCompletionTime) {
      timer = setInterval(() => {
        const now = new Date()
        const diff = unstakeCompletionTime.getTime() - now.getTime()
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((diff % (1000 * 60)) / 1000)
          setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
        } else {
          setTimeRemaining('')
          setUnstakeMessage('')
          setUnstakeCompletionTime(null)
          clearInterval(timer)
        }
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [unstakeCompletionTime])

  const handleUnstake = () => {
    console.log(`Unstaking to wallet ${unstakeWallet} on ${unstakeNetwork} network`)
    const completionTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
    setUnstakeCompletionTime(completionTime)
    setUnstakeMessage('Your unstaking request has been initiated.')
  }

  return {
    unstakeWallet,
    setUnstakeWallet,
    unstakeNetwork,
    setUnstakeNetwork,
    unstakeMessage,
    timeRemaining,
    handleUnstake
  }
}

export default function Staking() {
  const [riskLevel, setRiskLevel] = useState('medium')
  const [autoInvestEnabled, setAutoInvestEnabled] = useState(true)
  const [isKYCVerified, setIsKYCVerified] = useState(() => {
    // Initialize from localStorage
    const saved = localStorage.getItem('hideStakingMessage')
    return saved === 'true'
  })
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);

  const { balance } = useBalance()
  const vipStatus = getVipStatus(balance)
  const { portfolioAllocation } = usePortfolioSimulation(autoInvestEnabled, riskLevel)
  const staking = useStaking()
  const unstaking = useUnstaking()

  const handleRiskLevelChange = (value: string) => {
    setRiskLevel(value)
  }

  const toggleAutoInvest = () => {
    setAutoInvestEnabled(!autoInvestEnabled)
  }

  const handleStartInvestment = () => {
    setIsKYCVerified(true)
    // Save to localStorage
    localStorage.setItem('hideStakingMessage', 'true')
  }

  // Check if user is Diamond Member
  const isDiamondMember = vipStatus === 'Diamond'

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center -m-4">
      <Card className="w-full max-w-7xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white p-4">
          <div className="flex justify-between items-center mb-4">
            <CardTitle className="text-3xl font-bold">7AI</CardTitle>
            <Badge variant="secondary" className="text-sm">RiskGuard AI</Badge>
          </div>
          <CardDescription className="text-white text-lg">
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Diamond Member Requirement Message */}
          {!isDiamondMember && (
            <Card className="bg-gradient-to-r from-blue-50 to-pink-50 border-2 border-blue-200">
              <CardContent className="p-6 text-center">
                <Crown className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                <h2 className="text-xl font-bold mb-4">Diamond Membership Required</h2>
                <p className="text-gray-600 mb-4">
                  Full access to staking features is exclusive to Diamond Members. 
                  To unlock all staking features, you need to hold at least 500,000 Cat0 tokens.
                </p>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-blue-800">
                    Your current balance: {Math.floor(balance)} Cat0
                    <br />
                    Current status: <span className={getVipColor(vipStatus)}>{vipStatus} Member</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isKYCVerified && (
            <Card className="bg-gradient-to-r from-purple-400 to-pink-500 border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">AI-Driven Crypto Investment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white mb-4">
                  Get ready for a revolutionary investment experience! Our AI-powered platform will launch after the Presale, bringing you cutting-edge strategies to maximize your crypto returns.
                </p>
                <ul className="text-white space-y-2 mb-4">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> Advanced AI algorithms for optimal asset allocation
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> Real-time market analysis and risk management
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4" /> Personalized investment strategies tailored to your goals
                  </li>
                </ul>
                <Button onClick={handleStartInvestment} className="w-full bg-white text-gray-800 hover:bg-gray-500">
                  <Zap className="mr-2 h-4 w-4" /> Hide this Message
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                <Coins className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.floor(balance)} Cat0</div>
                <p className="text-xs text-gray-500">≈ ${Math.floor(balance / 100)} USDT</p>
                <div className="flex items-center mt-2">
                  <Crown className={`h-4 w-4 mr-2 ${getVipColor(vipStatus)}`} />
                  <span className={`text-sm font-medium ${getVipColor(vipStatus)}`}>
                    {vipStatus} Member
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Efficiency Score</CardTitle>
                <Zap className="h-4 w-4  text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">22%</div>
                <p className="text-xs text-gray-500">
                  +5% from last week
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
                <AlertTriangle className={`h-4 w-4 ${riskLevels[riskLevel].color}`} />
              </CardHeader>
              <CardContent>
                <Select onValueChange={handleRiskLevelChange} defaultValue={riskLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stake">Stake</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="stake">
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Stake Your Crypto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Stake Amount (Min: {stakingOptions.Cat0.minStake} Cat0)
                    </label>
                    <Input
                      id="stake-amount"
                      type="number"
                      value={staking.stakeAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => staking.setStakeAmount(parseFloat(e.target.value))}
                      min={stakingOptions.Cat0.minStake}
                      step={0.01}
                      disabled={!isDiamondMember}
                    />
                  </div>
                  <div>
                    <label htmlFor="staking-period" className="block text-sm font-medium text-gray-700 mb-1">
                      Staking Period: {staking.stakingPeriod} days
                    </label>
                    <Slider
                      id="staking-period"
                      min={30}
                      max={365}
                      step={1}
                      value={[staking.stakingPeriod]}
                      onValueChange={(value: number[]) => staking.setStakingPeriod(value[0])}
                      disabled={!isDiamondMember}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Staking Details</h3>
                    <p className="text-sm text-gray-600">APY: {stakingOptions.Cat0.apy}%</p>
                    <p className="text-sm text-gray-600">Estimated Rewards: {staking.estimatedRewards.toFixed(6)} Cat0</p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <InfoIcon className="inline-block mr-2 h-4 w-4" />
                      You can unstake and withdraw your funds at any time. However, if you unstake before your staking period ends, you will lose your accrued APY rewards.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 p-4 bg-gray-100 rounded-lg">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-medium">AI Auto-Invest</h3>
                      <p className="text-xs text-gray-500">Allow AI to automatically manage your investments</p>
                    </div>
                    <Switch checked={autoInvestEnabled} onCheckedChange={toggleAutoInvest} disabled={!isDiamondMember} />
                  </div>
                  <Button 
                    onClick={staking.handleStake} 
                    className="w-full" 
                    disabled={!isKYCVerified || !isDiamondMember}
                  >
                    <Lock className="mr-2 h-4 w-4" /> Stake Cat0
                  </Button>
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Unstake Your Crypto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="unstake-wallet" className="block text-sm font-medium text-gray-700 mb-1">
                      Wallet Address
                    </label>
                    <Input
                      id="unstake-wallet"
                      type="text"
                      value={unstaking.unstakeWallet}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => unstaking.setUnstakeWallet(e.target.value)}
                      placeholder="Enter your wallet address"
                      disabled={!isDiamondMember}
                    />
                  </div>
                  <div>
                    <label htmlFor="unstake-network" className="block text-sm font-medium text-gray-700 mb-1">
                      Network
                    </label>
                    <Select onValueChange={unstaking.setUnstakeNetwork} defaultValue={unstaking.unstakeNetwork}>
                      <SelectTrigger id="unstake-network" className="w-full" disabled={!isDiamondMember}>
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH/BNB">ETH/BNB</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={unstaking.handleUnstake} 
                    className="w-full" 
                    disabled={!isKYCVerified || !isDiamondMember}
                  >
                    <Unlock className="mr-2 h-4 w-4" /> Unstake
                  </Button>
                  {unstaking.unstakeMessage && (
                    <div className="mt-2 p-4 bg-yellow-50 rounded-md">
                      <p className="text-sm text-yellow-800 font-medium">{unstaking.unstakeMessage}</p>
                      {unstaking.timeRemaining && (
                        <div className="mt-2 flex items-center">
                          <Clock className="h-4 w-4 text-yellow-800 mr-2" />
                          <p className="text-sm text-yellow-800">
                            Estimated completion time: {unstaking.timeRemaining}
                          </p>
                        </div>
                      )}
                      <p className="mt-2 text-xs text-yellow-700">
                        For security reasons, your withdrawal will be processed after 24 hours.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Staking History</CardTitle>
                </CardHeader>
                <CardContent>
                  {staking.stakingHistory.length === 0 ? (
                    <p className="text-sm text-gray-500">No staking history yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {staking.stakingHistory.map((stake, index) => (
                        <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{stake.amount} {stake.crypto}</p>
                            <p className="text-sm text-gray-500">{new Date(stake.date).toLocaleDateString()} - {stake.period} days</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-600">+{stake.estimatedReward.toFixed(6)} {stake.crypto}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => staking.handleWithdraw(index)}
                              disabled={!isDiamondMember}
                            >
                              <Unlock className="mr-2 h-3 w-3" /> Withdraw
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>AI-Driven News Feed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {newsFeed.map((news, index) => (
                      <li key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{news.title}</h3>
                          <Badge 
                            variant={news.sentiment === "positive" ? "default" : "destructive"}
                            style={news.sentiment === "positive" ? { backgroundColor: '#10B981', color: 'white' } : {}}
                          >
                            {news.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{news.description}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Impact: {news.impact}</span>
                          <span className="text-blue-500 cursor-pointer hover:underline">Read more</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="ai-insights">
              <Card className="bg-gradient-to-br from-blue-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center text-blue-600">
                    <Brain className="mr-2 h-6 w-6" />
                    AI-Powered Insights
                  </CardTitle>
                  <CardDescription>
                    Leveraging advanced algorithms to optimize your crypto strategy
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-pink-600 flex items-center">
                      <Cpu className="mr-2 h-5 w-5" />
                      AI Analysis
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Our sophisticated AI model continuously analyzes vast amounts of data, including:
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <li className="flex items-center">
                        <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                        Real-time market trends
                      </li>
                      <li className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-blue-500" />
                        Breaking news and sentiment
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-purple-500" />
                        On-chain data and metrics
                      </li>
                      <li className="flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                        Network activity and upgrades
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-pink-600 flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5" />
                      Latest AI Recommendations
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center text-sm">
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span>Increase ETH allocation by 5% due to upcoming network upgrade and growing DeFi ecosystem</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" />
                        <span>Reduce BNB exposure by 2% based on recent regulatory news and potential market volatility</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <TrendingUp className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
                        <span>Explore staking opportunities in emerging Layer 2 protocols for potentially higher yields</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-2 text-pink-600 flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Risk Assessment
                    </h3>
                    <p className="mb-2">
                      Current risk level: <span className={`font-bold ${riskLevels[riskLevel].color}`}>{riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}</span>
                    </p>
                    <p className="text-sm mb-2">
                      {riskLevel === 'low' && "Your conservative risk level prioritizes capital preservation. The AI focuses on stable, lower-yield investments to minimize potential losses."}
                      {riskLevel === 'medium' && "Your balanced risk approach allows for a mix of stable and growth-oriented investments. The AI seeks to optimize returns while managing potential volatility."}
                      {riskLevel === 'high' && "Your high-risk strategy aims for maximum growth. The AI pursues volatile, high-potential opportunities, which may lead to significant gains or losses."}
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Low Risk</span>
                        <span>High Risk</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            riskLevel === 'low' ? 'bg-green-500' : 
                            riskLevel === 'medium' ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{width: `${riskLevels[riskLevel].maxRisk}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Notification Preferences</h3>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="notifications" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <label htmlFor="notifications" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Enable email notifications
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Security Settings</h3>
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" /> Enable Two-Factor Authentication
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Legal Documents</h3>
                    <div className="flex space-x-2">
                      <DialogTrigger onClick={() => setShowTermsDialog(true)}>
                        <FileText className="mr-2 h-4 w-4" /> Terms of Service
                      </DialogTrigger>
                      <DialogTrigger onClick={() => setShowPrivacyDialog(true)}>
                        <Shield className="mr-2 h-4 w-4" /> Privacy Policy
                      </DialogTrigger>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog isOpen={showTermsDialog} onClose={() => setShowTermsDialog(false)} title="Terms of Service">
        <DialogContent>
          <p>[Your detailed terms of service would go here]</p>
        </DialogContent>
      </Dialog>

      <Dialog isOpen={showPrivacyDialog} onClose={() => setShowPrivacyDialog(false)} title="Privacy Policy">
        <DialogContent>
          <p>[Your detailed privacy policy would go here]</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}
