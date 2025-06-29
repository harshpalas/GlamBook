import { type NextRequest, NextResponse } from "next/server"
import { SalonModel } from "@/lib/Salon"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const salonId = params.id
    const serviceData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "price", "duration"]
    for (const field of requiredFields) {
      if (!serviceData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    await SalonModel.addService(salonId, serviceData)

    return NextResponse.json({ message: "Service added successfully" }, { status: 201 })
  } catch (error) {
    console.error("Error adding service:", error)
    return NextResponse.json({ error: "Failed to add service" }, { status: 500 })
  }
}
