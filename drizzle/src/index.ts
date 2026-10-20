import 'server-only';

import { requireEnv } from '../../lib/env';
import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Initialize the Neon HTTP client
const sql = neon(requireEnv('DATABASE_URL'));

// Initialize Drizzle ORM
export const db = drizzle({ client: sql });
