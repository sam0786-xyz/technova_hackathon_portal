const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigrations() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Connected to database');

        const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

        // We want to run 0003 and 0004
        const files = [
            '0003_add_community_features.sql',
            '0004_fix_permissions.sql'
        ];

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Running migration: ${file}`);
            await client.query(sql);
            console.log(`Successfully applied: ${file}`);
        }

        console.log('All migrations applied successfully');
    } catch (err) {
        console.error('Error running migrations:', err);
    } finally {
        await client.end();
    }
}

runMigrations();
