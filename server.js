const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const path = require('path');

// Create Prisma client with connection pooling and better retry logic
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  errorFormat: 'minimal',
  __internal: {
    engine: {
      cwd: process.cwd(),
      binaryPath: process.env.PRISMA_QUERY_ENGINE_BINARY,
      retry: {
        maxRetries: 5,
        initialDelay: 100,
        maxDelay: 2000,
        factor: 2,
        jitter: 0.2
      }
    }
  }
});

// Connection management
let isConnected = false;
const maxReconnectAttempts = 10;
const reconnectInterval = 5000;
let reconnectAttempts = 0;

const connectWithRetry = async () => {
  while (!isConnected && reconnectAttempts < maxReconnectAttempts) {
    try {
      await prisma.$connect();
      isConnected = true;
      reconnectAttempts = 0;
      console.log('Successfully connected to database');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      reconnectAttempts++;
      console.log(`Retrying connection (${reconnectAttempts}/${maxReconnectAttempts}) in ${reconnectInterval}ms...`);
      await new Promise(resolve => setTimeout(resolve, reconnectInterval));
    }
  }

  if (!isConnected) {
    console.error('Max reconnection attempts reached. Exiting...');
    process.exit(1);
  }
};

// Connection event handlers
process.on('beforeExit', async () => {
  console.log('Prisma Client is disconnecting');
  isConnected = false;
  try {
    await prisma.$disconnect();
    console.log('Successfully disconnected Prisma Client');
  } catch (error) {
    console.error('Error disconnecting:', error);
  }
});

// Helper functions
const toBigInt = (value) => {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(Math.round(value));
  if (typeof value === 'string') return BigInt(value);
  if (value?.toString) return BigInt(value.toString());
  return BigInt(0);
};

const fromBigInt = (value) => {
  const bigIntValue = toBigInt(value);
  return Number(bigIntValue);
};

const getVipStatus = (balance) => {
  const balanceNum = typeof balance === 'bigint' ? Number(balance) : Number(balance);
  console.log('Calculating VIP status for balance:', balanceNum);
  
  if (balanceNum >= 500000) {
    console.log('VIP Status: Diamond');
    return 'Diamond';
  }
  if (balanceNum >= 250000) {
    console.log('VIP Status: Platinum');
    return 'Platinum';
  }
  if (balanceNum >= 100000) {
    console.log('VIP Status: Gold');
    return 'Gold';
  }
  if (balanceNum >= 50000) {
    console.log('VIP Status: Silver');
    return 'Silver';
  }
  console.log('VIP Status: Bronze');
  return 'Bronze';
};

const getStageFromProgress = (progress) => {
  const stageThresholds = {
    7: 90,
    6: 75,
    5: 60,
    4: 45,
    3: 30,
    2: 15,
    1: 0
  };

  for (const [stage, threshold] of Object.entries(stageThresholds)) {
    if (progress >= threshold) {
      return parseInt(stage);
    }
  }

  return 1;
};

