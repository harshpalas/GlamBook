import { getDatabase, COLLECTIONS, type User } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export class UserModel {
  static async create(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    const newUser: Omit<User, "_id"> = {
      ...userData,
      password: hashedPassword,
      bookings: [],
      favorites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newUser)
    const user = await collection.findOne({ _id: result.insertedId })

    if (!user) {
      throw new Error("Failed to create user")
    }

    return user
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    return await collection.findOne({ email })
  }

  static async findById(id: string): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async updateById(id: string, updateData: Partial<User>): Promise<User | null> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  static async addBooking(userId: string, bookingId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: { bookings: bookingId },
        $set: { updatedAt: new Date() },
      },
    )
  }

  static async addFavorite(userId: string, salonId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $addToSet: { favorites: salonId },
        $set: { updatedAt: new Date() },
      },
    )
  }

  static async removeFavorite(userId: string, salonId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<User>(COLLECTIONS.USERS)

    await collection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: { favorites: salonId },
        $set: { updatedAt: new Date() },
      },
    )
  }
}
