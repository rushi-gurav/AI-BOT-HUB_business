const { db } = require('./db');
const { bots } = require('../shared/schema');
const { eq } = require('drizzle-orm');

async function testQueryBots(userId) {
  try {
    const userBots = await db.select().from(bots).where(eq(bots.userId, userId));
    console.log('Bots for user:', userId, userBots);
  } catch (error) {
    console.error('Error querying bots:', error);
  } finally {
    process.exit();
  }
}

// Replace with the userId you want to test
testQueryBots('c03b6dbb-8b46-4e74-ba3b-66daa7ec17ef');
