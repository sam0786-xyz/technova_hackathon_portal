
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkEvents() {
    const { data: events, error } = await supabase.from('events').select('*')
    if (error) {
        console.error("Error fetching events:", error)
        return
    }
    console.log(`Found ${events.length} events.`)
    events.forEach(e => {
        console.log(`- [${e.status}] ${e.title} (ID: ${e.id})`)
    })
}

checkEvents()
