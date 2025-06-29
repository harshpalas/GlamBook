import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("Login attempt for:", email) // Debug log

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Find user by email
    const user = await UserModel.findByEmail(email)
    console.log("User found:", user ? "Yes" : "No") // Debug log

    if (!user) {
      return NextResponse.json({ error: "No account found with this email. Please register first." }, { status: 401 })
    }

    // Verify password using the UserModel method
    const isValidPassword = await UserModel.verifyPassword(password, user.password)
    console.log("Password valid:", isValidPassword) // Debug log

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id?.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Remove password from response and add id field
    const { password: _, ...userWithoutPassword } = user
    const responseUser = {
      ...userWithoutPassword,
      id: user._id?.toString(),
    }

    return NextResponse.json({
      user: responseUser,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 })
  }
}
