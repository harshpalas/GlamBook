"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface Service {
  id: string
  name: string
  price: number
  duration: number
}

interface Shop {
  id: string
  name: string
  description: string
  address: string
  city: string
  phone: string
  services: Service[]
  images: string[]
  ownerId: string
}

interface BookingData {
  customerName: string
  customerPhone: string
  customerEmail: string
  date: string
  timeSlot: string
  notes: string
}

export default function BookingPage() {
  const params = useParams()
  const router = useRouter()
  const salonId = params.salonId as string

  const [shop, setShop] = useState<Shop | null>(null)
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [bookingData, setBookingData] = useState<BookingData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    date: "",
    timeSlot: "",
    notes: "",
  })
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Available time slots
  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
    "20:00",
  ]

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setBookingData((prev) => ({
        ...prev,
        customerName: parsedUser.name || "",
        customerEmail: parsedUser.email || "",
        customerPhone: parsedUser.phone || "",
      }))
    }

    // Load shop data
    loadShopData()
  }, [salonId])

  const loadShopData = () => {
    const shopData = localStorage.getItem(salonId)
    if (shopData) {
      setShop(JSON.parse(shopData))
    } else {
      setError("Salon not found")
    }
  }

  const handleServiceToggle = (service: Service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id)
      if (exists) {
        return prev.filter((s) => s.id !== service.id)
      } else {
        return [...prev, service]
      }
    })
  }

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.price, 0)
  }

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0)
  }

  const handleBooking = async () => {
    if (!shop) return

    // Validation
    if (selectedServices.length === 0) {
      setError("Please select at least one service")
      return
    }

    if (!bookingData.customerName || !bookingData.customerPhone || !bookingData.date || !bookingData.timeSlot) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Create booking object
      const booking = {
        id: Date.now().toString(),
        salonId: shop.id,
        salonName: shop.name,
        customerName: bookingData.customerName,
        customerPhone: bookingData.customerPhone,
        customerEmail: bookingData.customerEmail,
        service: selectedServices.map((s) => s.name).join(", "),
        services: selectedServices,
        date: bookingData.date,
        time: bookingData.timeSlot,
        status: "pending",
        price: getTotalPrice(),
        totalDuration: getTotalDuration(),
        notes: bookingData.notes,
        createdAt: new Date().toISOString(),
        paymentStatus: "pending",
      }

      // Save to user's bookings if logged in
      if (user) {
        const userBookingsKey = `bookings_${user.email}`
        const userBookings = JSON.parse(localStorage.getItem(userBookingsKey) || "[]")
        userBookings.push(booking)
        localStorage.setItem(userBookingsKey, JSON.stringify(userBookings))
      }

      // Save to salon owner's bookings
      const ownerId = shop.ownerId
      const salonBookingsKey = `salon_bookings_${ownerId}`
      const salonBookings = JSON.parse(localStorage.getItem(salonBookingsKey) || "[]")
      salonBookings.push(booking)
      localStorage.setItem(salonBookingsKey, JSON.stringify(salonBookings))

      setSuccess(true)

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        if (user) {
          router.push("/dashboard")
        } else {
          router.push("/")
        }
      }, 2000)
    } catch (error) {
      setError("Failed to create booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading salon details...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your appointment request has been sent to {shop.name}. You'll receive a confirmation once they approve it.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Salons
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Book Appointment</h1>
              <p className="text-gray-600">{shop.name}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Salon Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Salon Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shop.images.length > 0 && (
                  <img
                    src={shop.images[0] || "/placeholder.svg"}
                    alt={shop.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{shop.name}</h3>
                  <p className="text-gray-600">{shop.description}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {shop.address}, {shop.city}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {shop.phone}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle>Select Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {shop.services.map((service) => (
                    <div
                      key={service.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedServices.find((s) => s.id === service.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleServiceToggle(service)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.duration} minutes</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">₹{service.price}</p>
                          {selectedServices.find((s) => s.id === service.id) && (
                            <Badge className="mt-1">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {shop.services.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No services available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={bookingData.customerPhone}
                      onChange={(e) => setBookingData({ ...bookingData, customerPhone: e.target.value })}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={bookingData.customerEmail}
                    onChange={(e) => setBookingData({ ...bookingData, customerEmail: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Preferred Time *</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={bookingData.timeSlot === slot ? "default" : "outline"}
                        size="sm"
                        onClick={() => setBookingData({ ...bookingData, timeSlot: slot })}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Special Notes</Label>
                  <Textarea
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Any special requests or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            {selectedServices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex justify-between">
                        <span>{service.name}</span>
                        <span>₹{service.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Duration:</span>
                      <span>{getTotalDuration()} minutes</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Price:</span>
                      <span className="text-blue-600">₹{getTotalPrice()}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Payment:</strong> You'll only pay after the salon confirms your appointment. You can
                      choose to pay in advance or after the service.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={handleBooking}
              disabled={loading || selectedServices.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>

            {!user && (
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Login
                  </Link>{" "}
                  for faster booking
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
