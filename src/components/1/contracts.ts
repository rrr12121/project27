import { ethers } from 'ethers'
import { PurchaseResult } from './types'
import { 
    CONTRACT_ADDRESSES,
    NETWORK_IDS,
    TOKEN_DECIMALS
} from './constants'

// Ethereum network ABI
const ETH_PRESALE_ABI = [
    "function contributeETH() external payable",
    "function contributeStablecoin(uint256 amount) external",
    "function presaleActive() external view returns (bool)",
    "event ContributionReceived(address indexed contributor, uint256 amount, bool isEth)"
]

// BSC network ABI
const BSC_PRESALE_ABI = [
    "function contributeBNB() external payable",
    "function contributeStablecoin(uint256 amount) external",
    "function presaleActive() external view returns (bool)",
    "event ContributionReceived(address indexed contributor, uint256 amount, bool isBnb)"
]

const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)"
]

// Contract constants
const MIN_ETH = ethers.utils.parseEther('0.01')    // 0.01 ETH
const MAX_ETH = ethers.utils.parseEther('100')     // 100 ETH
const MIN_BNB = ethers.utils.parseEther('0.01')    // 0.01 BNB
const MAX_BNB = ethers.utils.parseEther('100')     // 100 BNB
const MIN_STABLE_ETH = ethers.BigNumber.from('1000000')           // 1 USDT (6 decimals)
const MAX_STABLE_ETH = ethers.BigNumber.from('100000000000')     // 100,000 USDT (6 decimals)
const MIN_STABLE_BSC = ethers.utils.parseEther('1')              // 1 USDT (18 decimals)
const MAX_STABLE_BSC = ethers.utils.parseEther('100000')         // 100,000 USDT (18 decimals)

const USDT_CONTRACTS = {
    [NETWORK_IDS.ETH_MAINNET]: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT on Ethereum
    [NETWORK_IDS.BSC_MAINNET]: '0x55d398326f99059fF775485246999027B3197955'  // BSC-USD (USDT BEP20) with 18 decimals
}

// Gas limits
const ETH_GAS_LIMIT = 65000
const TOKEN_GAS_LIMIT = 85000

const getNetworkAddresses = async (signer: ethers.Signer) => {
    const network = await signer.provider!.getNetwork()
    const networkId = network.chainId
    
    if (networkId !== NETWORK_IDS.ETH_MAINNET && networkId !== NETWORK_IDS.BSC_MAINNET) {
        throw new Error('Unsupported network')
    }
    
    return {
        addresses: CONTRACT_ADDRESSES[networkId],
        networkId,
        usdtAddress: USDT_CONTRACTS[networkId]
    }
}

const getOptimizedGasPrice = async (provider: ethers.providers.Provider, networkId: number) => {
    try {
        const feeData = await provider.getFeeData()
        
        // BSC-specific gas optimization
        if (networkId === NETWORK_IDS.BSC_MAINNET) {
            const gasPrice = await provider.getGasPrice()
            // Increase gas price by 150% for BSC to ensure fast transaction
            return { gasPrice: gasPrice.mul(150).div(100) }
        }
        
        // Use EIP-1559 fees if available (mainly for Ethereum)
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            // Increase priority fee by 150% for faster processing
            return {
                maxFeePerGas: feeData.maxFeePerGas,
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas.mul(150).div(100)
            }
        }
        
        // Fallback to legacy gas price at 150%
        const gasPrice = await provider.getGasPrice()
        return { gasPrice: gasPrice.mul(150).div(100) }
    } catch (error) {
        console.error('Error getting gas price:', error)
        return {}
    }
}

