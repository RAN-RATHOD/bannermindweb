#!/usr/bin/env node

/**
 * Bulk Launch Email Script
 * 
 * Sends "We are live!" emails to all subscribed users
 * 
 * Usage:
 *   node scripts/sendLaunchEmails.js           # Dry run (preview only)
 *   node scripts/sendLaunchEmails.js --send    # Actually send emails
 *   node scripts/sendLaunchEmails.js --stats   # Show subscription stats
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LaunchSubscriber = require('../models/LaunchSubscriber');
const emailService = require('../services/emailService');

// Configuration
const BATCH_SIZE = 10; // Emails per batch
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds between batches (Resend rate limit)

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

/**
 * Get subscription statistics
 */
async function getStats() {
  const stats = await LaunchSubscriber.getStats();
  console.log('\n📊 Subscription Statistics:');
  console.log('─'.repeat(30));
  console.log(`   Total subscribers: ${stats.total}`);
  console.log(`   Already notified:  ${stats.notified}`);
  console.log(`   Pending:           ${stats.pending}`);
  console.log('─'.repeat(30));
  return stats;
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Send launch emails to all pending subscribers
 */
async function sendLaunchEmails(dryRun = true) {
  console.log('\n🚀 BannerMind Launch Email Sender');
  console.log('═'.repeat(40));
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No emails will be sent');
    console.log('    Use --send flag to actually send emails\n');
  }

  // Get pending subscribers
  const subscribers = await LaunchSubscriber.getUnnotified();
  
  if (subscribers.length === 0) {
    console.log('✅ No pending subscribers to notify!');
    return { sent: 0, failed: 0 };
  }

  console.log(`\n📧 Found ${subscribers.length} pending subscribers\n`);

  if (dryRun) {
    console.log('Would send emails to:');
    subscribers.forEach((sub, i) => {
      console.log(`   ${i + 1}. ${sub.email}`);
    });
    return { sent: 0, failed: 0, dryRun: true, total: subscribers.length };
  }

  // Process in batches
  const results = { sent: [], failed: [] };
  let processed = 0;

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(subscribers.length / BATCH_SIZE);

    console.log(`\n📤 Processing batch ${batchNum}/${totalBatches}...`);

    // Send emails in parallel within batch
    const batchResults = await Promise.all(
      batch.map(async (subscriber) => {
        try {
          const result = await emailService.sendLaunchAnnouncement(subscriber.email);
          
          if (result.success) {
            await subscriber.markAsNotified();
            console.log(`   ✅ ${subscriber.email}`);
            return { success: true, email: subscriber.email };
          } else {
            console.log(`   ❌ ${subscriber.email}: ${result.error}`);
            return { success: false, email: subscriber.email, error: result.error };
          }
        } catch (error) {
          console.log(`   ❌ ${subscriber.email}: ${error.message}`);
          return { success: false, email: subscriber.email, error: error.message };
        }
      })
    );

    // Categorize results
    batchResults.forEach(result => {
      if (result.success) {
        results.sent.push(result.email);
      } else {
        results.failed.push({ email: result.email, error: result.error });
      }
    });

    processed += batch.length;
    console.log(`   Progress: ${processed}/${subscribers.length}`);

    // Delay between batches to respect rate limits
    if (i + BATCH_SIZE < subscribers.length) {
      console.log(`   ⏳ Waiting ${DELAY_BETWEEN_BATCHES/1000}s before next batch...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(40));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(40));
  console.log(`   ✅ Sent successfully: ${results.sent.length}`);
  console.log(`   ❌ Failed:            ${results.failed.length}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Failed emails:');
    results.failed.forEach(f => {
      console.log(`      ${f.email}: ${f.error}`);
    });
  }

  return {
    sent: results.sent.length,
    failed: results.failed.length,
    failedEmails: results.failed
  };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const showStats = args.includes('--stats');
  const sendMode = args.includes('--send');

  try {
    await connectDB();

    if (showStats) {
      await getStats();
    } else {
      await getStats();
      await sendLaunchEmails(!sendMode);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run the script
main();


