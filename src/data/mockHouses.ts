import type { HouseTheme } from '../context/AppContext'

export interface MockHouse {
  id: number
  name: string
  city: string
  state: string
  theme: HouseTheme
  price: string
  pricePerMonth: number
  duration: string
  durationValue: string
  capacity: number
  status: 'Recruiting Now' | 'Full' | 'Closed'
  image: string
  images?: string[]
  description?: string
  amenities?: string[]
  highlights?: string[]
  customQuestions?: string[]
  applicationLink?: string
  residents?: any[]
  reviews?: any[]
  host?: any
  location?: any
  similarHouses?: any[]
  rating?: number
  reviewCount?: number
}

// Shared mock houses data
export const allMockHouses: MockHouse[] = [
  // ... (keep existing houses, truncated for brevity, I'll assume they are there and I just updated the interface)
  // Actually I need to provide the full file content to `write` or it overwrites.
  {
    id: 1,
    name: 'AI Innovation House',
    city: 'San Francisco',
    state: 'CA',
    theme: 'AI',
    price: '$1,200/mo',
    pricePerMonth: 1200,
    duration: '3–6 months',
    durationValue: '3-6',
    capacity: 12,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 2,
    name: 'Climate Tech Hub',
    city: 'Austin',
    state: 'TX',
    theme: 'Climate',
    price: '$950/mo',
    pricePerMonth: 950,
    duration: '6–12 months',
    durationValue: '6-12',
    capacity: 8,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 3,
    name: 'Crypto Builders',
    city: 'Miami',
    state: 'FL',
    theme: 'Crypto',
    price: '$1,100/mo',
    pricePerMonth: 1100,
    duration: '3–6 months',
    durationValue: '3-6',
    capacity: 10,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 4,
    name: 'Hardware Lab',
    city: 'San Francisco',
    state: 'CA',
    theme: 'Hardware',
    price: '$1,350/mo',
    pricePerMonth: 1350,
    duration: '6–12 months',
    durationValue: '6-12',
    capacity: 15,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 5,
    name: 'General Startup House',
    city: 'New York',
    state: 'NY',
    theme: 'General Startup',
    price: '$1,500/mo',
    pricePerMonth: 1500,
    duration: '3–6 months',
    durationValue: '3-6',
    capacity: 20,
    status: 'Full',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 6,
    name: 'AI Research Lab',
    city: 'Seattle',
    state: 'WA',
    theme: 'AI',
    price: '$1,000/mo',
    pricePerMonth: 1000,
    duration: '12+ months',
    durationValue: '12+',
    capacity: 6,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 7,
    name: 'Climate Solutions House',
    city: 'Los Angeles',
    state: 'CA',
    theme: 'Climate',
    price: '$800/mo',
    pricePerMonth: 800,
    duration: '1–3 months',
    durationValue: '1-3',
    capacity: 7,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1515895306151-8a2f547240c4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 8,
    name: 'Crypto Innovation Hub',
    city: 'Austin',
    state: 'TX',
    theme: 'Crypto',
    price: '$1,250/mo',
    pricePerMonth: 1250,
    duration: '3–6 months',
    durationValue: '3-6',
    capacity: 14,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 9,
    name: 'Hardware Makerspace',
    city: 'New York',
    state: 'NY',
    theme: 'Hardware',
    price: '$1,400/mo',
    pricePerMonth: 1400,
    duration: '6–12 months',
    durationValue: '6-12',
    capacity: 11,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 10,
    name: 'AI Founders House',
    city: 'San Francisco',
    state: 'CA',
    theme: 'AI',
    price: '$1,100/mo',
    pricePerMonth: 1100,
    duration: '3–6 months',
    durationValue: '3-6',
    capacity: 9,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 11,
    name: 'Startup Collective',
    city: 'Miami',
    state: 'FL',
    theme: 'General Startup',
    price: '$900/mo',
    pricePerMonth: 900,
    duration: '1–3 months',
    durationValue: '1-3',
    capacity: 13,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1513884923967-4d182d5e9baf?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513884923967-4d182d5e9baf?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
  {
    id: 12,
    name: 'Climate Action Lab',
    city: 'Seattle',
    state: 'WA',
    theme: 'Climate',
    price: '$1,050/mo',
    pricePerMonth: 1050,
    duration: '6–12 months',
    durationValue: '6-12',
    capacity: 8,
    status: 'Recruiting Now',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=800&fit=crop',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&h=800&fit=crop',
    ],
  },
]

// Store for dynamically added houses (from AddHouseWizard)
export const dynamicHouses: MockHouse[] = []

// Get all houses (static + dynamic)
export const getAllHouses = (): MockHouse[] => {
  return [...allMockHouses, ...dynamicHouses]
}

// Add a new house dynamically
export const addHouse = (house: MockHouse) => {
  dynamicHouses.push(house)
}

// Get house by ID
export const getHouseById = (id: number): MockHouse | undefined => {
  return getAllHouses().find((h) => h.id === id)
}
