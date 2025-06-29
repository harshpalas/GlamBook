import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const db = await getDatabase()
    const messages = await db
      .collection("chat_messages")
      .find({ bookingId: params.bookingId })
      .sort({ timestamp: 1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const { senderId, senderName, senderRole, message } = await request.json()

    if (!senderId || !senderName || !senderRole || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const newMessage = {
      bookingId: params.bookingId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date(),
    }

    const result = await db.collection("chat_messages").insertOne(newMessage)
    const savedMessage = await db.collection("chat_messages").findOne({ _id: result.insertedId })

    return NextResponse.json(savedMessage, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
