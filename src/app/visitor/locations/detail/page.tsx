"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { locationService, type Location } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  MapPin,
  Users,
  Star,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Menu,
  X,
  Calendar,
  Facebook,
  Instagram,
  Mail,
  Twitter,
} from "lucide-react"
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./map'), {
  ssr: false, // Must disable SSR for Leaflet
});

export default function VenueDetailPage() {
  const params = useParams()
  const venueId = Number.parseInt(params.id as string)
  const [venue, setVenue] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchVenue() {
      setLoading(true)
      setError(null)
      try {
        const data = await locationService.getLocationById(venueId)
        setVenue(data)
      } catch (err: any) {
        setError("Venue not found.")
        setVenue(null)
      }
      setLoading(false)
    }
    if (!isNaN(venueId)) {
      fetchVenue()
    }
  }, [venueId])

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
              <Link
                href="/artists"
                className="text-gray-700 hover:text-pont-green font-medium text-lg relative group"
              >
                Artists
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
              </Link>
            
              <Link
                href="/venues"
                className="text-pont-green font-medium text-lg relative group"
              >
                Locations
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pont-green"></span>
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

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden mt-4">
              <nav className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-700 hover:text-pont-green">
                  Discover
                </Link>
                <Link href="/concerts" className="text-gray-700 hover:text-pont-green">
                  Events
                </Link>
                <Link href="/artists" className="text-gray-700 hover:text-pont-green">
                  Artists
                </Link>
            
                <Link href="/venues" className="text-pont-green font-bold">
                  Locations
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-pont-green">
                  About
                </Link>
                <Button className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-pont-rust/90 hover:to-pont-rust text-white">
                  Artist Login
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading venue...</h1>
        </div>
      </div>
    )
  }

  if (error || !venue) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Venue Not Found"}
          </h1>
          <Link href="/venues">
            <Button className="bg-pont-rust hover:bg-pont-rust/90 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Venues
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-cream min-h-screen">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-800">
                  {venue.name}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                   
                    <div className="flex items-center space-x-2">
                        <MapPin className="w-5 h-5" />
                        <span className="font-semibold">{venue.address} {venue.postal_code}</span>
                    </div>
                </div>
            </div>
          <Link href="/venues">
            <Button variant="outline" className="bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all venues
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column (Carousel) */}
          <div className="md:col-span-2">
            <Carousel className="rounded-2xl shadow-2xl overflow-hidden">
              <CarouselContent>
                {venue.location_images && venue.location_images.length > 0 ? (
                  venue.location_images.map((img: any, index: number) => (
                    <CarouselItem key={index}>
                      <div className="aspect-video relative">
                        <Image
                          src={img.image_url}
                          alt={`${venue.name} image ${index + 1}`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-video relative">
                      <Image
                        src="/venues/v1.png"
                        alt="Venue placeholder"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              <CarouselPrevious className="ml-16" />
              <CarouselNext className="mr-16" />
            </Carousel>
          </div>

          {/* Right Column (Host Info) */}
          <div className="space-y-6">
            <Card className="shadow-lg rounded-2xl border-2 border-pont-green/20">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-pont-green flex items-center">
                  <Sparkles className="w-6 h-6 mr-3" />
                  Host Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder-user.jpg"
                    alt={venue.name}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-pont-light-green"
                  />
                  <div>
                    <p className="font-bold text-lg text-gray-800">Pontangler</p>
                    <p className="text-sm text-gray-500">
                      Hosting since {venue.hosted_since}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

{/* Right Column (Google Map) */}
            
            <Card className="shadow-lg p-0 rounded-2xl border-2 border-pont-green/20">
              <CardHeader>  
                
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Google Map Embed */}
                      <Map lat={venue.latitude} lng={venue.longitude} /> {/* Replace with your coordinates */}

              </CardContent>
            </Card>
          </div>

          
        </div>

        <Separator className="my-12" />

        {/* Main Content Area */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
                {(venue.type || venue.residence_type) && (
                  <Badge className="bg-gradient-to-r from-pont-green to-green-500 text-white border-none text-md py-2 px-4 rounded-full">
                    {venue.type || venue.residence_type}
                  </Badge>
                )}
                <div className="flex flex-wrap gap-2">
                {(venue.location_tags || []).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-pont-light-green/40 text-pont-green border-pont-green/20 font-normal">
                    {tag}
                    </Badge>
                ))}
                </div>
            </div>
            {/* Description */}
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                About this space
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {venue.description}
              </p>
            </div>

            {(venue.place_offers || []).length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  What this place offers
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {venue.place_offers.map((amenity: string) => (
                    <div key={amenity} className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-pont-green" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Details Card */}
          {/* <div className="md:sticky top-24 self-start">
             <Card className="shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="bg-gray-50">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Venue Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-600">Capacity</span>
                        <div className="flex items-center space-x-2">
                           <Users className="w-5 h-5 text-pont-green" />
                           <span className="font-bold text-lg">{venue.capacity} guests</span>
                        </div>
                    </div>
                     <div className="text-center pt-4 border-t mt-4">
                        <p className="text-3xl font-extrabold text-gray-900">${venue.price}</p>
                        <p className="text-sm text-gray-500">per event</p>
                     </div>
                </CardContent>
                <CardFooter className="p-3">
                     <Button size="lg" className="w-full h-12 text-lg bg-pont-green hover:bg-pont-green/90 rounded-xl shadow-lg">
                        <Calendar className="w-5 h-5 mr-3"/>
                        Check Availability
                    </Button>
                </CardFooter>
             </Card>
          </div> */}
        </div>
      </div>
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
