import { type NextRequest, NextResponse } from "next/server"
import { ReviewModel } from "@/lib/Review"
import { SalonModel } from "@/lib/Salon"

export async function POST(request: NextRequest) {
  try {
    const reviewData = await request.json()

    // Validate required fields
    const requiredFields = ["userId", "salonId", "bookingId", "userName", "rating", "comment"]
    for (const field of requiredFields) {
      if (!reviewData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if user already reviewed this booking
    const existingReview = await ReviewModel.checkUserReviewExists(
      reviewData.userId,
      reviewData.salonId,
      reviewData.bookingId,
    )

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 409 })
    }

    // Create review
    const newReview = await ReviewModel.create(reviewData)

    // Update salon's average rating
    const averageRating = await ReviewModel.getAverageRating(reviewData.salonId)
    await SalonModel.updateRating(reviewData.salonId, averageRating)

    return NextResponse.json(newReview, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const salonId = searchParams.get("salonId")
    const userId = searchParams.get("userId")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let reviews

    if (salonId) {
      reviews = await ReviewModel.findBySalon(salonId, limit)
    } else if (userId) {
      reviews = await ReviewModel.findByUser(userId)
    } else {
      return NextResponse.json({ error: "salonId or userId parameter is required" }, { status: 400 })
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
