
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })
const { Client } = require('pg')
const fs = require('fs')
const path = require('path')

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function run() {
    await client.connect()
    try {
        const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/0002_add_onboarding_fields.sql'), 'utf8')
        await client.query(sql)
        console.log("Applied 0002 success")
    } catch (e) {
        console.error(e)
    } finally {
        await client.end()
    }
}
run()
