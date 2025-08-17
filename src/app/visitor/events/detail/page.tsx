"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Music,
  Phone,
  Mail,
  Globe,
  Ticket,
  CreditCard,
  User,
  Menu,
  X,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import router from "next/router"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"

// Mock concert data
const concertData = {
  1: {
    id: 1,
    title: "Chamber Music Evening",
    artist: "Elena Vasquez & Marcus Chen",
    genre: "Chamber Music",
    price: 45,
    date: "2024-12-15",
    time: "7:30 PM",
    duration: "90 minutes",
    venue: "Historic Brownstone",
    location: "Upper East Side, Manhattan",
    city: "New York",
    shows: [
      { date: "2024-12-18", time: "8:00 PM" },
      { date: "2024-12-19", time: "7:00 PM" },
      { date: "2024-12-19", time: "7:00 PM" },
    ],
    description:
      "An intimate evening featuring violin and piano duets in a beautifully restored 19th-century brownstone. Experience the magic of classical music in an elegant setting that transports you to another era.",
    fullDescription: `Join us for an unforgettable evening of chamber music in one of Manhattan's most beautiful historic brownstones. Elena Vasquez, internationally acclaimed violinist, and Marcus Chen, virtuoso pianist, will perform a carefully curated selection of classical masterpieces.

The evening will feature works by Mozart, Brahms, and Debussy, showcasing the intimate beauty of violin and piano duets. The historic brownstone provides the perfect acoustic environment for this intimate performance, with its high ceilings and elegant architecture enhancing every note.

This exclusive event is limited to just 30 guests, ensuring an intimate and personal experience. Light refreshments will be served during intermission, and guests will have the opportunity to meet the artists after the performance.`,
    image: "/concerts/c1.png",
    availableSeats: 25,
    totalSeats: 30,
    category: "Classical",
    status: "upcoming",
    rating: 4.8,
    reviews: 12,
    venue_details: {
      name: "Historic Brownstone",
      address: "234 East 78th Street, Upper East Side, Manhattan, NY 10075",
      phone: "+1 (212) 555-0123",
      email: "events@historicbrownstone.com",
      website: "www.historicbrownstone.com",
      description:
        "A beautifully restored 19th-century brownstone featuring original architectural details, high ceilings, and exceptional acoustics perfect for intimate musical performances.",
      amenities: ["Wheelchair Accessible", "Coat Check", "Refreshments", "Parking Available"],
      capacity: 30,
    },
    artist_details: {
      elena: {
        name: "Elena Vasquez",
        instrument: "Violin",
        bio: "Elena Vasquez is an internationally acclaimed violinist who has performed with major orchestras worldwide. She graduated from Juilliard and has won numerous international competitions.",
        image: "/artist/a1.png",
      },
      marcus: {
        name: "Marcus Chen",
        instrument: "Piano",
        bio: "Marcus Chen is a virtuoso pianist known for his sensitive interpretations of classical repertoire. He has performed at Carnegie Hall and Lincoln Center.",
        image: "/artist/a2.png",
      },
    },
    program: [
      {
        composer: "Wolfgang Amadeus Mozart",
        piece: "Violin Sonata No. 21 in E minor, K. 304",
        duration: "20 minutes",
      },
      {
        composer: "Johannes Brahms",
        piece: "Violin Sonata No. 1 in G major, Op. 78",
        duration: "25 minutes",
      },
      {
        composer: "Claude Debussy",
        piece: "Violin Sonata in G minor",
        duration: "15 minutes",
      },
    ],
    reviews_data: [
      {
        id: 1,
        name: "Sarah Johnson",
        rating: 5,
        date: "2024-11-20",
        comment: "Absolutely magical evening! The intimate setting made the performance feel so personal and special.",
      },
      {
        id: 2,
        name: "Michael Brown",
        rating: 5,
        date: "2024-11-18",
        comment: "Elena and Marcus are incredible musicians. The venue was perfect for this type of performance.",
      },
      {
        id: 3,
        name: "Lisa Chen",
        rating: 4,
        date: "2024-11-15",
        comment: "Beautiful music in a stunning venue. The refreshments during intermission were a nice touch.",
      },
    ],
  },
  // Add more concerts as needed
}

