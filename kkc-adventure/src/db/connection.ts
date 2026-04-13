import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  throw new Error('DB_PATH environment variable is not set. Check your .env file.');
}

const resolvedPath = path.resolve(dbPath);
const db = new Database(resolvedPath);

export default db;
