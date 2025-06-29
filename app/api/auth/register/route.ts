import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json()

    console.log("Registration attempt for:", email, "as", role) // Debug log

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!["user", "salonOwner"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    // Create new user
    const newUser = await UserModel.create({
      name,
      email,
      password,
      role: role as "user" | "salonOwner",
      bookings: [],
      favorites: [],
    })

    console.log("User created successfully:", newUser._id) // Debug log

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser._id?.toString(),
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Remove password from response and add id field
    const { password: _, ...userWithoutPassword } = newUser
    const responseUser = {
      ...userWithoutPassword,
      id: newUser._id?.toString(),
    }

    return NextResponse.json({
      user: responseUser,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