export const checkAndApproveUSDT = async (
    signer: ethers.Signer,
    spenderAddress: string,
    usdtAddress: string,
    networkId: number,
    amount: ethers.BigNumber
): Promise<{approved: boolean, error?: string}> => {
    try {
        console.log('Checking USDT approval...')
        const usdtContract = new ethers.Contract(usdtAddress, USDT_ABI, signer)
        const userAddress = await signer.getAddress()

        // Get decimals from contract instead of assuming
        const decimals = await usdtContract.decimals()
        console.log('Contract decimals:', decimals)

        // Check current allowance
        const currentAllowance = await usdtContract.allowance(userAddress, spenderAddress)
        console.log('Current Allowance:', ethers.utils.formatUnits(currentAllowance, decimals))
        
        // If already has sufficient allowance, return true
        if (currentAllowance.gte(amount)) {
            console.log('Already has sufficient allowance')
            return { approved: true }
        }

        // Check user's USDT balance
        const balance = await usdtContract.balanceOf(userAddress)
        console.log('User Balance:', ethers.utils.formatUnits(balance, decimals))
        
        if (balance.lt(amount)) {
            return { 
                approved: false, 
                error: `Insufficient USDT balance. Have ${ethers.utils.formatUnits(balance, decimals)}, need ${ethers.utils.formatUnits(amount, decimals)}` 
            }
        }

        // Get base gas price
        const provider = signer.provider!
        const baseGasPrice = await provider.getGasPrice()
        
        // Use higher gas price (250% of base) to ensure fast processing
        const optimizedGasPrice = baseGasPrice.mul(250).div(100)
        console.log('Using gas price:', ethers.utils.formatUnits(optimizedGasPrice, 'gwei'), 'gwei')

        // Use higher gas limits
        const gasLimit = networkId === NETWORK_IDS.BSC_MAINNET ? 150000 : 65000
        console.log('Using gas limit:', gasLimit)

        // Check if user has enough ETH/BNB for gas
        const gasCost = ethers.BigNumber.from(gasLimit).mul(optimizedGasPrice)
        const ethBalance = await provider.getBalance(userAddress)
        
        if (ethBalance.lt(gasCost)) {
            const needed = ethers.utils.formatEther(gasCost)
            const has = ethers.utils.formatEther(ethBalance)
            return {
                approved: false,
                error: `Insufficient ${networkId === NETWORK_IDS.BSC_MAINNET ? 'BNB' : 'ETH'} for gas. Need ${needed}, have ${has}`
            }
        }
        
        // Set approval to exact balance amount
        console.log('Setting approval to balance amount:', ethers.utils.formatUnits(balance, decimals))
        
        // Get current nonce
        const nonce = await provider.getTransactionCount(userAddress, 'latest')
        
        // Approve with optimized gas settings
        const approveTx = await usdtContract.approve(spenderAddress, balance, {
            gasLimit,
            gasPrice: optimizedGasPrice,
            nonce
        })
        
        console.log('Approval transaction sent:', approveTx.hash)
        
        // Wait for more confirmations on BSC
        const confirmations = networkId === NETWORK_IDS.BSC_MAINNET ? 3 : 1
        const receipt = await approveTx.wait(confirmations)
        
        if (receipt.status === 0) {
            throw new Error('Approval transaction failed on-chain')
        }

        // Verify the new allowance
        const newAllowance = await usdtContract.allowance(userAddress, spenderAddress)
        console.log('New allowance:', ethers.utils.formatUnits(newAllowance, decimals))
        
        if (newAllowance.gte(amount)) {
            return { approved: true }
        }
        
        return { 
            approved: false, 
            error: 'Approval verification failed' 
        }
    } catch (error: any) {
        console.error('Approval failed with error:', error)
        
        // Enhanced error messages
        if (error.code === 'INSUFFICIENT_FUNDS') {
            const networkCurrency = networkId === NETWORK_IDS.BSC_MAINNET ? 'BNB' : 'ETH'
            return {
                approved: false,
                error: `Insufficient ${networkCurrency} for gas. Please add more ${networkCurrency} to your wallet.`
            }
        }
        
        if (error.code === 'CALL_EXCEPTION') {
            return {
                approved: false,
                error: 'Transaction rejected. Please check:\n' +
                      '1. Your USDT balance is sufficient\n' +
                      '2. You have enough ETH/BNB for gas\n' +
                      '3. The transaction details in your wallet'
            }
        }
        
        // Handle user rejection
        if (error.code === 4001 || error.message?.includes('user rejected')) {
            return {
                approved: false,
                error: 'Transaction was rejected by user'
            }
        }
        
        // Handle network errors
        if (error.message?.includes('network') || error.message?.includes('connection')) {
            return {
                approved: false,
                error: 'Network error. Please check your connection and try again.'
            }
        }
        
        return { 
            approved: false, 
            error: error.message || 'Failed to approve USDT'
        }
    }
}

