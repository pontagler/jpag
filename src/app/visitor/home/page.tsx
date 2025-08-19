"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Calendar,
  MapPin,
  Music,
  Users,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Menu,
  X,
  Search,
  Play,
  Star,
  PinIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const Header = () => {
    return (
      <header className=" backdrop-blur-md py-4 px-4 border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo Only */}
            <div className="flex items-center">
              <Image
                src="/logo.jpg"
                alt="Pont Ar Gler Logo"
                width={100}
                height={100}
                className="shadow-md absolute top-4"
              />
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
                className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
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
                className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-pont-rust/90 hover:to-pont-rust text-white px-8 py-2.5  font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
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
                <Link href="/" className="text-pont-green font-bold">
                  Discover
                </Link>
                <Link
                  href="/concerts"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Events
                </Link>
                <Link
                  href="/artists"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Artists
                </Link>
              
                <Link
                  href="/venues"
                  className="text-gray-700 hover:text-pont-green transition-colors font-medium text-lg"
                >
                  Venues
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
                    className="bg-gradient-to-r from-pont-rust to-pont-rust/90 text-white w-fit px-6 py-2  font-semibold shadow-lg"
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

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4" style={{backgroundImage: 'url(/images/fern1.png)', backgroundSize: 'cover', backgroundPosition: 'center'}} >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Tagline */}
              {/* <div className="flex items-center space-x-2 text-white  border-2 rounded-full border-pont-green px-4 py-2 w-fit bg-pont-green -mb-4">
                <Music className="w-5 h-5" />
                <span className="text-sm font-medium">Connecting Artists & Music Lovers</span>
              </div> */}

              {/* Main Headline */}
              <div className="relative ">
                {/* Optional background pattern (SVG or CSS) */}
                <div className="absolute inset-0 opacity-40 pointer-events-none select-none z-0" />
                <h1 className="text-3xl md:text-5xl font-bold leading-none relative z-10">
                  Notre raison d’être,<br />
                  <span className="text-pont-rust font-extrabold leading-none block mt-2">le soutien aux jeunes talents.</span>
                </h1>
                <div className="mt-6 text-gray-700 text-md md:text-md relative z-10 space-y-4">
                  <p>
                    La France dispose d'un vivier de jeunes talents, issus des excellentes écoles d’arts et des Conservatoires de France et d’Europe. <span className="font-bold">Une fois diplômés, ils ont besoin de se produire</span> pour parfaire leur formation et développer tout leur talent.
                  </p>
                  <p>
                    Notre ambition en donnant ces concerts et en créant ce festival a toujours été de les aider dans cette phase cruciale du début de leur carrière.
                  </p>
                  <p className="font-bold">
                    Car comment devenir des professionnels accomplis sans occasion de jouer ou de se produire ?
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => router.push("/become-host")}
                  className="bg-pont-rust hover:bg-pont-rust/90 text-white px-8 py-3 text-lg"
                >
                  <PinIcon className="w-5 h-5 mr-2" />
                  Donation
                </Button>
                <Button
                  onClick={() => router.push("/artist-signup")}
                  variant="outline"
                  className="border-pont-green text-pont-green hover:bg-pont-green hover:text-white px-8 py-3 text-lg bg-transparent"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Become member
                </Button>
              </div>

              {/* Stats */}
              {/* <div className="grid grid-cols-3 gap-2 pt-4 sm:w-4/6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pont-green">200+</div>
                  <div className="text-sm text-gray-600 mt-1">Events Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pont-green">85+</div>
                  <div className="text-sm text-gray-600 mt-1">Local Artists</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-3xl font-bold text-pont-green">4.8</span>
                    <Star className="w-6 h-6 text-pont-yellow fill-current" />
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Average Rating</div>
                </div>
              </div> */}
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="relative rounded-md overflow-hidden shadow-2xl">
                <Image
                  src="/images/bg.png"
                  alt="Musicians performing"
                  width={300}
                  height={400}
                  className="w-full h-[400px] object-cover"
                />

                {/* Live Performance Indicator */}
                <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm rounded-full px-4 py-3 flex items-center space-x-3 shadow-lg transition-colors duration-300 hover:bg-pont-green hover:text-white cursor-pointer group">
                  <div className="bg-pont-rust rounded-full p-2 transition-colors duration-300 group-hover:bg-white">
                    <Play className="w-4 h-4 fill-current text-white transition-colors duration-300 group-hover:text-pont-green" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Live Performance</div>
                    <div className="text-xs text-gray-600 transition-colors duration-300 group-hover:text-white">
                      Now Playing
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      {/* <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Your Perfect Concert</h2>
          <p className="text-gray-600 mb-8">Search by location, date, or musical style</p>

          <Card className="shadow-xl border-2 border-pont-rust ">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Brittany, France"
                      className="pl-10 h-12 border-gray-300 focus:border-pont-green"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input type="date" className="pl-10 h-12 border-gray-300 focus:border-pont-green" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Genre</label>
                  <select className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-pont-green focus:ring-pont-green">
                    <option>All Genres</option>
                    <option>Classical</option>
                    <option>Folk</option>
                    <option>Jazz</option>
                    <option>Traditional</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button className="w-full h-12 bg-pont-rust hover:bg-pont-rust/90 text-white">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}

          {/* Upcoming Concerts Section */}
          <section id="concerts" className="py-16 px-4 bg-slate-50 -mt-2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss these exceptional performances celebrating Brittany's rich musical heritage
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "Summer Celtic Festival",
                artist: "Marie Dubois & Ensemble",
                shows: [
                  { date: "July 15, 2024", time: "8:00 PM" },
                  { date: "July 15, 2024", time: "8:00 PM" },
                ],
                location: "Château de Josselin",
                price: "From €35",
                image: "/concerts/c1.png",
                type: "Festival",
                description: "An enchanting evening of traditional Celtic music in a historic castle setting",
                availability: "Limited seats",
                instruments: "Violin, Flute, Harp",
                program: "Spring Festival 2025"
              },
              {
                title: "Jazz Under the Stars",
                artist: "Sophie Laurent Trio",
                shows: [
                  { date: "July 22, 2024", time: "7:30 PM" },
                  { date: "July 23, 2024", time: "8:00 PM" },
                ],
                location: "Parc de la Préfecture, Vannes",
                price: "From €28",
                image: "/concerts/c2.png",
                type: "Concert",
                description: "Contemporary jazz interpretations of Breton folk ",
                availability: "Available",
                instruments: "Piano, Drums, Bass",
                program: "Season 2025"
              },
              {
                title: "Acoustic Folk Evening",
                artist: "Jean-Luc Martin",
                shows: [
                  { date: "Aug 5, 2024", time: "8:30 PM" },
                  { date: "Aug 6, 2024", time: "7:00 PM" },
                  { date: "Aug 7, 2024", time: "8:00 PM" },
                  { date: "Aug 8, 2024", time: "8:00 PM" },
                ],
                location: "Théâtre de Lorient",
                price: "From €42",
                image: "/concerts/c3.png",
                type: "Concert",
                description: "Intimate acoustic performance featuring traditional and original compositions",
                availability: "Selling fast",
                instruments: "Guitar, Vocals",
                program: "Winter Festival 2025"
              },
              {
                title: "Blues & Breton Fusion",
                artist: "Pierre Moreau Quartet",
                shows: [
                  { date: "Aug 12, 2024", time: "9:00 PM" },
                  { date: "Aug 13, 2024", time: "8:00 PM" },
                  { date: "Aug 14, 2024", time: "7:30 PM" },
                  { date: "Aug 15, 2024", time: "8:30 PM" },
                  { date: "Aug 16, 2024", time: "9:00 PM" },
                ],
                location: "La Cigale, Nantes",
                price: "From €38",
                image: "/concerts/c4.png",
                type: "Concert",
                description: "A unique fusion of American blues and traditional Breton melodies",
                availability: "Available",
                instruments: "Saxophone, Guitar, Drums",
                program: "Summer Festival 2025"
              },
            ].map((concert, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden"
              >
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-5 gap-0 h-full">
                    <div className="md:col-span-2 relative h-full">
                      <Image
                        src={concert.image || "/placeholder.svg"}
                        alt={concert.title}
                        width={500}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            concert.type === "Jazz" ? "bg-pont-yellow text-black" : "bg-pont-rust text-white"
                          }`}
                        >
                         Jazz
                        </span>
                      </div>
                      {/* Instrument label at the bottom left of the image */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pont-green text-white shadow">
                          {concert.instruments}
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        {/* <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            concert.availability === "Limited seats"
                              ? "bg-red-100 text-red-700"
                              : concert.availability === "Festival"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {concert.availability}
                        </span> */}
                      </div>
                    </div>
                    <div className="md:col-span-3 p-6 flex flex-col justify-between h-full">
                      <div>
                        <h5 className="text-sm text-black   w-fit">{concert.program}</h5>
                        <h3 className="text-2xl font-bold text-gray-900 ">{concert.title}</h3>
                        <p className="text-pont-green font-semibold mb-3">{concert.artist}</p>
                        <p className="text-gray-600 mb-4 leading-relaxed">{concert.description}</p>
                        <div className="space-y-2 mb-2">
                          {concert.shows.slice(0, 2).map((show, showIdx) => (
                            <div key={showIdx} className="flex items-center text-gray-700">
                              <Calendar className="w-4 h-4 mr-3 text-pont-green" />
                              <span className="font-medium text-sm">{show.date}</span>
                              <span className="mx-2">•</span>
                              <span className="text-sm">{show.time}</span>
                            </div>
                          ))}
                          {concert.shows.length > 2 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="text-pont-green underline text-sm mt-1">View all dates</button>
                              </PopoverTrigger>
                              <PopoverContent className="w-64">
                                <div className="space-y-2">
                                  {concert.shows.map((show, idx) => (
                                    <div key={idx} className="flex items-center text-gray-700">
                                      <Calendar className="w-4 h-4 mr-3 text-pont-green" />
                                      <span className="font-medium text-sm">{show.date}</span>
                                      <span className="mx-2">•</span>
                                      <span className="text-sm">{show.time}</span>
                                    </div>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                          <div className="flex items-center text-gray-700">
                            <MapPin className="w-4 h-4 mr-3 text-pont-green" />
                            <span>{concert.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button onClick={() => router.push("/concerts/1")} className="bg-pont-rust hover:bg-pont-rust/90 text-white px-6 py-2">Book Now</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button
            onClick={() => router.push("/concerts")}
              variant="outline"
              className="border-pont-rust text-pont-rust hover:bg-pont-rust hover:text-white px-8 py-3 bg-transparent"
            >
              View All Events
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section id="artists" className="py-16 px-4 bg-cream">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Artists</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the talented musicians who bring our cultural heritage to life through their exceptional
              performances
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[
              {
                name: "Marie Dubois",
                instrument: "Classical Violin",
                genre: "Classical & Folk",
                image: "/artist/a1.png",
                bio: "Renowned violinist specializing in Breton traditional music",
                rating: 4.9,
                concerts: 45,
              },
              {
                name: "Jean-Luc Martin",
                instrument: "Acoustic Guitar",
                genre: "Folk & Celtic",
                image: "/artist/a2.png",
                bio: "Master of Celtic guitar with 20 years of experience",
                rating: 4.8,
                concerts: 38,
              },
              {
                name: "Sophie Laurent",
                instrument: "Piano & Vocals",
                genre: "Jazz & Contemporary",
                image: "/artist/a3.png",
                bio: "Jazz pianist bringing modern interpretations to traditional songs",
                rating: 4.9,
                concerts: 52,
              },
              {
                name: "Pierre Moreau",
                instrument: "Saxophone",
                genre: "Jazz & Blues",
                image: "/artist/a4.png",
                bio: "Saxophone virtuoso blending jazz with Breton influences",
                rating: 4.7,
                concerts: 41,
              },
            ].map((artist, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg bg-white"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    <Image
                      src={artist.image || "/placeholder.svg"}
                      alt={artist.name}
                      width={300}
                      height={400}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                 
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-2">{artist.name}</h3>
                    <p className="text-pont-rust font-medium mb-2">{artist.instrument}</p>
                    <p className="text-sm text-gray-600 mb-3">{artist.bio}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="bg-pont-light-green text-pont-green px-2 py-1 rounded-full text-xs font-medium">
                        {artist.genre}
                      </span>
             
                    </div>
                    <Button onClick={() => router.push("/artists/5")} className="w-full bg-pont-green hover:bg-pont-green/90 text-white">View Profile</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/artists">
              <Button
              onClick={() => router.push("/artists")}
                variant="outline"
                className="border-pont-green text-pont-green hover:bg-pont-green hover:text-white px-8 py-3 bg-transparent"
              >
                View All Artists
              </Button>
            </Link>
          </div>
        </div>
      </section>

  

      {/* Newsletter Section */}
      <section className="py-16 px-4 bg-pont-rust">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay Connected</h2>
          <p className="text-lg text-white mb-8">
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
            <Button type="submit" className="bg-white hover:bg-white text-pont-rust px-8 py-3 text-lg">
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
              <h3 className="text-2xl font-bold text-pont-rust mb-4">Pont Ar Gler</h3>
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
                <li>
                  <Link href="/admin-login" className="text-gray-300 hover:text-pont-yellow transition-colors">
                    Admin
                  </Link>
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
