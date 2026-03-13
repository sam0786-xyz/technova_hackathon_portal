
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const supabaseUrl = "https://flsufzphoemuqscztmgj.supabase.co" // Hardcoded as per fix
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
    console.error("No Service Role Key found")
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    console.log("Testing connection to users table...")
    const { data, error } = await supabase.from('users').select('id').limit(1)

    if (error) {
        console.error("Error connecting to users table:", error)
        if (error.code === '42P01') {
            console.log("DIAGNOSIS: Table 'users' DOES NOT EXIST.")
        } else {
            console.log("DIAGNOSIS: API Error. Check Key/URL.")
        }
    } else {
        console.log("Success! Users table exists.")
        console.log("Data:", data)

        console.log("Testing connection to events table...")
        const { error: eventError } = await supabase.from('events').select('id').limit(1)
        if (eventError) {
            if (eventError.code === '42P01') {
                console.log("DIAGNOSIS: Table 'events' DOES NOT EXIST. Migration 0001 needed.")
            } else {
                console.log("DIAGNOSIS: Events Error", eventError)
            }
        } else {
            console.log("Success! Events table exists.")
        }
    }
}

test()