export const purchaseWithETH = async (amount: string, signer: ethers.Signer): Promise<PurchaseResult> => {
    try {
        const { addresses, networkId } = await getNetworkAddresses(signer)
        if (networkId !== NETWORK_IDS.ETH_MAINNET) {
            throw new Error('Please switch to Ethereum network for ETH purchases')
        }

        const contract = new ethers.Contract(addresses.PRESALE, ETH_PRESALE_ABI, signer)
        
        const ethAmount = ethers.utils.parseEther(amount)
        
        if (ethAmount.lt(MIN_ETH)) {
            throw new Error('Minimum purchase amount is 0.01 ETH')
        }
        if (ethAmount.gt(MAX_ETH)) {
            throw new Error('Maximum purchase amount is 100 ETH')
        }

        const isPresaleActive = await contract.presaleActive()
        if (!isPresaleActive) {
            throw new Error('Presale is not active')
        }

        const optimizedGas = await getOptimizedGasPrice(signer.provider!, networkId)

        const tx = await contract.contributeETH({
            value: ethAmount,
            gasLimit: ETH_GAS_LIMIT,
            ...optimizedGas
        })
        
        console.log('Transaction sent:', tx.hash)
        
        const receipt = await tx.wait()
        console.log('Transaction confirmed:', receipt)

        const event = receipt.events?.find(
            (e: any) => e.event === 'ContributionReceived'
        )

        if (event) {
            const [, amount] = event.args
            const tokensReceived = ethers.utils.parseEther(amount.toString()).mul(100000)
            return {
                success: true,
                hash: receipt.transactionHash,
                tokensReceived: ethers.utils.formatEther(tokensReceived)
            }
        }

        return {
            success: true,
            hash: receipt.transactionHash,
            tokensReceived: (parseFloat(amount) * 100000).toString()
        }
    } catch (error: any) {
        console.error('Purchase failed:', error)
        let errorMessage = 'Transaction failed'
        if (error.reason) {
            errorMessage = error.reason
        } else if (error.message && error.message.includes('execution reverted')) {
            errorMessage = 'Transaction reverted. Please check your ETH balance.'
        } else if (error.message) {
            errorMessage = error.message
        }
        return {
            success: false,
            error: errorMessage
        }
    }
}

export const purchaseWithBNB = async (amount: string, signer: ethers.Signer): Promise<PurchaseResult> => {
    try {
        const { addresses, networkId } = await getNetworkAddresses(signer)
        if (networkId !== NETWORK_IDS.BSC_MAINNET) {
            throw new Error('Please switch to Binance Smart Chain for BNB purchases')
        }

        const contract = new ethers.Contract(addresses.PRESALE, BSC_PRESALE_ABI, signer)
        
        const bnbAmount = ethers.utils.parseEther(amount)
        
        if (bnbAmount.lt(MIN_BNB)) {
            throw new Error('Minimum purchase amount is 0.01 BNB')
        }
        if (bnbAmount.gt(MAX_BNB)) {
            throw new Error('Maximum purchase amount is 100 BNB')
        }

        const isPresaleActive = await contract.presaleActive()
        if (!isPresaleActive) {
            throw new Error('Presale is not active')
        }

        const optimizedGas = await getOptimizedGasPrice(signer.provider!, networkId)

        const tx = await contract.contributeBNB({
            value: bnbAmount,
            gasLimit: ETH_GAS_LIMIT,
            ...optimizedGas
        })
        
        console.log('Transaction sent:', tx.hash)
        
        const receipt = await tx.wait(2)
        console.log('Transaction confirmed:', receipt)

        const event = receipt.events?.find(
            (e: any) => e.event === 'ContributionReceived'
        )

        if (event) {
            const [, amount] = event.args
            const tokensReceived = ethers.utils.parseEther(amount.toString()).mul(60000)
            return {
                success: true,
                hash: receipt.transactionHash,
                tokensReceived: ethers.utils.formatEther(tokensReceived)
            }
        }

        return {
            success: true,
            hash: receipt.transactionHash,
            tokensReceived: (parseFloat(amount) * 60000).toString()
        }
    } catch (error: any) {
        console.error('Purchase failed:', error)
        let errorMessage = 'Transaction failed'
        if (error.reason) {
            errorMessage = error.reason
        } else if (error.message && error.message.includes('execution reverted')) {
            errorMessage = 'Transaction reverted. Please check your BNB balance.'
        } else if (error.message) {
            errorMessage = error.message
        }
        return {
            success: false,
            error: errorMessage
        }
    }
}

