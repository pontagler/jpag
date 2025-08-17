"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  MapPin,
  Music,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Menu,
  X,
  Search,
  Star,
  Grid3X3,
  List,
  SlidersHorizontal,
  Calendar,
  Clock,
  Users,
  Heart,
  Share2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Mock data for concerts
const allConcerts = [
  {
    id: 1,
    title: "Chamber Music Evening",
    artist: "Elena Vasquez & Marcus Chen",
    genre: "Chamber Music",
    price: 45,
    shows: [
      { date: "2024-12-15", time: "7:30 PM" },
      { date: "2024-12-16", time: "8:00 PM" },
    ],
    duration: "90 minutes",
    venue: "Historic Brownstone",
    location: "Upper East Side, Manhattan",
    city: "New York",
    description:
      "An intimate evening featuring violin and piano duets in a beautifully restored 19th-century brownstone.",
    image: "/concerts/c1.png",
    availableSeats: 25,
    totalSeats: 30,
    category: "Classical",
    status: "upcoming",
    rating: 4.8,
    reviews: 12,
  },
  {
    id: 2,
    title: "Solo Piano Recital",
    artist: "Marcus Chen",
    genre: "Solo Piano",
    price: 35,
    shows: [
      { date: "2024-12-18", time: "8:00 PM" },
      { date: "2024-12-19", time: "7:00 PM" },
    ],
    duration: "75 minutes",
    venue: "Private Residence",
    location: "Brooklyn Heights, Brooklyn",
    city: "Brooklyn",
    description:
      "A captivating solo piano performance in an elegant Brooklyn Heights townhouse with stunning city views.",
    image: "/concerts/c2.png",
    availableSeats: 15,
    totalSeats: 20,
    category: "Classical",
    status: "upcoming",
    rating: 4.9,
    reviews: 8,
  },
  {
    id: 3,
    title: "String Quartet Performance",
    artist: "Sofia Rodriguez Quartet",
    genre: "String Quartet",
    price: 55,
    shows: [
      { date: "2024-12-20", time: "7:00 PM" },
    ],
    duration: "100 minutes",
    venue: "Penthouse Loft",
    location: "SoHo, Manhattan",
    city: "New York",
    description: "Experience the power of string quartet music in a stunning penthouse with panoramic city views.",
    image: "/concerts/c3.png",
    availableSeats: 5,
    totalSeats: 40,
    category: "Classical",
    status: "upcoming",
    rating: 4.7,
    reviews: 15,
  },
  {
    id: 4,
    title: "Celtic Folk Evening",
    artist: "Breton Ensemble",
    genre: "Folk",
    price: 40,
    shows: [
      { date: "2024-12-22", time: "6:30 PM" },
      { date: "2024-12-23", time: "7:00 PM" },
      { date: "2024-12-24", time: "8:00 PM" },
    ],
    duration: "85 minutes",
    venue: "Traditional Hall",
    location: "Greenwich Village, Manhattan",
    city: "New York",
    description: "Traditional Breton folk music featuring authentic instruments and haunting melodies.",
    image: "/concerts/c4.png",
    availableSeats: 12,
    totalSeats: 35,
    category: "Folk",
    status: "upcoming",
    rating: 4.6,
    reviews: 9,
  },
  {
    id: 5,
    title: "Jazz Piano Trio",
    artist: "Manhattan Jazz Collective",
    genre: "Jazz",
    price: 50,
    shows: [
      { date: "2025-01-05", time: "8:30 PM" },
    ],
    duration: "95 minutes",
    venue: "Rooftop Terrace",
    location: "Midtown, Manhattan",
    city: "New York",
    description: "Smooth jazz melodies under the stars with the city skyline as your backdrop.",
    image: "/concerts/c1.png",
    availableSeats: 20,
    totalSeats: 25,
    category: "Jazz",
    status: "upcoming",
    rating: 4.5,
    reviews: 6,
  },
  {
    id: 6,
    title: "Acoustic Guitar Showcase",
    artist: "Pierre Dubois",
    genre: "Acoustic",
    price: 30,
    shows: [
      { date: "2025-01-10", time: "7:15 PM" },
    ],
    duration: "70 minutes",
    venue: "Garden Conservatory",
    location: "Upper West Side, Manhattan",
    city: "New York",
    description: "Intimate acoustic guitar performance in a beautiful glass conservatory surrounded by gardens.",
    image: "/concerts/c2.png",
    availableSeats: 18,
    totalSeats: 22,
    category: "Acoustic",
    status: "upcoming",
    rating: 4.4,
    reviews: 5,
  },
  {
    id: 7,
    title: "Autumn Melodies",
    artist: "Sarah Williams",
    genre: "Folk",
    price: 38,
    shows: [
      { date: "2024-11-15", time: "7:00 PM" },
    ],
    duration: "85 minutes",
    venue: "Cozy Bookstore",
    location: "East Village, Manhattan",
    city: "New York",
    description: "A beautiful evening of folk music celebrating the autumn season with original compositions.",
    image: "/concerts/c4.png",
    availableSeats: 0,
    totalSeats: 30,
    category: "Folk",
    status: "past",
    rating: 4.9,
    reviews: 22,
  },
  {
    id: 8,
    title: "Classical Masterworks",
    artist: "Metropolitan String Ensemble",
    genre: "Classical",
    price: 65,
    shows: [
      { date: "2024-10-28", time: "7:30 PM" },
    ],
    duration: "120 minutes",
    venue: "Historic Theater",
    location: "Lincoln Center, Manhattan",
    city: "New York",
    description: "An unforgettable evening featuring classical masterworks performed by renowned musicians.",
    image: "/concerts/c1.png",
    availableSeats: 0,
    totalSeats: 150,
    category: "Classical",
    status: "past",
    rating: 4.8,
    reviews: 45,
  },
  {
    id: 9,
    title: "Jazz Under the Stars",
    artist: "Blue Note Quartet",
    genre: "Jazz",
    price: 48,
    shows: [
      { date: "2024-09-20", time: "8:00 PM" },
    ],
    duration: "100 minutes",
    venue: "Rooftop Bar",
    location: "Williamsburg, Brooklyn",
    city: "Brooklyn",
    description: "Smooth jazz performance under the open sky with the Manhattan skyline as backdrop.",
    image: "/concerts/c2.png",
    availableSeats: 0,
    totalSeats: 40,
    category: "Jazz",
    status: "past",
    rating: 4.7,
    reviews: 18,
  },
]

