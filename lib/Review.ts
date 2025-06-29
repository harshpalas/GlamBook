import { getDatabase, COLLECTIONS, type Review } from "@/lib/mongodb"

export class ReviewModel {
  static async create(reviewData: Omit<Review, "_id" | "createdAt" | "updatedAt">): Promise<Review> {
    const db = await getDatabase()
    const collection = db.collection<Review>(COLLECTIONS.REVIEWS)

    const newReview: Omit<Review, "_id"> = {
      ...reviewData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newReview)
    const review = await collection.findOne({ _id: result.insertedId })

    if (!review) {
      throw new Error("Failed to create review")
    }

    return review
  }

  static async findBySalon(salonId: string, limit = 20): Promise<Review[]> {
    const db = await getDatabase()
    const collection = db.collection<Review>(COLLECTIONS.REVIEWS)

    return await collection.find({ salonId }).sort({ createdAt: -1 }).limit(limit).toArray()
  }

  static async findByUser(userId: string): Promise<Review[]> {
    const db = await getDatabase()
    const collection = db.collection<Review>(COLLECTIONS.REVIEWS)

    return await collection.find({ userId }).sort({ createdAt: -1 }).toArray()
  }

  static async getAverageRating(salonId: string): Promise<number> {
    const db = await getDatabase()
    const collection = db.collection<Review>(COLLECTIONS.REVIEWS)

    const result = await collection
      .aggregate([
        { $match: { salonId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ])
      .toArray()

    return result[0]?.averageRating || 0
  }

  static async checkUserReviewExists(userId: string, salonId: string, bookingId: string): Promise<boolean> {
    const db = await getDatabase()
    const collection = db.collection<Review>(COLLECTIONS.REVIEWS)

    const review = await collection.findOne({ userId, salonId, bookingId })
    return !!review
  }
}
