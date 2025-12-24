/**
 * Script to add demo content to Supabase database
 * Run with: npx tsx scripts/add-demo-data.ts
 */

import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dwgowbbzvncolxsnvmvp.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_kYHGdG2mu2aduoTE3igIkg_asCVbUBF'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Demo host profiles
const demoProfiles = [
  {
    email: 'sarah.chen@example.com',
    full_name: 'Sarah Chen',
    role: 'host' as const,
    bio: 'Tech entrepreneur and startup founder. Passionate about building communities for builders.',
    linkedin_url: 'https://linkedin.com/in/sarahchen',
    github_url: 'https://github.com/sarahchen',
  },
  {
    email: 'mike.rodriguez@example.com',
    full_name: 'Mike Rodriguez',
    role: 'host' as const,
    bio: 'AI researcher and serial entrepreneur. Founded 3 startups in the AI space.',
    linkedin_url: 'https://linkedin.com/in/mikerodriguez',
    github_url: 'https://github.com/mikerodriguez',
  },
  {
    email: 'jessica.kim@example.com',
    full_name: 'Jessica Kim',
    role: 'host' as const,
    bio: 'Climate tech advocate and startup advisor. Building the future of sustainable technology.',
    linkedin_url: 'https://linkedin.com/in/jessicakim',
    github_url: 'https://github.com/jessicakim',
  },
  {
    email: 'david.patel@example.com',
    full_name: 'David Patel',
    role: 'host' as const,
    bio: 'Crypto and blockchain developer. Building decentralized applications.',
    linkedin_url: 'https://linkedin.com/in/davidpatel',
    github_url: 'https://github.com/davidpatel',
  },
  {
    email: 'emma.wilson@example.com',
    full_name: 'Emma Wilson',
    role: 'host' as const,
    bio: 'Hardware engineer and maker. Passionate about IoT and smart devices.',
    linkedin_url: 'https://linkedin.com/in/emmawilson',
    github_url: 'https://github.com/emmawilson',
  },
]

// Demo houses
const demoHouses = [
  {
    name: 'AI Innovation House',
    city: 'San Francisco',
    state: 'CA',
    theme: 'AI',
    price_per_month: 1200,
    duration: '3–6 months',
    capacity: 12,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'A vibrant community of AI researchers, ML engineers, and startup founders working on the next generation of AI products. Located in the heart of SOMA, walking distance to major tech companies.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Coffee station', 'Gym access'],
    highlights: ['Weekly AI meetups', 'Access to GPU clusters', 'Mentorship from AI founders', 'Demo day opportunities'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
    ],
    featured: true,
    hostEmail: 'sarah.chen@example.com',
  },
  {
    name: 'Climate Tech Hub',
    city: 'Austin',
    state: 'TX',
    theme: 'Climate',
    price_per_month: 950,
    duration: '6–12 months',
    capacity: 8,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'Join a community of climate tech founders and engineers building solutions for a sustainable future. Solar-powered house with EV charging stations.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'],
    highlights: ['Climate tech networking events', 'Access to impact investors', 'Sustainability workshops', 'Green tech mentorship'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: true,
    hostEmail: 'jessica.kim@example.com',
  },
  {
    name: 'Crypto Builders House',
    city: 'Miami',
    state: 'FL',
    theme: 'Crypto',
    price_per_month: 1100,
    duration: '3–6 months',
    capacity: 10,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'A beachside hacker house for crypto and Web3 builders. Perfect for DeFi developers, NFT creators, and blockchain entrepreneurs.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Rooftop terrace'],
    highlights: ['Crypto meetups', 'Blockchain workshops', 'DeFi hackathons', 'Web3 investor connections'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    ],
    featured: false,
    hostEmail: 'david.patel@example.com',
  },
  {
    name: 'Hardware Lab',
    city: 'San Francisco',
    state: 'CA',
    theme: 'Hardware',
    price_per_month: 1350,
    duration: '6–12 months',
    capacity: 15,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'State-of-the-art hardware makerspace with 3D printers, CNC machines, and electronics lab. Perfect for IoT developers and hardware startups.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Gym access'],
    highlights: ['Hardware prototyping lab', '3D printing access', 'Electronics workshop', 'Hardware mentorship'],
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: true,
    hostEmail: 'emma.wilson@example.com',
  },
  {
    name: 'General Startup House',
    city: 'New York',
    state: 'NY',
    theme: 'General Startup',
    price_per_month: 1500,
    duration: '3–6 months',
    capacity: 20,
    status: 'Full' as const,
    admin_status: 'approved' as const,
    description: 'A diverse community of founders building across all industries. Great networking opportunities and access to NYC startup ecosystem.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms', 'Coffee station'],
    highlights: ['NYC startup events', 'Investor connections', 'Co-working space access', 'Founder mentorship'],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: false,
    hostEmail: 'mike.rodriguez@example.com',
  },
  {
    name: 'AI Research Lab',
    city: 'Seattle',
    state: 'WA',
    theme: 'AI',
    price_per_month: 1000,
    duration: '12+ months',
    capacity: 6,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'Long-term research-focused house for AI PhD students and researchers. Quiet environment perfect for deep work.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace', 'Private bedrooms'],
    highlights: ['Research collaboration', 'Academic connections', 'Paper writing support', 'Conference access'],
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: false,
    hostEmail: 'sarah.chen@example.com',
  },
  {
    name: 'Climate Solutions House',
    city: 'Los Angeles',
    state: 'CA',
    theme: 'Climate',
    price_per_month: 800,
    duration: '1–3 months',
    capacity: 7,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'Short-term stays for climate tech founders. Perfect for those in between funding rounds or pivoting their startup.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Dedicated workspace'],
    highlights: ['Climate tech network', 'Impact investor intros', 'Sustainability workshops'],
    images: [
      'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: false,
    hostEmail: 'jessica.kim@example.com',
  },
  {
    name: 'Crypto Innovation Hub',
    city: 'Austin',
    state: 'TX',
    theme: 'Crypto',
    price_per_month: 1250,
    duration: '3–6 months',
    capacity: 14,
    status: 'Recruiting Now' as const,
    admin_status: 'approved' as const,
    description: 'Vibrant crypto community in the heart of Austin. Great for DeFi protocols, NFT marketplaces, and blockchain infrastructure.',
    amenities: ['High-speed WiFi', 'Fully equipped kitchen', 'Parking available', 'Dedicated workspace', 'Coffee station'],
    highlights: ['Crypto meetups', 'DeFi workshops', 'Blockchain hackathons', 'Web3 investor network'],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
    featured: false,
    hostEmail: 'david.patel@example.com',
  },
]