export default function ConcertDetailPage() {
  const params = useParams()
  const concertId = Number.parseInt(params.id as string)
  const concert = concertData[concertId as keyof typeof concertData]
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTickets, setSelectedTickets] = useState(1)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tickets: 1,
    specialRequests: "",
  })

  if (!concert) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Events Not Found</h1>
          <Link href="/concerts">
            <Button className="bg-pont-rust hover:bg-pont-rust/90 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Concerts
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
   
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getAvailabilityBadge = (available: number, total: number) => {
    const percentage = (available / total) * 100
    if (percentage <= 20) {
      return <Badge variant="destructive">Only {available} left!</Badge>
    } else if (percentage <= 50) {
      return <Badge variant="secondary">Limited seats</Badge>
    }
    return <Badge className="bg-pont-green text-white">Available</Badge>
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically handle the booking submission
    alert(`Booking submitted for ${bookingForm.tickets} ticket(s)! You will receive a confirmation email shortly.`)
    setIsBookingOpen(false)
  }

  const Header = () => {
    return (
      <header className="backdrop-blur-md py-4 px-4 border-b border-gray-100 shadow-sm sticky top-0 z-50 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo Only */}
            <div className="flex items-center">
              <Link href="/">
                <Image
                  src="/logo.jpg"
                  alt="Pont Ar Gler Logo"
                  width={100}
                  height={100}
                  className="shadow-md absolute top-4"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-10">
              <Link
                href="/"
                className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
              >
                Discover
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/concerts"
                className="text-pont-green transition-all duration-300 font-medium text-lg relative group"
              >
                Events
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pont-green"></span>
              </Link>
              <Link
                href="/artists"
                className="text-gray-700 hover:text-pont-green font-medium text-lg relative group"
              >
                Artists
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>

              <Link
                href="/venues"
                className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
              >
                Locations
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
              >
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Artist Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => router.push("/artist-login")}
                className="bg-pont-green hover:bg-pont-rust/90  text-white px-8 py-2.5 rounded-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Artist Login
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-pont-green transition-colors rounded-lg hover:bg-pont-green/5"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-pont-green">
                  Discover
                </Link>
                <Link href="/concerts" className="text-pont-green font-bold">
                  Events
                </Link>
                <Link href="/artists" className="text-gray-700 hover:text-pont-green">
                  Artists
                </Link>

                <Link href="/venues" className="text-gray-700 hover:text-pont-green">
                  Locations
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-pont-green">
                  About
                </Link>
                <Button className="bg-pont-green hover:from-pont-rust/90 hover:to-pont-rust text-white">
                  Artist Login
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
    )
  }

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto w px-2 py-2 text-right mt-10">
          <Link href="/concerts">
            <Button variant="ghost" className="text-pont-rust hover:text-pont-rust/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Concert Image */}
            <div className="relative">
              <Image
                src={concert.image || "/placeholder.svg"}
                alt={concert.title}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
              <div className="absolute top-4 left-4 flex gap-2">
              
                <Badge className="bg-pont-green text-white">{concert.genre}</Badge>
              </div>
             
              <div className="absolute bottom-4 right-4 flex gap-2">

                <Button size="sm" variant="secondary" className="h-10 w-10 p-0">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Concert Info */}
            <div className="space-y-6">
              <div>
              <h5 className="text-md text-black font-medium   w-fit">Festival Spring 2025</h5>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">{concert.title}</h1>
                <p className="text-xl text-pont-rust font-medium mb-0">{concert.artist}</p>
                <div className="flex gap-2 mb-4">
              
              <Badge className="bg-slate-50 text-grey-500 border-slate-200 border-2">Voilin</Badge>
              <Badge className="bg-slate-50 text-grey-500 border-slate-200 border-2">Piano</Badge>
            </div>

                <p className="text-gray-600 leading-relaxed">{concert.description}</p>
              </div>

              {/* Dates of the Event */}
              <div className="space-y-2 text-sm text-gray-600 ">
              {/* Multiple Dates Display */}
              {concert.shows && concert.shows.slice(0, 2).map((show, idx) => (
                <div key={idx} className="flex items-center">
                 <Calendar className="w-5 h-5 mr-3 text-pont-green" />
                  <span className="font-medium">{formatDate(show.date)}</span>
                  <span className="mx-2">-</span>
                  <span className="font-medium">{show.time}</span>
                </div>
              ))}

              {concert.shows && concert.shows.length > 2 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-pont-green underline text-xs mt-1">View all dates</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 bg-white border-gray-100 border-2 rounded-md">
                    <div className="space-y-2">
                      {concert.shows.map((show, idx) => (
                        <div key={idx} className="flex items-center text-gray-700">
                        <Calendar className="w-5 h-5 mr-3 text-pont-green" />
                          <span className="font-medium">{formatDate(show.date)}</span>
                          <span className="mx-2">-</span>
                          <span className="font-medium">{show.time}</span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
              {/* Add extra space if less than 2 dates */}
              {concert.shows && concert.shows.length < 2 && (
                <div style={{ height: 32 * (2 - concert.shows.length) }} />
              )}
            </div>





              {/* Event Details */}
              <div className="space-y-2">
               
                
                <div className="flex items-center text-gray-700">
                  <MapPin className="w-5 h-5 mr-3 text-pont-green" />
                  <span>
                    {concert.venue}, {concert.location}
                  </span>
                </div>

                {/* <Button className="w-full bg-pont-rust hover:bg-pont-rust/90 text-white text-lg py-3">
                      <Ticket className="w-5 h-5 mr-2" />
                      Book Tickets
                    </Button> */}
                
              </div>

              {/* Booking Section */}
              <div className=" p-6 rounded-lg">
              

                <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-pont-rust hover:bg-pont-rust/90 text-white text-lg py-3">
                      <Ticket className="w-5 h-5 mr-2" />
                      Book Tickets
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Book Your Tickets</DialogTitle>
                      <DialogDescription>Complete your booking for {concert.title}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={bookingForm.firstName}
                            onChange={(e) => setBookingForm({ ...bookingForm, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={bookingForm.lastName}
                            onChange={(e) => setBookingForm({ ...bookingForm, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tickets">Number of Tickets</Label>
                        <Select
                          value={bookingForm.tickets.toString()}
                          onValueChange={(value) => setBookingForm({ ...bookingForm, tickets: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(Math.min(concert.availableSeats, 8))].map((_, i) => (
                              <SelectItem key={i + 1} value={(i + 1).toString()}>
                                {i + 1} ticket{i > 0 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span>
                            Total ({bookingForm.tickets} ticket{bookingForm.tickets > 1 ? "s" : ""})
                          </span>
                          <span className="text-xl font-bold text-pont-rust">
                            €{concert.price * bookingForm.tickets}
                          </span>
                        </div>
                      </div>
                      <Button type="submit" className="w-full bg-pont-rust hover:bg-pont-rust/90 text-white">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Booking
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Information Tabs */}
      <section className="bg-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="venue">Venue</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              
            </TabsList>

            <TabsContent value="details" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Music className="w-5 h-5 mr-2 text-pont-green" />
                      About This Concert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{concert.fullDescription}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Shows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {concert.program.map((piece, index) => (
                        <div key={index} className="border-l-4 border-pont-green pl-4">
                          <h4 className="font-semibold text-gray-900">{piece.composer}</h4>
                          <p className="text-gray-700">{piece.piece}</p>
                          <p className="text-sm text-gray-500">{piece.duration}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="venue" className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-pont-green" />
                    {concert.venue_details.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-gray-700">{concert.venue_details.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center text-gray-700">
                          <MapPin className="w-4 h-4 mr-2 text-pont-green" />
                          <span>{concert.venue_details.address}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Phone className="w-4 h-4 mr-2 text-pont-green" />
                          <span>{concert.venue_details.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-pont-green" />
                          <span>{concert.venue_details.email}</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Globe className="w-4 h-4 mr-2 text-pont-green" />
                          <span>{concert.venue_details.website}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <iframe
                        title="Venue Location"
                        width="100%"
                        height="250"
                        style={{ border: 0, borderRadius: "0.5rem" }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(concert.venue_details.address)}&output=embed`}
                      ></iframe>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artists" className="mt-8">
              <div className="grid lg:grid-cols-2 gap-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={concert.artist_details.elena.image || "/placeholder.svg"}
                        alt={concert.artist_details.elena.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{concert.artist_details.elena.name}</h3>
                        <p className="text-pont-rust font-medium">{concert.artist_details.elena.instrument}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{concert.artist_details.elena.bio}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Image
                        src={concert.artist_details.marcus.image || "/placeholder.svg"}
                        alt={concert.artist_details.marcus.name}
                        width={80}
                        height={80}
                        className="rounded-full object-cover"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{concert.artist_details.marcus.name}</h3>
                        <p className="text-pont-rust font-medium">{concert.artist_details.marcus.instrument}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{concert.artist_details.marcus.bio}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

           
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-bold text-pont-yellow mb-4">Pont Ar Gler</h3>
              <p className="text-gray-300">
                Celebrating artists and culture through unforgettable musical experiences.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-pont-green">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Artists
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Events
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-pont-green">Event Types</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Festivals
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Concerts
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Exhibitions
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Workshops
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-pont-green">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <Mail className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Pont Ar Gler. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