export default function ConcertsPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [festivalType, setFestivalType] = useState("")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [sortBy, setSortBy] = useState("date")

  // Get unique values for filters
  const genres = [...new Set(allConcerts.map((concert) => concert.genre))]
  const statuses = [...new Set(allConcerts.map((concert) => concert.status))]
  const cities = [...new Set(allConcerts.map((concert) => concert.city))]
  const minPrice = Math.min(...allConcerts.map((c) => c.price))
  const maxPrice = Math.max(...allConcerts.map((c) => c.price))

  // Initialize price range with actual min/max values
  useState(() => {
    setPriceRange([minPrice, maxPrice])
  })

  // Filter and sort concerts
  const filteredAndSortedConcerts = useMemo(() => {
    const filtered = allConcerts.filter((concert) => {
      // Festival Type filter (Festival, Concert, Season)
      const matchesFestivalType = !festivalType ||
        (festivalType === "Festival" && concert.category === "Festival") ||
        (festivalType === "Concert" && concert.category === "Concert") ||
        (festivalType === "Season" && concert.category === "Season")

      const matchesSearch =
        concert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concert.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concert.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        concert.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesGenre = !selectedGenre || concert.genre === selectedGenre
      const matchesStatus = !selectedStatus || concert.status === selectedStatus
      const matchesPrice = concert.price >= priceRange[0] && concert.price <= priceRange[1]

      return matchesFestivalType && matchesSearch && matchesGenre && matchesStatus && matchesPrice
    })

    // Sort concerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.shows[0].date).getTime() - new Date(a.shows[0].date).getTime()
        case "date-asc":
          return new Date(a.shows[0].date).getTime() - new Date(b.shows[0].date).getTime()
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "title":
          return a.title.localeCompare(b.title)
        case "rating":
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }, [searchTerm, selectedGenre, selectedStatus, festivalType, priceRange, sortBy])

  // Update formatDate to use short month names
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-pont-green text-white">Upcoming</Badge>
      case "past":
        return <Badge variant="secondary">Past</Badge>
      default:
        return null
    }
  }

  const getAvailabilityBadge = (available: number, total: number, status: string) => {
    if (status === "past") {
      return <Badge variant="outline">Completed</Badge>
    }

    const percentage = (available / total) * 100
    if (percentage <= 20) {
      return <Badge variant="destructive">Only {available} left!</Badge>
    } else if (percentage <= 50) {
      return <Badge variant="secondary">Limited seats</Badge>
    }
    return null
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
                href="/#discover"
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
              <Link href="/artists" className="text-gray-700 hover:text-pont-green font-medium text-lg relative group">
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
                className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-pont-rust/90 hover:to-pont-rust text-white px-8 py-2.5 rounded-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
            <div className="md:hidden mt-6 py-6 border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg mx-4">
              <nav className="flex flex-col space-y-6 px-6">
                <Link
                  href="/#discover"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Discover
                </Link>
                <Link href="/concerts" className=" text-pont-green transition-colors font-medium text-lg">
                  Events
                </Link>
                <Link href="/artists" className="text-gray-700 font-medium text-lg">
                  Artists
                </Link>

                <Link
                  href="/venues"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Locations
                </Link>
                <Link
                  href="/about"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  About
                </Link>
                <div className="flex flex-col space-y-3 pt-6 border-t border-gray-100">
                  <Button
                    onClick={() => router.push("/artist-login")}
                    className="bg-gradient-to-r from-pont-rust to-pont-rust/90 text-white w-fit px-6 py-2 rounded-full font-semibold shadow-lg"
                  >
                    Artist Login
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    )
  }

  const ConcertGridCard = ({ concert }: { concert: (typeof allConcerts)[0] }) => {
    const dateCount = concert.shows ? concert.shows.length : 0;
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white h-[500px] flex flex-col">
        <CardContent className="p-0 flex flex-col h-full">
          <div className="relative overflow-hidden">
            <Image
              src={concert.image || "/placeholder.svg"}
              alt={concert.title}
              width={300}
              height={320}
              className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute top-4 left-4">
              <Badge className="bg-white text-black">{concert.genre}</Badge>
            </div>

            <div className="absolute bottom-4 left-4">
              <Badge className="bg-pont-green text-white">Harp and Voilin</Badge>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">

              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="p-6 flex flex-col flex-1">
            <h5 className="text-sm text-black   w-fit">Festival Spring 2025</h5>
            <h3 className="font-bold text-xl text-gray-900  group-hover:text-pont-green transition-colors">
              <Link href={`/concerts/1`}>{concert.title}</Link>
            </h3>
            <p className="text-pont-rust font-medium mb-2">{concert.artist}</p>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{concert.description}</p>
            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2 text-pont-green" />
              <span className="text-xs">{concert.location}</span>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4 min-h-[56px]">
              {/* Multiple Dates Display */}
              {concert.shows && concert.shows.slice(0, 2).map((show, idx) => (
                <div key={idx} className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-pont-green" />
                  <span className="text-xs">{formatDate(show.date)}</span>
                  <span className="mx-2">•</span>
                  <span className="text-xs">{show.time}</span>
                </div>
              ))}

              {concert.shows && concert.shows.length > 2 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-pont-green underline text-xs mt-1">View all dates</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      {concert.shows.map((show, idx) => (
                        <div key={idx} className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-pont-green" />
                          <span className="text-xs">{formatDate(show.date)}</span>
                          <span className="mx-2">•</span>
                          <span className="text-xs">{show.time}</span>
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

            <div className="mt-auto">
              {concert.status === "upcoming" && (
                <Link href={`/concerts/1`}>
                  <Button className="w-full bg-pont-rust hover:bg-pont-rust/90 text-white">Book Tickets</Button>
                </Link>
              )}
              {concert.status === "past" && (
                <Link href={`/concerts/1`}>
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Event Completed
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ConcertListCard = ({ concert }: { concert: (typeof allConcerts)[0] }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-6 gap-0 min-h-[8rem]">
          <div className="md:col-span-2 relative">
            <Image
              src={concert.image || "/placeholder.svg"}
              alt={concert.title}
              width={300}
              height={300}
              className="w-full h-72 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            <div className="absolute top-4 left-4">
              <Badge className="bg-white text-black">{concert.genre}</Badge>
            </div>

            <div className="absolute bottom-4 left-4">
              <Badge className="bg-pont-green text-white">Harp and Voilin</Badge>
            </div>



          </div>
          <div className="md:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-pont-green transition-colors">
                <h5 className="text-sm text-black font-normal   w-fit">Festival Spring 2025</h5>
                  <Link href={`/concerts/${concert.id}`}>{concert.title}</Link>
                </h3>
           
              </div>
              <p className="text-pont-rust font-medium mb-1 text-sm">{concert.artist}</p>
              <p className="text-gray-600 mb-2 leading-snug text-xs line-clamp-2">{concert.description}</p>
              <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2 text-pont-green" />
              <span className="text-xs">{concert.location}</span>
            </div>
          {/* ---HERE--- */}
          <div className="space-y-2 text-sm text-gray-600 mb-4 min-h-[56px]">
              {/* Multiple Dates Display */}
              {concert.shows && concert.shows.slice(0, 2).map((show, idx) => (
                <div key={idx} className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-pont-green" />
                  <span className="text-xs">{formatDate(show.date)}</span>
                  <span className="mx-2">•</span>
                  <span className="text-xs">{show.time}</span>
                </div>
              ))}

              {concert.shows && concert.shows.length > 2 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-pont-green underline text-xs mt-1">View all dates</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      {concert.shows.map((show, idx) => (
                        <div key={idx} className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-pont-green" />
                          <span className="text-xs">{formatDate(show.date)}</span>
                          <span className="mx-2">•</span>
                          <span className="text-xs">{show.time}</span>
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


              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  
                  <Button size="sm" variant="outline" className="h-7 w-7 p-0 bg-transparent">
                    <Share2 className="w-3 h-3" />
                  </Button>
                </div>
                {concert.status === "upcoming" && (
                  <Button className="bg-pont-rust hover:bg-pont-rust/90 text-white px-3 py-1 text-xs h-7">
                    Book Tickets
                  </Button>
                )}
                {concert.status === "past" && (
                  <Button variant="outline" className="px-3 py-1 text-xs h-7 bg-transparent" disabled>
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Get statistics
  const stats = {
    upcoming: allConcerts.filter((c) => c.status === "upcoming").length,
    thisWeek: allConcerts.filter((c) => {
      const concertDate = new Date(c.shows[0].date)
      const now = new Date()
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      return concertDate >= now && concertDate <= weekFromNow
    }).length,
    venues: [...new Set(allConcerts.map((c) => c.venue))].length,
    avgPrice: Math.round(allConcerts.reduce((sum, c) => sum + c.price, 0) / allConcerts.length),
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Page Header */}
      <section className="relative bg-orange-50">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="w-full h-full">
            <Image
              src="/images/bg.png"
              alt="Concerts Background"
              layout="fill"
              objectFit="cover"
              className="w-full h-full object-cover opacity-60"
              priority
            />
            {/* Overlay for better text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-white/90" />
          </div>
        </div>
        <div className="relative text-center px-9 py-16 z-10">
          <h1 className="text-4xl lg:text-5xl font-bold text-rust-900 mb-4">
            All <span className="text-pont-rust">Events</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover intimate classical music performances in unique locations across the city
          </p>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-8">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search concerts, artists, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-pont-rust focus:ring-pont-rust"
                />
              </div>
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-pont-rust text-pont-rust hover:bg-pont-rust hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none ${viewMode === "grid" ? "bg-pont-rust text-white" : "text-gray-600"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className={`rounded-none ${viewMode === "list" ? "bg-pont-rust text-white" : "text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-8 border-pont-rust/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  {/* Festival Type Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Festival Type</label>
                    <select
                      value={festivalType}
                      onChange={(e) => setFestivalType(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-rust focus:ring-pont-rust"
                    >
                      <option value="">All Types</option>
                      <option value="Festival">Festival Sprint 2025</option>
                      <option value="Season">Season 2025</option>
                    </select>
                  </div>
                  {/* Genre Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Genre</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-rust focus:ring-pont-rust"
                    >
                      <option value="">All Genres</option>
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-rust focus:ring-pont-rust"
                    >
                      <option value="">All Status</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Sort By Filter */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-rust focus:ring-pont-rust"
                    >
                      <option value="date">Date Latest</option>
                      <option value="date-asc">Date Oldest</option>
                    </select>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedGenre("")
                    setSelectedStatus("")
                    setFestivalType("")
                    setSortBy("date")
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredAndSortedConcerts.length} of {allConcerts.length} concerts
            </p>
          </div>

          {/* Concerts Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAndSortedConcerts.map((concert) => (
                <ConcertGridCard key={concert.id} concert={concert} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAndSortedConcerts.map((concert) => (
                <ConcertListCard key={concert.id} concert={concert} />
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredAndSortedConcerts.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No concerts found</h3>
              <p className="text-gray-500">Try adjusting your search criteria or filters</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-pont-light-green">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-pont-green mb-4">Stay Connected</h2>
          <p className="text-lg text-gray-700 mb-8">
            Subscribe to our newsletter and never miss an upcoming concert or artist announcement
          </p>

          <form className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input type="text" placeholder="Your Name" className="h-12 border-pont-green focus:ring-pont-green" />
              <Input type="text" placeholder="Code Postal" className="h-12 border-pont-green focus:ring-pont-green" />
            </div>
            <Input
              type="email"
              placeholder="Your Email Address"
              className="h-12 border-pont-green focus:ring-pont-green"
            />
            <Button type="submit" className="bg-pont-rust hover:bg-pont-rust/90 text-white px-8 py-3 text-lg">
              Subscribe to Newsletter
            </Button>
          </form>
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
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">
                  <Twitter className="w-6 h-6" />
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
