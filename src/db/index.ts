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
    const result = sqlite.prepare('SELECT sqlite_version()').get();
    console.log('SQLite version:', result['sqlite_version()']);
} catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
} 