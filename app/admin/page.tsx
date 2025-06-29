"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, Calendar, Users, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

interface Service {
  id: string
  name: string
  price: number
  duration: number
  description: string
}

interface Booking {
  id: string
  customerName: string
  customerPhone: string
  service: string
  date: string
  time: string
  status: "confirmed" | "completed" | "cancelled"
  price: number
}

interface SalonData {
  name: string
  address: string
  phone: string
  description: string
  services: Service[]
  bookings: Booking[]
}

const mockSalonData: SalonData = {
  name: "Glamour Studio",
  address: "123 Fashion Street, Bandra West, Mumbai - 400050",
  phone: "+91 98765 43210",
  description: "Premium beauty salon offering a wide range of services",
  services: [
    { id: "1", name: "Haircut & Styling", price: 500, duration: 45, description: "Professional haircut with styling" },
    { id: "2", name: "Facial Treatment", price: 800, duration: 60, description: "Deep cleansing facial" },
    { id: "3", name: "Manicure", price: 300, duration: 30, description: "Complete nail care" },
    { id: "4", name: "Pedicure", price: 400, duration: 45, description: "Foot care and nail treatment" },
  ],
  bookings: [
    {
      id: "1",
      customerName: "Priya Sharma",
      customerPhone: "+91 98765 12345",
      service: "Haircut & Styling",
      date: "2024-01-25",
      time: "14:00",
      status: "confirmed",
      price: 500,
    },
    {
      id: "2",
      customerName: "Anita Desai",
      customerPhone: "+91 98765 67890",
      service: "Facial Treatment",
      date: "2024-01-25",
      time: "16:00",
      status: "confirmed",
      price: 800,
    },
    {
      id: "3",
      customerName: "Meera Patel",
      customerPhone: "+91 98765 54321",
      service: "Manicure",
      date: "2024-01-24",
      time: "11:00",
      status: "completed",
      price: 300,
    },
  ],
}

export default function AdminDashboard() {
  const [salonData, setSalonData] = useState<SalonData>(mockSalonData)
  const [activeTab, setActiveTab] = useState("overview")
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState({
    name: "",
    price: 0,
    duration: 0,
    description: "",
  })

  const todayBookings = salonData.bookings.filter((b) => b.date === "2024-01-25")
  const totalRevenue = salonData.bookings.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.price, 0)
  const totalBookings = salonData.bookings.length
  const completionRate = Math.round(
    (salonData.bookings.filter((b) => b.status === "completed").length / totalBookings) * 100,
  )

  const handleAddService = () => {
    const service: Service = {
      id: Date.now().toString(),
      ...newService,
    }
    setSalonData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }))
    setNewService({ name: "", price: 0, duration: 0, description: "" })
    setIsServiceDialogOpen(false)
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setNewService({
      name: service.name,
      price: service.price,
      duration: service.duration,
      description: service.description,
    })
    setIsServiceDialogOpen(true)
  }

  const handleUpdateService = () => {
    if (editingService) {
      setSalonData((prev) => ({
        ...prev,
        services: prev.services.map((s) => (s.id === editingService.id ? { ...editingService, ...newService } : s)),
      }))
      setEditingService(null)
      setNewService({ name: "", price: 0, duration: 0, description: "" })
      setIsServiceDialogOpen(false)
    }
  }

  const handleDeleteService = (serviceId: string) => {
    setSalonData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== serviceId),
    }))
  }

  const handleBookingStatusChange = (bookingId: string, newStatus: "confirmed" | "completed" | "cancelled") => {
    setSalonData((prev) => ({
      ...prev,
      bookings: prev.bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)),
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">G</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  GlamBook
                </span>
              </Link>
              <div className="text-gray-400">|</div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-600">{salonData.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                      <p className="text-2xl font-bold">{todayBookings.length}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                      <p className="text-2xl font-bold">{totalBookings}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold">{completionRate}%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {todayBookings.length > 0 ? (
                  <div className="space-y-4">
                    {todayBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
                            <Clock className="h-6 w-6 text-pink-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <p className="text-gray-600">{booking.service}</p>
                            <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{booking.time}</p>
                          <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          <p className="text-sm text-gray-500">₹{booking.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bookings scheduled for today</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Bookings</h2>
              <div className="flex space-x-2">
                <Button variant="outline">Export</Button>
                <Button variant="outline">Filter</Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {salonData.bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                              <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.service}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{new Date(booking.date).toLocaleDateString()}</div>
                            <div className="text-gray-500">{booking.time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{booking.price}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {booking.status === "confirmed" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookingStatusChange(booking.id, "completed")}
                                >
                                  Complete
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleBookingStatusChange(booking.id, "cancelled")}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Services</h2>
              <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-pink-500 hover:bg-pink-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="serviceName">Service Name</Label>
                      <Input
                        id="serviceName"
                        value={newService.name}
                        onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter service name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="servicePrice">Price (₹)</Label>
                        <Input
                          id="servicePrice"
                          type="number"
                          value={newService.price}
                          onChange={(e) =>
                            setNewService((prev) => ({ ...prev, price: Number.parseInt(e.target.value) || 0 }))
                          }
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceDuration">Duration (minutes)</Label>
                        <Input
                          id="serviceDuration"
                          type="number"
                          value={newService.duration}
                          onChange={(e) =>
                            setNewService((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) || 0 }))
                          }
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="serviceDescription">Description</Label>
                      <Textarea
                        id="serviceDescription"
                        value={newService.description}
                        onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter service description"
                        rows={3}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={editingService ? handleUpdateService : handleAddService}
                        className="bg-pink-500 hover:bg-pink-600"
                      >
                        {editingService ? "Update" : "Add"} Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsServiceDialogOpen(false)
                          setEditingService(null)
                          setNewService({ name: "", price: 0, duration: 0, description: "" })
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salonData.services.map((service) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{service.description}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleEditService(service)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteService(service.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-pink-600">₹{service.price}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {service.duration} min
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Salon Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="salonName">Salon Name</Label>
                  <Input
                    id="salonName"
                    value={salonData.name}
                    onChange={(e) => setSalonData((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="salonAddress">Address</Label>
                  <Textarea
                    id="salonAddress"
                    value={salonData.address}
                    onChange={(e) => setSalonData((prev) => ({ ...prev, address: e.target.value }))}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="salonPhone">Phone Number</Label>
                  <Input
                    id="salonPhone"
                    value={salonData.phone}
                    onChange={(e) => setSalonData((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="salonDescription">Description</Label>
                  <Textarea
                    id="salonDescription"
                    value={salonData.description}
                    onChange={(e) => setSalonData((prev) => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button className="bg-pink-500 hover:bg-pink-600">Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="font-medium w-24">{day}</span>
                      <div className="flex items-center space-x-2">
                        <Input type="time" defaultValue="10:00" className="w-32" />
                        <span>to</span>
                        <Input type="time" defaultValue="20:00" className="w-32" />
                        <input type="checkbox" className="ml-4" />
                        <span className="text-sm text-gray-600">Closed</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 bg-pink-500 hover:bg-pink-600">Update Hours</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
