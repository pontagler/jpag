"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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
  Music2Icon,
  Clock10Icon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { artistService } from "../../lib/supabase"





export default function ArtistsPage() {

  const [allArtists, setAllArtists] = useState<any[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedInstrument, setSelectedInstrument] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const router = useRouter()
  const categories = [...new Set(allArtists.map((artist) => artist.genre).filter(Boolean))] // Use genre as category since category doesn't exist
  const locations = [...new Set(allArtists.map((artist) => artist.location).filter(Boolean))]


    useEffect(() => {
    const fetchArtists = async () => {
      try {
        const data = await artistService.getArtists()
        setAllArtists(data)
        console.log(data)
      } catch (error) {
        console.error("Failed to fetch artists:", error)
      }
    }

    // Slight delay to ensure Supabase is initialized
    const timer = setTimeout(() => {
      fetchArtists()
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  console.log('All artists fetched:', allArtists);

  // Helper function to convert string to title case
  const toTitleCase = (str: string) => {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
  // Get unique values for filters
  const instruments = [...new Set(allArtists.flatMap((artist) => {
    // Handle different formats of instruments (array or string)
    const artistInstruments = artist.instruments || []
    if (Array.isArray(artistInstruments)) {
      return artistInstruments
    }
    // If it's a string (PostgreSQL array sometimes comes as string), try to parse it
    if (typeof artistInstruments === 'string') {
      try {
        return JSON.parse(artistInstruments)
      } catch {
        return [artistInstruments]
      }
    }
    return []
  }).filter(Boolean))]


  // Filter and sort artists
  const filteredAndSortedArtists = useMemo(() => {
    console.log('Filtering artists:', allArtists.length, 'total artists')

    const filtered = allArtists.filter((artist) => {
      try {
        const matchesSearch =
          (artist.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (artist.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
        const matchesInstrument = !selectedInstrument || (() => {
          const artistInstruments = artist.instruments || []
          if (Array.isArray(artistInstruments)) {
            return artistInstruments.includes(selectedInstrument)
          }
          if (typeof artistInstruments === 'string') {
            try {
              const parsed = JSON.parse(artistInstruments)
              return Array.isArray(parsed) && parsed.includes(selectedInstrument)
            } catch {
              return artistInstruments === selectedInstrument
            }
          }
          return false
        })()
        const matchesCategory = !selectedCategory || artist.genre === selectedCategory // Use genre as category
        const matchesLocation = !selectedLocation || artist.location === selectedLocation

        return matchesSearch && matchesInstrument && matchesCategory && matchesLocation
      } catch (error) {
        console.log('Error filtering artist:', artist, error)
        return false
      }
    })

    // Sort artists
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "concerts":
          return (b.total_events || 0) - (a.total_events || 0) // Use total_events instead of concerts
        case "name":
        default:
          return (a.name || '').localeCompare(b.name || '')
      }
    })

    console.log('Filtered and sorted artists:', filtered.length, 'artists')
    console.log('First few artists:', filtered.slice(0, 3))
    return filtered
  }, [allArtists, searchTerm, selectedInstrument, selectedCategory, selectedLocation, sortBy])


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
                className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
              >
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/artists" className="text-pont-green font-medium text-lg relative group">
                Artists
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pont-green"></span>
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
            <div className="md:hidden mt-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-pont-green">
                  Discover
                </Link>
                <Link
                  href="/concerts"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Events
                </Link>
                <Link href="/artists" className="text-pont-green font-bold">
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

  const ArtistGridCard = ({ artist }: { artist: (typeof allArtists)[0] }) => (
    <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <Image
            src={artist.image_url || "/placeholder.svg"}
            alt={artist.name}
            width={300}
            height={400}
            className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
          />

          <div className="absolute top-4 left-4 bg-pont-green/90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-xs font-medium text-white">{artist.genre}</span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-bold text-xl text-gray-900 mb-2">{artist.name}</h3>
          <p className="text-pont-rust font-medium mb-2">{(() => {
            const instruments = artist.instruments || []
            if (Array.isArray(instruments) && instruments.length > 0) {
              return instruments.map(toTitleCase).join(', ')
            }
            if (typeof instruments === 'string') {
              try {
                const parsed = JSON.parse(instruments)
                if (Array.isArray(parsed) && parsed.length > 0) {
                  return parsed.map(toTitleCase).join(', ')
                }
              } catch {
                return toTitleCase(instruments)
              }
            }
            return 'Multi-instrument'
          })()}</p>
          <p className="text-sm text-gray-600 mb-3">{artist.bio}</p>



          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span className="bg-pont-light-green text-pont-green px-2 py-1 rounded-full text-xs font-medium">
              {artist.genre}
            </span>
            {/* <span>Next: {artist.next}</span> */}
          </div>
          <Link href={`/artists/${artist.id}`}>
            <Button className="w-full bg-pont-green hover:bg-pont-green/90 text-white">View Profile</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )

  const ArtistListCard = ({ artist }: { artist: (typeof allArtists)[0] }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md bg-white">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-6 gap-0 min-h-[8rem]">
          <div className="md:col-span-2 relative">
            <Image
              src={artist.image_url || "/placeholder.svg"}
              alt={artist.name}
              width={300}
              height={300}
              className="w-full h-72 md:h-72 object-cover group-hover:scale-105 transition-transform duration-300 "
            />

          </div>
          <div className="md:col-span-4 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900">{artist.name}</h3>
                <span className="bg-pont-green/90 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                  {artist.genre}
                </span>
              </div>
              <p className="text-pont-rust font-medium mb-1 text-sm">{(() => {
                const instruments = artist.instruments || []
                if (Array.isArray(instruments) && instruments.length > 0) {
                  return instruments.map(toTitleCase).join(', ')
                }
                if (typeof instruments === 'string') {
                  try {
                    const parsed = JSON.parse(instruments)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return parsed.map(toTitleCase).join(', ')
                    }
                  } catch {
                    return toTitleCase(instruments)
                  }
                }
                return 'Multi-instrument'
              })()}</p>
              <p className="text-gray-600 mb-2 leading-snug text-xs line-clamp-2">{artist.bio}</p>



              <div className="flex items-center justify-between">
                <span className="bg-pont-light-green text-pont-green px-2 py-0.5 rounded-full text-xs font-medium">
                  {artist.genre}
                </span>
                <Link href={`/artists/${artist.id}`}>
                  <Button className="bg-pont-green hover:bg-pont-green/90 text-white px-3 py-1 text-xs h-7">
                    View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      {/* Page Header */}

      <section
        className="relative bg-lime-50"
        style={{
          backgroundImage: 'url(/images/bg-artist.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0  z-0" />
        <div className="relative z-10 text-center px-9 py-16 ">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-700 mb-4">
            Our <span className="text-pont-rust">Artists</span>
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Discover talented musicians from across Brittany who bring our cultural heritage to life through their
            exceptional performances
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
                  placeholder="Search artists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 border-gray-300 focus:border-pont-green"
                />
              </div>
            </div>

            {/* View Mode and Filter Toggle */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-pont-green text-pont-green hover:bg-pont-green hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none ${viewMode === "grid" ? "bg-pont-green text-white" : "text-gray-600"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  onClick={() => setViewMode("list")}
                  className={`rounded-none ${viewMode === "list" ? "bg-pont-green text-white" : "text-gray-600"}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <Card className="mb-8 border-pont-green/20">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Instrument</label>
                    <select
                      value={selectedInstrument}
                      onChange={(e) => setSelectedInstrument(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-green focus:ring-pont-green"
                    >
                      <option value="">All Instruments</option>
                      {instruments.map((instrument) => (
                        <option key={instrument} value={instrument}>
                          {toTitleCase(instrument)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Genre</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-green focus:ring-pont-green"
                    >
                      <option value="">All Genres</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full h-10 px-3 border border-gray-300 rounded-md focus:border-pont-green focus:ring-pont-green"
                    >
                      <option value="name">Alphabetical</option>
                    
                    </select>
                  </div> */}
                  <div className="space-y-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedInstrument("")
                        setSelectedCategory("")
                        setSelectedLocation("")
                        setSortBy("name")
                      }}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Clear All Filters
                    </Button>
                  </div>

                </div>


              </CardContent>
            </Card>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredAndSortedArtists.length} of {allArtists.length} artists
            </p>
          </div>

          {/* Artists Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAndSortedArtists.map((artist) => (
                <ArtistGridCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredAndSortedArtists.map((artist) => (
                <ArtistListCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}

          {/* No Results */}
          {filteredAndSortedArtists.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No artists found</h3>
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
            Subscribe to our newsletter and never miss an upcoming event or artist announcement
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
