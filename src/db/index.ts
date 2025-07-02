import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '@/config/env';
import * as schema from '@/db/schema';

const sqliteClient = createClient({
  url: env.DB_FILE_NAME,
});

export const db = drizzle(sqliteClient, { schema });
