import { loadConfig } from '../cli/utils/config.js';

/**
 * Base USDC Payment Integration for CashClaw
 * Uses on-chain invoices that clients pay with USDC on Base network
 */

let config = null;

/**
 * Load config for Base/USDC settings
 */
async function getConfig() {
  if (config) return config;
  config = await loadConfig();
  return config;
}

/**
 * Generate a crypto payment invoice for USDC on Base
 * @param {number} amount - Amount in USD
 * @param {string} description - Description of the service
 * @param {string} customerEmail - Customer's email
 * @returns {object} Invoice details with payment address and amount
 */
export async function createUSDCInvoice(amount, description = 'CashClaw Service', customerEmail = '') {
  const cfg = await getConfig();
  
  // Get the wallet address from config (user needs to set this)
  const paymentAddress = cfg.base?.payment_address;
  
  if (!paymentAddress) {
    throw new Error(
      'Base payment address not configured. Run "cashclaw config set base.payment_address <your-eth-address>"'
    );
  }

  // USDC on Base is 6 decimals
  const usdcAmountSmallest = Math.round(amount * 1000000); // Convert USD to USDC (6 decimals)
  const usdcAmountDisplay = amount; // Display as regular USDC
  
  // Generate a unique invoice ID
  const invoiceId = `CC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  // Create invoice record (in production, you'd store this in a database)
  const invoice = {
    id: invoiceId,
    amount_usd: amount,
    amount_usdc: usdcAmountSmallest,
    currency: 'USDC',
    network: 'base',
    payment_address: paymentAddress,
    description,
    customer_email: customerEmail,
    status: 'pending',
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  // In a full implementation, you'd:
  // 1. Store this invoice in a database
  // 2. Set up webhook monitoring for on-chain payments
  // 3. Generate a QR code for easy payment
  
  return {
    id: invoice.id,
    amount: amount,
    amount_usdc: usdcAmountSmallest,
    currency: 'USDC',
    network: 'Base',
    payment_address: paymentAddress,
    description,
    customer_email: customerEmail,
    status: 'pending',
    payment_link: `ethereum:${paymentAddress}@8453?amount=${usdcAmountSmallest}`,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`ethereum:${paymentAddress}@8453?amount=${usdcAmountSmallest}`)}`,
    instructions: [
      `Send exactly ${usdcAmountDisplay} USDC to ${paymentAddress}`,
      'Network: Base (Chain ID: 8453)',
      'Token: USDC',
      'Payment will be confirmed automatically via on-chain monitoring'
    ],
    created_at: invoice.created_at,
    expires_at: invoice.expires_at,
  };
}

/**
 * Check the status of a USDC payment
 * In production, this would check on-chain or database for payment confirmation
 * @param {string} invoiceId - The invoice ID
 * @returns {object} Payment status details
 */
export async function getPaymentStatus(invoiceId) {
  const cfg = await getConfig();
  
  // In a full implementation, you'd check:
  // 1. Database for stored invoice status
  // 2. Or query Base blockchain directly via RPC
  
  // For now, return pending status
  // User would need to implement actual on-chain monitoring
  return {
    id: invoiceId,
    status: 'pending',
    message: 'On-chain payment monitoring not yet implemented. Please verify payment manually on Basescan.',
    network: 'Base',
    explorer_url: `https://basescan.org/tx/${invoiceId}`,
  };
}

/**
 * Generate a payment link/QR code for easy payment
 * @param {string} paymentAddress - Wallet address to receive USDC
 * @param {number} amount - Amount in USDC (smallest unit)
 * @returns {object} Payment details
 */
export function generatePaymentDetails(paymentAddress, amount) {
  const uri = `ethereum:${paymentAddress}@8453?amount=${amount}`;
  return {
    uri,
    qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`,
    network: 'Base',
    chain_id: '8453',
    token: 'USDC',
  };
}

/**
 * Test the Base/USDC configuration
 * @returns {object} Configuration status
 */
export async function testConnection() {
  try {
    const cfg = await getConfig();
    const paymentAddress = cfg.base?.payment_address;
    
    if (!paymentAddress) {
      return {
        configured: false,
        error: 'Base payment address not set. Run: cashclaw config set base.payment_address <address>',
      };
    }
    
    // Basic ETH address validation
    const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(paymentAddress);
    
    if (!isValidAddress) {
      return {
        configured: false,
        error: 'Invalid Ethereum address format',
      };
    }
    
    return {
      configured: true,
      payment_address: paymentAddress,
      network: 'Base',
      mode: cfg.base?.mode || 'test',
    };
  } catch (err) {
    return {
      configured: false,
      error: err.message,
    };
  }
}

export default {
  createUSDCInvoice,
  getPaymentStatus,
  generatePaymentDetails,
  testConnection,
};
