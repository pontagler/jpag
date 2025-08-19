"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Heart,
  Music,
  Users,
  Mail,
  Phone,
  MapPin,
  Menu,
  X,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import router from "next/router"

const teamMembers = [
  {
    name: "Jean-Pierre",
    role: "Founder & Director",
    image: "/placeholder-user.jpg",
    bio: "Passionate about preserving and promoting Breton culture through music.",
  },
  {
    name: "Marie Claire",
    role: "Artistic Coordinator",
    image: "/placeholder-user.jpg",
    bio: "Curates our diverse lineup of talented artists and immersive cultural events.",
  },
  {
    name: "Yannick Le Roux",
    role: "Community Manager",
    image: "/placeholder-user.jpg",
    bio: "Connects with our audience and ensures every event is a memorable experience.",
  },
]

export default function AboutPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const Header = () => (
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
              className="text-gray-700 hover:text-pont-green transition-all duration-300 font-medium text-lg relative group"
            >
              Locations
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pont-green transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link
              href="/about"
              className="text-pont-green font-medium text-lg relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-pont-green"></span>
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700 hover:text-pont-green">Discover</Link>
              <Link href="/concerts" className="text-gray-700 hover:text-pont-green">Events</Link>

              <Link href="/artists" className="text-gray-700 hover:text-pont-green">Artists</Link>
              <Link href="/venues" className="text-gray-700 hover:text-pont-green">Locations</Link>
              <Link href="/about" className="text-pont-green font-bold">About</Link>
              <Button className="bg-gradient-to-r from-lime-600 to-lime-700 hover:from-pont-rust/90 hover:to-pont-rust text-white">
                Artist Login
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )

  const Footer = () => (
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
              <li><Link href="/about" className="text-gray-300 hover:text-pont-yellow transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-pont-yellow transition-colors">Contact</Link></li>
              <li><Link href="/artists" className="text-gray-300 hover:text-pont-yellow transition-colors">Artists</Link></li>
              <li><Link href="/concerts" className="text-gray-300 hover:text-pont-yellow transition-colors">Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-pont-green">Event Types</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">Festivals</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">Concerts</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">Exhibitions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors">Workshops</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-pont-green">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors"><Facebook className="w-6 h-6" /></a>
              <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors"><Instagram className="w-6 h-6" /></a>
              <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors"><Twitter className="w-6 h-6" /></a>
              <a href="#" className="text-gray-300 hover:text-pont-yellow transition-colors"><Mail className="w-6 h-6" /></a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Pont Ar Gler. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="bg-cream min-h-screen">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[50vh] flex items-center justify-center text-white">
          <Image
            src="/images/bg.png"
            alt="Breton landscape"
            layout="fill"
            objectFit="cover"
            className="z-0"
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
          <div className="relative z-20 text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">About Pont Ar Gler</h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl md:text-2xl">
              Connecting Cultures Through the Power of Breton Music
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Founded in the heart of Brittany, Pont Ar Gler was born from a deep love for the region's rich musical heritage. Our mission is to build a bridge ("pont" in Breton) between talented local artists ("gler") and a global audience that appreciates authentic, traditional, and contemporary Breton music. We believe in the power of music to transcend boundaries and foster a sense of community.
            </p>
          </div>
        </section>

        {/* Meet the Team Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Meet the Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center">
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={150}
                    height={150}
                    className="rounded-full mx-auto mb-4 shadow-lg"
                  />
                  <h3 className="text-2xl font-bold text-pont-green">{member.name}</h3>
                  <p className="text-md font-semibold text-pont-rust mb-2">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Get In Touch</h2>
              <p className="text-lg text-gray-600 mb-8">
                We'd love to hear from you! Whether you're an artist, a venue owner, or a music lover, feel free to reach out.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Mail className="w-6 h-6 text-pont-green" />
                  <a href="mailto:contact@pontargler.com" className="text-gray-700 hover:text-pont-rust">contact@pontargler.com</a>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone className="w-6 h-6 text-pont-green" />
                  <span className="text-gray-700">+33 1 23 45 67 89</span>
                </div>
                <div className="flex items-center space-x-4">
                  <MapPin className="w-6 h-6 text-pont-green" />
                  <span className="text-gray-700">123 Rue de la Musique, 35000 Rennes, Brittany</span>
                </div>
              </div>
            </div>
            <Card className="p-8 shadow-xl rounded-2xl">
              <form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Input placeholder="First Name" className="h-12"/>
                  <Input placeholder="Last Name" className="h-12"/>
                </div>
                <Input placeholder="Email Address" type="email" className="mb-6 h-12"/>
                <Textarea placeholder="Your Message" rows={5} className="mb-6"/>
                <Button type="submit" className="w-full h-12 text-lg bg-pont-green hover:bg-pont-green/90 rounded-xl">Send Message</Button>
              </form>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
