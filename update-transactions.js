const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTransactions() {
  try {
    // Get all transactions
    const transactions = await prisma.transaction.findMany();
    
    // Update each transaction to use BUSD and correct price
    for (const tx of transactions) {
      // Only update transactions that are not 100 CAT0
      if (tx.amount !== 100) {
        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            price: 0.01, // 1 CAT0 = $0.01
            currency: 'BUSD'
          }
        });
        console.log(`Updated transaction ${tx.id} with correct price and currency`);
      }
    }

    // Verify the updates
    const updatedTransactions = await prisma.transaction.findMany({
      orderBy: {
        timestamp: 'desc'
      }
    });

    console.log('Updated transactions:', updatedTransactions);
  } catch (error) {
    console.error('Error updating transactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTransactions();
