import chalk from 'chalk';
import { createUSDCInvoice, testConnection as testBaseConnection } from '../../integrations/base-usdc.js';
import { createInvoice as createStripeInvoice, testConnection as testStripeConnection } from '../../integrations/stripe-connect.js';
import { loadConfig } from '../utils/config.js';

const green = chalk.hex('#16C784');
const orange = chalk.hex('#FF6B35');
const dim = chalk.dim;

export async function createInvoiceCommand(amount, email, description, options) {
  const config = await loadConfig();
  const useBase = options.base || config.base?.payment_address;
  const useStripe = config.stripe?.secret_key && !options.base;
  
  // If no specific payment method, decide based on config
  const paymentMethod = options.base ? 'base' : (useStripe ? 'stripe' : (useBase ? 'base' : 'stripe'));
  
  if (paymentMethod === 'base') {
    // Create USDC on Base invoice
    console.log(orange('\n  Creating USDC on Base invoice...\n'));
    
    try {
      const result = await createUSDCInvoice(
        parseFloat(amount),
        description || 'CashClaw Service',
        email
      );
      
      console.log(green('  Invoice Created Successfully!\n'));
      console.log(`  ${orange('Invoice ID:')} ${result.id}`);
      console.log(`  ${orange('Amount:')} $${result.amount} USD (${result.amount_usdc} USDC)`);
      console.log(`  ${orange('Network:')} ${result.network}`);
      console.log(`  ${orange('Status:')} ${result.status}`);
      console.log(`  ${orange('Payment Address:')} ${result.payment_address}`);
      console.log(`  ${orange('Customer:')} ${email || 'N/A'}`);
      
      if (result.qr_code_url) {
        console.log(`\n  ${orange('QR Code:')} ${result.qr_code_url}`);
      }
      
      console.log(`\n  ${dim('Payment Instructions:')}`);
      for (const instruction of result.instructions) {
        console.log(`    ${dim('•')} ${instruction}`);
      }
      
      console.log(`\n  ${dim('Expires:')} ${new Date(result.expires_at).toLocaleString()}\n`);
      
      return result;
    } catch (err) {
      console.error(chalk.red(`\n  Error creating invoice: ${err.message}\n`));
      throw err;
    }
  } else {
    // Create Stripe invoice (original method)
    console.log(orange('\n  Creating Stripe invoice...\n'));
    
    try {
      const items = [
        {
          description: description || 'CashClaw Service',
          amount: parseFloat(amount),
          currency: 'usd'
        }
      ];
      
      const result = await createStripeInvoice(email, items);
      
      console.log(green('  Invoice Created Successfully!\n'));
      console.log(`  ${orange('Invoice ID:')} ${result.id}`);
      console.log(`  ${orange('Number:')} ${result.number}`);
      console.log(`  ${orange('Amount:')} $${result.amount_due} ${result.currency.toUpperCase()}`);
      console.log(`  ${orange('Status:')} ${result.status}`);
      console.log(`  ${orange('Customer:')} ${email}`);
      console.log(`  ${orange('Payment URL:')} ${result.hosted_invoice_url}\n`);
      
      return result;
    } catch (err) {
      console.error(chalk.red(`\n  Error creating invoice: ${err.message}\n`));
      throw err;
    }
  }
}

export async function testConnectionCommand() {
  const config = await loadConfig();
  
  console.log(orange('\n  Testing Payment Connections...\n'));
  
  // Test Base/USDC
  if (config.base?.payment_address) {
    const baseResult = await testBaseConnection();
    if (baseResult.configured) {
      console.log(green('  ✓ Base/USDC'));
      console.log(`    ${dim('Payment Address:')} ${baseResult.payment_address}`);
      console.log(`    ${dim('Network:')} ${baseResult.network}`);
      console.log(`    ${dim('Mode:')} ${baseResult.mode}`);
    } else {
      console.log(chalk.yellow('  ✗ Base/USDC'));
      console.log(`    ${dim(baseResult.error)}`);
    }
  }
  
  // Test Stripe
  if (config.stripe?.secret_key) {
    const stripeResult = await testStripeConnection();
    if (stripeResult.connected) {
      console.log(green('  ✓ Stripe'));
      console.log(`    ${dim('Account:')} ${stripeResult.account_id}`);
      console.log(`    ${dim('Email:')} ${stripeResult.email}`);
    } else {
      console.log(chalk.yellow('  ✗ Stripe'));
      console.log(`    ${dim(stripeResult.error)}`);
    }
  }
  
  if (!config.base?.payment_address && !config.stripe?.secret_key) {
    console.log(dim('  No payment methods configured.\n'));
    console.log(dim('  For USDC on Base:'));
    console.log(dim('    cashclaw config set base.payment_address <your-eth-address>'));
    console.log(dim('  For Stripe:'));
    console.log(dim('    cashclaw config set stripe.secret_key <your-secret-key>\n'));
  }
  
  console.log();
}