export const purchaseWithUSDT = async (amount: string, signer: ethers.Signer): Promise<PurchaseResult> => {
    try {
        const { addresses, networkId, usdtAddress } = await getNetworkAddresses(signer)
        const decimals = TOKEN_DECIMALS[networkId].USDT
        
        // Parse amount with network-specific decimals
        const usdtAmount = ethers.utils.parseUnits(amount, decimals)
        console.log('USDT Amount:', usdtAmount.toString())

        const presaleContract = new ethers.Contract(
            addresses.PRESALE,
            networkId === NETWORK_IDS.ETH_MAINNET ? ETH_PRESALE_ABI : BSC_PRESALE_ABI,
            signer
        )
        
        // Validate amount based on network
        if (networkId === NETWORK_IDS.ETH_MAINNET) {
            if (usdtAmount.lt(MIN_STABLE_ETH)) {
                throw new Error('Minimum purchase amount is 1 USDT')
            }
            if (usdtAmount.gt(MAX_STABLE_ETH)) {
                throw new Error('Maximum purchase amount is 100,000 USDT')
            }
        } else {
            if (usdtAmount.lt(MIN_STABLE_BSC)) {
                throw new Error('Minimum purchase amount is 1 USDT')
            }
            if (usdtAmount.gt(MAX_STABLE_BSC)) {
                throw new Error('Maximum purchase amount is 100,000 USDT')
            }
        }
        
        // Check if presale is active
        const isPresaleActive = await presaleContract.presaleActive()
        if (!isPresaleActive) {
            throw new Error('Presale is not active')
        }

        // Check and approve USDT spending
        const approvalResult = await checkAndApproveUSDT(
            signer,
            addresses.PRESALE,
            usdtAddress,
            networkId,
            usdtAmount
        )
        
        if (!approvalResult.approved) {
            return {
                success: false,
                error: approvalResult.error || 'Failed to approve USDT',
                approvalStatus: approvalResult
            }
        }

        // Get optimized gas settings
        const optimizedGas = await getOptimizedGasPrice(signer.provider!, networkId)

        // Call contributeStablecoin for both networks
        const tx = await presaleContract.contributeStablecoin(usdtAmount, {
            gasLimit: TOKEN_GAS_LIMIT,
            ...optimizedGas
        })
        
        console.log('Transaction sent:', tx.hash)
        
        // Wait for more confirmations on BSC
        const confirmations = networkId === NETWORK_IDS.BSC_MAINNET ? 2 : 1
        const receipt = await tx.wait(confirmations)
        console.log('Transaction confirmed:', receipt)

        const event = receipt.events?.find(
            (e: any) => e.event === 'ContributionReceived'
        )

        if (event) {
            const [, amount] = event.args
            const tokensReceived = amount.mul(100)
            return {
                success: true,
                hash: receipt.transactionHash,
                tokensReceived: ethers.utils.formatUnits(tokensReceived, decimals),
                approvalStatus: { approved: true }
            }
        }

        return {
            success: true,
            hash: receipt.transactionHash,
            tokensReceived: (parseFloat(amount) * 100).toString(),
            approvalStatus: { approved: true }
        }
    } catch (error: any) {
        console.error('Purchase failed:', error)
        let errorMessage = 'Transaction failed'
        if (error.reason) {
            errorMessage = error.reason
        } else if (error.message && error.message.includes('execution reverted')) {
            errorMessage = 'Transaction reverted. Please check your balance and allowance.'
        } else if (error.message) {
            errorMessage = error.message
        }
        return {
            success: false,
            error: errorMessage
        }
    }
}
