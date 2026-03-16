/**
 * Lead Generator Agent
 * Monitors for B2B lead generation jobs and executes them
 * Payment: USDC on Base
 */

import { loadConfig } from '../cli/utils/config.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENT_NAME = 'Lead-Generator';
const SERVICES = {
  starter: { price: 9, leads: 25, name: 'Starter Lead Pack' },
  growth: { price: 15, leads: 50, name: 'Growth Lead Pack' },
  scale: { price: 25, leads: 100, name: 'Scale Lead Pack' }
};

async function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${AGENT_NAME}] ${timestamp} - ${message}`);
}

async function checkForJobs() {
  await log('Scanning for lead generation jobs...');
  
  const missionsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.cashclaw', 'missions');
  await fs.ensureDir(missionsDir);
  
  // Check for lead gen specific missions
  const files = await fs.readdir(missionsDir).catch(() => []);
  const pendingLeads = files.filter(f => f.includes('lead') && f.endsWith('.md'));
  
  if (pendingLeads.length > 0) {
    await log(`Found ${pendingLeads.length} lead generation requests`);
  } else {
    await log('No new lead gen jobs. Waiting...');
  }
}

async function generateMarketingMessage() {
  const messages = [
    `🎯 B2B Lead Generation - Qualified Leads Delivered`,
    `📊 25-100 qualified leads with contact info & scoring`,
    `🏢 Target by: Industry, Size, Location, Job Title`,
    `💰 Payment: USDC on Base Network`,
    `📧 Contact: crypto.storm.2026@gmail.com`,
    ``,
    `Packages:`,
    `• Starter ($9) - 25 qualified leads`,
    `• Growth ($15) - 50 qualified leads`,
    `• Scale ($25) - 100 qualified leads`,
    ``,
    `Includes: Company, Contact, Email, Phone, LinkedIn, Score`,
    `Wallet: 0x6a64...8268 (Base Network)`
  ];
  return messages.join('\n');
}

async function start() {
  await log('========================================');
  await log('  Lead Generator Agent Starting');
  await log('  Payment: USDC on Base');
  await log('========================================');
  
  const config = await loadConfig();
  await log(`Agent: ${config.agent.name}`);
  await log(`Payment Address: ${config.base?.payment_address || 'Not configured'}`);
  
  console.log('\n' + await generateMarketingMessage() + '\n');
  
  while (true) {
    await checkForJobs();
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
}

start().catch(err => {
  console.error('Agent crashed:', err);
  process.exit(1);
});
