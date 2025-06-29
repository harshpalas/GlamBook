import { type NextRequest, NextResponse } from "next/server"
import { BookingModel } from "@/lib/Booking"
import { UserModel } from "@/lib/User"

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json()

    // Validate required fields
    const requiredFields = ["salonId", "services", "date", "timeSlot", "customerName", "customerPhone"]
    for (const field of requiredFields) {
      if (!bookingData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Check if slot is still available
    const isAvailable = await BookingModel.checkSlotAvailability(
      bookingData.salonId,
      bookingData.date,
      bookingData.timeSlot,
    )

    if (!isAvailable) {
      return NextResponse.json({ error: "Selected time slot is no longer available" }, { status: 409 })
    }

    // Create booking
    const newBooking = await BookingModel.create({
      ...bookingData,
      userId: bookingData.userId || "guest",
    })

    // Add booking to user's bookings if user is logged in
    if (bookingData.userId && bookingData.userId !== "guest") {
      await UserModel.addBooking(bookingData.userId, newBooking._id!.toString())
    }

    return NextResponse.json(newBooking, { status: 201 })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const salonId = searchParams.get("salonId")

    let bookings

    if (userId) {
      bookings = await BookingModel.findByUser(userId)
    } else if (salonId) {
      bookings = await BookingModel.findBySalon(salonId)
    } else {
      return NextResponse.json({ error: "userId or salonId parameter is required" }, { status: 400 })
    }

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}
