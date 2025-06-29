import { getDatabase, COLLECTIONS, type Booking } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export class BookingModel {
  static async create(bookingData: Omit<Booking, "_id" | "createdAt" | "updatedAt">): Promise<Booking> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    const newBooking: Omit<Booking, "_id"> = {
      ...bookingData,
      status: "booked",
      paymentStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newBooking)
    const booking = await collection.findOne({ _id: result.insertedId })

    if (!booking) {
      throw new Error("Failed to create booking")
    }

    return booking
  }

  static async findById(id: string): Promise<Booking | null> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)
    return await collection.findOne({ _id: new ObjectId(id) })
  }

  static async findByUser(userId: string): Promise<Booking[]> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    return await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
  }

  static async findBySalon(salonId: string): Promise<Booking[]> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    return await collection.find({ salonId }).sort({ date: 1, timeSlot: 1 }).toArray()
  }

  static async findByDateRange(salonId: string, startDate: string, endDate: string): Promise<Booking[]> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    return await collection
      .find({
        salonId,
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      })
      .sort({ date: 1, timeSlot: 1 })
      .toArray()
  }

  static async updateStatus(id: string, status: Booking["status"]): Promise<Booking | null> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value
  }

  static async updatePaymentStatus(id: string, paymentStatus: Booking["paymentStatus"]): Promise<Booking | null> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          paymentStatus,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    return result.value
  }

  static async checkSlotAvailability(salonId: string, date: string, timeSlot: string): Promise<boolean> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    const existingBooking = await collection.findOne({
      salonId,
      date,
      timeSlot,
      status: { $in: ["booked", "confirmed"] },
    })

    return !existingBooking
  }

  static async getBookingStats(salonId: string): Promise<{
    totalBookings: number
    completedBookings: number
    totalRevenue: number
    averageRating: number
  }> {
    const db = await getDatabase()
    const collection = db.collection<Booking>(COLLECTIONS.BOOKINGS)

    const stats = await collection
      .aggregate([
        { $match: { salonId } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            totalRevenue: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, "$totalPrice", 0] },
            },
          },
        },
      ])
      .toArray()

    const result = stats[0] || {
      totalBookings: 0,
      completedBookings: 0,
      totalRevenue: 0,
    }

    return {
      ...result,
      averageRating: 0, // This would be calculated from reviews
    }
  }
}
