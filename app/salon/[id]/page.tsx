"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, MapPin, Clock, Phone, Calendar, ArrowLeft, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface Service {
  name: string
  price: number
  duration: number
  description?: string
}

interface Review {
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

interface Salon {
  _id: string
  name: string
  location: {
    city: string
    address: string
    coordinates: [number, number]
  }
  services: Service[]
  rating: number
  reviews: Review[]
  images: string[]
  description: string
  phone: string
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  availableSlots: Array<{
    date: string
    slots: string[]
  }>
}

const mockSalonData: { [key: string]: Salon } = {
  "1": {
    _id: "1",
    name: "Glamour Studio",
    location: {
      city: "Mumbai",
      address: "123 Fashion Street, Bandra West, Mumbai - 400050",
      coordinates: [19.0596, 72.8295],
    },
    services: [
      { name: "Haircut & Styling", price: 500, duration: 45, description: "Professional haircut with styling" },
      { name: "Facial Treatment", price: 800, duration: 60, description: "Deep cleansing facial with moisturizing" },
      { name: "Manicure", price: 300, duration: 30, description: "Complete nail care and polish" },
      { name: "Pedicure", price: 400, duration: 45, description: "Foot care and nail treatment" },
      { name: "Hair Color", price: 1200, duration: 90, description: "Professional hair coloring service" },
      { name: "Bridal Makeup", price: 2500, duration: 120, description: "Complete bridal makeup package" },
    ],
    rating: 4.5,
    reviews: [
      {
        userId: "1",
        userName: "Priya Sharma",
        rating: 5,
        comment: "Excellent service! The staff is very professional and the ambiance is great.",
        date: "2024-01-15",
      },
      {
        userId: "2",
        userName: "Anita Desai",
        rating: 4,
        comment: "Great haircut and styling. Will definitely come back!",
        date: "2024-01-10",
      },
      {
        userId: "3",
        userName: "Meera Patel",
        rating: 5,
        comment: "Amazing bridal makeup service. Highly recommended!",
        date: "2024-01-08",
      },
    ],
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    description:
      "Glamour Studio is a premium beauty salon offering a wide range of services including haircuts, styling, facials, manicures, pedicures, and bridal makeup. Our experienced professionals use high-quality products to ensure you look and feel your best.",
    phone: "+91 98765 43210",
    hours: {
      monday: { open: "10:00", close: "20:00" },
      tuesday: { open: "10:00", close: "20:00" },
      wednesday: { open: "10:00", close: "20:00" },
      thursday: { open: "10:00", close: "20:00" },
      friday: { open: "10:00", close: "20:00" },
      saturday: { open: "09:00", close: "21:00" },
      sunday: { open: "09:00", close: "21:00" },
    },
    availableSlots: [
      {
        date: "2024-01-20",
        slots: ["10:00", "11:00", "14:00", "15:00", "16:00"],
      },
      {
        date: "2024-01-21",
        slots: ["09:00", "10:00", "13:00", "14:00", "17:00"],
      },
    ],
  },
}

export default function SalonDetailPage() {
  const params = useParams()
  const salonId = params.id as string
  const [salon, setSalon] = useState<Salon | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // In a real app, fetch salon data from API
    const salonData = mockSalonData[salonId]
    if (salonData) {
      setSalon(salonData)
    }
  }, [salonId])

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p>Loading salon details...</p>
        </div>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ))
  }

  const getCurrentDayHours = () => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const today = days[new Date().getDay()]
    return salon.hours[today]
  }

  const todayHours = getCurrentDayHours()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  GlamBook
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        <div className="h-64 md:h-80 overflow-hidden">
          <img src={salon.images[0] || "/placeholder.svg"} alt={salon.name} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </section>

      {/* Salon Info */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{salon.name}</h1>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <div className="flex items-center">
                        {renderStars(salon.rating)}
                        <span className="ml-2 font-medium">{salon.rating}</span>
                        <span className="ml-1">({salon.reviews.length} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Open Now
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{salon.location.address}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{salon.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Today: {todayHours.open} - {todayHours.close}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-gray-700">{salon.description}</p>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="services" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>

              <TabsContent value="services" className="space-y-4">
                <div className="grid gap-4">
                  {salon.services.map((service, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            {service.description && <p className="text-gray-600 text-sm mt-1">{service.description}</p>}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {service.duration} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-pink-600">₹{service.price}</div>
                            <Link href={`/book/${salon._id}?service=${encodeURIComponent(service.name)}`}>
                              <Button size="sm" className="mt-2 bg-pink-500 hover:bg-pink-600">
                                Book Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-4">
                <div className="space-y-4">
                  {salon.reviews.map((review, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar>
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{review.userName}</h4>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                            <div className="flex items-center mb-2">{renderStars(review.rating)}</div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="gallery" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {salon.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${salon.name} gallery ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Book */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Quick Book
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/book/${salon._id}`}>
                  <Button className="w-full bg-pink-500 hover:bg-pink-600" size="lg">
                    Book Appointment
                  </Button>
                </Link>
                <div className="text-center text-sm text-gray-600">
                  Available slots today: {salon.availableSlots[0]?.slots.length || 0}
                </div>
              </CardContent>
            </Card>

            {/* Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Opening Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(salon.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-gray-600">
                        {hours.closed ? "Closed" : `${hours.open} - ${hours.close}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">{salon.phone}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                  <span className="text-sm">{salon.location.address}</span>
                </div>
                <Button variant="outline" className="w-full">
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
