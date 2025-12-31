import 'dotenv/config';
import { db } from '../db/index';
import { transactions } from '../db/schema'; // Ensure importing from schema file

async function main() {
    try {
        console.log('Connecting to database...');
        const result = await db.select().from(transactions).limit(1);
        console.log('Query successful. Transactions found:', result.length);
    } catch (err) {
        console.error('Database connection failed:', err);
    } finally {
        process.exit(0);
    }
}

main();
