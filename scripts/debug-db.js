
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })
const { Client } = require('pg')

const url = process.env.DATABASE_URL
console.log("DATABASE_URL type:", typeof url)
console.log("DATABASE_URL length:", url ? url.length : 0)

if (!url) {
    console.error("URL is empty")
    process.exit(1)
}

// Masked Output
const masked = url.replace(/:[^:@]+@/, ':***@')
console.log("DATABASE_URL (masked):", masked)

try {
    const parsed = new URL(url)
    console.log("URL Parsing: Success")
    console.log("Protocol:", parsed.protocol)
    console.log("Host:", parsed.host)
} catch (e) {
    console.error("URL Parsing: Failed using new URL()", e.message)
}

// Try connecting
const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false }
})

client.connect()
    .then(() => {
        console.log("PG Connection: Success")
        return client.end()
    })
    .catch(err => {
        console.error("PG Connection: Failed", err)
        process.exit(1)
    })
