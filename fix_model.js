// Quick fix script for model error
// Run this with: node fix_model.js

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

// Database connection
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function fixModel() {
  try {
    console.log('🔧 Fixing model configuration...');
    
    // Update the bot with a valid model
    const result = await sql`
      UPDATE bots 
      SET model_name = 'anthropic/claude-3-haiku', 
          api_provider = 'openrouter'
      WHERE model_name = 'qwen/qwen3-235b-a22b-2507:free'
    `;
    
    console.log(`✅ Updated bot(s) with valid model`);
    console.log('🎯 New configuration:');
    console.log('   - API Provider: openrouter');
    console.log('   - Model: anthropic/claude-3-haiku');
    console.log('');
    console.log('🔄 Please restart your server and try chatting again!');
    
  } catch (error) {
    console.error('❌ Error fixing model:', error);
  }
}

fixModel();
