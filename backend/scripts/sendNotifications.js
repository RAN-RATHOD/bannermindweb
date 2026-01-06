#!/usr/bin/env node

/**
 * Admin Script: Send Launch Notifications
 * 
 * Usage:
 *   node scripts/sendNotifications.js [options]
 * 
 * Options:
 *   --dry-run     Preview without sending
 *   --message     Custom message to send
 *   --batch-size  Number of messages per batch (default: 10)
 *   --delay       Delay between batches in ms (default: 1000)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const notificationService = require('../services/notificationService');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  batchSize: 10,
  delayBetweenBatches: 1000,
  customMessage: null
};

// Parse additional options
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--message' && args[i + 1]) {
    options.customMessage = args[i + 1];
    i++;
  }
  if (args[i] === '--batch-size' && args[i + 1]) {
    options.batchSize = parseInt(args[i + 1]);
    i++;
  }
  if (args[i] === '--delay' && args[i + 1]) {
    options.delayBetweenBatches = parseInt(args[i + 1]);
    i++;
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════╗
║     BannerMind Launch Notification Sender        ║
╚══════════════════════════════════════════════════╝
  `);

  // Connect to MongoDB
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bannermind';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }

  // Get stats first
  console.log('📊 Current Statistics:');
  const stats = await notificationService.getStats();
  console.log(`   Total subscribers: ${stats.total}`);
  console.log(`   Already notified: ${stats.notified}`);
  console.log(`   Pending: ${stats.pending}`);
  console.log(`   SMS: ${stats.byType.sms} | WhatsApp: ${stats.byType.whatsapp}\n`);

  if (stats.pending === 0) {
    console.log('ℹ️  No pending notifications to send.');
    await mongoose.connection.close();
    process.exit(0);
  }

  // Confirm if not dry run
  if (options.dryRun) {
    console.log('🔍 DRY RUN MODE - No messages will be sent\n');
  } else {
    console.log('⚠️  LIVE MODE - Messages will be sent!\n');
  }

  console.log('Configuration:');
  console.log(`   Batch size: ${options.batchSize}`);
  console.log(`   Delay between batches: ${options.delayBetweenBatches}ms`);
  if (options.customMessage) {
    console.log(`   Custom message: "${options.customMessage.substring(0, 50)}..."`);
  }
  console.log('');

  // Send notifications
  console.log('📤 Starting notification process...\n');
  
  try {
    const result = await notificationService.sendLaunchNotifications(
      options.customMessage,
      {
        batchSize: options.batchSize,
        delayBetweenBatches: options.delayBetweenBatches,
        dryRun: options.dryRun
      }
    );

    console.log('\n📋 Results:');
    console.log(`   Total processed: ${result.stats.total}`);
    console.log(`   Successfully sent: ${result.stats.sent}`);
    console.log(`   Failed: ${result.stats.failed}`);

    if (result.failed && result.failed.length > 0) {
      console.log('\n❌ Failed notifications:');
      result.failed.forEach(f => {
        console.log(`   ${f.phoneNumber} (${f.type}): ${f.error}`);
      });
    }

    if (options.dryRun && result.subscribers) {
      console.log('\n📝 Would send to:');
      result.subscribers.forEach(s => {
        console.log(`   ${s.phoneNumber} via ${s.type}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error sending notifications:', error.message);
  }

  // Cleanup
  await mongoose.connection.close();
  console.log('\n✅ Done!\n');
  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});










