
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })
require('dotenv').config({ path: '.env' })

const supabaseUrl = "https://flsufzphoemuqscztmgj.supabase.co"
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseKey) {
    console.error("No Service Role Key found")
    process.exit(1)
}

// Test with next_auth schema using custom header
const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'next_auth' }
})

async function test() {
    console.log("Testing INSERT into next_auth.users...")

    const testUser = {
        id: '13d109b9-2b06-4b9b-9b6e-8ef91fa9c27b',
        name: 'Test User',
        email: 'test@sharda.ac.in',
        image: 'https://example.com/image.png',
        role: 'student',
        xp_points: 0,
        emailVerified: null
    }

    const { data, error } = await supabase
        .from('users')
        .insert(testUser)
        .select()
        .single()

    if (error) {
        console.error("INSERT Error:", error)
    } else {
        console.log("INSERT Success:", data)

        // Clean up
        await supabase.from('users').delete().eq('id', testUser.id)
        console.log("Cleaned up test user")
    }
}

test()
