import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';

// Determine the correct path to the database file relative to the built output
// Assuming the built output is in dist/ and the original db is in db/
const dbPath = path.resolve(__dirname, '../../db/travel.sqlite');

// Initialize better-sqlite3
const sqlite = new Database(dbPath, { fileMustExist: true });

// Initialize Drizzle
export const db = drizzle(sqlite);

console.log(`Connected to database at: ${dbPath}`);

// Optional: Add a check to ensure the connection is successful
try {
    // Cast the result to an object with the expected property
    const result = sqlite.prepare('SELECT sqlite_version()').get() as { 'sqlite_version()': string };
    if (result && typeof result['sqlite_version()'] === 'string') {
        console.log('SQLite version:', result['sqlite_version()']);
    } else {
        console.warn('Could not retrieve SQLite version.');
    }
} catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
} 