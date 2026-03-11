
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

// Need connection string. Supabase usually provides one.
// If not in env, we might be stuck.
// usually it is `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
// The user only has URL and Service Role Key.
// Service Role Key works with REST API / Client Libs.
// It DOES NOT work with `pg` client (needs DB password).

// CHECK: Does the user have DATABASE_URL in env?
// If not, we cannot use `pg`.

// Backtracking: 
// 1. We have Service Role Key.
// 2. We want to create tables.
// 3. We can use the REST API to create tables? No, REST API is for Data Manipulation (CRUD), not DDL (Create Table).
// EXCEPTION: If there is an RPC function to exec sql. (Unlikely by default).

// If I cannot run SQL, I cannot fix the schema remotely without User input or CLI.
// BUT, wait. NextAuth Supabase Adapter is *supposed* to fail if tables are missing, but does it create them? No, it expects them.

// Let's check `.env` for DATABASE_URL.
console.log("Checking for DATABASE_URL...")
const rawUrl = process.env.DATABASE_URL
if (rawUrl) {
    console.log("DATABASE_URL found. Attempting to parse and connect...")

    let connectionString = rawUrl
    try {
        new URL(rawUrl) // Check if valid
    } catch (e) {
        console.log("URL is invalid (likely unencoded password). Attempting to fix...")
        try {
            // Heuristic to fix unencoded password
            // Format: postgresql://user:password@host:port/db
            const lastAt = rawUrl.lastIndexOf('@')
            const schemaEnd = rawUrl.indexOf('://')
            if (lastAt > -1 && schemaEnd > -1) {
                const userPass = rawUrl.substring(schemaEnd + 3, lastAt)
                const hostPart = rawUrl.substring(lastAt + 1)

                const firstColon = userPass.indexOf(':')
                if (firstColon > -1) {
                    const user = userPass.substring(0, firstColon)
                    const password = userPass.substring(firstColon + 1)

                    connectionString = `postgresql://${user}:${encodeURIComponent(password)}@${hostPart}`
                    console.log("Fixed Connection String (masked):", connectionString.replace(/:[^:@]+@/, ':***@'))
                }
            }
        } catch (fixErr) {
            console.error("Failed to fix URL manually:", fixErr)
        }
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    })

    async function run() {
        try {
            await client.connect()
            console.log("PG Connected!")

            const sqlPath = path.join(process.cwd(), 'supabase', 'migrations', '0000_setup_auth_tables.sql')
            const sql = fs.readFileSync(sqlPath, 'utf8')
            await client.query(sql)
            console.log("Migration 0000 success")

            // Phase 2 Tables
            const sqlPath2 = path.join(process.cwd(), 'supabase', 'migrations', '0001_setup_event_tables.sql')
            const sql2 = fs.readFileSync(sqlPath2, 'utf8')
            await client.query(sql2)
            console.log("Migration 0001 success")

        } catch (err) {
            console.error("Migration Failed:", err)
        } finally {
            await client.end()
        }
    }
    run()
} else {
    console.error("No DATABASE_URL found. Cannot run standard migration.")
    console.log("Attempting detailed logging of Adapter Error via app...")
}
