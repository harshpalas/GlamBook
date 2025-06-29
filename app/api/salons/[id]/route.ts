import { type NextRequest, NextResponse } from "next/server"
import { SalonModel } from "@/lib/Salon"
import { ReviewModel } from "@/lib/Review"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salonId = params.id

    const salon = await SalonModel.findById(salonId)
    if (!salon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 })
    }

    // Get reviews for this salon
    const reviews = await ReviewModel.findBySalon(salonId, 10)

    // Calculate average rating
    const averageRating = await ReviewModel.getAverageRating(salonId)

    const salonWithReviews = {
      ...salon,
      rating: averageRating,
      reviews: reviews,
    }

    return NextResponse.json(salonWithReviews)
  } catch (error) {
    console.error("Error fetching salon:", error)
    return NextResponse.json({ error: "Failed to fetch salon" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salonId = params.id
    const updateData = await request.json()

    const updatedSalon = await SalonModel.updateById(salonId, updateData)
    if (!updatedSalon) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSalon)
  } catch (error) {
    console.error("Error updating salon:", error)
    return NextResponse.json({ error: "Failed to update salon" }, { status: 500 })
  }
}
