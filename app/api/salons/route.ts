import { type NextRequest, NextResponse } from "next/server"
import { SalonModel } from "@/lib/Salon"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const search = searchParams.get("search")
    const ownerId = searchParams.get("ownerId")

    let salons

    if (ownerId) {
      // Get salons for specific owner
      salons = await SalonModel.findByOwner(ownerId)
    } else if (search) {
      // Search salons
      salons = await SalonModel.search(search, city || undefined)
    } else if (city) {
      // Get salons by city
      salons = await SalonModel.findByCity(city)
    } else {
      // Get all active salons (for homepage)
      salons = await SalonModel.findByCity("", 50) // Get up to 50 salons
    }

    return NextResponse.json(salons)
  } catch (error) {
    console.error("Error fetching salons:", error)
    return NextResponse.json({ error: "Failed to fetch salons" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const salonData = await request.json()

    // Validate required fields
    const requiredFields = ["name", "location", "ownerId"]
    for (const field of requiredFields) {
      if (!salonData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    const newSalon = await SalonModel.create(salonData)
    return NextResponse.json(newSalon, { status: 201 })
  } catch (error) {
    console.error("Error creating salon:", error)
    return NextResponse.json({ error: "Failed to create salon" }, { status: 500 })
  }
}
