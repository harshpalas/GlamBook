import { type NextRequest, NextResponse } from "next/server"
import { BookingModel } from "@/lib/Booking"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const booking = await BookingModel.findById(params.id)

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()

    if (updates.status) {
      const updatedBooking = await BookingModel.updateStatus(params.id, updates.status)
      if (!updatedBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      return NextResponse.json(updatedBooking)
    }

    if (updates.paymentStatus) {
      const updatedBooking = await BookingModel.updatePaymentStatus(params.id, updates.paymentStatus)
      if (!updatedBooking) {
        return NextResponse.json({ error: "Booking not found" }, { status: 404 })
      }
      return NextResponse.json(updatedBooking)
    }

    return NextResponse.json({ error: "No valid updates provided" }, { status: 400 })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
