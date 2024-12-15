import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { AlertCircle, Clock, DollarSign, ExternalLink, Trophy, Loader2, Copy, Users } from 'lucide-react'

type Transaction = {
  id: string
  amount: number
  price: number
  address: string
  currency: string
  timestamp: string | Date
  isNew?: boolean
  totalAmount?: number // For top buyers
}

const calculateDollarValue = (catAmount: number) => {
  return catAmount * 0.01
}

const getCurrencyColor = (currency: string) => {
  switch (currency.toUpperCase()) {
    case 'ETH':
      return 'bg-blue-100 text-blue-800'
    case 'USDT':
      return 'bg-green-100 text-green-800'
    case 'BNB':
      return 'bg-yellow-100 text-yellow-800'
    case 'BUSD':
      return 'bg-yellow-100 text-yellow-800'
    case 'BTC':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getExplorerUrl = (address: string, currency: string) => {
  switch (currency.toUpperCase()) {
    case 'BTC':
      return `https://www.blockchain.com/btc/address/${address}`
    case 'ETH':
    case 'USDT':
      return `https://etherscan.io/address/${address}`
    default:
      return `https://bscscan.com/address/${address}`
  }
}

const formatTimeAgo = (timestamp: string | Date) => {
  const now = new Date().getTime()
  const time = new Date(timestamp).getTime()
  const diff = now - time

  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} mins ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`
  
  const days = Math.floor(hours / 24)
  return `${days} days ago`
}

const formatAddress = (address: string) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

const getTopBuyerStyles = (rank: number) => {
  switch (rank) {
    case 0:
      return {
        card: 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-black',
        badge: 'bg-black text-white font-bold px-3 py-1',
        title: 'text-black'
      }
    case 1:
      return {
        card: 'bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-500',
        badge: 'bg-pink-500 text-white font-bold px-3 py-1',
        title: 'text-pink-500'
      }
    case 2:
      return {
        card: 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-500',
        badge: 'bg-yellow-500 text-white font-bold px-3 py-1',
        title: 'text-yellow-500'
      }
    default:
      return {
        card: '',
        badge: '',
        title: ''
      }
  }
}

// Function to get display currency
const getDisplayCurrency = (transaction: Transaction) => {
  // Show BUSD for 100 CAT transactions even if stored as BNB
  if (transaction.amount === 100 && transaction.currency === 'BNB') {
    return 'BUSD'
  }
  return transaction.currency
}

export default function RecentTransactionsNew() {
  const [expandedTransaction, setExpandedTransaction] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [topBuyers, setTopBuyers] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [holdersCount, setHoldersCount] = useState(0)

  const calculateHolders = (txs: Transaction[]) => {
    // Get unique addresses from both regular transactions and top buyers
    const uniqueAddresses = new Set([
      ...txs.map(tx => tx.address),
      ...topBuyers.map(buyer => buyer.address)
    ])
    return uniqueAddresses.size
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/transactions')
      const data = await response.json()
      if (data.success) {
        const newTransactions = data.transactions
          .filter((tx: Transaction) => !['REWARD', 'POWERUP', 'BTC', 'CAT0'].includes(tx.currency))
          .map((tx: Transaction) => ({
            ...tx,
            isNew: true
          }))
        setTransactions(newTransactions)
        // Calculate holders count from all transactions
        setHoldersCount(calculateHolders(newTransactions))
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch transactions')
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Failed to load transactions. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTopBuyers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/top-buyers')
      const data = await response.json()
      if (data.success) {
        // Filter out REWARD, POWERUP, BTC, and CAT0 transactions from top buyers
        const filteredTopBuyers = data.topBuyers.filter((buyer: Transaction) => 
          !['REWARD', 'POWERUP', 'BTC', 'CAT0'].includes(buyer.currency)
        )
        setTopBuyers(filteredTopBuyers)
        setError(null)
      } else {
        throw new Error(data.error || 'Failed to fetch top buyers')
      }
    } catch (error) {
      console.error('Error fetching top buyers:', error)
      setError('Failed to load top buyers. Please try again later.')
    }
  }

  useEffect(() => {
    fetchTransactions()
    fetchTopBuyers()
    
    const transactionInterval = setInterval(fetchTransactions, 10000)
    const topBuyersInterval = setInterval(fetchTopBuyers, 30000)
    
    return () => {
      clearInterval(transactionInterval)
      clearInterval(topBuyersInterval)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setTransactions(prev => prev.map(t => ({ ...t, isNew: false })))
    }, 5000)
    return () => clearTimeout(timer)
  }, [transactions])

  useEffect(() => {
    if (copiedAddress) {
      const timer = setTimeout(() => {
        setCopiedAddress(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedAddress])

  const handleCopyAddress = (address: string, event: React.MouseEvent) => {
    event.stopPropagation()
    copyToClipboard(address)
    setCopiedAddress(address)
  }

  const renderTransaction = (transaction: Transaction, rank: number | null = null) => {
    const styles = rank !== null ? getTopBuyerStyles(rank) : { card: '', badge: '', title: '' }
    const displayCurrency = getDisplayCurrency(transaction)
    
    return (
      <TooltipProvider key={transaction.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Card 
                className={`hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${styles.card}`}
                onClick={() => setExpandedTransaction(expandedTransaction === transaction.id ? null : transaction.id)}
              >
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className={`w-2 ${getCurrencyColor(displayCurrency)}`}></div>
                    <div className="flex-grow p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            {rank !== null ? (
                              <>
                                {transaction.totalAmount?.toLocaleString()} CAT0
                                <Badge className={`${styles.badge} shadow-sm`}>
                                  {rank === 0 ? 'Top Buyer' : rank === 1 ? '2nd Top Buyer' : '3rd Top Buyer'}
                                </Badge>
                              </>
                            ) : (
                              transaction.amount.toLocaleString() + ' CAT0'
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Paid with {displayCurrency}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-800 flex items-center justify-end">
                            <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                            {calculateDollarValue(rank !== null ? (transaction.totalAmount || 0) : transaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-gray-500">{formatAddress(transaction.address)}</p>
                            <button
                              onClick={(e) => handleCopyAddress(transaction.address, e)}
                              className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              {copiedAddress === transaction.address ? (
                                <span className="text-xs text-green-500">Copied!</span>
                              ) : (
                                <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(transaction.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {expandedTransaction === transaction.id && (
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Transaction Details:</p>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-gray-600">Full Address: {transaction.address}</p>
                        <button
                          onClick={(e) => handleCopyAddress(transaction.address, e)}
                          className="ml-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          {copiedAddress === transaction.address ? (
                            <span className="text-xs text-green-500">Copied!</span>
                          ) : (
                            <Copy className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                      <a 
                        href={getExplorerUrl(transaction.address, displayCurrency)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline flex items-center mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on Explorer <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to view transaction details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Sort top buyers by totalAmount to ensure correct ranking
  const sortedTopBuyers = [...topBuyers].sort((a, b) => (b.totalAmount || 0) - (a.totalAmount || 0))

  // Filter out ALL transactions from users who are top buyers
  const filteredTransactions = transactions.filter(transaction => 
    !topBuyers.some(buyer => buyer.address === transaction.address)
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl shadow-xl">
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-0">
      <Card className="w-full max-w-4xl shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-pink-400 to-blue-400 text-white">
          <CardTitle className="text-3xl font-bold">Transactions</CardTitle>
          <div className="flex items-center mt-4 bg-white/10 rounded-lg p-3">
            <Users className="h-6 w-6 mr-2" aria-hidden="true" />
            <span className="text-xl font-bold">
              <span className="opacity-90">Cat0 Holders:</span>{' '}
              <span className="text-2xl">{holdersCount.toLocaleString()}</span>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading transactions...</span>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {sortedTopBuyers.map((buyer, index) => (
                  <div key={buyer.id} className="mb-4">
                    <h3 className="text-xl font-bold mb-2 flex items-center">
                      <Trophy className={`h-5 w-5 mr-2 ${getTopBuyerStyles(index).title}`} />
                      {index === 0 ? '(Pinned for 7 days)' :
                       index === 1 ? '(Pinned for 3 days)' :
                       '(Pinned for 1 day)'}
                    </h3>
                    {renderTransaction(buyer, index)}
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id}>
                    {renderTransaction(transaction)}
                  </div>
                ))}
              </div>
            </>
          )}

          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-800">Presale Status</h3>
              </div>
              <p className="mt-2 text-gray-600">
                Presale is active and running smoothly. Current status: <span className="text-green-500 font-semibold">Open</span>
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
