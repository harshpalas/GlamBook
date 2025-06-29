import { MongoClient, type Db } from "mongodb"

if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}

const uri = process.env.DATABASE_URL
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("glambook")
}

// Database Collections
export const COLLECTIONS = {
  USERS: "users",
  SALONS: "salons",
  BOOKINGS: "bookings",
  REVIEWS: "reviews",
} as const

// Database Interfaces
export interface User {
  _id?: string
  name: string
  email: string
  password: string
  role: "user" | "salonOwner" | "admin"
  phone?: string
  bookings: string[]
  favorites: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Salon {
  _id?: string
  name: string
  location: {
    city: string
    address: string
    coordinates: [number, number]
  }
  services: Array<{
    _id: string
    name: string
    price: number
    duration: number
    description?: string
  }>
  rating: number
  totalReviews: number
  images: string[]
  description: string
  phone: string
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  availableSlots: Array<{
    date: string
    slots: string[]
  }>
  ownerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  _id?: string
  userId: string
  salonId: string
  services: Array<{
    _id: string
    name: string
    price: number
    duration: number
  }>
  date: string
  timeSlot: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  notes?: string
  totalPrice: number
  totalDuration: number
  status: "booked" | "confirmed" | "completed" | "cancelled"
  paymentStatus: "pending" | "paid" | "refunded"
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: string
  userId: string
  salonId: string
  bookingId: string
  userName: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
}