const calculateTotalRaised = async (prisma) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(CASE 
          WHEN currency = 'USDT' THEN amount
          WHEN currency = 'BNB' THEN amount
          ELSE amount
        END), 0) as total_amount
      FROM "Transaction"
      WHERE currency NOT IN ('REWARD', 'BTC', 'CAT0')
    `;
    return toBigInt(Math.round(result[0].total_amount * 100));
  } catch (error) {
    console.error('Error calculating total raised:', error);
    throw error;
  }
};

const initializeStageProgress = async (prisma) => {
  try {
    const totalAmount = await calculateTotalRaised(prisma);
    const targetAmount = toBigInt(1000000000 * 100);
    const progressPercentage = (Number(totalAmount) / Number(targetAmount)) * 100;
    
    const currentStage = getStageFromProgress(progressPercentage);
    console.log('Current progress:', progressPercentage.toFixed(2) + '%', 'Stage:', currentStage);

    const progress = await prisma.stageProgress.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        amountRaised: totalAmount,
        targetAmount: targetAmount,
        currentStage: currentStage,
        updatedAt: new Date()
      },
      update: {
        amountRaised: totalAmount,
        targetAmount: targetAmount,
        currentStage: currentStage,
        updatedAt: new Date()
      }
    });

    return progress;
  } catch (error) {
    console.error('Error initializing stage progress:', error);
    throw error;
  }
};

const app = express();

// Configure CORS with environment variable
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept', 'Cache-Control']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Enhanced retry logic for database operations
const withRetry = async (operation, maxRetries = 5) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (!isConnected) {
        await connectWithRetry();
      }
      return await operation();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      lastError = error;
      
      // Check if it's a connection error
      if (error.message?.includes('terminating connection') || 
          error.message?.includes('Connection terminated') ||
          error.message?.includes('Cannot find module')) {
        isConnected = false;
        await connectWithRetry();
      }
      
      if (i < maxRetries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

// API Routes with enhanced error handling
app.get('/api/progress', async (req, res) => {
  try {
    const progress = await withRetry(() => initializeStageProgress(prisma));
    
    const amountRaised = fromBigInt(progress.amountRaised) / 100;
    const targetAmount = fromBigInt(progress.targetAmount) / 100;
    const progressPercentage = (amountRaised / targetAmount) * 100;

    res.json({
      success: true,
      data: {
        amountRaised: amountRaised,
        targetAmount: targetAmount,
        currentStage: progress.currentStage,
        progress: progressPercentage.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Progress API error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await withRetry(() => 
      prisma.transaction.findMany({
        orderBy: {
          timestamp: 'desc'
        },
        take: 10
      })
    );

    const convertedTransactions = transactions.map(tx => ({
      id: tx.id,
      amount: fromBigInt(tx.amount) / (tx.currency === 'CAT0' ? 1 : 100),
      price: tx.price,
      address: tx.address,
      currency: tx.currency,
      timestamp: tx.timestamp
    }));

    res.json({
      success: true,
      transactions: convertedTransactions
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      transactions: []
    });
  }
});

app.get('/api/top-buyers', async (req, res) => {
  try {
    const addressTotals = await withRetry(() => 
      prisma.$queryRaw`
        SELECT 
          address,
          SUM(CASE 
            WHEN currency = 'USDT' THEN amount
            WHEN currency = 'CAT0' THEN amount
            ELSE amount
          END) as total_amount,
          MAX(timestamp) as latest_timestamp
        FROM "Transaction"
        WHERE currency NOT IN ('BTC', 'CAT0')
        GROUP BY address
        ORDER BY SUM(amount) DESC
        LIMIT 3
      `
    );

    const topBuyersWithDetails = await Promise.all(
      addressTotals.map(async (total) => {
        const latestTransaction = await withRetry(() =>
          prisma.transaction.findFirst({
            where: { 
              address: total.address,
              timestamp: total.latest_timestamp
            }
          })
        );

        const totalAmountBigInt = toBigInt(Math.round(total.total_amount * 100));
        const totalCatoValue = fromBigInt(totalAmountBigInt) / 100;
        const bnbPrice = totalCatoValue / 600;

        return {
          ...latestTransaction,
          amount: totalCatoValue,
          totalAmount: totalCatoValue,
          price: bnbPrice
        };
      })
    );

    res.json({
      success: true,
      topBuyers: topBuyersWithDetails
    });
  } catch (error) {
    console.error('Top Buyers API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      topBuyers: []
    });
  }
});

app.get('/api/balance/:address', async (req, res) => {
  console.log('GET request received for address:', req.params.address);
  const { address } = req.params;

  try {
    const userBalance = await withRetry(() =>
      prisma.balance.findUnique({
        where: { address: address.toLowerCase() },
        select: { amount: true }
      })
    );

    console.log('Found balance:', userBalance);

    const convertedBalance = userBalance ? fromBigInt(userBalance.amount) : 0;

    res.json({
      success: true,
      balance: convertedBalance
    });
  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      balance: 0
    });
  }
});

app.get('/api/power-level/:address', async (req, res) => {
  console.log('GET power level request received for address:', req.params.address);
  const { address } = req.params;

  try {
    const powerLevel = await withRetry(() =>
      prisma.powerLevel.findUnique({
        where: { address: address.toLowerCase() }
      })
    );

    if (!powerLevel) {
      // Return default values for new users
      return res.json({
        success: true,
        powerLevel: {
          level: 1,
          multiplier: 1.0,
          vipStatus: 'Bronze'
        }
      });
    }

    res.json({
      success: true,
      powerLevel: {
        level: powerLevel.level,
        multiplier: powerLevel.multiplier,
        vipStatus: powerLevel.vipStatus
      }
    });
  } catch (error) {
    console.error('Power level API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      powerLevel: {
        level: 1,
        multiplier: 1.0,
        vipStatus: 'Bronze'
      }
    });
  }
});

app.get('/api/reward-balance/:address', async (req, res) => {
  console.log('GET reward balance request received for address:', req.params.address);
  const { address } = req.params;

  try {
    const rewardBalance = await withRetry(() =>
      prisma.rewardBalance.findUnique({
        where: { address: address.toLowerCase() }
      })
    );

    res.json({
      success: true,
      rewardBalance: rewardBalance ? rewardBalance.amount : 0
    });
  } catch (error) {
    console.error('Reward balance API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      rewardBalance: 0
    });
  }
});

app.post('/api/reward-balance/:address', async (req, res) => {
  console.log('POST reward balance request received:', {
    address: req.params.address,
    body: req.body
  });
  
  const { address } = req.params;
  const { amount } = req.body;

  try {
    const result = await withRetry(() =>
      prisma.rewardBalance.upsert({
        where: { address: address.toLowerCase() },
        create: {
          address: address.toLowerCase(),
          amount: amount,
          updatedAt: new Date()
        },
        update: {
          amount: amount,
          updatedAt: new Date()
        }
      })
    );

    res.json({
      success: true,
      rewardBalance: result.amount
    });
  } catch (error) {
    console.error('Reward balance API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      rewardBalance: 0
    });
  }
});

app.post('/api/balance/:address', async (req, res) => {
  console.log('POST request received:', {
    address: req.params.address,
    body: req.body
  });
  
  const { address } = req.params;
  const { 
    balance, 
    addToBalance = false, 
    currency = 'CAT0', 
    price, 
    isReward = false, 
    giftCodeBonus = 0 
  } = req.body;

  try {
    let updatedBalance;
    
    const result = await withRetry(() =>
      prisma.$transaction(async (prisma) => {
        const currentBalance = await prisma.balance.findUnique({
          where: { address: address.toLowerCase() },
          select: { amount: true }
        });
        
        const bonusMultiplier = 1 + giftCodeBonus;
        let adjustedBalance = balance;
        
        const balanceWithBonus = adjustedBalance * bonusMultiplier;
        const balanceInt = toBigInt(balanceWithBonus);
        const originalBalanceInt = toBigInt(adjustedBalance);
        const currentBalanceInt = currentBalance ? toBigInt(currentBalance.amount) : BigInt(0);
        
        const currentBalanceNum = fromBigInt(currentBalanceInt);
        
        console.log('Current balance:', currentBalanceNum);
        console.log('Adding balance:', adjustedBalance);
        console.log('Gift code bonus:', giftCodeBonus);
        console.log('Balance with bonus:', balanceWithBonus);
        console.log('Balance to add (in internal units):', balanceInt.toString());
        console.log('Transaction price:', price);

        if (currency === 'BTC') {
          const parsedPrice = parseFloat(price);
          console.log('Creating BTC transaction with raw price:', price);
          console.log('Parsed BTC price:', parsedPrice);
          
          await prisma.transaction.create({
            data: {
              amount: originalBalanceInt,
              price: !isNaN(parsedPrice) ? parsedPrice : 0,
              address: address.toLowerCase(),
              currency: currency,
              timestamp: new Date()
            }
          });

          return currentBalance || { amount: currentBalanceInt };
        }
        
        const shouldAddToBalance = isReward ? true : addToBalance;
        
        const newBalance = shouldAddToBalance ? 
          currentBalanceInt + balanceInt :
          balanceInt;
        
        const transactionAmount = shouldAddToBalance ? 
          originalBalanceInt :
          originalBalanceInt - currentBalanceInt;
        
        console.log('New balance will be:', fromBigInt(newBalance));
        
        updatedBalance = await prisma.balance.upsert({
          where: { address: address.toLowerCase() },
          create: {
            address: address.toLowerCase(),
            amount: newBalance,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          update: {
            amount: newBalance,
            updatedAt: new Date()
          }
        });

        const vipStatus = getVipStatus(newBalance);

        await prisma.powerLevel.upsert({
          where: { address: address.toLowerCase() },
          create: {
            address: address.toLowerCase(),
            level: 1,
            multiplier: 1.0,
            vipStatus: vipStatus,
            updatedAt: new Date()
          },
          update: {
            vipStatus: vipStatus,
            updatedAt: new Date()
          }
        });

        if (transactionAmount !== BigInt(0)) {
          const absTransactionAmount = transactionAmount < BigInt(0) ? -transactionAmount : transactionAmount;
          await prisma.transaction.create({
            data: {
              amount: absTransactionAmount,
              price: price || 0,
              address: address.toLowerCase(),
              currency: isReward ? 'REWARD' : currency,
              timestamp: new Date()
            }
          });

          await initializeStageProgress(prisma);
        }

        return updatedBalance;
      })
    );

    const finalBalance = fromBigInt(result.amount);
    console.log('Updated balance:', finalBalance);

    res.json({
      success: true,
      balance: finalBalance
    });
  } catch (error) {
    console.error('Balance API error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      balance: 0
    });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 3001;

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Set a timeout for the graceful shutdown
  const shutdownTimeout = setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);

  try {
    if (isConnected) {
      console.log('Closing database connections...');
      await prisma.$disconnect();
      isConnected = false;
      console.log('Database connections closed.');
    }
    
    clearTimeout(shutdownTimeout);
    console.log('Graceful shutdown completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

// Handle various shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Initial database connection and server start
connectWithRetry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
