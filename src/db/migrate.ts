import { migrate } from 'drizzle-orm/libsql/migrator';
import { db, sqliteClient } from '.';
import pinoLogger from '@/utils/logger';

async function runMigrations() {
  pinoLogger.info('Running migrations...');
  try {
    await migrate(db, { migrationsFolder: 'src/db/migrations' });
    pinoLogger.info('Migrations complete!');
  } catch (error) {
    pinoLogger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    sqliteClient.close();
  }
}

runMigrations();
