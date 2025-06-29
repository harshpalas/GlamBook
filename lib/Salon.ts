import { getDatabase, COLLECTIONS, type Salon } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export class SalonModel {
  static async create(salonData: Omit<Salon, "_id" | "createdAt" | "updatedAt">): Promise<Salon> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    const newSalon: Omit<Salon, "_id"> = {
      ...salonData,
      rating: 0,
      totalReviews: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await collection.insertOne(newSalon)
    const salon = await collection.findOne({ _id: result.insertedId })

    if (!salon) {
      throw new Error("Failed to create salon")
    }

    return salon
  }

  static async findById(id: string): Promise<Salon | null> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)
    return await collection.findOne({ _id: new ObjectId(id), isActive: true })
  }

  static async findByCity(city: string, limit = 20): Promise<Salon[]> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    return await collection
      .find({
        "location.city": { $regex: city, $options: "i" },
        isActive: true,
      })
      .limit(limit)
      .toArray()
  }

  static async search(query: string, city?: string, limit = 20): Promise<Salon[]> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    const searchFilter: any = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { "services.name": { $regex: query, $options: "i" } },
      ],
    }

    if (city) {
      searchFilter["location.city"] = { $regex: city, $options: "i" }
    }

    return await collection.find(searchFilter).limit(limit).toArray()
  }

  static async findByOwner(ownerId: string): Promise<Salon[]> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    return await collection.find({ ownerId, isActive: true }).toArray()
  }

  static async updateById(id: string, updateData: Partial<Salon>): Promise<Salon | null> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

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

  static async updateRating(salonId: string, newRating: number): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    await collection.updateOne(
      { _id: new ObjectId(salonId) },
      {
        $set: {
          rating: newRating,
          updatedAt: new Date(),
        },
        $inc: { totalReviews: 1 },
      },
    )
  }

  static async addService(salonId: string, service: Salon["services"][0]): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    const serviceWithId = {
      ...service,
      _id: new ObjectId().toString(),
    }

    await collection.updateOne(
      { _id: new ObjectId(salonId) },
      {
        $push: { services: serviceWithId },
        $set: { updatedAt: new Date() },
      },
    )
  }

  static async updateService(
    salonId: string,
    serviceId: string,
    serviceData: Partial<Salon["services"][0]>,
  ): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    const updateFields: any = {}
    Object.keys(serviceData).forEach((key) => {
      if (key !== "_id") {
        updateFields[`services.$.${key}`] = serviceData[key as keyof typeof serviceData]
      }
    })

    await collection.updateOne(
      {
        _id: new ObjectId(salonId),
        "services._id": serviceId,
      },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
    )
  }

  static async removeService(salonId: string, serviceId: string): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    await collection.updateOne(
      { _id: new ObjectId(salonId) },
      {
        $pull: { services: { _id: serviceId } },
        $set: { updatedAt: new Date() },
      },
    )
  }

  static async updateAvailableSlots(salonId: string, date: string, slots: string[]): Promise<void> {
    const db = await getDatabase()
    const collection = db.collection<Salon>(COLLECTIONS.SALONS)

    await collection.updateOne(
      {
        _id: new ObjectId(salonId),
        "availableSlots.date": date,
      },
      {
        $set: {
          "availableSlots.$.slots": slots,
          updatedAt: new Date(),
        },
      },
      { upsert: false },
    )

    // If no existing slot for this date, add new one
    const salon = await collection.findOne({
      _id: new ObjectId(salonId),
      "availableSlots.date": date,
    })

    if (!salon) {
      await collection.updateOne(
        { _id: new ObjectId(salonId) },
        {
          $push: {
            availableSlots: { date, slots },
          },
          $set: { updatedAt: new Date() },
        },
      )
    }
  }
}
