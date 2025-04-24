import type { Config } from 'drizzle-kit';

export default {
    schema: './src/db/schema.ts',
    out: './drizzle', // Output directory for migrations (if used)
    driver: 'better-sqlite',
    dbCredentials: {
        url: './db/travel.sqlite', // Path relative to project root
    },
    verbose: true,
    strict: true,
} satisfies Config; 