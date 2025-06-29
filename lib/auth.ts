import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthUser {
  userId: string
  email: string
  role: "user" | "salonOwner" | "admin"
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

export function requireAuth(request: NextRequest): AuthUser {
  const user = getAuthUser(request)

  if (!user) {
    throw new Error("Authentication required")
  }

  return user
}

export function requireRole(request: NextRequest, allowedRoles: string[]): AuthUser {
  const user = requireAuth(request)

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }

  return user
}
