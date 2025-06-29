"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Star, Clock, Navigation, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Salon {
  _id: string
  name: string
  location: {
    city: string
    address: string
    coordinates: [number, number]
  }
  services: Array<{ name: string; price: number; duration: number }>
  rating: number
  totalReviews: number
  images: string[]
  description: string
  distance?: number
  ownerId?: string
}

// Dummy salons for HOMEPAGE DISPLAY ONLY - these don't affect user data
const dummySalons: Salon[] = [
  {
    _id: "dummy_1",
    name: "Glamour Studio",
    location: {
      city: "Mumbai",
      address: "123 Fashion Street, Bandra West",
      coordinates: [19.0596, 72.8295],
    },
    services: [
      { name: "Haircut", price: 500, duration: 45 },
      { name: "Facial", price: 800, duration: 60 },
      { name: "Manicure", price: 300, duration: 30 },
    ],
    rating: 4.5,
    totalReviews: 127,
    images: ["/placeholder.svg?height=200&width=300"],
    description: "Premium beauty salon with expert stylists",
    distance: 1.2,
  },
  {
    _id: "dummy_2",
    name: "Royal Beauty Parlour",
    location: {
      city: "Delhi",
      address: "45 CP Market, Connaught Place",
      coordinates: [28.6139, 77.209],
    },
    services: [
      { name: "Bridal Makeup", price: 3000, duration: 120 },
      { name: "Hair Styling", price: 800, duration: 60 },
      { name: "Facial", price: 600, duration: 45 },
    ],
    rating: 4.7,
    totalReviews: 89,
    images: ["/placeholder.svg?height=200&width=300"],
    description: "Specializing in bridal makeup and styling",
    distance: 0.8,
  },
  {
    _id: "dummy_3",
    name: "Elegant Touch Salon",
    location: {
      city: "Bangalore",
      address: "78 MG Road, Brigade Road",
      coordinates: [12.9716, 77.5946],
    },
    services: [
      { name: "Haircut & Style", price: 400, duration: 45 },
      { name: "Pedicure", price: 350, duration: 40 },
      { name: "Threading", price: 100, duration: 15 },
    ],
    rating: 4.3,
    totalReviews: 156,
    images: ["/placeholder.svg?height=200&width=300"],
    description: "Modern salon with affordable prices",
    distance: 2.1,
  },
  {
    _id: "dummy_4",
    name: "Chic Style Studio",
    location: {
      city: "Chennai",
      address: "12 Anna Nagar, T Nagar",
      coordinates: [13.0827, 80.2707],
    },
    services: [
      { name: "Keratin Treatment", price: 2500, duration: 150 },
      { name: "Deep Cleansing Facial", price: 700, duration: 60 },
      { name: "Nail Art", price: 400, duration: 45 },
    ],
    rating: 4.6,
    totalReviews: 203,
    images: ["/placeholder.svg?height=200&width=300"],
    description: "Trendy salon with latest treatments",
    distance: 1.5,
  },
  {
    _id: "dummy_5",
    name: "Divine Beauty Center",
    location: {
      city: "Hyderabad",
      address: "56 Banjara Hills, Road No 3",
      coordinates: [17.385, 78.4867],
    },
    services: [
      { name: "Spa Facial", price: 900, duration: 75 },
      { name: "Hair Spa", price: 800, duration: 60 },
      { name: "Full Body Waxing", price: 1200, duration: 90 },
    ],
    rating: 4.8,
    totalReviews: 178,
    images: ["/placeholder.svg?height=200&width=300"],
    description: "Luxury spa and beauty treatments",
    distance: 3.2,
  },
]

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt")
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([])
  const [allSalons, setAllSalons] = useState<Salon[]>([])
  const [manualLocation, setManualLocation] = useState("")
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Clear any existing user data on page load to ensure fresh start
    const shouldClearData = !localStorage.getItem("user_session_started")
    if (shouldClearData) {
      localStorage.clear()
      localStorage.setItem("user_session_started", "true")
    }

    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("user")
      }
    }

    // Load salons from database + dummy salons for display
    loadSalons()

    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setLocationPermission(result.state as "granted" | "denied" | "prompt")
      })
    }
  }, [])

  const loadSalons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/salons")

      if (response.ok) {
        const dbSalons = await response.json()
        // Combine database salons with dummy salons for display
        const combinedSalons = [...dummySalons, ...dbSalons]
        setAllSalons(combinedSalons)
        setFilteredSalons(combinedSalons)
      } else {
        // If API fails, show only dummy salons for display
        setAllSalons(dummySalons)
        setFilteredSalons(dummySalons)
      }
    } catch (error) {
      console.error("Error loading salons:", error)
      // Fallback to dummy salons for display
      setAllSalons(dummySalons)
      setFilteredSalons(dummySalons)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLocationPermission("granted")
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationPermission("denied")
        },
      )
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = allSalons.filter(
        (salon) =>
          salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          salon.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          salon.services.some((service) => service.name.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredSalons(filtered)
    } else {
      setFilteredSalons(allSalons)
    }
  }

  const handleManualLocationSubmit = () => {
    if (manualLocation.trim()) {
      // Filter by city
      const filtered = allSalons.filter((salon) =>
        salon.location.city.toLowerCase().includes(manualLocation.toLowerCase()),
      )
      setFilteredSalons(filtered)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    setUser(null)
    router.push("/")
  }

  const handleBookNow = (salonId: string) => {
    if (!user) {
      // Redirect to login if not logged in
      router.push("/login")
      return
    }

    // Check if it's a dummy salon
    if (salonId.startsWith("dummy_")) {
      alert("This is a demo salon. Please register as a salon owner to create a real salon!")
      return
    }

    // Redirect to booking page for real salons
    router.push(`/book/${salonId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading salons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">GlamBook</h1>
            </div>
            <nav className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" />
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {user.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Perfect Beauty Experience</h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover and book appointments at the best salons and parlours near you
          </p>

          {/* Location Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-gray-700 font-medium">Find salons near you</span>
            </div>

            {locationPermission === "prompt" && (
              <div className="space-y-4">
                <Button onClick={getCurrentLocation} className="bg-blue-600 hover:bg-blue-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Use Current Location
                </Button>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">or</span>
                </div>
                <div className="flex space-x-2 max-w-md mx-auto">
                  <Input
                    placeholder="Enter city (e.g., Mumbai, Delhi)"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualLocationSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleManualLocationSubmit} variant="outline">
                    Search
                  </Button>
                </div>
              </div>
            )}

            {locationPermission === "granted" && userLocation && (
              <div className="text-green-600 flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1" />
                Location detected successfully
              </div>
            )}

            {locationPermission === "denied" && (
              <div className="space-y-2">
                <p className="text-amber-600">Location access denied. Please enter your location manually:</p>
                <div className="flex space-x-2 max-w-md mx-auto">
                  <Input
                    placeholder="Enter city (e.g., Mumbai, Delhi)"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualLocationSubmit()}
                    className="flex-1"
                  />
                  <Button onClick={handleManualLocationSubmit} variant="outline">
                    Search
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex space-x-2 max-w-2xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search salons, services, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 py-3 text-lg"
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Salons Grid */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Results for "${searchQuery}"` : "Available Salons"}
            </h3>
            <span className="text-gray-600">{filteredSalons.length} salons found</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <Card key={salon._id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <img
                    src={salon.images?.[0] || "/placeholder.svg?height=200&width=300"}
                    alt={salon.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {salon._id.startsWith("dummy_") && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Demo Salon</Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{salon.name}</CardTitle>
                    {salon.distance && (
                      <Badge variant="secondary" className="text-xs">
                        {salon.distance} km
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{salon.rating}</span>
                    <span className="ml-1 text-sm text-gray-500">({salon.totalReviews} reviews)</span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {salon.location.address}
                  </p>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {salon.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service.name} - ₹{service.price}
                        </Badge>
                      ))}
                      {salon.services.length === 0 && (
                        <Badge variant="outline" className="text-xs text-gray-500">
                          Services coming soon
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Available today
                      </span>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleBookNow(salon._id)}
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSalons.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No salons found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or location</p>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700">Register as Salon Owner</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold">GlamBook</span>
              </div>
              <p className="text-gray-400">Your trusted partner for beauty and wellness appointments.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Customers</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/search" className="hover:text-white">
                    Find Salons
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/offers" className="hover:text-white">
                    Offers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Business</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/partner" className="hover:text-white">
                    Partner with us
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white">
                    Business Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GlamBook. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
