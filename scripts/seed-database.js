const { MongoClient } = require("mongodb")

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017"
const dbName = "glambook"

const sampleSalons = [
  {
    name: "Glamour Studio",
    location: {
      city: "Mumbai",
      address: "123 Fashion Street, Bandra West, Mumbai - 400050",
      coordinates: [19.0596, 72.8295],
    },
    services: [
      {
        _id: "service1",
        name: "Haircut & Styling",
        price: 500,
        duration: 45,
        description: "Professional haircut with styling",
      },
      {
        _id: "service2",
        name: "Facial Treatment",
        price: 800,
        duration: 60,
        description: "Deep cleansing facial with moisturizing",
      },
      {
        _id: "service3",
        name: "Manicure",
        price: 300,
        duration: 30,
        description: "Complete nail care and polish",
      },
    ],
    rating: 4.5,
    totalReviews: 25,
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=300&width=400"],
    description:
      "Glamour Studio is a premium beauty salon offering a wide range of services including haircuts, styling, facials, and nail care.",
    phone: "+91 98765 43210",
    hours: {
      monday: { open: "10:00", close: "20:00" },
      tuesday: { open: "10:00", close: "20:00" },
      wednesday: { open: "10:00", close: "20:00" },
      thursday: { open: "10:00", close: "20:00" },
      friday: { open: "10:00", close: "20:00" },
      saturday: { open: "09:00", close: "21:00" },
      sunday: { open: "09:00", close: "21:00" },
    },
    availableSlots: [
      {
        date: "2024-01-25",
        slots: ["10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        date: "2024-01-26",
        slots: ["09:00", "10:00", "13:00", "14:00", "17:00"],
      },
    ],
    ownerId: "owner1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name: "Beauty Paradise",
    location: {
      city: "Mumbai",
      address: "456 Link Road, Andheri West, Mumbai - 400053",
      coordinates: [19.1136, 72.8697],
    },
    services: [
      {
        _id: "service4",
        name: "Hair Styling",
        price: 600,
        duration: 60,
        description: "Professional hair styling service",
      },
      {
        _id: "service5",
        name: "Pedicure",
        price: 400,
        duration: 45,
        description: "Foot care and nail treatment",
      },
      {
        _id: "service6",
        name: "Threading",
        price: 150,
        duration: 15,
        description: "Eyebrow and facial threading",
      },
    ],
    rating: 4.2,
    totalReviews: 18,
    images: ["/placeholder.svg?height=400&width=600"],
    description: "Beauty Paradise offers comprehensive beauty services in a relaxing environment.",
    phone: "+91 98765 54321",
    hours: {
      monday: { open: "10:00", close: "20:00" },
      tuesday: { open: "10:00", close: "20:00" },
      wednesday: { open: "10:00", close: "20:00" },
      thursday: { open: "10:00", close: "20:00" },
      friday: { open: "10:00", close: "20:00" },
      saturday: { open: "09:00", close: "21:00" },
      sunday: { closed: true },
    },
    availableSlots: [
      {
        date: "2024-01-25",
        slots: ["11:00", "12:00", "15:00", "16:00"],
      },
    ],
    ownerId: "owner2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

async function seedDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)

    // Clear existing collections
    await db.collection("users").deleteMany({})
    await db.collection("salons").deleteMany({})
    await db.collection("bookings").deleteMany({})
    await db.collection("reviews").deleteMany({})
    await db.collection("chat_messages").deleteMany({})

    console.log("Cleared existing data")

    // Insert sample salons
    await db.collection("salons").insertMany(sampleSalons)
    console.log("Sample salons inserted")

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("salons").createIndex({ "location.city": 1 })
    await db.collection("salons").createIndex({ name: "text", description: "text" })
    await db.collection("bookings").createIndex({ userId: 1 })
    await db.collection("bookings").createIndex({ salonId: 1 })
    await db.collection("chat_messages").createIndex({ bookingId: 1 })

    console.log("Created indexes")

    console.log("Database seeded successfully!")
    console.log("The database is now ready for fresh user registrations.")
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  seedDatabase()
}

module.exports = { seedDatabase }
