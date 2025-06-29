const { MongoClient } = require("mongodb")

const uri = process.env.DATABASE_URL || "mongodb://localhost:27017"
const dbName = "glambook"

async function clearDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)

    // Clear ALL collections for fresh start
    await db.collection("users").deleteMany({})
    await db.collection("salons").deleteMany({})
    await db.collection("bookings").deleteMany({})
    await db.collection("reviews").deleteMany({})
    await db.collection("chat_messages").deleteMany({})

    console.log("✅ Database cleared successfully!")
    console.log("🆕 Ready for fresh user registrations")
    console.log("🏠 Homepage will show dummy salons for display only")
    console.log("👤 All user/owner data will be fresh and real")
  } catch (error) {
    console.error("❌ Error clearing database:", error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  clearDatabase()
}

module.exports = { clearDatabase }
