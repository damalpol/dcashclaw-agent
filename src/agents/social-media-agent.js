/**
 * Social Media Manager Agent
 * Monitors for social media management jobs
 * Payment: USDC on Base
 */

import { loadConfig } from '../cli/utils/config.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AGENT_NAME = 'Social-Media';
const SERVICES = {
  weekly_1: { price: 9, platforms: 1, posts: 5, name: 'Weekly Lite' },
  weekly_3: { price: 19, platforms: 3, posts: 15, name: 'Weekly Multi' },
  monthly: { price: 49, platforms: 'all', posts: 80, name: 'Monthly Full' }
};

async function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${AGENT_NAME}] ${timestamp} - ${message}`);
}

async function checkForJobs() {
  await log('Scanning for social media jobs...');
  
  const missionsDir = path.join(process.env.HOME || process.env.USERPROFILE, '.cashclaw', 'missions');
  await fs.ensureDir(missionsDir);
  
  const files = await fs.readdir(missionsDir).catch(() => []);
  const pendingSocial = files.filter(f => (f.includes('social') || f.includes('content')) && f.endsWith('.md'));
  
  if (pendingSocial.length > 0) {
    await log(`Found ${pendingSocial.length} social media requests`);
  } else {
    await log('No new social media jobs. Waiting...');
  }
}

async function generateMarketingMessage() {
  const messages = [
    `📱 Social Media Management - Content That Converts`,
    `📝 Custom content calendars for Instagram, Twitter/X, LinkedIn`,
    `🎯 Platform-native posts, hashtags, and engagement strategies`,
    `💰 Payment: USDC on Base Network`,
    `📧 Contact: crypto.storm.2026@gmail.com`,
    ``,
    `Packages:`,
    `• Weekly Lite ($9) - 5 posts, 1 platform`,
    `• Weekly Multi ($19) - 5 posts per platform, 3 platforms`,
    `• Monthly Full ($49) - 20 posts per platform, all platforms + analytics`,
    ``,
    `Wallet: 0x6a64...8268 (Base Network)`
  ];
  return messages.join('\n');
}

async function start() {
  await log('========================================');
  await log('  Social Media Manager Agent Starting');
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
