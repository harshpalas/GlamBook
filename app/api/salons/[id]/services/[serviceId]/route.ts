import { type NextRequest, NextResponse } from "next/server"
import { SalonModel } from "@/lib/Salon"

export async function PUT(request: NextRequest, { params }: { params: { id: string; serviceId: string } }) {
  try {
    const { id: salonId, serviceId } = params
    const serviceData = await request.json()

    await SalonModel.updateService(salonId, serviceId, serviceData)

    return NextResponse.json({ message: "Service updated successfully" })
  } catch (error) {
    console.error("Error updating service:", error)
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; serviceId: string } }) {
  try {
    const { id: salonId, serviceId } = params

    await SalonModel.removeService(salonId, serviceId)

    return NextResponse.json({ message: "Service deleted successfully" })
  } catch (error) {
    console.error("Error deleting service:", error)
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 })
  }
}