async function addDemoData() {
  console.log('🚀 Starting to add demo data...\n')

  // Step 1: Create demo profiles (using service role would be better, but we'll try with anon key)
  // Note: This might fail due to RLS policies. If it does, you'll need to run the SQL script directly.
  console.log('📝 Creating demo host profiles...')
  
  const profileMap = new Map<string, string>()
  
  for (const profile of demoProfiles) {
    // Try to find existing profile first
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', profile.email)
      .single()

    if (existing) {
      console.log(`   ✓ Profile already exists: ${profile.full_name}`)
      profileMap.set(profile.email, existing.id)
      continue
    }

    // Try to insert (this might fail due to RLS - profiles should be created via auth signup)
    // For demo purposes, we'll create a placeholder UUID
    const tempId = crypto.randomUUID()
    const { error } = await supabase
      .from('profiles')
      .insert({
        id: tempId,
        ...profile,
      })

    if (error) {
      console.log(`   ⚠️  Could not create profile for ${profile.full_name}: ${error.message}`)
      console.log(`   💡 Tip: Sign up as a host through the app first, or run the SQL script directly`)
      // Use a placeholder - houses will still be created but won't link to real profiles
      profileMap.set(profile.email, tempId)
    } else {
      console.log(`   ✓ Created profile: ${profile.full_name}`)
      profileMap.set(profile.email, tempId)
    }
  }

  console.log('\n🏠 Creating demo houses...\n')

  // Step 2: Create demo houses
  let successCount = 0
  let errorCount = 0

  for (const house of demoHouses) {
    const hostId = profileMap.get(house.hostEmail) || profileMap.values().next().value

    const { data, error } = await supabase
      .from('houses')
      .insert({
        host_id: hostId,
        name: house.name,
        city: house.city,
        state: house.state,
        theme: house.theme,
        price_per_month: house.price_per_month,
        duration: house.duration,
        capacity: house.capacity,
        status: house.status,
        admin_status: house.admin_status,
        description: house.description,
        amenities: house.amenities,
        highlights: house.highlights,
        application_link: null,
        images: house.images,
        featured: house.featured,
        impressions: 0,
        applications_count: 0,
      })
      .select()
      .single()

    if (error) {
      console.log(`   ❌ Failed to create "${house.name}": ${error.message}`)
      errorCount++
    } else {
      console.log(`   ✓ Created: ${house.name} (${house.city}, ${house.state})`)
      successCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Successfully created ${successCount} houses`)
  if (errorCount > 0) {
    console.log(`❌ Failed to create ${errorCount} houses`)
  }
  console.log('='.repeat(50))
  console.log('\n🎉 Demo data addition complete!')
  console.log('💡 Visit your app to see the new houses!')
}

// Run the script
addDemoData().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})

