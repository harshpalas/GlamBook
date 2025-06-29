import { type NextRequest, NextResponse } from "next/server"
import { BookingModel } from "@/lib/Booking"

export async function GET(request: NextRequest, { params }: { params: { salonId: string } }) {
  try {
    const salonId = params.salonId

    const stats = await BookingModel.getBookingStats(salonId)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
