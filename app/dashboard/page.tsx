"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Calendar,
  Clock,
  LogOut,
  User,
  Heart,
  History,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  Plus,
  MessageCircle,
  Store,
  DollarSign,
  Camera,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import { useRouter } from "next/navigation"




interface Booking {
  id: string
  salonName: string
  service: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled" | "reschedule_requested"
  price: number
  salonId: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  notes?: string
  services?: Array<{ name: string; price: number; duration: number }>
  totalDuration?: number
  createdAt?: string
  rescheduleRequest?: {
    newDate: string
    newTime: string
    reason?: string
  }
  paymentStatus?: "pending" | "paid_advance" | "paid_after"
  paymentMethod?: "advance" | "after_service"
}

interface Shop {
  id: string
  name: string
  description: string
  address: string
  city: string
  phone: string
  services: Array<{ id: string; name: string; price: number; duration: number }>
  images: string[]
  hours: {
    [key: string]: { open: string; close: string; closed?: boolean }
  }
  ownerId: string
}

interface ChatMessage {
  id: string
  bookingId: string
  senderId: string
  senderName: string
  senderRole: "user" | "salonOwner"
  message: string
  timestamp: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [salonBookings, setSalonBookings] = useState<Booking[]>([])
  const [shop, setShop] = useState<Shop | null>(null)
  const [activeTab, setActiveTab] = useState("bookings")
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    reason: "",
  })
  const [showShopForm, setShowShopForm] = useState(false)
  const [shopData, setShopData] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
  })
  
  const [shopServices, setShopServices] = useState<
    Array<{ id: string; name: string; price: number; duration: number }>
  >([])
  const [newService, setNewService] = useState({ name: "", price: 0, duration: 0 })
  const [shopImages, setShopImages] = useState<string[]>([])
  const [chatBooking, setChatBooking] = useState<Booking | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [paymentDialog, setPaymentDialog] = useState<Booking | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const router = useRouter()

  // Real-time update function
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setProfileData({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.phone || "",
      })

      if (parsedUser.role === "user") {
        // Load user-specific bookings (FRESH DATA ONLY)
        loadUserBookings(parsedUser.email)
      } else if (parsedUser.role === "salonOwner") {
        // Load shop data and bookings for salon owner (FRESH DATA ONLY)
        loadShopData(parsedUser.id)
        loadSalonBookings(parsedUser.id)
      }
    } else {
      router.push("/login")
    }
  }, [router, refreshTrigger])

  const loadUserBookings = (email: string) => {
    // Load ONLY real user bookings - no dummy data
    const userBookingsKey = `bookings_${email}`
    const userBookings = localStorage.getItem(userBookingsKey)
    if (userBookings) {
      setBookings(JSON.parse(userBookings))
    } else {
      setBookings([]) // Start with empty array for fresh users
    }
  }

  const loadSalonBookings = (ownerId: string) => {
    // Load ONLY real salon bookings - no dummy data
    const salonBookingsKey = `salon_bookings_${ownerId}`
    const salonBookings = localStorage.getItem(salonBookingsKey)
    if (salonBookings) {
      setSalonBookings(JSON.parse(salonBookings))
    } else {
      setSalonBookings([]) // Start with empty array for fresh owners
    }
  }

  const loadShopData = (ownerId: string) => {
    // Load ONLY real shop data - no dummy data
    const shopKey = `shop_${ownerId}`
    const shopData = localStorage.getItem(shopKey)
    if (shopData) {
      const parsedShop = JSON.parse(shopData)
      setShop(parsedShop)
      setShopData({
        name: parsedShop.name,
        description: parsedShop.description,
        address: parsedShop.address,
        city: parsedShop.city,
        phone: parsedShop.phone,
      })
      setShopServices(parsedShop.services || [])
      setShopImages(parsedShop.images || [])
    } else {
      setShop(null) // No shop created yet
    }
  }

  const loadChatMessages = (bookingId: string) => {
    const chatKey = `chat_${bookingId}`
    const messages = localStorage.getItem(chatKey)
    if (messages) {
      setChatMessages(JSON.parse(messages))
    } else {
      setChatMessages([])
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const handleBookingStatusChange = (bookingId: string, newStatus: "confirmed" | "cancelled" | "completed") => {
    if (!user) return

    // Update in salon owner's specific bookings
    const salonBookingsKey = `salon_bookings_${user.id}`
    const salonBookings = JSON.parse(localStorage.getItem(salonBookingsKey) || "[]")
    const updatedSalonBookings = salonBookings.map((booking: Booking) =>
      booking.id === bookingId ? { ...booking, status: newStatus } : booking,
    )
    localStorage.setItem(salonBookingsKey, JSON.stringify(updatedSalonBookings))
    setSalonBookings(updatedSalonBookings)

    // Update in user's personal bookings
    const booking = salonBookings.find((b: Booking) => b.id === bookingId)
    if (booking && booking.customerEmail) {
      const userBookingsKey = `bookings_${booking.customerEmail}`
      const userBookings = JSON.parse(localStorage.getItem(userBookingsKey) || "[]")
      const updatedUserBookings = userBookings.map((b: Booking) =>
        b.id === bookingId ? { ...b, status: newStatus } : b,
      )
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedUserBookings))

      // If current user is the customer, update local state
      if (user?.email === booking.customerEmail) {
        setBookings(updatedUserBookings)
      }
    }

    triggerRefresh()
  }

  const handleRescheduleRequest = (booking: Booking) => {
    setRescheduleBooking(booking)
    setRescheduleData({
      date: booking.date,
      time: booking.time,
      reason: "",
    })
  }

  const submitRescheduleRequest = () => {
    if (rescheduleBooking && rescheduleData.date && rescheduleData.time && user) {
      // Update booking with reschedule request
      const userBookingsKey = `bookings_${user.email}`
      const userBookings = JSON.parse(localStorage.getItem(userBookingsKey) || "[]")
      const updatedUserBookings = userBookings.map((b: Booking) =>
        b.id === rescheduleBooking.id
          ? {
              ...b,
              status: "reschedule_requested",
              rescheduleRequest: {
                newDate: rescheduleData.date,
                newTime: rescheduleData.time,
                reason: rescheduleData.reason,
              },
            }
          : b,
      )
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedUserBookings))
      setBookings(updatedUserBookings)

      // Update in salon owner's bookings
      const booking = userBookings.find((b: Booking) => b.id === rescheduleBooking.id)
      if (booking && booking.salonId) {
        // Extract owner ID from salon ID
        const ownerId = booking.salonId.replace("shop_", "")
        const salonBookingsKey = `salon_bookings_${ownerId}`
        const salonBookings = JSON.parse(localStorage.getItem(salonBookingsKey) || "[]")
        const updatedSalonBookings = salonBookings.map((b: Booking) =>
          b.id === rescheduleBooking.id
            ? {
                ...b,
                status: "reschedule_requested",
                rescheduleRequest: {
                  newDate: rescheduleData.date,
                  newTime: rescheduleData.time,
                  reason: rescheduleData.reason,
                },
              }
            : b,
        )
        localStorage.setItem(salonBookingsKey, JSON.stringify(updatedSalonBookings))
      }

      setRescheduleBooking(null)
      setRescheduleData({ date: "", time: "", reason: "" })
      triggerRefresh()
    }
  }

  const handleRescheduleApproval = (bookingId: string, approve: boolean) => {
    if (!user) return

    const salonBookingsKey = `salon_bookings_${user.id}`
    const salonBookings = JSON.parse(localStorage.getItem(salonBookingsKey) || "[]")
    const booking = salonBookings.find((b: Booking) => b.id === bookingId)

    if (booking && booking.rescheduleRequest) {
      let updatedBooking
      if (approve) {
        updatedBooking = {
          ...booking,
          date: booking.rescheduleRequest.newDate,
          time: booking.rescheduleRequest.newTime,
          status: "confirmed",
          rescheduleRequest: undefined,
        }
      } else {
        updatedBooking = {
          ...booking,
          status: "confirmed",
          rescheduleRequest: undefined,
        }
      }

      const updatedSalonBookings = salonBookings.map((b: Booking) => (b.id === bookingId ? updatedBooking : b))
      localStorage.setItem(salonBookingsKey, JSON.stringify(updatedSalonBookings))
      setSalonBookings(updatedSalonBookings)

      // Update user's bookings
      if (booking.customerEmail) {
        const userBookingsKey = `bookings_${booking.customerEmail}`
        const userBookings = JSON.parse(localStorage.getItem(userBookingsKey) || "[]")
        const updatedUserBookings = userBookings.map((b: Booking) => (b.id === bookingId ? updatedBooking : b))
        localStorage.setItem(userBookingsKey, JSON.stringify(updatedUserBookings))
      }

      triggerRefresh()
    }
  }

  const handleCancelBooking = (bookingId: string) => {
    handleBookingStatusChange(bookingId, "cancelled")
  }

  const handleProfileUpdate = () => {
    if (editingProfile) {
      // Save profile data
      const updatedUser = { ...user, ...profileData }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditingProfile(false)
    } else {
      setEditingProfile(true)
    }
  }

  const handleShopCreate = () => {
    if (user && shopData.name && shopData.address) {
      const newShop: Shop = {
        id: `shop_${user.id}`,
        name: shopData.name,
        description: shopData.description,
        address: shopData.address,
        city: shopData.city,
        phone: shopData.phone,
        services: shopServices,
        images: shopImages,
        hours: {
          monday: { open: "10:00", close: "20:00" },
          tuesday: { open: "10:00", close: "20:00" },
          wednesday: { open: "10:00", close: "20:00" },
          thursday: { open: "10:00", close: "20:00" },
          friday: { open: "10:00", close: "20:00" },
          saturday: { open: "09:00", close: "21:00" },
          sunday: { open: "09:00", close: "21:00" },
        },
        ownerId: user.id,
      }

      const shopKey = `shop_${user.id}`
      localStorage.setItem(shopKey, JSON.stringify(newShop))
      setShop(newShop)
      setShowShopForm(false)
      triggerRefresh()
    }
  }

  const handleAddService = () => {
    if (newService.name && newService.price > 0 && newService.duration > 0) {
      const service = {
        id: Date.now().toString(),
        ...newService,
      }
      setShopServices([...shopServices, service])
      setNewService({ name: "", price: 0, duration: 0 })
    }
  }

  const handleRemoveService = (serviceId: string) => {
    setShopServices(shopServices.filter((s) => s.id !== serviceId))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you would upload to a server
      // For demo, we'll use placeholder URLs
      const newImages = Array.from(files).map(
        (file, index) => `/placeholder.svg?height=200&width=300&text=Shop+Image+${shopImages.length + index + 1}`,
      )
      setShopImages([...shopImages, ...newImages])
    }
  }

  const handleRemoveImage = (index: number) => {
    setShopImages(shopImages.filter((_, i) => i !== index))
  }

  const openChat = (booking: Booking) => {
    setChatBooking(booking)
    loadChatMessages(booking.id)
  }

  const sendMessage = () => {
    if (newMessage.trim() && chatBooking && user) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        bookingId: chatBooking.id,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
      }

      const updatedMessages = [...chatMessages, message]
      setChatMessages(updatedMessages)

      const chatKey = `chat_${chatBooking.id}`
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages))
      setNewMessage("")

      // Trigger refresh for real-time updates
      triggerRefresh()
    }
  }

  const handlePayment = (booking: Booking, method: "advance" | "after_service") => {
    if (!user) return

    // Update in salon owner's bookings
    const salonBookingsKey = `salon_bookings_${user.id}`
    const salonBookings = JSON.parse(localStorage.getItem(salonBookingsKey) || "[]")
    const updatedSalonBookings = salonBookings.map((b: Booking) =>
      b.id === booking.id
        ? {
            ...b,
            paymentMethod: method,
            paymentStatus: method === "advance" ? "paid_advance" : "pending",
          }
        : b,
    )
    localStorage.setItem(salonBookingsKey, JSON.stringify(updatedSalonBookings))

    // Update user bookings
    if (booking.customerEmail) {
      const userBookingsKey = `bookings_${booking.customerEmail}`
      const userBookings = JSON.parse(localStorage.getItem(userBookingsKey) || "[]")
      const updatedUserBookings = userBookings.map((b: Booking) =>
        b.id === booking.id
          ? {
              ...b,
              paymentMethod: method,
              paymentStatus: method === "advance" ? "paid_advance" : "pending",
            }
          : b,
      )
      localStorage.setItem(userBookingsKey, JSON.stringify(updatedUserBookings))

      if (user?.email === booking.customerEmail) {
        setBookings(updatedUserBookings)
      }
    }

    setSalonBookings(updatedSalonBookings)
    setPaymentDialog(null)
    triggerRefresh()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "reschedule_requested":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="h-4 w-4" />
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      case "reschedule_requested":
        return <Clock className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const upcomingBookings = bookings.filter((b) => ["confirmed", "pending", "reschedule_requested"].includes(b.status))
  const pastBookings = bookings.filter((b) => b.status === "completed" || b.status === "cancelled")

  const pendingBookings = salonBookings.filter((b) => b.status === "pending")
  const confirmedBookings = salonBookings.filter((b) => b.status === "confirmed")
  const completedBookings = salonBookings.filter((b) => b.status === "completed")
  const rescheduleRequests = salonBookings.filter((b) => b.status === "reschedule_requested")

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Salon Owner Dashboard
  if (user.role === "salonOwner") {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold text-gray-900">GlamBook - Owner Dashboard</span>
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!shop ? (
            // Shop Setup Screen - FRESH OWNERS START HERE
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Welcome to GlamBook!</CardTitle>
                  <p className="text-gray-600">Let's set up your salon to start receiving bookings</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <Store className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Create Your Salon Profile</h3>
                    <p className="text-gray-600 mb-6">
                      Add your salon details, services, and photos to attract customers
                    </p>
                    <Button onClick={() => setShowShopForm(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Salon Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Main Dashboard - AFTER SHOP IS CREATED
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                      <Avatar className="w-20 h-20 mb-4">
                        <AvatarImage src="/placeholder.svg?height=80&width=80" />
                        <AvatarFallback className="text-lg bg-blue-600 text-white">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <h2 className="text-xl font-semibold">{user.name}</h2>
                      <p className="text-gray-600">{shop.name}</p>
                      <Badge className="mt-2 bg-blue-100 text-blue-800">Salon Owner</Badge>
                    </div>

                    <nav className="space-y-2">
                      <Button
                        variant={activeTab === "overview" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("overview")}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Overview
                      </Button>
                      <Button
                        variant={activeTab === "bookings" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("bookings")}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Manage Bookings
                        {pendingBookings.length + rescheduleRequests.length > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white">
                            {pendingBookings.length + rescheduleRequests.length}
                          </Badge>
                        )}
                      </Button>
                      <Button
                        variant={activeTab === "shop" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("shop")}
                      >
                        <Store className="h-4 w-4 mr-2" />
                        Manage Shop
                      </Button>
                      <Button
                        variant={activeTab === "profile" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveTab("profile")}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Profile
                      </Button>
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">Business Overview</h1>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                              <p className="text-3xl font-bold text-yellow-600">{pendingBookings.length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-yellow-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Reschedule Requests</p>
                              <p className="text-3xl font-bold text-orange-600">{rescheduleRequests.length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Confirmed Today</p>
                              <p className="text-3xl font-bold text-blue-600">{confirmedBookings.length}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                              <p className="text-3xl font-bold text-green-600">
                                ₹{completedBookings.reduce((sum, b) => sum + b.price, 0).toLocaleString()}
                              </p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {salonBookings.length === 0 && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          Your salon is now live! Share your salon link with customers to start receiving bookings.
                        </AlertDescription>
                      </Alert>
                    )}

                    {(pendingBookings.length > 0 || rescheduleRequests.length > 0) && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          You have {pendingBookings.length + rescheduleRequests.length} request
                          {pendingBookings.length + rescheduleRequests.length > 1 ? "s" : ""} waiting for your approval.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}

                {activeTab === "bookings" && (
                  <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-900">Customer Bookings</h1>

                    {salonBookings.length === 0 ? (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                          <p className="text-gray-600 mb-4">
                            Your salon is ready to receive bookings! Share your salon link with customers.
                          </p>
                          <Link href="/">
                            <Button className="bg-blue-600 hover:bg-blue-700">View Your Salon</Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ) : (
                      <Tabs defaultValue="pending" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
                          <TabsTrigger value="reschedule">Reschedule ({rescheduleRequests.length})</TabsTrigger>
                          <TabsTrigger value="confirmed">Confirmed ({confirmedBookings.length})</TabsTrigger>
                          <TabsTrigger value="completed">Completed ({completedBookings.length})</TabsTrigger>
                        </TabsList>

                        {/* Booking tabs content would go here - same as before */}
                      </Tabs>
                    )}
                  </div>
                )}

                {activeTab === "shop" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-gray-900">Manage Shop</h1>
                      <Button onClick={() => setShowShopForm(true)} variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Shop Details */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Shop Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Name</Label>
                            <p className="text-lg font-semibold">{shop.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Description</Label>
                            <p className="text-gray-700">{shop.description}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Address</Label>
                            <p className="text-gray-700">
                              {shop.address}, {shop.city}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Phone</Label>
                            <p className="text-gray-700">{shop.phone}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Services */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Services
                            <Button size="sm" onClick={() => setShowShopForm(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add Service
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {shop.services.map((service) => (
                              <div
                                key={service.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium">{service.name}</p>
                                  <p className="text-sm text-gray-600">{service.duration} min</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-blue-600">₹{service.price}</p>
                                </div>
                              </div>
                            ))}
                            {shop.services.length === 0 && (
                              <p className="text-gray-500 text-center py-4">No services added yet</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Shop Images */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Shop Photos
                          <Button size="sm" onClick={() => setShowShopForm(true)}>
                            <Camera className="h-4 w-4 mr-2" />
                            Manage Photos
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {shop.images.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {shop.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={image || "/placeholder.svg"}
                                  alt={`Shop image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No photos uploaded yet</p>
                            <Button className="mt-4" onClick={() => setShowShopForm(true)}>
                              Upload Photos
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === "profile" && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        Profile Information
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleProfileUpdate}
                          className="flex items-center gap-2"
                        >
                          {editingProfile ? (
                            <>
                              <Save className="h-4 w-4" />
                              Save
                            </>
                          ) : (
                            <>
                              <Edit className="h-4 w-4" />
                              Edit
                            </>
                          )}
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="Add phone number"
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Account Type</Label>
                          <Input id="role" value="Salon Owner" disabled />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shop Creation/Edit Dialog */}
        <Dialog open={showShopForm} onOpenChange={setShowShopForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{shop ? "Edit Shop Details" : "Create Your Salon Profile"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shop-name">Salon Name *</Label>
                  <Input
                    id="shop-name"
                    value={shopData.name}
                    onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                    placeholder="Enter salon name"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-phone">Phone Number *</Label>
                  <Input
                    id="shop-phone"
                    value={shopData.phone}
                    onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-city">City *</Label>
                  <Input
                    id="shop-city"
                    value={shopData.city}
                    onChange={(e) => setShopData({ ...shopData, city: e.target.value })}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="shop-address">Full Address *</Label>
                  <Input
                    id="shop-address"
                    value={shopData.address}
                    onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                    placeholder="Enter full address"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="shop-description">Description</Label>
                <Textarea
                  id="shop-description"
                  value={shopData.description}
                  onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                  placeholder="Describe your salon..."
                  rows={3}
                />
              </div>

              {/* Services */}
              <div>
                <Label className="text-lg font-semibold">Services</Label>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <Input
                      placeholder="Service name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Price (₹)"
                      value={newService.price || ""}
                      onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    />
                    <Input
                      type="number"
                      placeholder="Duration (min)"
                      value={newService.duration || ""}
                      onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                    />
                    <Button onClick={handleAddService} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {shopServices.map((service) => (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">
                            ₹{service.price} • {service.duration} min
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Images */}
              <div>
                <Label className="text-lg font-semibold">Shop Photos</Label>
                <div className="space-y-4">
                  <div>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {shopImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {shopImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image || "/placeholder.svg"}
                            alt={`Shop image ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleShopCreate} className="bg-blue-600 hover:bg-blue-700">
                  {shop ? "Update Shop" : "Create Shop"}
                </Button>
                <Button variant="outline" onClick={() => setShowShopForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Dialog */}
        <Dialog open={!!chatBooking} onOpenChange={() => setChatBooking(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chat with {chatBooking?.customerName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderRole === user.role ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-3 py-2 rounded-lg ${
                        message.senderRole === user.role ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
                )}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={sendMessage}>Send</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Method Dialog */}
        <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Method</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">How would the customer like to pay for this service?</p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => paymentDialog && handlePayment(paymentDialog, "advance")}
                >
                  <CreditCard className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Pay in Advance</p>
                    <p className="text-sm text-gray-600">Customer pays now before the appointment</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => paymentDialog && handlePayment(paymentDialog, "after_service")}
                >
                  <DollarSign className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Pay After Service</p>
                    <p className="text-sm text-gray-600">Customer pays after completing the appointment</p>
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Customer Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GlamBook</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <Avatar className="w-20 h-20 mb-4">
                    <AvatarImage src="/placeholder.svg?height=80&width=80" />
                    <AvatarFallback className="text-lg bg-blue-600 text-white">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Customer</Badge>
                </div>

                <nav className="space-y-2">
                  <Button
                    variant={activeTab === "bookings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("bookings")}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                    {upcomingBookings.length > 0 && (
                      <Badge className="ml-2 bg-blue-500 text-white">{upcomingBookings.length}</Badge>
                    )}
                  </Button>
                  <Button
                    variant={activeTab === "favorites" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("favorites")}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "bookings" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
                  <Link href="/">
                    <Button className="bg-blue-600 hover:bg-blue-700">Book New Appointment</Button>
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                      <p className="text-gray-600 mb-4">Book your first appointment to get started</p>
                      <Link href="/">
                        <Button className="bg-blue-600 hover:bg-blue-700">Find Salons</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <Tabs defaultValue="upcoming" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
                      <TabsTrigger value="history">History ({pastBookings.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="upcoming" className="space-y-4">
                      {upcomingBookings.length > 0 ? (
                        upcomingBookings.map((booking) => (
                          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">{booking.salonName}</h3>
                                    <div className="flex items-center gap-2">
                                      <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                                        {getStatusIcon(booking.status)}
                                        {booking.status === "pending"
                                          ? "Pending Approval"
                                          : booking.status === "reschedule_requested"
                                            ? "Reschedule Requested"
                                            : booking.status}
                                      </Badge>
                                      {booking.paymentStatus && (
                                        <Badge
                                          className={
                                            booking.paymentStatus === "paid_advance"
                                              ? "bg-green-100 text-green-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }
                                        >
                                          {booking.paymentStatus === "paid_advance" ? "Paid" : "Pay After"}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-600 mb-2 font-medium">{booking.service}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(booking.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {booking.time}
                                    </span>
                                    <span className="font-bold text-blue-600 text-lg">₹{booking.price}</span>
                                  </div>
                                  {booking.status === "pending" && (
                                    <div className="mt-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                                      ⏳ Waiting for salon confirmation
                                    </div>
                                  )}
                                  {booking.status === "confirmed" && (
                                    <div className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                      ✅ Confirmed! See you at the salon
                                    </div>
                                  )}
                                  {booking.status === "reschedule_requested" && (
                                    <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg">
                                      🔄 Reschedule request sent. Waiting for salon approval.
                                      {booking.rescheduleRequest && (
                                        <div className="mt-1">
                                          New time: {booking.rescheduleRequest.newDate} at{" "}
                                          {booking.rescheduleRequest.newTime}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-col space-y-2 ml-6">
                                  {booking.status === "confirmed" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRescheduleRequest(booking)}
                                      >
                                        Reschedule
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => openChat(booking)}
                                        className="flex items-center gap-2"
                                      >
                                        <MessageCircle className="h-4 w-4" />
                                        Chat
                                      </Button>
                                    </>
                                  )}
                                  {booking.status === "pending" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openChat(booking)}
                                      className="flex items-center gap-2"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                      Chat
                                    </Button>
                                  )}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    Cancel
                                  </Button>
                                  <Link href={`/salon/${booking.salonId}`}>
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full">
                                      View Salon
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                            <p className="text-gray-600 mb-4">Book your next appointment to get started</p>
                            <Link href="/">
                              <Button className="bg-blue-600 hover:bg-blue-700">Find Salons</Button>
                            </Link>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                      {pastBookings.length > 0 ? (
                        pastBookings.map((booking) => (
                          <Card key={booking.id}>
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-semibold text-gray-900">{booking.salonName}</h3>
                                    <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                                      {getStatusIcon(booking.status)}
                                      {booking.status}
                                    </Badge>
                                  </div>
                                  <p className="text-gray-600 mb-2">{booking.service}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {new Date(booking.date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {booking.time}
                                    </span>
                                    <span className="font-medium text-blue-600">₹{booking.price}</span>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  {booking.status === "completed" && (
                                    <Button variant="outline" size="sm">
                                      Write Review
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    Book Again
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-8 text-center">
                            <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history</h3>
                            <p className="text-gray-600">Your completed bookings will appear here</p>
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Salons</CardTitle>
                </CardHeader>
                <CardContent className="p-8 text-center">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                  <p className="text-gray-600 mb-4">Save your favorite salons for quick access</p>
                  <Link href="/">
                    <Button className="bg-blue-600 hover:bg-blue-700">Explore Salons</Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Profile Information
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleProfileUpdate}
                      className="flex items-center gap-2"
                    >
                      {editingProfile ? (
                        <>
                          <Save className="h-4 w-4" />
                          Save
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="Add phone number"
                        disabled={!editingProfile}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Account Type</Label>
                      <Input id="role" value="Customer" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleBooking} onOpenChange={() => setRescheduleBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Reschedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reschedule-date">New Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reschedule-time">New Time</Label>
              <Input
                id="reschedule-time"
                type="time"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="reschedule-reason">Reason (Optional)</Label>
              <Textarea
                id="reschedule-reason"
                value={rescheduleData.reason}
                onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                placeholder="Why do you need to reschedule?"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={submitRescheduleRequest} className="bg-blue-600 hover:bg-blue-700">
                Send Request
              </Button>
              <Button variant="outline" onClick={() => setRescheduleBooking(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog open={!!chatBooking} onOpenChange={() => setChatBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chat with {chatBooking?.salonName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 overflow-y-auto border rounded-lg p-4 space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === user.role ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderRole === user.role ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
              {chatMessages.length === 0 && (
                <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
